import { Container } from '@react-email/components';

interface EmailHeaderProps extends React.PropsWithChildren {
  className?: string;
}

export function EmailHeader({ className, children }: EmailHeaderProps) {
  return <Container className={className}>{children}</Container>;
}
