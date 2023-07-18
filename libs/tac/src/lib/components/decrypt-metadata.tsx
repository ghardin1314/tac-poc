import { SecondaryButton } from './button';

export interface DecryptMetadataProps {
  onDecrypt: () => void;
  imgUrl?: string;
}

export const DecryptMetadata = ({
  onDecrypt,
  imgUrl,
}: DecryptMetadataProps) => {
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
