import { FC } from 'react';

interface HeaderProps {
  children: React.ReactNode;
}

export const Section: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className='grid relative grid-flow-row gap-6 mb-12'>
    {children}
  </div>
)

export const Header: FC<HeaderProps> = ({ children }) => {
  return (
    <div className='block relative w-full mt-2'>
      <h2 className='text-[2rem] font-acumin-pro font-bold border-b border-dashed border-[#b8b8b8] pb-4'>
        {children}
      </h2>
    </div>
  )
}

export const TextBlock: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <p className='black w-full max-w-[500px] leading-6'>{children}</p>
  )
}