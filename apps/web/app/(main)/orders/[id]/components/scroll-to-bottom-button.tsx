import { ArrowDown } from 'lucide-react';

import { Button } from '@kit/ui/button';

interface ScrollToBottomButtonProps {
  content?: string;
  unreadMessages?: number;
  [key: string]: unknown;
}
const ScrollToBottomButton = ({
  content,
  unreadMessages,
  ...props
}: ScrollToBottomButtonProps) => {
  return (
    <Button
      variant="static"
      size="sm"
      className="sticky bottom-0 z-50 ml-auto flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-gray-200 py-3 px-2 text-xs font-semibold text-gray-700
      hover:bg-gray-100"
      {...props}
    >
      {(unreadMessages ?? 0) > 0 && (
        <span
          className={
            'flex h-5 w-5 items-center justify-center rounded-full bg-red-500 font-bold text-white ' +
            `${!content && 'absolute -right-1.5 -top-1.5'}`
          }
        >
          {unreadMessages}
        </span>
      )}
      {content && <span>{content}</span>}
      <ArrowDown className="h-4 w-4" />
    </Button>
  );
};

export default ScrollToBottomButton;
