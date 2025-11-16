// import { Container, Text } from '@react-email/components';

// export function EmailFooter(props: React.PropsWithChildren) {
//   return (
//     <Container>
//       <Text className="px-4 text-[12px] leading-[24px] text-gray-300">
//         {props.children}
//       </Text>
//     </Container>
//   );
// }
import { Container, Text } from '@react-email/components';

interface EmailFooterProps extends React.PropsWithChildren {
  className?: string;
}

export function EmailFooter({ className, children }: EmailFooterProps) {
  return (
    <Container className={className}>
      <Text className="px-4 text-[12px] leading-[24px] text-gray-300">
        {children}
      </Text>
    </Container>
  );
}
