import { FC } from 'react';
import { Button } from '../../atoms';
import { apiRequest } from '../../../core/api-request';
import { BackendCustomer } from '@tnmo/types';

const PauseButton: FC<{}> = () => {
  const handleClick = async () => {
    const data = await apiRequest<BackendCustomer>("customer", {
      method: "GET"
    })

    console.log({ data })
  }

  return (
    <Button primary onClick={() => handleClick()}>
      Pause Subscription
    </Button>
  )
};

export default PauseButton;