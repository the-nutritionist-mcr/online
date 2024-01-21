import { FC, useEffect, useState } from 'react';
import MainButton from '@/components/ui/main-button';
import { DateTime } from 'luxon';
import { useMe } from '@/hooks/use-me';
import { TextBlock } from './account-elements';
import { getPause, humanReadableDate } from './pause-utils';

interface PauseStatusProps {
  handleOpenPausePanel: () => void
}

const PauseStatus: FC<PauseStatusProps> = ({ handleOpenPausePanel }) => {
  const user = useMe();
  const [pauseStart, setPauseStart] = useState<DateTime | null>(null);
  const [pauseEnd, setPauseEnd] = useState<DateTime | null>(null);
  const [pausedNow, setPausedNow] = useState<boolean | null>(false);
  const [currentYear, setCurrentYear] = useState<number>(false);

  useEffect(() => {
    if (!user) return;
    const pause = getPause(user);
    setPauseStart(pause.start)
    setPauseEnd(pause.end)
    setPausedNow(pause.pausedNow)
    setCurrentYear(DateTime.now().year)
  }, [user]);

  return (
    <>
      {
        (pauseStart && pauseEnd && !pausedNow) &&
        <div className='grid gap-6 pt-2 col-span-3'>
          <TextBlock>
            You have a pause scheduled from {humanReadableDate(pauseStart.plus({days: 1}), currentYear !== pauseStart.year)}, resuming on {humanReadableDate(pauseEnd.plus({days: 1}), currentYear !== pauseEnd.year)}.
          </TextBlock>
        </div>
      }
      {
        pausedNow &&
        <div className='grid gap-6 pt-2 col-span-3'>
          <TextBlock>
            Your subscription is currently paused.<br />
            It will resume on {pauseEnd ? humanReadableDate(pauseEnd.plus({days: 1}), currentYear !== pauseEnd.year) : '...'}.
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