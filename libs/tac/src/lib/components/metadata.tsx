import { MetadataForm } from './metadata-form';
import { ConditionSet, DeployedStrategy } from '@nucypher/nucypher-ts';
import {
  EncryptedMetadata,
  EncryptedMetadataProps,
} from './encrypted-metadata';

export interface MetadataProps {
  strategy: DeployedStrategy;
  conditionSet: ConditionSet;
  encryptedMetadata: EncryptedMetadataProps;
  setEncryptedMetadata: (encryptedMetadata: EncryptedMetadataProps) => void;
}

export const Metadata = ({
  strategy,
  conditionSet,
  encryptedMetadata,
  setEncryptedMetadata,
}: MetadataProps) => {
  return (
    <div className="mt-4">
      <span className="font-bold text-xl mt-4">Metadata: </span>
      <div className="grid grid-cols-2">
        <div className="w-1/2">
          <MetadataForm
            strategy={strategy}
            conditionSet={conditionSet}
            setEncryptedMetadata={setEncryptedMetadata}
          />
        </div>
        <div>
          {encryptedMetadata && <EncryptedMetadata {...encryptedMetadata} />}
        </div>
      </div>
    </div>
  );
};
