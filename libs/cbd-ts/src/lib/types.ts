import { Address, Hex } from 'viem';


export type Porter = {
  uri: string;
};

export type Ritual = {
  id: number;
  threshold: number;
};

export type CustomParam = `:${string}`;
