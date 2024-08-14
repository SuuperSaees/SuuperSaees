import ChatMessage from './chat-message';
import AvatarDisplayer from './ui/avatar-displayer';

interface UserMessageProps {
  user: {
    id?: string;
    name: string;
    email: string;
    picture_url: string;
  };
  message: {
    id: string;
    content: string;
    senderId: string;
    updatedAt: string;
    files: {
      id: string;
      url: string;
      type: string;
      name: string;
      size: number;
      createdAt: string;
    }[];
  };
}
const mockFileImages = [
  {
    id: '1',
    url: 'https://i.pinimg.com/736x/6a/ec/54/6aec54dcb14c166c4c9ade98f158c52a.jpg',
    type: 'image/jpeg',
    name: 'image1.jpg',
    size: 1024,
    createdAt: '2023-04-01T10:00:00Z',
  },
  {
    id: '2',
    url: 'https://i.pinimg.com/236x/4f/7a/5a/4f7a5ab07ca73f801a77739736414ebc.jpg',
    type: 'image/png',
    name: 'image2.png',
    size: 2048,
    createdAt: '2023-04-01T11:00:00Z',
  },
];
const mockMessages = [
  {
    id: '1',
    content:
      'Hey Olivia, can you please review the latest design when you can?',
    senderId: '1',
    updatedAt: '2023-05-01T12:00:00Z',
    files: mockFileImages,
  },
  {
    id: '2',
    content: 'Sure, I can do that. When do you need it?',
    senderId: '2',
    updatedAt: '2023-05-01T12:05:00Z',
    files: [],
  },
];

const UserMessage = ({ user }: UserMessageProps) => {
  const messages = mockMessages;
  return (
    <div className="flex gap-1">
      <AvatarDisplayer
        displayName={null}
        pictureUrl={user.picture_url}
        status="online"
      />
      <div className="flex flex-col gap-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} user={user} />
        ))}
      </div>
    </div>
  );
};

export default UserMessage;
