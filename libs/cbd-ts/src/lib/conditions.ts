import * as z from 'zod';
import { Conditions } from '@nucypher/nucypher-core';
import { toBytes, toJsonStr } from './utils';

// TODO: Use AbiType to validate abi schema
// TODO: Add support for time, compound conditions

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
  parameters: z.array(z.string()), // TODO ':userAddress' or isAddress
  returnValueTest: returnValueSchema,
});

export type RpcCondition = z.infer<typeof rpcConditionSchema>;

const contractConditionSchema = rpcConditionSchema.extend({
  conditionType: z.literal('contract'),
  contractAddress: z.string(), // TODO Address
  method: z.string(),
  parameters: z.array(z.string()),
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
