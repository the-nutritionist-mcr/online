import { FC } from 'react';
import { Button } from '../../atoms';

interface PauseButtonProps {
}

const PauseButton: FC<PauseButtonProps> = () => {
  const handleClick = () => {
    console.log('Pause button clicked');
  };

  return (
    <Button primary onClick={() => handleClick()}>
      Pause Subscription
    </Button>
  )
};

export default PauseButton;