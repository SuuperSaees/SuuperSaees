const PreviewPDF = ({ url }: { url: string }) => (
    <iframe className='w-[192px] h-[137px] rounded-lg' src={url} type='application/pdf'>
      Your browser does not support PDFs.
    </iframe>
  );

export default PreviewPDF;