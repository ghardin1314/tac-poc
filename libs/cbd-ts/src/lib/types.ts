import { Address, Hex } from 'viem';

export type DkgRitual = {
  initiator: Address;
  publicKey: Hex;
  dkgSize: number;
};

export type Porter = {
  uri: string;
};

export type Ritual = {
  id: number;
  threshold: number;
};

export type CustomParam = `:${string}`;
