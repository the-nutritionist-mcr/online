import { FC, useEffect, useState } from 'react';
import { apiRequest } from '../../../core/api-request';
import { BackendCustomer } from '@tnmo/types';
import MainButton from '@/components/ui/main-button';
import { DateTime } from 'luxon';
import { useMe } from '@/hooks/use-me';

interface CancelPauseButtonProps {
  handlePauseCancelled: () => void;
}

const CancelPauseButton: FC<CancelPauseButtonProps> = ({ handlePauseCancelled }) => {
  const user = useMe();
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = async () => {
    if (!user) return;
    setLoading(true);

    user.plans.forEach(async plan => {
      const data = await apiRequest<BackendCustomer>("chargebee-remove-pause-plan", {
        method: "POST",
        body: JSON.stringify({
          "plan_id": plan.id
        })
      })
      handlePauseCancelled();
    });
  }

  return (
    <>
      <MainButton
        disabled={!user || loading}
        loading={loading}
        onClick={() => handleClick()}>
        {
          loading ? 'Cancelling...' : 'Cancel this pause'
        }
      </MainButton>
    </>
  )
};

export default CancelPauseButton;