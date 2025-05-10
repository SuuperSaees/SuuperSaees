import { Message as MessageType } from '~/lib/message.types';

import Avatar from '../../../components/ui/avatar';
import Message from './message';

interface UserMessageProps {
  message: MessageType.Type;
  canDelete?: boolean;
}

const UserMessage = ({ message, canDelete = false }: UserMessageProps) => {
  return (
    <div className="flex w-full items-start gap-4 rounded-lg p-2 transition duration-300 hover:bg-grayTrue-100">
      <Avatar
        username={message?.user?.name}
        src={message?.user?.picture_url ?? ''}
        alt={message?.user?.name ?? ''}
        text={message?.user?.name}
      />

      <Message key={message?.id} message={message} canDelete={canDelete} />
    </div>
  );
};

export default UserMessage;
