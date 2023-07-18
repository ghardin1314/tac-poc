import { Address } from 'wagmi';

// TODO! Make network specific
export const coordinatorAddress: Address =
  '0x0f019Ade1D34399D946CF2f161386362655Dd1A4';

export const coordinatorAbi = [
  {
    inputs: [
      {
        internalType: 'contract IAccessControlApplication',
        name: 'app',
        type: 'address',
      },
      {
        internalType: 'uint32',
        name: '_timeout',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: '_maxDkgSize',
        type: 'uint32',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint32',
        name: 'ritualId',
        type: 'uint32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'node',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'aggregatedTranscriptDigest',
        type: 'bytes32',
      },
    ],
    name: 'AggregationPosted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint32',
        name: 'ritualId',
        type: 'uint32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'initiator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'successful',
        type: 'bool',
      },
    ],
    name: 'EndRitual',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint32',
        name: 'oldSize',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'newSize',
        type: 'uint32',
      },
    ],
    name: 'MaxDkgSizeChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint32',
        name: 'ritualId',
        type: 'uint32',
      },
    ],
    name: 'StartAggregationRound',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint32',
        name: 'ritualId',
        type: 'uint32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'initiator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address[]',
        name: 'participants',
        type: 'address[]',
      },
    ],
    name: 'StartRitual',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint32',
        name: 'oldTimeout',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'newTimeout',
        type: 'uint32',
      },
    ],
    name: 'TimeoutChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint32',
        name: 'ritualId',
        type: 'uint32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'node',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'transcriptDigest',
        type: 'bytes32',
      },
    ],
    name: 'TranscriptPosted',
    type: 'event',
  },
  {
    inputs: [],
    name: 'application',
    outputs: [
      {
        internalType: 'contract IAccessControlApplication',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'nodes',
        type: 'address[]',
      },
    ],
    name: 'cohortFingerprint',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'ritualID',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'provider',
        type: 'address',
      },
    ],
    name: 'getParticipantFromProvider',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'provider',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'aggregated',
            type: 'bool',
          },
          {
            internalType: 'bytes',
            name: 'transcript',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'decryptionRequestStaticKey',
            type: 'bytes',
          },
        ],
        internalType: 'struct Coordinator.Participant',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'ritualId',
        type: 'uint32',
      },
    ],
    name: 'getParticipants',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'provider',
            type: 'address',
          },
          {
            internalType: 'bool',
            name: 'aggregated',
            type: 'bool',
          },
          {
            internalType: 'bytes',
            name: 'transcript',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'decryptionRequestStaticKey',
            type: 'bytes',
          },
        ],
        internalType: 'struct Coordinator.Participant[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'ritualId',
        type: 'uint256',
      },
    ],
    name: 'getRitualState',
    outputs: [
      {
        internalType: 'enum Coordinator.RitualState',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'providers',
        type: 'address[]',
      },
    ],
    name: 'initiateRitual',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'maxDkgSize',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'numberOfRituals',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'ritualId',
        type: 'uint32',
      },
      {
        internalType: 'bytes',
        name: 'aggregatedTranscript',
        type: 'bytes',
      },
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'word0',
            type: 'bytes32',
          },
          {
            internalType: 'bytes16',
            name: 'word1',
            type: 'bytes16',
          },
        ],
        internalType: 'struct BLS12381.G1Point',
        name: 'publicKey',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: 'decryptionRequestStaticKey',
        type: 'bytes',
      },
    ],
    name: 'postAggregation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'ritualId',
        type: 'uint32',
      },
      {
        internalType: 'bytes',
        name: 'transcript',
        type: 'bytes',
      },
    ],
    name: 'postTranscript',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'rituals',
    outputs: [
      {
        internalType: 'address',
        name: 'initiator',
        type: 'address',
      },
      {
        internalType: 'uint32',
        name: 'dkgSize',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'initTimestamp',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'totalTranscripts',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'totalAggregations',
        type: 'uint32',
      },
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'word0',
            type: 'bytes32',
          },
          {
            internalType: 'bytes16',
            name: 'word1',
            type: 'bytes16',
          },
        ],
        internalType: 'struct BLS12381.G1Point',
        name: 'publicKey',
        type: 'tuple',
      },
      {
        internalType: 'bool',
        name: 'aggregationMismatch',
        type: 'bool',
      },
      {
        internalType: 'bytes',
        name: 'aggregatedTranscript',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'newSize',
        type: 'uint32',
      },
    ],
    name: 'setMaxDkgSize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'newTimeout',
        type: 'uint32',
      },
    ],
    name: 'setTimeout',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'timeout',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
