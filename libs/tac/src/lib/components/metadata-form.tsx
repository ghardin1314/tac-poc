import { useRef } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { PrimaryButton } from './button';
import { EncryptedMetadataProps } from './encrypted-metadata';

export interface MetadataFormProps {
  onSubmit: SubmitHandler<MetadataFormInputs>;
}

export type MetadataFormInputs = {
  title: string;
  description: string;
  file: FileList;
};

export const MetadataForm = ({ onSubmit }: MetadataFormProps) => {
  const { register, handleSubmit } = useForm<MetadataFormInputs>();

  // const onEncrypt = async () => {
  //   const encrypter = strategy.encrypter;

  //   const file = fileRef.current?.files?.[0];

  //   if (!file) {
  //     alert('No file selected');
  //     return;
  //   }

  //   const cyphertext = encrypter.encryptMessage(
  //     new Uint8Array(await file.arrayBuffer()),
  //     conditionSet
  //   );

  //   const encryptedMetadata = {
  //     title: titleRef.current?.value,
  //     description: descriptionRef.current?.value,
  //     image: cyphertext.toBytes(),
  //     conditions: JSON.parse(cyphertext.conditions?.toString() || ''),
  //   };

  //   setEncryptedMetadata(encryptedMetadata);
  // };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-y-2 p-2"
    >
      <input
        type="text"
        placeholder="Title"
        className="px-2 py-1 rounded bg-slate-900"
        {...register('title', { required: true })}
      />
      <input
        type="text"
        placeholder="Description"
        className="px-2 py-1 rounded bg-slate-900"
        {...register('description', { required: true })}
      />
      <input
        type="file"
        placeholder="Description"
        className="px-2 py-1 rounded bg-slate-900"
        {...register('file', { required: true })}
      />
      <PrimaryButton type="submit">Encrypt</PrimaryButton>
    </form>
  );
};
