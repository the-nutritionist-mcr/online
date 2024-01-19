import { FC, useEffect, useState } from 'react';
import MainButton from '@/components/ui/main-button';
import { DateTime } from 'luxon';
import { useMe } from '@/hooks/use-me';
import { TextBlock } from './account-elements';

interface PauseStatusProps {
  handleOpenPausePanel: () => void
}

const PauseStatus: FC<PauseStatusProps> = ({ handleOpenPausePanel }) => {
  const user = useMe();
  const [pauseStart, setPauseStart] = useState<DateTime | null>(null);
  const [pauseEnd, setPauseEnd] = useState<DateTime | null>(null);
  const [pausedNow, setPausedNow] = useState<boolean>(false);
  const now = DateTime.now()

  useEffect(() => {
    if (!user) return
    const pauseStart = user.plans[0]?.pauseStart ? DateTime.fromMillis(user.plans[0]?.pauseStart).plus({days: 1}) : null
    setPauseStart(pauseStart)   

    const pauseEnd = user.plans[0]?.pauseEnd ? DateTime.fromMillis(user.plans[0]?.pauseEnd).plus({days: 1}) : null
    setPauseEnd(pauseEnd)       
    
    const paused = pauseStart && user.plans[0].pauseEnd
      ? pauseStart.toMillis() <= now.toMillis() && now.toMillis() < user.plans[0].pauseEnd
      : false
    setPausedNow(paused)
  }, [user]);

  return (
    <div className='grid gap-6 pt-2 col-span-3'>
      {
        (pauseStart && pauseEnd && !pausedNow) &&
        <TextBlock>
          You have a pause scheduled from {pauseStart.toLocaleString(DateTime.DATE_HUGE)}.<br />
          Your subscription will resume on {pauseEnd.toLocaleString(DateTime.DATE_HUGE)}.
        </TextBlock>
      }
      {
        pausedNow &&
        <TextBlock>
          Your subscription is currently paused.<br />
          It will resume on {pauseEnd?.toLocaleString(DateTime.DATE_HUGE)}.
        </TextBlock>      
      }
      {
        !pauseStart &&
        <MainButton onClick={handleOpenPausePanel}>
          Pause your subscription
        </MainButton>
      }
    </div>
  )
};

export default PauseStatus;