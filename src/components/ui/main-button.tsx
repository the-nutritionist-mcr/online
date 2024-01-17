import { FC, ReactNode } from 'react';
import { Button } from './button';

interface MainButtonProps {
  onClick?: () => void;
  children: ReactNode;
}

const MainButton: FC<MainButtonProps> = ({ children, onClick = () => { } }) => {
  return (
    <Button onClick={onClick} className='shadow-none font-acumin-pro text-[16px] font-bold py-5 rounded-full text-white hover:bg-white hover:text-black border border-black min-w-[240px]'>
      {children}
    </Button>
  )
}

export default MainButton;