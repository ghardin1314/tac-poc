import {
  EncryptedThresholdDecryptionRequest,
  EncryptedThresholdDecryptionResponse,
} from '@nucypher/nucypher-core';
import { Address, isAddress } from 'viem';
import { Porter } from './types';
import * as z from 'zod';
import { fromBase64, toBase64 } from './utils';

const cbdDecryptResponseSchema = z.object({
  result: z.object({
    decryption_results: z.object({
      encrypted_decryption_responses: z.record(
        // z.string().refine(isAddress), // TODO Validate checksum address
        z.string(),
        z
          .string()
          .transform((str) =>
            EncryptedThresholdDecryptionResponse.fromBytes(fromBase64(str))
          ) // TODO Convert from base64 to bytes
      ),
      errors: z.record(
        // z.string().refine(isAddress), // TODO Validate checksum address
        z.string(),
        z.string()
      ),
    }),
  }),
});

export type CbdDecryptResponse = z.infer<typeof cbdDecryptResponseSchema>;

export async function cbdDecrypt({
  encryptedRequests,
  threshold,
  porter,
}: {
  encryptedRequests: Record<Address, EncryptedThresholdDecryptionRequest>;
  threshold: number;
  porter: Porter;
}) {
  const encrypted_decryption_requests = Object.fromEntries(
    Object.entries(encryptedRequests).map(([ursula, encryptedRequest]) => [
      ursula,
      toBase64(encryptedRequest.toBytes()),
    ])
  );

  const data = await (
    await fetch(`${porter.uri}/cbd_decrypt`, {
      method: 'POST',
      body: JSON.stringify({
        encrypted_decryption_requests,
        threshold,
      }),
    })
  ).json();

  const { result } = cbdDecryptResponseSchema.parse(data);

  if (
    Object.keys(result.decryption_results.encrypted_decryption_responses)
      .length < threshold
  ) {
    throw new Error(
      `CBD decryption failed with errors: ${JSON.stringify(
        result.decryption_results.errors
      )}`
    );
  }

  return { ...result.decryption_results };
}
