import { ConditionSet, DeployedStrategy } from '@nucypher/nucypher-ts';
import { useRef } from 'react';
import { PrimaryButton } from './button';
import { EncryptedMetadataProps } from './encrypted-metadata';

export interface MetadataFormProps {
  strategy: DeployedStrategy;
  conditionSet: ConditionSet;
  setEncryptedMetadata: (encryptedMetadata: EncryptedMetadataProps) => void;
}

export const MetadataForm = ({
  strategy,
  conditionSet,
  setEncryptedMetadata,
}: MetadataFormProps) => {
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onEncrypt = async () => {
    const encrypter = strategy.encrypter;

    const file = fileRef.current?.files?.[0];

    if (!file) {
      alert('No file selected');
      return;
    }

    const cyphertext = encrypter.encryptMessage(
      new Uint8Array(await file.arrayBuffer()),
      conditionSet
    );

    const encryptedMetadata = {
      title: titleRef.current?.value,
      description: descriptionRef.current?.value,
      image: cyphertext.toBytes(),
      conditions: JSON.parse(cyphertext.conditions?.toString() || ''),
    };

    setEncryptedMetadata(encryptedMetadata);
  };

  return (
    <div className="flex flex-col gap-y-2 p-2">
      <input
        ref={titleRef}
        type="text"
        placeholder="Title"
        className="px-2 py-1 rounded bg-slate-900"
      />
      <input
        ref={descriptionRef}
        type="text"
        placeholder="Description"
        className="px-2 py-1 rounded bg-slate-900"
      />
      <input
        ref={fileRef}
        type="file"
        placeholder="Description"
        className="px-2 py-1 rounded bg-slate-900"
      />
      <PrimaryButton onClick={onEncrypt}>Encrypt</PrimaryButton>
    </div>
  );
};
