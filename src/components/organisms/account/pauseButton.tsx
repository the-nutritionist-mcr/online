import { FC } from 'react';
import { Button } from '../../atoms';
import { apiRequest } from '../../../core/api-request';
import { BackendCustomer } from '@tnmo/types';
import MainButton from '@/components/ui/main-button';

const PauseButton: FC<{}> = () => {
  const handleClick = async () => {
    

    // const data = await apiRequest<BackendCustomer>("customers", {
    //   method: "GET"
    // })
    // console.log({ data })
  }

  return (
    <MainButton onClick={() => handleClick()}>
      Pause your plan
    </MainButton>
  )
};

export default PauseButton;