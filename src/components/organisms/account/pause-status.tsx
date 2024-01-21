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
  const [pausedNow, setPausedNow] = useState<boolean | null>(false);
  const now = DateTime.now();

  useEffect(() => {
    if (!user) return
    console.log({user})
    const pauseStart = user.plans[0]?.pauseStart ? DateTime.fromMillis(user.plans[0]?.pauseStart).plus({ days: 1 }) : null
    setPauseStart(pauseStart)

    const pauseEnd = user.plans[0]?.pauseEnd ? DateTime.fromMillis(user.plans[0]?.pauseEnd).plus({ days: 1 }) : null
    setPauseEnd(pauseEnd)

    const pausedNow = pauseStart && pauseEnd && (pauseStart.minus({days: 1}).toMillis() <= now.toMillis() && pauseEnd.minus({days: 1}).toMillis() >= now.toMillis())
    setPausedNow(pausedNow)
  }, [user]);

  return (
    <>
      {
        (pauseStart && pauseEnd && !pausedNow) &&
        <div className='grid gap-6 pt-2 col-span-3'>
          <TextBlock>
            You have a pause scheduled from {pauseStart.toLocaleString(DateTime.DATE_HUGE)}.<br />
            Your subscription will resume on {pauseEnd.toLocaleString(DateTime.DATE_HUGE)}.
          </TextBlock>
        </div>
      }
      {
        pausedNow &&
        <div className='grid gap-6 pt-2 col-span-3'>
          <TextBlock>
            Your subscription is currently paused.<br />
            It will resume on {pauseEnd?.toLocaleString(DateTime.DATE_HUGE)}.
          </TextBlock>
        </div>
      }
      {
        !pauseStart &&
        <div className='grid gap-6 pt-2'>
          <MainButton onClick={handleOpenPausePanel}>
            Schedule a pause
          </MainButton>
        </div>
      }
    </>
  )
};

export default PauseStatus;