import { Brief } from '~/lib/brief.types';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import UserFile from './user-file';


const UserFirstMessage = ({ interaction }) => {
  const { t } = useTranslation('orders');
  const convertLinks = (text: string) => {
    const urlRegex =
      /\b(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*))/gi;
    return text.replace(
      urlRegex,
      (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">${url}</a>`,
    );
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

  const getExtension = (fileUrl: string) => {
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    if(extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'gif' || extension === 'bmp' || extension === 'svg' || extension === 'webp' || extension === 'avif') {
      return 'image/' + extension;
    } else if(extension === 'mp4' || extension === 'webm' || extension === 'ogg' || extension === 'avi' || extension === 'mov') {
      return 'video/' + extension;
    }
    return extension;
  };

  return (
    <div className={`flex flex-col gap-2 w-full p-0 max-w-full min-w-0`}>
    <div className="flex justify-between w-full">
      <div className="flex gap-2">
        <span className="font-semibold">{interaction?.userSettings.name} {t("createdNewProject")}</span>
      </div>
      <small className="">{`${date}`}</small>
    </div>

    <div className="flex w-full p-2.5 flex-col items-start gap-2.5 rounded-tr-lg rounded-br-lg rounded-bl-lg bg-gray-100">
      {interaction.fields.map((field) => (
        field.response && (
          <div key={field.id} className="flex w-full flex-col gap-2.5 rounded-lg">
            {field.field?.type === "file" ? (
              field.response !== "" && (
                <div className="flex max-w-full gap-4 overflow-x-auto [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                  {formatResponse(field).map((fileUrl, index) => (
                    <UserFile key={index} file={{
                      url: fileUrl,
                      name: getFileName(fileUrl),
                      type: getExtension(fileUrl),
                    }} />
                  ))}
                </div>
              )
            ) : (
              field.response !== "" && (
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
              )
            )}
          </div>
        )
      ))}
    </div>
  </div>
  );
};

export default UserFirstMessage;