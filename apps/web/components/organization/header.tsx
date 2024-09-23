import { Avatar, AvatarImage } from '@kit/ui/avatar';
import { Trans } from '@kit/ui/trans';

interface OrganizationHeaderProps {
  name: string;
  logo: string;
  owner: {
    name: string;
    email: string;
    picture_url?: string;
  };
}
function Header({ name, logo, owner }: OrganizationHeaderProps) {
  return (
    <div className="flex w-full gap-4">
      <Avatar className="aspect-square h-16 w-16">
        <AvatarImage src={logo} alt={name + 'logo'} />
      </Avatar>
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">{name}</h1>
        <p className="text-sm text-gray-600">
          <Trans i18nKey={'clients:organizations.members.owner'} />
          {': '}
          {owner.email}
        </p>
      </div>
    </div>
  );
}

export default Header;