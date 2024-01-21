import { BackendCustomer } from '@tnmo/types'
import { DateTime } from 'luxon'

export const humanReadableDate = (date: DateTime, showYear: boolean = false) => {
  return date.toFormat(`EEEE, dd MMMM${showYear ? ' yyyy' : ''}`)
};

export type Pause = {
  start: DateTime | null,
  end: DateTime | null,
  pausedNow: boolean,
  planId: string
}

export const getPause = (user: BackendCustomer): Pause => {
  const now = DateTime.now();
  const plan = user.plans[0];

  const pauseStart = plan?.pauseStart
    ? DateTime.fromMillis(plan?.pauseStart)
    : null;

  const pauseEnd = plan?.pauseEnd
    ? DateTime.fromMillis(plan?.pauseEnd)
    : null;

  const pausedNow: boolean = (
    pauseStart && pauseEnd && (pauseStart.toMillis() <= now.toMillis() && pauseEnd.toMillis() >= now.toMillis())
  ) ?? false;

  return {
    start: pauseStart,
    end: pauseEnd,
    pausedNow: pausedNow,
    planId: plan.id,
  }
}