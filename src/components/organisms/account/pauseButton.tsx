import { FC } from 'react';
import { Button } from '../../atoms';
import { apiRequest } from '../../../core/api-request';
import { BackendCustomer } from '@tnmo/types';

const PauseButton: FC<{}> = () => {
  const handleClick = async () => {
    

    // const data = await apiRequest<BackendCustomer>("customers", {
    //   method: "GET"
    // })
    // console.log({ data })
  }

  return (
    <Button primary onClick={() => handleClick()}>
      Pause your plan
    </Button>
  )
};

export default PauseButton;