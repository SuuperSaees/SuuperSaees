const PreviewImage = ({ url, alt }) => (
    <img src={url} alt={alt} className='w-full  h-full rounded-lg object-contain' />
);

export default PreviewImage;