import { Avatar, AvatarFallback, AvatarImage } from '../shadcn/avatar';


type SessionProps = {
  displayName: string | null;
  pictureUrl?: string | null;
  className?: string;
};

type TextProps = {
  text: string;
};

type ProfileAvatarProps =
  | (SessionProps & React.HTMLAttributes<HTMLDivElement>)
  | (TextProps & React.HTMLAttributes<HTMLDivElement>);

export function ProfileAvatar(props: ProfileAvatarProps) {
  const { className, ...rest } = props;
  const avatarClassName = 'mx-auto w-9 h-9 group-focus:ring-2';

  if ('text' in props) {
    return (
      <Avatar className={avatarClassName + ` ${className}`} {...rest}>
        <AvatarFallback>
          <span className={'uppercase'}>{props.text.slice(0, 1)}</span>
        </AvatarFallback>
      </Avatar>
    );
  }

  const initials = props.displayName?.slice(0, 1);

  return (
    <Avatar className={avatarClassName + ` ${className}`} {...rest}>
      <AvatarImage src={props.pictureUrl ?? undefined} />

      <AvatarFallback className={'animate-in fade-in'}>
        <span suppressHydrationWarning className={'uppercase'}>
          {initials}
        </span>
      </AvatarFallback>
    </Avatar>
  );
}