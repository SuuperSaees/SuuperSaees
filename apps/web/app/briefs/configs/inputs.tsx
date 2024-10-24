'use client';
import {
  CalendarCheck2,
  CheckSquare,
  ChevronDown,
  Circle,
  Text,
  TextIcon,
  Upload,
} from 'lucide-react';

import FormFieldDatePicker from '../components/date-picker';
import FormFieldDropdown from '../components/dropdown';
import { FormFieldShortText } from '../components/form-field-short-text';
import FormFieldMultipleChoice from '../components/multiple-choice';
import FormFieldSingleChoice from '../components/single-choice';
import { ComponentProps, Input, InputTypes } from '../types/brief.types';
import TextLarge from '../components/text-large';
import UploadFiles from '../components/upload-files';
import { useTranslation } from 'react-i18next';

// Import your custom components
type InputKey = InputTypes;
type InputValue = Input;
type InputMap = Map<InputKey, InputValue>;
// Generator function to create the inputs Map
export const useGenerateInputs = (
  action: (inputName: InputTypes) => void,
): InputMap => {
  const {t} = useTranslation('briefs')
  return new Map([
    [
      'text-short',
      {
        name: t('textShort.value'),
        icon: <Text className="h-6 w-6" />,
        action: () => action('text-short'), // Action passed dynamically
        content: {
          label: '',
          placeholder: '',
          description: '',
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
        name: t('textLarge.value'),
        icon: <TextIcon className="h-6 w-6" />,
        action: () => action('text-large'), // Action passed dynamically
        content: {
          label: '',
          placeholder: '',
          description: '',
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
        name: t('uploadFiles.value'),
        icon: <Upload className="h-6 w-6" />,
        action: () => action('file'), // Action passed dynamically
        content: {
          label: '',
          placeholder: '',
          description: '',
          type: 'file',
        },
        component: (props: ComponentProps) => (
          <UploadFiles
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
      'multiple_choice',
      {
        name: t('multipleChoice.value'),
        icon: <CheckSquare className="h-6 w-6" />,
        action: () => action('multiple_choice'), // Action passed dynamically
        content: {
          label: '',
          placeholder: '',
          description: '',
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
        name: t('singleChoice.value'),
        icon: <Circle className="h-6 w-6" />,
        action: () => action('select'), // Action passed dynamically
        content: {
          label: '',
          placeholder: '',
          description: '',
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
        name: t('dropdown.value'),
        icon: <ChevronDown className="h-6 w-6" />,
        action: () => action('dropdown'), // Action passed dynamically
        content: {
          label: '',
          placeholder: '',
          description: '',
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
        name: t('datePicker.value'),
        icon: <CalendarCheck2 className="h-6 w-6" />,
        action: () => action('date'), // Action passed dynamically
        content: {
          label: '',
          placeholder: '',
          description: '',
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
