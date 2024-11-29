import { ALargeSmall, Image } from 'lucide-react';

import FormTitleComponent from '../components/content-fields/title-content';
// import FormRichTextComponent from '../components/content-fields/rich-text-content';
import { ComponentProps, Content, ContentTypes } from '../types/brief.types';
// import FormVideoUpload from '../components/video-content';
import UploadImagePreview from '../components/upload-image-preview';
// import { AlignCenter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type ContentKey = ContentTypes;
type ContentValue = Content;
type ContentMap = Map<ContentKey, ContentValue>;
// Generator function to create the content Map
export const useGenerateContent = (
  action: (contentName: ContentKey) => void,
): ContentMap => {
  const {t} = useTranslation('briefs')
  return new Map([
    [
      'h1',
      {
        name: t('title.value'),
        icon: <ALargeSmall className="h-6 w-6" />,
        action: () => action('h1'), // Action passed dynamically,
        content: {
          label: 'Title',
          description: '',
          placeholder: '',
          type: 'h1',
          position: -1,
          id: 'create-form-field-0',
        },
        component: (props: ComponentProps) => (
          <FormTitleComponent
            index={props.index}
            question={props.question}
            form={props.form}
            handleQuestionChange={props.handleQuestionChange}
            handleRemoveQuestion={props.handleRemoveQuestion}
            handleQuestionFocus={props.handleQuestionFocus}
            handleQuestionBlur={props.handleQuestionBlur}
          />
        ),
      },
    ],
    // [
    //   'rich-text',
    //   {
    //     name: t('richText.value'),
    //     icon: <AlignCenter className="h-8 w-8" />,
    //     action: () => action('rich-text'), // Action passed dynamically,
    //     content: {
    //       label: '',
    //       description: '',
    //       placeholder: '',
    //       type: 'rich-text',
    //       position: -1,
    //       id: 'create-form-field-0',
    //     },
    //     component: (props: ComponentProps) => (
    //       <FormRichTextComponent
    //         index={props.index}
    //         question={props.question}
    //         form={props.form}
    //         handleQuestionChange={props.handleQuestionChange}
    //         handleRemoveQuestion={props.handleRemoveQuestion}
    //         handleQuestionFocus={props.handleQuestionFocus}
    //         handleQuestionBlur={props.handleQuestionBlur}
    //         userRole={props.userRole}
    //         inSidebar = {false}
    //       />
    //     ),
    //   },
    // ],
    [
      'image',
      {
        name: t('uploadImage.value'),
        icon: <Image className="h-6 w-6" />,
        action: () => action('image'), // Action passed dynamically
        content: {
          label: 'Image',
          placeholder: '',
          type:'image',
          position: -1,
          id: 'create-form-field-0',
        },
        component: (props: ComponentProps) => (
          <UploadImagePreview
            index={props.index}
            question={props.question}
            form={props.form}
          />
        ), // Custom component
      },
    ],
    // [
    //   'video',
    //   {
    //     name: 'Video',
    //     icon: <Play className="h-8 w-8" />,
    //     action: () => action('video'), 
    //     content: {
    //       label: 'Video',
    //       placeholder: '',
    //       description: '',
    //       type: 'video',
    //     },
    //     component: (props: ComponentProps) => (
    //       <FormVideoUpload
    //         index={props.index}
    //         question={props.question}
    //         form={props.form}
    //         handleQuestionChange={props.handleQuestionChange}
    //         handleRemoveQuestion={props.handleRemoveQuestion}
    //       />
    //     )
    //   },
    // ],
    // Add other content...
  ]);
};
