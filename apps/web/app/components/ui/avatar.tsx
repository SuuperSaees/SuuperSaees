// component to display rounded avatar with fallback text - simirlar to shadcn/ui/avatar but not using the library

export default function Avatar({
  src,
  alt,
  className,
  username,
}: {
  src: string;
  alt: string;
  username?: string;
  className?: string;
  [key: string]: unknown;
}) {
  const fallback = username ? username.charAt(0).toUpperCase() : 'N/A';

  return (
    <div className={`rounded-full border-2 border-white overflow-hidden shrink-0 ${!className?.includes('w-') ? 'w-8 h-8': ''} ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <AvatarFallback fallback={fallback} />
      )}
    </div>
  );
}

export const AvatarFallback = ({
  fallback,
}: {
  fallback: string;
}) => {
  return <div className="flex items-center justify-center h-full w-full bg-gray-200 rounded-full">{fallback}</div>;
};
