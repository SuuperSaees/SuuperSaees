import { Heading } from '@react-email/components';

interface EmailHeadingProps extends React.PropsWithChildren {
  className?: string;
}

export function EmailHeading({ className, children }: EmailHeadingProps) {
  return (
    <Heading className={`mx-0 p-0 font-sans text-[20px] font-normal tracking-tight text-black ${className}`}>
      {children}
    </Heading>
  );
}
