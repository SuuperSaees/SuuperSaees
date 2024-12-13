const PreviewVideo = ({ url }: { url: string }) => (
    <video className='w-[192px] h-[137px] rounded-lg' controls>
      <source src={url} type='video/mp4' />
      Your browser does not support the video tag.
    </video>
  );

export default PreviewVideo;