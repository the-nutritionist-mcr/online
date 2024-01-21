import { FC, useEffect, useState } from 'react';
import { apiRequest } from '../../../core/api-request';
import { BackendCustomer } from '@tnmo/types';
import MainButton from '@/components/ui/main-button';
import { DateTime } from 'luxon';
import { useMe } from '@/hooks/use-me';
import { Pause, getPause, humanReadableDate } from './pause-utils';

interface PauseButtonProps {
  pauseDate: DateTime | null;
}

const PauseButton: FC<PauseButtonProps> = ({ pauseDate }) => {
  const user = useMe();
  const [loading, setLoading] = useState<boolean>(false); 

  const handleClick = async () => {
    // console.log('pause date:', humanReadableDate(pauseDate), 'plan:', user?.plans[0].id);

    if (!pauseDate || !user) return;
    setLoading(true);
    const data = await apiRequest<BackendCustomer>("chargebee-pause-plan", {
      method: "POST",
      body: JSON.stringify({
        "plan_id": user.plans[0].id,
        "pause_date": pauseDate.toUnixInteger(),
        "resume_date": pauseDate.plus({ weeks: 1 }).toUnixInteger()
      })
    })
    setLoading(false);
    console.log({ data })
  }

  return (
    <>
      <MainButton
        disabled={!!(!pauseDate && !user) || loading}
        loading={loading}
        onClick={() => handleClick()}>
        Schedule this pause
      </MainButton>
    </>
  )
};

export default PauseButton;