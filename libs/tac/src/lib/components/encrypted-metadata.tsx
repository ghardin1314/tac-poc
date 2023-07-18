export interface EncryptedMetadataProps {
  title?: string;
  description?: string;
  image: string;
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
            image: image,
            conditions: conditions,
          },
          null,
          4
        )}
      </pre>
    </div>
  );
};
