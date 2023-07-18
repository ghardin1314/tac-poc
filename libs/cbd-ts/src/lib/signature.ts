import { WalletClient, publicActions, toHex } from 'viem';
import { randomBytes } from './utils';

const cbdSignatureTypes = {
  Wallet: [
    { name: 'address', type: 'address' },
    { name: 'signatureText', type: 'string' },
    { name: 'blockNumber', type: 'uint256' },
    { name: 'blockHash', type: 'bytes32' },
  ],
} as const;

const eip712types = {
  EIP712Domain: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'salt', type: 'bytes32' },
  ],
};

export async function getOrCreateSignature(client: WalletClient) {
  const address = client.account?.address;

  if (!address) {
    throw new Error('No address found');
  }

  const storageKey = `wallet-signature-${address}`;

  const isLocalStorage = typeof localStorage !== 'undefined';

  const { chainId, blockHash, blockNumber } = await getBlockData(client);
  const salt = toHex(randomBytes());
  const signatureText = `I'm the owner of address ${address} as of block number ${blockNumber.toString()}`;

  const data = {
    domain: {
      name: 'cbd',
      version: '1',
      chainId: chainId,
      salt,
    },
    types: cbdSignatureTypes,
    primaryType: 'Wallet' as const,
    message: {
      address,
      signatureText,
      blockNumber,
      blockHash,
    },
    account: address,
  };

  const signature = await client.signTypedData(data);

  const typedData = {
    ...data,
    types: {
      ...data.types,
      ...eip712types,
    },
  };

  return { signature, address, typedData };
}

const getBlockData = async (client: WalletClient) => {
  const publicClient = publicActions(client);

  const block = await publicClient.getBlock();
  const blockNumber = block.number;
  const blockHash = block.hash;
  const chainId = await publicClient.getChainId();

  if (!blockNumber || !blockHash || !chainId) {
    throw new Error('Could not retrieve block information');
  }

  return { blockNumber: blockNumber, blockHash, chainId };
};
