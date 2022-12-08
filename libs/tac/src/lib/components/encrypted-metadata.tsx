import { utils } from 'ethers';

export interface EncryptedMetadataProps {
  title?: string;
  description?: string;
  image: Uint8Array;
  conditions: any;
}

export const EncryptedMetadata = ({
  title,
  description,
  image,
  conditions,
}: EncryptedMetadataProps) => {
  return (
    <div className="text-xs">
      <pre className=" overflow-clip overflow-ellipsis">
        {JSON.stringify(
          {
            title,
            description,
            image: utils.hexlify(image),
            conditions: conditions,
          },
          null,
          4
        )}
      </pre>
    </div>
  );
};
