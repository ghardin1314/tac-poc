import { MetadataForm } from './metadata-form';

import {
  EncryptedMetadata,
  EncryptedMetadataProps,
} from './encrypted-metadata';

export interface MetadataProps {

  // encryptedMetadata: EncryptedMetadataProps;
  // setEncryptedMetadata: (encryptedMetadata: EncryptedMetadataProps) => void;
}

export const Metadata = ({
  // encryptedMetadata,
  // setEncryptedMetadata,
}: MetadataProps) => {
  return (
    <div className="mt-4">
      <span className="font-bold text-xl mt-4">Metadata: </span>
      <div className="grid grid-cols-2">
        <div className="w-1/2">
          <MetadataForm />
        </div>
        <div>
          {/* {encryptedMetadata && <EncryptedMetadata {...encryptedMetadata} />} */}
        </div>
      </div>
    </div>
  );
};
