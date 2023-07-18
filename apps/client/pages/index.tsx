import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  DecryptMetadata,
  EncryptedMetadataProps,
  Metadata,
  RevokeStatus,
  useEthersSigner,
} from '@tac-poc/tac';
import { PrimaryButton } from 'libs/tac/src/lib/components/button';
import {
  Condition,
  craftContext,
  encrypt,
  FerveoVariant,
  getRitual,
  retrieveAndDecrypt,
} from '@tac-poc/cbd-ts';
import { usePublicClient, useWalletClient } from 'wagmi';
import { useEffect, useRef, useState } from 'react';
import {
  MetadataForm,
  MetadataFormInputs,
} from 'libs/tac/src/lib/components/metadata-form';
import { toJsonStr } from 'libs/cbd-ts/src/lib/utils';
import { EncryptedMetadata } from 'libs/tac/src/lib/components/encrypted-metadata';
import { Ciphertext } from '@nucypher/nucypher-core';

const porterUri = 'https://porter-tapir.nucypher.community';

const revocationAddress = '0x9216d4d91bADCD1A8CC65215B2f7D067C6fEFB46';

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

export function Index() {
  const [ritualId, setRitualId] = useState(17);
  const [threshold, setThreshold] = useState(0);
  const [cyphertext, setCyphertext] = useState<Ciphertext>();
  const [imgUrl, setImgUrl] = useState<string>();
  const [file, setFile] = useState<File>();
  const [encryptedMetadata, setEncryptedMetadata] =
    useState<EncryptedMetadataProps>();
  const client = usePublicClient();
  const { data: wallet } = useWalletClient();

  useEffect(() => {
    if (imgUrl) {
      URL.revokeObjectURL(imgUrl);
    }
    setImgUrl(undefined);

    return () => {
      if (imgUrl) {
        URL.revokeObjectURL(imgUrl);
      }
    };
  }, [encryptedMetadata]);

  const onEncrypt = async (data: MetadataFormInputs) => {
    // TODO: check if client connected
    const ritual = await getRitual({
      ritualId,
      client,
    });

    setThreshold(ritual.dkgSize);

    const file = await data.file.item(0)?.arrayBuffer();

    if (!file) {
      window.alert('No file selected');
      return;
    }

    const cyphertext = await encrypt({
      message: new Uint8Array(file),
      encryptingKey: ritual.publicKey,
      condition,
    });

    setCyphertext(cyphertext.cyphertext);

    const encryptedMetadata = {
      title: data.title,
      description: data.description,
      image: toJsonStr(cyphertext),
      conditions: toJsonStr(condition),
    };

    setEncryptedMetadata(encryptedMetadata);
  };

  const onDecrypt = async () => {
    if (!wallet) {
      window.alert('Please connect your wallet');
      return;
    }

    if (!cyphertext) {
      window.alert('No encrypted metadata');
      return;
    }

    const conditionCtx = await craftContext(condition, {}, wallet);

    const plaintext = await retrieveAndDecrypt({
      ritual: { id: ritualId, threshold },
      client,
      porter: {
        uri: porterUri,
      },
      condition,
      conditionCtx,
      variant: FerveoVariant.Simple,
      cyphertext,
    });

    const url = URL.createObjectURL(new Blob([plaintext]));
    setImgUrl(url);
  };

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

    if (!wallet || !file) {
      window.alert('Please connect your wallet');
      return;
    }

    const ritual = await getRitual({
      ritualId: 17,
      client,
    });
    const cyphertext2 = await encrypt({
      message: new Uint8Array(await file.arrayBuffer()),
      encryptingKey: ritual.publicKey,
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

    console.log(plaintext1);
  };

  return (
    <div className="flex flex-col w-full max-w-screen h-full min-h-screen bg-slate-700 text-white px-8">
      <div className="flex w-full justify-between py-2">
        <span className=" text-lg font-bold">Welcome to TAC POC</span>
        <ConnectButton />
      </div>
      <RevokeStatus revocationAddress={revocationAddress} />
      <input
        type="number"
        placeholder="Ritual Id"
        className="px-2 py-1 rounded bg-slate-900 mt-2 max-w-md"
        value={ritualId}
        onChange={(e) => setRitualId(parseInt(e.target.value))}
      />
      <input
        type="file"
        className="px-2 py-1 rounded bg-slate-900 mt-2 max-w-md"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.item(0) || undefined)}
      />
      <PrimaryButton onClick={createCohort}>Test</PrimaryButton>
      <div className="mt-4">
        <span className="font-bold text-xl mt-4">Metadata: </span>
        <div className="grid grid-cols-2">
          <div className="w-1/2">
            <MetadataForm onSubmit={onEncrypt} />
          </div>
          <div>
            {encryptedMetadata && <EncryptedMetadata {...encryptedMetadata} />}
          </div>
        </div>
      </div>
      {encryptedMetadata && (
        <DecryptMetadata onDecrypt={onDecrypt} imgUrl={imgUrl} />
      )}
    </div>
  );
}

export default Index;
