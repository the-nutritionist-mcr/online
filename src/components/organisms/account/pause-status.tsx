import { FC, useEffect, useState } from "react";
import Link from "next/link";
import MainButton from "@/components/ui/main-button";
import { DateTime } from "luxon";
import { useMe } from "@/hooks/use-me";
import { Header, Section, TextBlock } from "./account-elements";
import { getPause, humanReadableDate } from "./pause-utils";
import PauseSelector from "./pause-selector";
import CancelPauseButton from "./cancelPauseButton";

const PauseStatus: FC = () => {
  const user = useMe();
  const [pauseStart, setPauseStart] = useState<DateTime | null>(null);
  const [pauseEnd, setPauseEnd] = useState<DateTime | null>(null);
  const [pausedNow, setPausedNow] = useState<boolean | null>(false);
  const [currentYear] = useState<number>(DateTime.now().year);
  const [showPausePanel, setShowPausePanel] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;
    const pause = getPause(user);
    setPauseStart(pause.start);
    setPauseEnd(pause.end);
    setPausedNow(pause.pausedNow);
  }, [user]);

  return (
    <>
      {pauseStart && pauseEnd && !pausedNow && (
        <div className="flex flex-col gap-4">
          <TextBlock>
            You have a pause scheduled from{" "}
            {humanReadableDate(pauseStart, currentYear !== pauseStart.year)},
            resuming on{" "}
            {humanReadableDate(pauseEnd, currentYear !== pauseEnd.year)}.
          </TextBlock>
          {pauseStart.toMillis() >
            DateTime.now().plus({ weeks: 1 }).toMillis() && (
            <div className="flex">
              <CancelPauseButton
                handlePauseCancelled={() => setShowPausePanel(false)}
              />
            </div>
          )}
        </div>
      )}
      {pausedNow && (
        <div className="flex flex-col gap-4">
          <TextBlock>
            <strong>
              Your plan is currently paused.
              <br />
              It will resume on{" "}
              {pauseEnd
                ? humanReadableDate(pauseEnd, currentYear !== pauseEnd.year)
                : "..."}
            </strong>
          </TextBlock>
        </div>
      )}
      {!pauseStart && (
        <Section>
          {!showPausePanel && (
            <div className="flex">
              <MainButton onClick={() => setShowPausePanel(true)}>
                Schedule a pause
              </MainButton>
            </div>
          )}
          {showPausePanel && (
            <>
              <Header>Schedule a pause</Header>
              <div className="flex flex-col gap-3">
                <TextBlock>
                  You can pause your plan whenever you like. Just remember to
                  provide us with a minimum of one week's notice, as we order
                  our fresh ingredients a week in advance.
                </TextBlock>
                <TextBlock>
                  When you resume, we’ll work out any credit for missed cooks.{" "}
                  <Link href="/pause-billing/" className="underline">
                    Find out how pause billing works
                  </Link>
                  .
                </TextBlock>
              </div>
              <PauseSelector
                handlePauseSelection={() => setShowPausePanel(false)}
              />
            </>
          )}
        </Section>
      )}
    </>
  );
};

export default PauseStatus;
