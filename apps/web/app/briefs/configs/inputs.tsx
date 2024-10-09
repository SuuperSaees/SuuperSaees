import {
  CalendarCheck2,
  CheckSquare,
  ChevronDown,
  Circle,
  Text,
  TextIcon,
  Upload,
} from 'lucide-react';

import { FormFieldShortText } from '../components/form-field-short-text';
import { ComponentProps, Input, InputTypes } from '../contexts/briefs-context';
import FormFieldMultipleChoice from '../components/multiple-choice';
import FormFieldSingleChoice from '../components/single-choice';
import FormFieldDropdown from '../components/dropdown';
import FormFieldDatePicker from '../components/date-picker';
import TextLarge from '../components/text-large';

// Import your custom components

type InputKey = InputTypes;
type InputValue = Input;
type InputMap = Map<InputKey, InputValue>;

// Generator function to create the inputs Map
export const generateInputs = (
  action: (inputName: InputTypes) => void,
): InputMap => {
  return new Map([
    [
      'text-short',
      {
        name: 'Short Text',
        icon: <Text className="h-8 w-8" />,
        action: () => action('text-short'), // Action passed dynamically
        content: {
          label: 'Label',
          placeholder: 'Placeholder',
          description: 'Description of the short text',
          type: 'text-short',
        },
        component: (props: ComponentProps) => (
          <FormFieldShortText
            index={props.index}
            question={props.question}
            form={props.form}
            handleQuestionChange={props.handleQuestionChange}
            handleRemoveQuestion={props.handleRemoveQuestion}
          />
        ), // Custom component
      },
    ],
    [
      'text-large',
      {
        name: 'Paragraph',
        icon: <TextIcon className="h-8 w-8" />,
        action: () => action('text-large'), // Action passed dynamically
        content: {
          label: 'Label',
          placeholder: 'Enter a description... ',
          description: 'This is a hint text for help user',
          type: 'text-large',
        },
        component: (props: ComponentProps) => (
          <TextLarge
            index={props.index}
            question={props.question}
            form={props.form}
            handleQuestionChange={props.handleQuestionChange}
            handleRemoveQuestion={props.handleRemoveQuestion}
          />
        ), // Custom component
      },
    ],
    [
      'file',
      {
        name: 'Upload files',
        icon: <Upload className="h-8 w-8" />,
        action: () => action('file'), // Action passed dynamically
        content: {
          label: 'Label',
          placeholder: 'Click or drag and drop files here...',
          description: 'Description of the file upload',
          type: 'file',
        },
        component: <></>, // Custom component
      },
    ],
    [
      'multiple_choice',
      {
        name: 'Multiple choice',
        icon: <CheckSquare className="h-8 w-8" />,
        action: () => action('multiple_choice'), // Action passed dynamically
        content: {
          label: 'Label',
          placeholder: 'Select multiple options',
          description: 'Description of the multiple choice',
          type: 'multiple_choice',
          options: [
            {
              label: 'Option 1',
              value: 'option1',
            },
            {
              label: 'Option 2',
              value: 'option2',
            },
            {
              label: 'Option 3',
              value: 'option3',
            },
          ],
        },
        component: (props: ComponentProps) => (
          <FormFieldMultipleChoice
            index={props.index}
            question={props.question}
            form={props.form}
            handleQuestionChange={props.handleQuestionChange}
            handleRemoveQuestion={props.handleRemoveQuestion}
            />
        ), // Custom component
      },
    ],
    [
      'select',
      {
        name: 'Select',
        icon: <Circle className="h-8 w-8" />,
        action: () => action('select'), // Action passed dynamically
        content: {
          label: 'Label',
          placeholder: 'Select an option',
          description: 'Description of the select',
          type: 'select',
          options: [
            {
              label: 'Option 1',
              value: 'option1',
            },
            {
              label: 'Option 2',
              value: 'option2',
            },
            {
              label: 'Option 3',
              value: 'option3',
            },
          ],
        },
        component: (props: ComponentProps) => (
          <FormFieldSingleChoice
            index={props.index}
            question={props.question}
            form={props.form}
            handleQuestionChange={props.handleQuestionChange}
            handleRemoveQuestion={props.handleRemoveQuestion}
            />
        ), // Custom component
      },
    ],
    [
      'dropdown',
      {
        name: 'Dropdown',
        icon: <ChevronDown className="h-8 w-8" />,
        action: () => action('dropdown'), // Action passed dynamically
        content: {
          label: 'Label',
          placeholder: 'Select an option',
          description: 'Description of the dropdown',
          type: 'dropdown',
          options: [
            {
              label: 'Option 1',
              value: 'option1',
            },
            {
              label: 'Option 2',
              value: 'option2',
            },
            {
              label: 'Option 3',
              value: 'option3',
            },
          ],
        },
        component: (props: ComponentProps) => (
          <FormFieldDropdown
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
      'date',
      {
        name: 'Date',
        icon: <CalendarCheck2 className="h-8 w-8" />,
        action: () => action('date'), // Action passed dynamically
        content: {
          label: 'Label',
          placeholder: 'Select a date',
          description: 'Description of the date',
          type: 'date',
        },
        component: (props: ComponentProps) => (
          <FormFieldDatePicker
            index={props.index}
            question={props.question}
            form={props.form}
            handleQuestionChange={props.handleQuestionChange}
            handleRemoveQuestion={props.handleRemoveQuestion}
            />
        ), // Custom component
      },
    ],
  ]);
};
