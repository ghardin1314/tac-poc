import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  CbdStrategy,
  Cohort,
  conditions,
  DeployedCbdStrategy,
  SecretKey,
} from '@nucypher/nucypher-ts';
import { useEffect, useRef, useState } from 'react';
import { Context } from '@nucypher/nucypher-core';

import { providers, utils } from 'ethers';
import { Revocation__factory } from '@tac-poc/contracts';
import { RevokeStatus, useEthersSigner } from '@tac-poc/tac';
import { PrimaryButton } from 'libs/tac/src/lib/components/button';
import { arrayify } from 'ethers/lib/utils.js';
import { FerveoVariant, retrieveAndDecrypt } from '@tac-poc/cbd-ts';
import { usePublicClient } from 'wagmi';

const porterUri = 'https://porter-tapir.nucypher.community';

const config = {
  threshold: 3,
  shares: 5,
  porterUri,
};

const revocationAddress = '0x9216d4d91bADCD1A8CC65215B2f7D067C6fEFB46';

const aliceSecretKey =
  '0xeaa57275bc08381e7b76dcf00f2a24f63053f2ce2aaaf42f183e77572fe09c57';

export function Index() {
  const signer = useEthersSigner();
  const client = usePublicClient();

  const createCohort = async () => {
    const cohort = await Cohort.create(config);
    // const strategy = CbdStrategy.create(cohort);
    // This is using hard coded cohort with id 2
    // const deployedStrategy = await strategy.deploy(
    //   signer.provider as providers.Web3Provider
    // );

    // const ritual = DkgRitual.fromObj({
    //   id: 17,
    //   threshold: 3,
    //   dkgPublicKey: arrayify(
    //     '0xa571bff49cfd520b2efb9727576c57420f29cefe95f5363849ff83f5e5b45912,0xbf3ebc9f3671aaa399e89d994815743c'
    //   ),
    // });

    const stratConfig = {
      decrypter: {
        ritualId: 17,
        threshold: 3,
        porterUri,
      },
      dkgPublicKey: [
        ...arrayify(
          '0xa571bff49cfd520b2efb9727576c57420f29cefe95f5363849ff83f5e5b45912'
        ),
        ...arrayify('0xbf3ebc9f3671aaa399e89d994815743c'),
      ],
    };

    const deployedStrategy = DeployedCbdStrategy.fromJSON(
      JSON.stringify(stratConfig)
    );

    const functionAbi = Revocation__factory.abi.find(
      (abi) => abi.name === 'isRevoked'
    );

    // Had to go override `name` in the abi to get this to work
    console.log(functionAbi);

    const condition1 = new conditions.base.ContractCondition({
      contractAddress: revocationAddress,
      method: 'isRevoked',
      parameters: [':userAddress'],
      functionAbi: {
        inputs: [
          {
            name: 'addr',
            type: 'address',
          },
        ],
        name: 'isRevoked',
        outputs: [
          {
            name: 'addr',
            type: 'bool',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      chain: 80001,
      returnValueTest: {
        comparator: '==',
        value: false,
      },
    });

    const condition2 = new conditions.base.TimeCondition({
      chain: 80001,
      returnValueTest: {
        comparator: '>',
        value: 100,
      },
    });

    const condition = new conditions.CompoundCondition({
      operands: [condition2.toObj(), condition1.toObj()],
      operator: 'and',
    });

    const conditionExpr = new conditions.ConditionExpression(condition1);

    console.log(conditionExpr.toJson());

    const conditionCtx = conditionExpr.buildContext(
      signer?.provider as providers.Web3Provider
    );

    const encrypter = deployedStrategy.makeEncrypter(conditionExpr);

    const cyphertext = encrypter.encryptMessageCbd('hello world');

    console.log(cyphertext);

    const plaintext = await deployedStrategy.decrypter.retrieveAndDecrypt(
      signer?.provider as providers.Web3Provider,
      conditionExpr,
      0,
      cyphertext.ciphertext
    );

    const plaintext1 = await retrieveAndDecrypt({
      ritual: {
        id: 17,
        threshold: 3,
      },
      porter: {
        uri: porterUri,
      },
      condition: {
        conditionType: 'contract',
        contractAddress: revocationAddress,
        method: 'isRevoked',
        parameters: [':userAddress'],
        functionAbi: {
          inputs: [
            {
              name: '',
              type: 'address',
            },
          ],
          name: 'isRevoked',
          outputs: [
            {
              name: '',
              type: 'bool',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
        chain: 80001,
        returnValueTest: {
          comparator: '==',
          value: false,
        },
      },
      conditionCtx: new Context(await conditionCtx.toJson()),
      variant: FerveoVariant.Simple,
      client,
      cyphertext: cyphertext.ciphertext,
    });

    console.log(String.fromCharCode(...plaintext1));

    // const context = new conditions.ConditionContext(
    //   [condition],
    //   signer.provider as providers.Web3Provider
    // );

    // console.log(await context.toJson());
  };

  return (
    <div className="flex flex-col w-full max-w-screen h-full min-h-screen bg-slate-700 text-white px-8">
      <div className="flex w-full justify-between py-2">
        <span className=" text-lg font-bold">Welcome to TAC POC</span>
        <ConnectButton />
      </div>
      <RevokeStatus revocationAddress={revocationAddress} />
      <PrimaryButton onClick={createCohort}>Create Cohort</PrimaryButton>
    </div>
  );
}

export default Index;
