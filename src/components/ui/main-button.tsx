import { FC, ReactNode } from 'react';
import { Button } from './button';
import { ReloadIcon } from '@radix-ui/react-icons';

interface MainButtonProps {
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean | undefined;
  loading?: boolean | undefined;
}

const MainButton: FC<MainButtonProps> = ({ children, onClick = () => { }, disabled = false, loading = false }) => {
  return (
    <Button onClick={onClick}
      className='shadow-none font-acumin-pro text-[16px] font-bold py-5 rounded-full text-white hover:bg-white hover:text-black border border-black min-w-[240px]'
      disabled={disabled}>
      {
        loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
      }
      {children}
    </Button>
  )
}

export default MainButton;