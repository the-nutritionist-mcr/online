import { FC, useEffect, useState } from 'react';
import MainButton from '@/components/ui/main-button';
import { DateTime } from 'luxon';
import { useMe } from '@/hooks/use-me';
import { Header, Section, TextBlock } from './account-elements';
import { getPause, humanReadableDate } from './pause-utils';
import PauseSelector from './pause-selector';

interface PauseStatusProps {
  handleOpenPausePanel: () => void
}

const PauseStatus: FC<PauseStatusProps> = ({ handleOpenPausePanel }) => {
  const user = useMe();
  const [pauseStart, setPauseStart] = useState<DateTime | null>(null);
  const [pauseEnd, setPauseEnd] = useState<DateTime | null>(null);
  const [pausedNow, setPausedNow] = useState<boolean | null>(false);
  const [currentYear] = useState<number>(DateTime.now().year);
  const [showPausePanel, setShowPausePanel] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;
    const pause = getPause(user);
    setPauseStart(pause.start)
    setPauseEnd(pause.end)
    setPausedNow(pause.pausedNow)
  }, [user]);

  return (
    <>
      {
        (pauseStart && pauseEnd && !pausedNow) &&
        <div className='grid gap-6 pt-2 col-span-3'>
          <TextBlock>
            You have a pause scheduled from {humanReadableDate(pauseStart.plus({ days: 1 }), currentYear !== pauseStart.year)}, resuming on {humanReadableDate(pauseEnd.plus({ days: 1 }), currentYear !== pauseEnd.year)}.
          </TextBlock>
          {
            pauseStart.plus({ days: 1 }).toMillis() > DateTime.now().plus({weeks: 1}).toMillis() &&
            <div className='grid grid-cols-3'>
              <MainButton onClick={() => setShowPausePanel(true)}>
                Cancel this pause
              </MainButton>
            </div>
          }
        </div>
      }
      {
        pausedNow &&
        <div className='grid gap-6 pt-2 col-span-3'>
          <TextBlock>
            Your subscription is currently paused.<br />
            It will resume on {pauseEnd ? humanReadableDate(pauseEnd.plus({ days: 1 }), currentYear !== pauseEnd.year) : '...'}.
          </TextBlock>
        </div >
      }
      {
        !pauseStart &&
        <div className='grid gap-6'>
          <Section>
            {
              !showPausePanel &&
              <div className='grid grid-cols-3'>
                <MainButton onClick={() => setShowPausePanel(true)}>
                  Schedule a pause
                </MainButton>
              </div>
            }
            {
              showPausePanel &&
              <>
                <Header>Schedule a pause</Header>
                <TextBlock>
                  You can pause your plan whenever you like. Just remember to provide us with a minimum of one week's notice, as we order our fresh ingredients a week in advance. If we've already taken your subscription payment for the month, we'll credit your pause duration amount in the following month.
                </TextBlock>
                <PauseSelector handlePauseSelection={() => setShowPausePanel(false)} />
              </>
            }
          </Section>
        </div>
      }
    </>
  )
};

export default PauseStatus;