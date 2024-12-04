import { Brief } from '~/lib/brief.types';
import { Check, Download, StickyNote } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';


const UserFirstMessage = ({ interaction }) => {
  console.log('interaction', interaction);
  const { t } = useTranslation('orders');
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);
  const convertLinks = (text: string) => {
    const urlRegex =
      /\b(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*))/gi;
    return text.replace(
      urlRegex,
      (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">${url}</a>`,
    );
  };

  const handleDownload = async ({src}) => {
    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error('Failed to fetch image');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'image.jpg'; // Set the filename for the downloaded file
      link.click();

      window.URL.revokeObjectURL(url); // Clean up the object URL
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const getFileName = (fileUrl: string) => {
    const fileName = fileUrl.split("/").pop() ?? "";
    const underscoreIndex = fileName.indexOf("_");
    return underscoreIndex !== -1 ? fileName.slice(underscoreIndex + 1) : fileName;
  };

  const formatResponse = (
    formField: Brief.Relationships.FormFieldResponse.Response,
  ) => {
    if (formField.field?.type === "date") {
      return format(new Date(formField.response), "PPPP");
    }
    if (formField.field?.type === "rich-text") {
      return formField.response;
    }
    if (formField.field?.type === "file") {
      return formField.response.split(",").map((url) => url.trim());
    }
    return convertLinks(formField.response);
  };

  const date = format(new Date(interaction.created_at), 'MMM dd, p');

  const isImageOrVideo = (fileUrl: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov'];

    const extension = fileUrl.split('.').pop()?.toLowerCase();

    return imageExtensions.includes(`.${extension}`) || videoExtensions.includes(`.${extension}`);
  };

  return (
    <div className="flex items-start gap-4 w-full">
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-200 p-1">
        <Check className="text-green-700" />
      </div>
      <div className="flex flex-col w-full">
        <div className="flex justify-between w-full">
          <span>
            {interaction?.userSettings.name} {t("createdNewProject")}
          </span>
          <small>{`${date}`}</small>
        </div>
        <div className="flex w-full p-2.5 flex-col items-start gap-2.5 rounded-tr-lg rounded-br-lg rounded-bl-lg bg-gray-100">
          {interaction.fields.map((field) => (
            <div key={field.id} className="flex w-full flex-col gap-2.5 rounded-lg">
              {field.field?.type === "file" ? (
                <div className="flex flex-wrap gap-2">
                  {formatResponse(field).map((fileUrl, index) => (
                    <div
                      key={index}
                      className="relative flex flex-col items-center justify-start w-24 mt-4 m-2"
                      onMouseEnter={() => setHoveredFile(fileUrl)}
                      onMouseLeave={() => setHoveredFile(null)}
                    >
                      <div className="flex items-center justify-center w-24 h-16 bg-gray-200 rounded-lg">
                        {isImageOrVideo(fileUrl) ? (
                          isImageOrVideo(fileUrl) && fileUrl.includes('.mp4') ? (
                            <video className="w-full h-full object-cover rounded-lg" controls>
                              <source src={fileUrl} />
                            </video>
                          ) : (
                            <img src={fileUrl} alt="preview" className="w-full h-full object-cover rounded-lg" />
                          )
                        ) : (
                          <StickyNote className="text-white w-8" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 whitespace-normal break-words w-24">
                        {getFileName(fileUrl)}
                      </p>
                      {hoveredFile === fileUrl && (
                        <div className="absolute top-[-8px] right-[-8px]">
                          <Download
                            className="cursor-pointer w-4 h-4 bg-white rounded-full shadow"
                            onClick={() => handleDownload({ src: fileUrl })}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <span className="text-gray-900 text-4 font-semibold">
                    {field.field?.label}
                  </span>
                  <span
                    className="text-gray-900 text-4 font-normal"
                    dangerouslySetInnerHTML={{
                      __html: formatResponse(field),
                    }}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserFirstMessage;
