import { ConnectButton } from '@rainbow-me/rainbowkit';
import { RevokeStatus, useEthersSigner } from '@tac-poc/tac';
import { PrimaryButton } from 'libs/tac/src/lib/components/button';
import {
  Condition,
  craftContext,
  encrypt,
  FerveoVariant,
  getCohortEncryptingKey,
  retrieveAndDecrypt,
} from '@tac-poc/cbd-ts';
import { usePublicClient, useWalletClient } from 'wagmi';

const porterUri = 'https://porter-tapir.nucypher.community';

const revocationAddress = '0x9216d4d91bADCD1A8CC65215B2f7D067C6fEFB46';


export function Index() {
  const signer = useEthersSigner();
  const client = usePublicClient();
  const { data: wallet } = useWalletClient();

  const createCohort = async () => {

    // const condition2 = new conditions.base.TimeCondition({
    //   chain: 80001,
    //   returnValueTest: {
    //     comparator: '>',
    //     value: 100,
    //   },
    // });

    // const condition = new conditions.CompoundCondition({
    //   operands: [condition2.toObj(), condition1.toObj()],
    //   operator: 'and',
    // });

    if (!wallet) {
      window.alert('Please connect your wallet');
      return;
    }

    const condition: Condition = {
      conditionType: 'contract',
      contractAddress: revocationAddress,
      method: 'isRevoked',
      parameters: [`:userAddress`],
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
    };

    const encryptingKey = await getCohortEncryptingKey({
      ritualId: 17,
      client,
    });
    const cyphertext2 = await encrypt({
      message: new TextEncoder().encode('hello world 2'),
      encryptingKey,
      condition,
    });

    console.log(cyphertext2);

    const conditionCtx2 = await craftContext(condition, {}, wallet);

    const plaintext1 = await retrieveAndDecrypt({
      ritual: {
        id: 17,
        threshold: 3,
      },
      porter: {
        uri: porterUri,
      },
      condition,
      conditionCtx: conditionCtx2,
      variant: FerveoVariant.Simple,
      client,
      cyphertext: cyphertext2.cyphertext,
    });

    console.log(String.fromCharCode(...plaintext1));
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
