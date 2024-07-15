import { FC, useEffect, useState } from 'react';
import { apiRequest } from '../../../core/api-request';
import { BackendCustomer } from '@tnmo/types';
import MainButton from '@/components/ui/main-button';
import { DateTime } from 'luxon';
import { useMe } from '@/hooks/use-me';
import { PauseWeeks } from './pause-utils';

interface SchedulePauseButtonProps {
  pauseDate: DateTime | null;
  resumeDate: DateTime | null;
  handlePauseSelection: () => void;
}

const SchedulePauseButton: FC<SchedulePauseButtonProps> = ({ pauseDate, resumeDate }) => {
  const user = useMe();
  const [loading, setLoading] = useState<boolean>(false);

  const handleClick = async () => {
    if (!pauseDate || !resumeDate || !user) return;
    setLoading(true);
    user.plans.forEach(async plan => pausePlan(plan.id, pauseDate, resumeDate));
  }

  const pausePlan = async (planId: string, pauseDate: DateTime, resumeDate: DateTime) => {
    const data = await apiRequest<BackendCustomer>("chargebee-pause-plan", {
      method: "POST",
      body: JSON.stringify({
        "plan_id": planId,
        "pause_date": pauseDate.toUnixInteger(),
        "resume_date": resumeDate.toUnixInteger()
      })
    })
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