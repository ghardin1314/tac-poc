import { DkgPublicKey } from '@nucypher/nucypher-core';
import { Address, Hex, PublicClient, toBytes } from 'viem';
import { coordinatorAbi, coordinatorAddress } from './abi';

export type DkgRitual = {
  initiator: Address;
  dkgSize: number;
  initTimestamp: number;
  totalTranscripts: number;
  totalAggregations: number;
  publicKey: DkgPublicKey;
  aggregationMismatch: boolean;
  aggregatedTranscript: Hex;
};

export async function getRitual({
  ritualId,
  client,
}: {
  ritualId: number;
  client: PublicClient;
}): Promise<DkgRitual> {
  const ritual = await client.readContract({
    abi: coordinatorAbi,
    address: coordinatorAddress,
    functionName: 'rituals',
    args: [BigInt(ritualId)],
  });

  const initiator = ritual[0];
  const dkgSize = ritual[1];
  const initTimestamp = ritual[2];
  const totalTranscripts = ritual[3];
  const totalAggregations = ritual[4];
  const publicKey = DkgPublicKey.fromBytes(
    new Uint8Array([...toBytes(ritual[5].word0), ...toBytes(ritual[5].word1)])
  );
  const aggregationMismatch = ritual[6];
  const aggregatedTranscript = ritual[7];

  return {
    initiator,
    dkgSize,
    initTimestamp,
    totalTranscripts,
    totalAggregations,
    publicKey,
    aggregationMismatch,
    aggregatedTranscript,
  };
}
