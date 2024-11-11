import { UseFormReturn } from 'react-hook-form';
import { BriefCreationForm } from '../components/brief-creation-form';
import { FormField as FormFieldType } from '~/lib/form-field.types';
import { Brief as BriefType } from '~/lib/brief.types';
import { Service } from '~/lib/services.types';

type FormFieldType = FormFieldType.Insert;
type BriefType = BriefType.Type;

export type Option = {
  label: string;
  value: string;
  selected?: boolean;
};

export type FormField = Omit<
  FormFieldType,
  'created_at' | 'id'
> & {
  options?: Option[] | null;
  id: string;
};

export type Brief = Pick<BriefType , 'name'> & {
  id?: BriefType['id'];
  description?: BriefType['description'];
  image_url?: BriefType['image_url'];
  services: Pick<Service.Response, 'id' | 'name'>[];
}

export type ComponentProps = {
  index: number;
  question: FormField;
  form: UseFormReturn<BriefCreationForm>;
  handleQuestionChange: (
    id: string,
    field:
      | 'label'
      | 'description'
      | 'placeholder'
      | `options.${number}.selected` | 'image_url', 
    value: string | boolean | Date,
  ) => void;
  handleRemoveQuestion: (id: string) => void;
  userRole?: string;
  inSidebar?: boolean;
};

export type InputTypes =
  | 'date'
  | 'text-short'
  | 'text-large'
  | 'select'
  | 'multiple_choice'
  | 'dropdown'
  | 'file';

export type Input = {
  name: string;
  icon: JSX.Element;
  action: () => void;
  content: FormField & {
    type?: InputTypes;
  };
  component: JSX.Element | ((props: ComponentProps) => JSX.Element); // Using a generic for props
};

export type ContentTypes =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'rich-text'
  | 'image'
  | 'video';

export type Content = {
  name: string;
  icon: JSX.Element;
  action: () => void;
  content: FormField & {
    type?: ContentTypes;
  };
  component: JSX.Element | ((props: ComponentProps) => JSX.Element); // Using a generic for props
};
