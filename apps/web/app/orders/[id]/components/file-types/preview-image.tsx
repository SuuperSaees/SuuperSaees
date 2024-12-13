const PreviewImage = ({ url, alt }: { url: string; alt: string }) => (
    <img src={url} alt={alt} className='w-full  h-full rounded-lg object-cover' />
);

export default PreviewImage;