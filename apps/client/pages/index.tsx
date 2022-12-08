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
import * as fs from 'fs';

const config = {
  threshold: 3,
  shares: 5,
  porterUri: 'https://porter-tapir.nucypher.community',
};

const condition = new Conditions.RpcCondition({
  chain: 80001,
  method: 'eth_getBalance',
  parameters: [':userAddress', 'latest'],
  returnValueTest: {
    comparator: '>=',
    value: utils.parseEther('1').toString(),
  },
});

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

    // cyphertext.conditions = [
    //   {
    //     chain: 1,
    //     method: 'eth_getBalance',
    //     parameters: [':userAddress', 'latest'],
    //     returnValueTest: { comparator: '>=', value: '0' },
    //   },
    // ];

    // const jsonConditions = JSON.parse(cyphertext.conditions.toString());

    // console.log(cyphertext.conditions.toString());

    const jsonConditions = [
      {
        contractAddress: '',
        standardContractType: '',
        chain: 5,
        method: 'timelock',
        returnValueTest: {
          comparator: '>',
          value: 100,
        },
      },
    ];

    const conditions = [];

    for (const _condition of jsonConditions) {
      const condition = new Conditions.Condition(_condition);
      conditions.push(condition);
    }

    const conditionCtx = new ConditionSet(conditions).buildContext(
      signer.provider as providers.Web3Provider
    );

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
  // Wont work in prod
  const strategy = fs.readFileSync('apps/client/json/strategy.json', 'utf8');

  return {
    props: { deployedStrategyJSON: strategy },
  };
}

export default Index;
