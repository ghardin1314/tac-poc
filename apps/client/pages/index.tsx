import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  Cohort,
  Conditions,
  ConditionSet,
  DeployedStrategy,
  SecretKey,
  Strategy,
} from '@nucypher/nucypher-ts';
import { useEffect, useRef, useState } from 'react';
import { useSigner } from 'wagmi';
import { providers, utils } from 'ethers';
import { Revocation__factory } from '@tac-poc/contracts';
import {
  DecryptMetadata,
  EncryptedMetadataProps,
  Metadata,
  RevokeStatus,
} from '@tac-poc/tac';

const config = {
  threshold: 3,
  shares: 5,
  porterUri: 'https://porter-tapir.nucypher.community',
};

const revocationAddress = '0x9216d4d91bADCD1A8CC65215B2f7D067C6fEFB46';

const condition = new Conditions.Condition({
  contractAddress: revocationAddress,
  method: 'isRevoked',
  parameters: [':userAddress'],
  functionAbi: Revocation__factory.abi.find((abi) => abi.name === 'isRevoked'),
  chain: 80001,
  returnValueTest: {
    comparator: '==',
    value: false,
  },
});

const conditionSet = new ConditionSet([condition]);

const aliceSecretKey =
  '0xeaa57275bc08381e7b76dcf00f2a24f63053f2ce2aaaf42f183e77572fe09c57';

export function Index({ deployedStrategyJSON }) {
  const { data: signer } = useSigner();
  const [deployedStrategy, setDeployedStrategy] =
    useState<DeployedStrategy | null>(null);
  const [encryptedMetadata, setEncryptedMetadata] =
    useState<EncryptedMetadataProps | null>(null);

  useEffect(() => {
    loadStrategy();
  }, []);

  const loadStrategy = async () => {
    if (!deployedStrategyJSON) {
      alert('No deployed strategy found');
      return;
    }

    try {
      const newStrategy = DeployedStrategy.fromJSON(
        {} as providers.Web3Provider,
        JSON.stringify(deployedStrategyJSON)
      );
      setDeployedStrategy(newStrategy);
    } catch (error) {
      console.error(error);
    }
  };

  const createStrategy = async () => {
    const cohort = await Cohort.create(config);

    if (!signer.provider) {
      alert('No provider found');
      return;
    }

    const newStrategy = Strategy.create(
      cohort,
      undefined,
      SecretKey.fromBytes(utils.arrayify(aliceSecretKey))
    );

    const deployed = await newStrategy.deploy(
      'tac-demo',
      signer.provider as providers.Web3Provider
    );

    console.log(deployed.toJSON());
  };


  return (
    <div className="flex flex-col w-full max-w-screen h-full min-h-screen bg-slate-700 text-white px-8">
      <div className="flex w-full justify-between py-2">
        <span className=" text-lg font-bold">Welcome to TAC POC</span>
        <ConnectButton />
      </div>
      <RevokeStatus revocationAddress={revocationAddress} />
      {deployedStrategy && (
        <Metadata
          strategy={deployedStrategy}
          conditionSet={conditionSet}
          encryptedMetadata={encryptedMetadata}
          setEncryptedMetadata={setEncryptedMetadata}
        />
      )}
      {encryptedMetadata && (
        <DecryptMetadata
          encryptedMetadata={encryptedMetadata}
          strategy={deployedStrategy}
        />
      )}
    </div>
  );
}

export async function getServerSideProps() {
  const strategy = {
    policy: {
      id: 'base64:8ZRDEKLmpTmx6V6k2omFfQ==',
      label: 'tac-demo',
      policyKey: 'base64:Anlnu0FJ8BDWAvUCfgxrgAQzn3/2fSJjCemioBPvT+sI',
      encryptedTreasureMap:
        'base64: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',
      aliceVerifyingKey: 'base64:Aw6Wuy1/opR9MYSbHO4GghPD2TC9lhO9WyqY2rBC1slb',
      size: 5,
      startTimestamp: '2022-12-08T23:07:34.626Z',
      endTimestamp: '2023-01-07T23:07:34.626Z',
      txHash:
        '0xbb2f08077e693c3ce1affd3760444c71336d131adec40b0dc1d3c6365c31199b',
    },
    cohortConfig: {
      ursulaAddresses: [
        '0xcbE2F626d84c556AbA674FABBbBDdbED6B39d87b',
        '0x18F3a9ae64339E4FcfeBe1ac89Bc51aC3c83C22E',
        '0xd274f0060256c186479f2b9f51615003cbcd19E6',
        '0x05Be6D76d2282D24691E28E3Dc1c1A9709d70fa1',
        '0xA7165c0229544c84b417e53a1D3ab717EA4b4587',
      ],
      threshold: 3,
      shares: 5,
      porterUri: 'https://porter-tapir.nucypher.community',
    },
    bobSecretKeyBytes: 'base64:VzICZLW5/AU9wFgZulUzVd/mE4SnaUjP1WJzIcJRpNY=',
  };

  return {
    props: { deployedStrategyJSON: strategy },
  };
}

export default Index;
