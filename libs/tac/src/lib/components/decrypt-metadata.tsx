import {
  Conditions,
  ConditionSet,
  DeployedStrategy,
  MessageKit,
} from '@nucypher/nucypher-ts';
import { providers } from 'ethers';;
import { useEffect, useState } from 'react';
import { useSigner } from 'wagmi';
import { SecondaryButton } from './button';
import { EncryptedMetadataProps } from './encrypted-metadata';

export interface DecryptMetadataProps {
  encryptedMetadata: EncryptedMetadataProps;
  strategy: DeployedStrategy;
}

export const DecryptMetadata = ({
  encryptedMetadata,
  strategy,
}: DecryptMetadataProps) => {
  const { data: signer } = useSigner();
  const messageKit = MessageKit.fromBytes(encryptedMetadata.image);
  const [imgUrl, setImgUrl] = useState<string>();

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

  const onDecrypt = async () => {
    if (!signer?.provider) {
      alert('No provider found');
      return;
    }

    const decrypter = strategy.decrypter;

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
        [messageKit],
        conditionCtx
      );

      const url = URL.createObjectURL(new Blob([plaintext[0]]));
      setImgUrl(url);
    } catch (err: any) {
      alert(`Could not decrypt: ${err.message}`);
    }
  };

  return (
    <div className="flex ">
      {imgUrl ? (
        <img src={imgUrl} />
      ) : (
        <SecondaryButton onClick={onDecrypt}>Decrypt Image</SecondaryButton>
      )}
    </div>
  );
};
