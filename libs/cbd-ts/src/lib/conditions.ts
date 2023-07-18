import * as z from 'zod';
import { Conditions, Context } from '@nucypher/nucypher-core';
import { toBytes, toJsonStr } from './utils';
import { CustomParam } from './types';
import {  WalletClient } from 'viem';
import { getOrCreateSignature } from './signature';

// TODO: Use AbiType to validate abi schema
// TODO: Add support for time, compound conditions

function isCustomParam(param: string): param is CustomParam {
  return param.startsWith(':');
}

function isUserDefinedParam(param: string): param is CustomParam {
  return param.startsWith(':') && param !== ':userAddress';
}

const returnValueSchema = z.object({
  comparator: z.enum(['==', '>', '<', '>=', '<=', '!=']),
  value: z.string().or(z.number()).or(z.boolean()),
});

const functionAbiVariableSchema = z.object({
  name: z.string(),
  type: z.enum(['address', 'bool']), // TODO add base eth types
});

const functionAbiSchema = z.object({
  name: z.string().optional(),
  type: z.literal('function'),
  inputs: z.array(functionAbiVariableSchema),
  outputs: z.array(functionAbiVariableSchema),
  stateMutability: z.literal('view'),
});

const rpcConditionSchema = z.object({
  conditionType: z.literal('rpc'),
  method: z.enum(['eth_getBalance']),
  parameters: z.array(z.string().refine(isCustomParam)), // TODO ':userAddress' or isAddress
  returnValueTest: returnValueSchema,
});

export type RpcCondition = z.infer<typeof rpcConditionSchema>;

const contractConditionSchema = rpcConditionSchema.extend({
  conditionType: z.literal('contract'),
  contractAddress: z.string(), // TODO Address
  method: z.string(),
  parameters: z.array(z.string().refine(isCustomParam)), // TODO check if starts with ':'
  chain: z.coerce.number(), // TODO enum of supported chains
  functionAbi: functionAbiSchema,
});

export type ContractCondition = z.infer<typeof contractConditionSchema>;

const conditionSchema = z.discriminatedUnion('conditionType', [
  rpcConditionSchema,
  contractConditionSchema,
]);

export type Condition = z.infer<typeof conditionSchema>;

// Cant pass extra props to Porter. Need to remove discriminator
export function validateCondition(condition: Condition) {
  switch (condition.conditionType) {
    case 'rpc': {
      const { conditionType, ...rest } = rpcConditionSchema.parse(condition);
      return rest;
    }
    case 'contract': {
      const { conditionType, ...rest } =
        contractConditionSchema.parse(condition);
      return rest;
    }
    // case 'time':
    // 	return timeConditionSchema.parse(condition);
    // case 'compound':
    // 	return compoundConditionSchema.parse(condition);
  }
}

// TODO: Pass version as param
export function toWasm(condition: Condition) {
  return new Conditions(
    toJsonStr({
      version: '1.0.0',
      condition: validateCondition(condition), // Maybe dont bury validation here
    })
  );
}

export function toAad(condition: Condition) {
  return toBytes(
    toJsonStr({
      version: '1.0.0',
      condition: validateCondition(condition), // Maybe dont bury validation here
    })
  );
}

const customParamsSchema = z.record(
  z.string().refine(isUserDefinedParam),
  z.string().or(z.number()).or(z.boolean())
);

// TODO! Figure out overrides
// export function craftContext(condition: Condition): Promise<Context>;
// export function craftContext(
//   condition: Condition,
//   params: Record<CustomParam, string | number | boolean>
// ): Promise<Context>;
// export function craftContext(
//   condition: Condition,
//   client: WalletClient
// ): Promise<Context>;
// export function craftContext(
//   condition: Condition,
//   params: Record<CustomParam, string | number | boolean>,
//   client: WalletClient
// ): Promise<Context>;
export async function craftContext(
  condition: Condition,
  params: Record<CustomParam, string | number | boolean> = {},
  client?: WalletClient
): Promise<Context> {
  customParamsSchema.parse(params);

  // TODO: Type better 
  const requiredParams: Record<CustomParam, unknown> = {};

  if (condition.parameters.includes(':userAddress')) {
    if (!client) throw new Error('Client required for :userAddress parameter');
    requiredParams[':userAddress'] = await getOrCreateSignature(client);
  }

  // TODO! Test this works
  for (const param of condition.parameters) {
    if (param !== ':userAddress') {
      const val = params[param];
      if (val === undefined) throw new Error(`Missing param ${param}`);
      requiredParams[param] = val;
    }
  }

  return new Context(toJsonStr(requiredParams));
  // return new Context('');
}
