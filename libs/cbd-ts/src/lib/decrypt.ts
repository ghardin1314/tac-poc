import {
  Ciphertext,
  SessionStaticKey,
  ThresholdDecryptionRequest,
  Conditions,
  Context,
  SessionStaticSecret,
  SessionSharedSecret,
  EncryptedThresholdDecryptionRequest,
  EncryptedThresholdDecryptionResponse,
  DecryptionShareSimple,
  DecryptionSharePrecomputed,
  SharedSecret,
  combineDecryptionSharesSimple,
  combineDecryptionSharesPrecomputed,
  decryptWithSharedSecret,
} from '@nucypher/nucypher-core';
import { Condition, toAad, toWasm } from './conditions';
import { PublicClient, fromHex, Address } from 'viem';
import { coordinatorAbi } from './abi';
import { Porter, Ritual } from './types';
import { cbdDecrypt } from './porter';

export enum FerveoVariant {
  Simple = 0,
  Precomputed = 1,
}

export async function retrieveAndDecrypt({
  ritual,
  client,
  variant,
  cyphertext,
  condition,
  conditionCtx,
  porter,
}: {
  ritual: Ritual;
  cyphertext: Ciphertext;
  condition: Condition;
  conditionCtx: Context;
  variant: FerveoVariant;
  client: PublicClient;
  porter: Porter;
}) {
  const decryptionShares = await retrieve({
    ritual,
    client,
    variant,
    cyphertext,
    condition,
    conditionCtx,
    porter,
  });
  return decrypt({ decryptionShares, variant, cyphertext, condition });
}

export async function decrypt({
  decryptionShares,
  variant,
  condition,
  cyphertext,
}: {
  decryptionShares: DecryptionShareSimple[] | DecryptionSharePrecomputed[];
  variant: FerveoVariant;
  cyphertext: Ciphertext;
  condition: Condition;
}) {
  const sharedSecret =
    getCombineDecryptionSharesFunction(variant)(decryptionShares);
  return decryptWithSharedSecret(cyphertext, toAad(condition), sharedSecret);
}

export async function retrieve({
  ritual,
  client,
  variant,
  cyphertext,
  condition,
  conditionCtx,
  porter,
}: {
  ritual: Ritual;
  cyphertext: Ciphertext;
  condition: Condition;
  conditionCtx: Context;
  variant: FerveoVariant;
  client: PublicClient;
  porter: Porter;
}) {
  // Get participants
  const participants = await getDkgParticipants({
    ritualId: ritual.id,
    client,
  });
  // craft decryption requests
  const { sharedSecrets, encryptedRequests } = await craftDecryptionRequests({
    ritualId: ritual.id,
    variant,
    cyphertext,
    conditions: toWasm(condition),
    conditionCtx,
    participants,
  });

  // send requests
  const { encrypted_decryption_responses } = await cbdDecrypt({
    encryptedRequests,
    threshold: ritual.threshold,
    porter,
  });

  // craft decryption shares
  return craftDecryptionShares({
    sharedSecrets,
    encryptedResponses: encrypted_decryption_responses,
    ritualId: ritual.id,
    variant,
  });
}

export type DkgParticipant = {
  provider: Address;
  aggregated: boolean;
  decryptionRequestStaticKey: SessionStaticKey;
};

export async function getDkgParticipants({
  ritualId,
  client,
}: {
  ritualId: number;
  client: PublicClient;
}): Promise<DkgParticipant[]> {
  const participants = await client.readContract({
    address: '0x0f019Ade1D34399D946CF2f161386362655Dd1A4',
    functionName: 'getParticipants',
    abi: coordinatorAbi,
    args: [ritualId],
  });
  return participants.map(
    ({ provider, aggregated, decryptionRequestStaticKey }) => ({
      provider,
      aggregated,
      decryptionRequestStaticKey: SessionStaticKey.fromBytes(
        fromHex(decryptionRequestStaticKey, 'bytes')
      ),
    })
  );
}

export async function craftDecryptionRequests({
  ritualId,
  variant,
  cyphertext,
  conditions,
  conditionCtx,
  participants,
}: {
  ritualId: number;
  variant: FerveoVariant;
  cyphertext: Ciphertext;
  conditions: Conditions;
  conditionCtx: Context;
  participants: DkgParticipant[];
}) {
  const decryptionRequest = new ThresholdDecryptionRequest(
    ritualId,
    variant,
    cyphertext,
    conditions,
    conditionCtx
  );

  const ephemeralSessionKey = SessionStaticSecret.random();

  return participants.reduce(
    (acc, { provider, decryptionRequestStaticKey }) => {
      const secret = ephemeralSessionKey.deriveSharedSecret(
        decryptionRequestStaticKey
      );

      acc.sharedSecrets[provider] = secret;
      acc.encryptedRequests[provider] = decryptionRequest.encrypt(
        secret,
        ephemeralSessionKey.publicKey()
      );

      return acc;
    },
    {
      sharedSecrets: {} as Record<Address, SessionSharedSecret>,
      encryptedRequests: {} as Record<
        Address,
        EncryptedThresholdDecryptionRequest
      >,
    }
  );
}

function craftDecryptionShares({
  encryptedResponses,
  sharedSecrets,
  ritualId,
  variant,
}: {
  encryptedResponses: Record<Address, EncryptedThresholdDecryptionResponse>;
  sharedSecrets: Record<Address, SessionSharedSecret>;
  ritualId: number;
  variant: FerveoVariant;
}) {
  const shareType = mapVariant(variant);

  return Object.entries(encryptedResponses).map(([provider, response]) => {
    const decryptedResponse = response.decrypt(
      sharedSecrets[provider as Address]
    );

    if (decryptedResponse.ritualId !== ritualId) {
      throw new Error(
        `Ritual id mismatch. Expected ${ritualId}, got ${decryptedResponse.ritualId}`
      );
    }

    return shareType.fromBytes(decryptedResponse.decryptionShare);
  });
}

const mapVariant = (
  variant: FerveoVariant
): typeof DecryptionShareSimple | typeof DecryptionSharePrecomputed => {
  switch (variant) {
    case FerveoVariant.Simple:
      return DecryptionShareSimple;
    case FerveoVariant.Precomputed:
      return DecryptionSharePrecomputed;
  }
};

export function getCombineDecryptionSharesFunction(
  variant: FerveoVariant
): (
  shares: DecryptionShareSimple[] | DecryptionSharePrecomputed[]
) => SharedSecret {
  switch (variant) {
    case FerveoVariant.Simple:
      return combineDecryptionSharesSimple;
    case FerveoVariant.Precomputed:
      return combineDecryptionSharesPrecomputed;
    default:
      throw new Error(`Invalid FerveoVariant: ${variant}`);
  }
}
