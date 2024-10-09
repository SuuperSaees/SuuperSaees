import { ALargeSmall, AlignCenter, Image, Play } from 'lucide-react';

import FormTitleComponent from '../components/title-content';
import { ComponentProps, Content, ContentTypes } from '../types/brief.types';

type ContentKey = ContentTypes;
type ContentValue = Content;
type ContentMap = Map<ContentKey, ContentValue>;
// Generator function to create the content Map
export const generateContent = (
  action: (contentName: ContentKey) => void,
): ContentMap => {
  return new Map([
    [
      'h1',
      {
        name: 'Title',
        icon: <ALargeSmall className="h-8 w-8" />,
        action: () => action('h1'), // Action passed dynamically,
        content: {
          label: 'Title',
          placeholder: '',
          description: '',
          type: 'h1',
        },
        component: (props: ComponentProps) => (
          <FormTitleComponent
            index={props.index}
            question={props.question}
            form={props.form}
            handleQuestionChange={props.handleQuestionChange}
            handleRemoveQuestion={props.handleRemoveQuestion}
          />
        ),
      },
    ],
    [
      'rich-text',
      {
        name: 'Rich text',
        icon: <AlignCenter className="h-8 w-8" />,
        action: () => action('rich-text'), // Action passed dynamically,
        component: <></>, // Custom component
        content: {
          label: 'Rich text',
          placeholder: '',
          description: '',
        },
      },
    ],
    [
      'image',
      {
        name: 'Image',
        icon: <Image className="h-8 w-8" />,
        action: () => action('image'), // Action passed dynamically
        component: <></>, // Custom component
        content: {
          label: 'Image',
          placeholder: '',
          description: '',
        },
      },
    ],
    [
      'video',
      {
        name: 'Video',
        icon: <Play className="h-8 w-8" />,
        action: () => action('video'), // Action passed dynamically,
        component: <></>, // Custom component,
        content: {
          label: 'Video',
          placeholder: '',
          description: '',
        },
      },
    ],
    // Add other content...
  ]);
};
