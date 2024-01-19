import { FC } from 'react';
import { apiRequest } from '../../../core/api-request';
import { BackendCustomer } from '@tnmo/types';
import MainButton from '@/components/ui/main-button';
import { DateTime } from 'luxon';
import { useMe } from '@/hooks/use-me';

interface PauseButtonProps {
  pauseDate: DateTime | null;
}

const PauseButton: FC<PauseButtonProps> = ({ pauseDate }) => {
  const user = useMe();
  console.log({ user })

  const handleClick = async () => {
    console.log(pauseDate?.toLocaleString(DateTime.DATE_HUGE));

    const data = await apiRequest<BackendCustomer>("chargebee-get-customer", {
      method: "GET"
    })
    console.log({ data })
  }

  return (
    <MainButton onClick={() => handleClick()}>
      Schedule this pause
    </MainButton>
  )
};

export default PauseButton;