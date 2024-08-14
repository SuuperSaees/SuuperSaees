interface ChatMessageProps {
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
  user: {
    id: string;
    name: string;
    picture_url: string;
  };
}
const ChatMessage = ({ message, user }: ChatMessageProps) => {
  const dateOptions = {
    weekday: 'long',
  };

  const timeOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };

  const date = new Date(message.updatedAt).toLocaleDateString(
    undefined,
    dateOptions,
  );
  const time = new Date(message.updatedAt).toLocaleTimeString(
    undefined,
    timeOptions,
  );
  return (
    <div className="flex max-w-xs flex-col gap-1">
      <div className="flex justify-between">
        <span className="font-semibold">{user.name}</span>
        <small>{`${date}, ${time}`}</small>
      </div>

      <div className="flex flex-col gap-2 rounded-lg rounded-ss-none border border-gray-200 bg-gray-50 p-4">
        <p>{message.content}</p>
        {message.files.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.files.map((file) => (
              <img
                key={file.id}
                src={file.url}
                alt={file.name}
                className="h-40 w-40 rounded-md object-cover"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default ChatMessage;
