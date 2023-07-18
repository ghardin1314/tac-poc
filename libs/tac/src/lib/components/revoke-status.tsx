import { Revocation__factory } from '@tac-poc/contracts';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { PrimaryButton, SecondaryButton } from './button';
import { useEthersSigner } from './utils';

export interface RevokeStatusProps {
  revocationAddress: string;
}

export const RevokeStatus = ({ revocationAddress }: RevokeStatusProps) => {
  const [isRevoked, setIsRevoked] = useState<boolean>(false);
  const signer = useEthersSigner();

  useEffect(() => {
    checkRevocation();
  }, [signer]);

  const checkRevocation = async () => {
    if (!signer) {
      return;
    }

    const revocation = Revocation__factory.connect(revocationAddress, signer);
    const _isRevoked = await revocation.isRevoked(await signer.getAddress());
    setIsRevoked(_isRevoked);
  };

  const onRevoke = async () => {
    if (!signer) {
      alert('please connect wallet');
      return;
    }

    const revocation = Revocation__factory.connect(revocationAddress, signer);
    const tx = await revocation.revoke(await signer.getAddress());
    await tx.wait();

    alert('Successfully revoked!');
    setIsRevoked(true);
  };

  const onUnrevoke = async () => {
    if (!signer) {
      alert('please connect wallet');
      return;
    }

    const revocation = Revocation__factory.connect(revocationAddress, signer);
    const tx = await revocation.unRevoke(await signer.getAddress());
    await tx.wait();

    alert('Successfully unrevoke!');
    setIsRevoked(false);
  };

  return (
    <div className="flex gap-x-2">
      <div className="font-bold">
        <span>Your access is currently: </span>
        {isRevoked ? (
          <span className="text-red-600">revoked</span>
        ) : (
          <span className="text-green-600">active</span>
        )}
      </div>
      <SecondaryButton disabled={isRevoked} onClick={onRevoke}>
        REVOKE
      </SecondaryButton>
      <PrimaryButton disabled={!isRevoked} onClick={onUnrevoke}>
        UNREVOKE
      </PrimaryButton>
      <Link
        href={`https://mumbai.polygonscan.com/address/${revocationAddress}#code`}
        passHref
      >
        <a target="_blank">
          <PrimaryButton>Go To Contract</PrimaryButton>
        </a>
      </Link>
    </div>
  );
};
