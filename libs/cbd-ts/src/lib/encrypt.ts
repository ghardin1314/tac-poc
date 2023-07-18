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
  // TODO! Rename something actually useful
  const aad = toAad(condition);
  const cyphertext = ferveoEncrypt(message, aad, encryptingKey);

  return { aad, cyphertext };
}