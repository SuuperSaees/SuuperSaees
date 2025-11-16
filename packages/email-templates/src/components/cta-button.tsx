// import { Button } from '@react-email/components';

// export function CtaButton(
//   props: React.PropsWithChildren<{
//     href: string;
//   }>,
// ) {
//   return (
//     <Button
//       className="w-full rounded bg-[#000000] py-3 text-center text-[14px] font-semibold text-white no-underline"
//       href={props.href}
//     >
//       {props.children}
//     </Button>
//   );
// }
import { Button } from '@react-email/components';

interface CtaButtonProps extends React.PropsWithChildren {
  href: string;
  className?: string;
}

export function CtaButton({ href, className, children }: CtaButtonProps) {
  return (
    <Button
      className={`w-full rounded bg-[#000000] py-3 text-center text-[14px] font-semibold text-white no-underline ${className}`}
      href={href}
    >
      {children}
    </Button>
  );
}
