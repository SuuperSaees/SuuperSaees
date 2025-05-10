interface ImageContainerProps {
  url: string;
  alt: string;
  size?: number;
  name?: string;
  [key: string]: unknown;
}
const ImageContainer = ({
  url,
  size,
  name,
  alt,
  ...rest
}: ImageContainerProps) => {
  /* eslint-disable @next/next/no-img-element */
  // the size must be represented on KB or MB

  const sizeString = size
    ? size < 1024
      ? `${size} KB`
      : `${Number((size / (1024 * 1024)).toFixed(2))} MB`
    : '';
  return (
    <div
      className="flex h-fit w-fit flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white p-3"
      {...rest}
    >
      <img src={url} alt={alt} className="h-40 w-40 rounded-md object-cover" />
      <div className="flex flex-col self-start truncate">
        <span>{name}</span>
        <span className="text-inherit/70">{sizeString}</span>
      </div>
    </div>
  );
};
export default ImageContainer;
