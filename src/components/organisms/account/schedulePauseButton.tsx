import { FC, useEffect, useState } from 'react';
import { apiRequest } from '../../../core/api-request';
import { BackendCustomer } from '@tnmo/types';
import MainButton from '@/components/ui/main-button';
import { DateTime } from 'luxon';
import { useMe } from '@/hooks/use-me';
import { PauseWeeks } from './pause-utils';

interface SchedulePauseButtonProps {
  pauseDate: DateTime | null;
  pauseWeeks: PauseWeeks;
  handlePauseSelection: () => void;
}

const SchedulePauseButton: FC<SchedulePauseButtonProps> = ({ pauseDate, pauseWeeks, handlePauseSelection }) => {
  const user = useMe();
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = async () => {
    if (!pauseDate || !user) return;
    setLoading(true);

    console.log(pauseDate.toISO());
    user.plans.forEach(async plan => pausePlan(plan.id, pauseDate, pauseWeeks));
    // pausePlan(user.plans[0].id, pauseDate, pauseWeeks);
  }

  const pausePlan = async (planId: string, pauseDate: DateTime, pauseWeeks: PauseWeeks) => {
    const data = await apiRequest<BackendCustomer>("chargebee-pause-plan", {
      method: "POST",
      body: JSON.stringify({
        "plan_id": planId,
        "pause_date": pauseDate.toUnixInteger(),
        "resume_date": pauseDate.plus({ weeks: pauseWeeks }).toUnixInteger()
      })
    })
    console.log({ data });
  }

  return (
    <>
      <MainButton
        disabled={!!(!pauseDate && !user) || loading}
        loading={loading}
        onClick={() => handleClick()}>
        {
          loading ? 'Scheduling...' : 'Schedule this pause'
        }
      </MainButton>
    </>
  )
};

export default SchedulePauseButton;