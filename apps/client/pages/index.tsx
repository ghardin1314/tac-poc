import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  Cohort,
  Conditions,
  ConditionSet,
  DeployedStrategy,
  MessageKit,
  Strategy,
} from '@nucypher/nucypher-ts';
import { useEffect, useRef, useState } from 'react';
import { useSigner } from 'wagmi';
import { providers, utils } from 'ethers';
import { Revocation__factory } from '@tac-poc/contracts';
import { RevokeStatus } from '@tac-poc/tac';

const config = {
  threshold: 3,
  shares: 5,
  porterUri: 'https://porter-tapir.nucypher.community',
};

const revocationAddress = '0x9216d4d91bADCD1A8CC65215B2f7D067C6fEFB46';

export function Index({ deployedStrategyJSON }) {
  const plaintextRef = useRef<HTMLInputElement>(null);
  const { data: signer } = useSigner();
  const [deployedStrategy, setDeployedStrategy] =
    useState<DeployedStrategy | null>(null);

  const [cyphertext, setCyphertext] = useState<MessageKit | null>(null);

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
        deployedStrategyJSON
      );
      setDeployedStrategy(newStrategy);
    } catch (error) {
      console.error(error);
    }
  };

  const createStrategy = async () => {
    if (deployedStrategy) {
      return;
    }

    const cohort = await Cohort.create(config);

    if (!signer.provider) {
      alert('No provider found');
      return;
    }

    const newStrategy = Strategy.create(cohort);

    const deployed = await newStrategy.deploy(
      'tac-demo',
      signer.provider as providers.Web3Provider
    );

    setDeployedStrategy(deployed);
  };

  const onEncrypt = () => {
    if (!deployedStrategy) {
      alert('No strategy deployed');
      return;
    }

    const encrypter = deployedStrategy.encrypter;

    const plaintext = plaintextRef.current.value;

    if (!plaintext) {
      alert('No plaintext found');
      return;
    }

    const condition = new Conditions.Condition({
      contractAddress: revocationAddress,
      method: 'isRevoked',
      parameters: [':userAddress'],
      functionAbi: Revocation__factory.abi.find(
        (abi) => abi.name === 'isRevoked'
      ),
      chain: 80001,
      returnValueTest: {
        comparator: '==',
        value: false,
      },
    });

    const cyphertext = encrypter.encryptMessage(
      plaintext,
      new ConditionSet([condition])
    );

    setCyphertext(cyphertext);
  };

  const onDecrypt = async () => {
    if (!signer.provider) {
      alert('No provider found');
      return;
    }

    if (!cyphertext) {
      alert('No cyphertext found');
      return;
    }

    const decrypter = deployedStrategy.decrypter;

    const conditionCtx = new ConditionSet([
      // Dummy conditions to trigger signature
      new Conditions.Condition({
        chain: 1,
        method: 'eth_getBalance',
        parameters: [':userAddress', 'latest'],
        returnValueTest: { comparator: '>=', value: '0' },
      }),
    ]).buildContext(signer.provider as providers.Web3Provider);

    try {
      const plaintext = await decrypter.retrieveAndDecrypt(
        [cyphertext],
        conditionCtx
      );

      console.log(Buffer.from(plaintext[0]).toString());
    } catch (err) {
      alert(`Could not decrypt: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-screen h-full min-h-screen bg-slate-700 text-white px-8">
      <div className="flex w-full justify-between py-2">
        <span className=" text-lg font-bold">Welcome to TAC POC</span>
        <ConnectButton />
      </div>
      <RevokeStatus revocationAddress={revocationAddress} />
      <div className="flex gap-x-2">
        <span>Data to encrypt:</span>
        <input type="text" className="bg-black" ref={plaintextRef} />
        <button onClick={onEncrypt}>Encrypt</button>
      </div>
      <div>
        <button
          disabled={deployedStrategy ? true : false}
          onClick={createStrategy}
        >
          Deploy Strategy
        </button>
      </div>
      <div>{cyphertext ? 'Cyphertext loaded' : ''}</div>
      <div>
        <button disabled={!cyphertext} onClick={onDecrypt}>
          Decrypt Cyphertext
        </button>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const strategy = {
    policy: {
      id: 'base64:ZaMa6WA9zie5AYShBYpe1Q==',
      label: 'tac-demo',
      policyKey: 'base64:A/a6KUAn9HVr7l85V8AngZX6Ip3XuufiBNATxO7oxTBa',
      encryptedTreasureMap:
        'base64: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',
      aliceVerifyingKey: 'base64:A8CGHwfiOliwoHz297JJz+mQz1enU+TXC3w3XajJ1WH2',
      size: 5,
      startTimestamp: '2022-12-07T23:12:53.525Z',
      endTimestamp: '2023-01-06T23:12:53.525Z',
      txHash:
        '0xd0573df6ceb561106b421ff162c215a1d40887ca1eecd74a18da9c81c0061332',
    },
    cohortConfig: {
      ursulaAddresses: [
        '0xcbE2F626d84c556AbA674FABBbBDdbED6B39d87b',
        '0x05Be6D76d2282D24691E28E3Dc1c1A9709d70fa1',
        '0xA7165c0229544c84b417e53a1D3ab717EA4b4587',
        '0x18F3a9ae64339E4FcfeBe1ac89Bc51aC3c83C22E',
        '0xd274f0060256c186479f2b9f51615003cbcd19E6',
      ],
      threshold: 3,
      shares: 5,
      porterUri: 'https://porter-tapir.nucypher.community',
    },
    bobSecretKeyBytes: 'base64:MyRHhMj1H1rJShfd6z31O0FLHowhLDd7BDt62qb60/8=',
  };

  return {
    props: { deployedStrategyJSON: strategy },
  };
}

export default Index;
