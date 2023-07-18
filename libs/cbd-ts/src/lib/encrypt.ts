import { DkgPublicKey, ferveoEncrypt } from '@nucypher/nucypher-core';
import { PublicClient, toBytes } from 'viem';
import { coordinatorAbi, coordinatorAddress } from './abi';
import { Condition, toAad } from './conditions';

export async function encrypt({
  message,
  condition,
  encryptingKey,
}: {
  message: Uint8Array;
  condition: Condition;
  encryptingKey: DkgPublicKey;
}) {
  const aad = toAad(condition);
  const cyphertext = ferveoEncrypt(message, aad, encryptingKey);

  return { aad, cyphertext };
}

export async function getCohortEncryptingKey({
  ritualId,
  client,
}: {
  ritualId: number;
  client: PublicClient;
}) {
  const ritual = await client.readContract({
    abi: coordinatorAbi,
    address: coordinatorAddress,
    functionName: 'rituals',
    args: [BigInt(ritualId)],
  });

  const dkgPkBytes = new Uint8Array([
    ...toBytes(ritual[5].word0),
    ...toBytes(ritual[5].word1),
  ]);

  return DkgPublicKey.fromBytes(dkgPkBytes);
}
