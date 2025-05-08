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
import { useTranslation } from 'react-i18next';

import FormFieldDatePicker from '../components/input-fields/date-picker';
import FormFieldDropdown from '../components/input-fields/dropdown';
import FormFieldMultipleChoice from '../components/input-fields/multiple-choice';
import { FormFieldShortText } from '../components/input-fields/short-text';
import FormFieldSingleChoice from '../components/input-fields/single-choice';
import TextLarge from '../components/input-fields/text-large';
import UploadFiles from '../components/input-fields/upload-files';
import { ComponentProps, Input, InputTypes } from '../types/brief.types';

// Import your custom components
type InputKey = InputTypes;
type InputValue = Input;
type InputMap = Map<InputKey, InputValue>;
// Generator function to create the inputs Map
export const useGenerateInputs = (
  action: (inputName: InputTypes) => void,
): InputMap => {
  const { t } = useTranslation('briefs');
  return new Map([
    [
      'text-short',
      {
        name: t('textShort.value'),
        icon: <Text className="h-6 w-6" />,
        action: () => action('text-short'), // Action passed dynamically
        content: {
          label: '',
          description: '',
          placeholder: '',
          type: 'text-short',
          required: false,
          position: -1,
          id: 'create-form-field-0',
        },
        component: (props: ComponentProps) => (
          <FormFieldShortText
            index={props.index}
            question={props.question}
            form={props.form}
            handleQuestionChange={props.handleQuestionChange}
            handleRemoveQuestion={props.handleRemoveQuestion}
            handleQuestionFocus={props.handleQuestionFocus}
            handleQuestionBlur={props.handleQuestionBlur}
            key={props.question.id}
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
          description: '',
          placeholder: '',
          type: 'text-large',
          required: false,
          position: -1,
          id: 'create-form-field-0',
        },
        component: (props: ComponentProps) => (
          <TextLarge
            index={props.index}
            question={props.question}
            form={props.form}
            handleQuestionChange={props.handleQuestionChange}
            handleRemoveQuestion={props.handleRemoveQuestion}
            handleQuestionFocus={props.handleQuestionFocus}
            handleQuestionBlur={props.handleQuestionBlur}
            key={props.question.id}
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
          description: '',
          placeholder: '',
          type: 'file',
          required: false,
          position: -1,
          id: 'create-form-field-0',
        },
        component: (props: ComponentProps) => (
          <UploadFiles
            index={props.index}
            question={props.question}
            form={props.form}
            handleQuestionChange={props.handleQuestionChange}
            handleRemoveQuestion={props.handleRemoveQuestion}
            handleQuestionFocus={props.handleQuestionFocus}
            handleQuestionBlur={props.handleQuestionBlur}
            key={props.question.id}
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
          description: '',
          placeholder: '',
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
          required: false,
          position: -1,
          id: 'create-form-field-0',
        },
        component: (props: ComponentProps) => (
          <FormFieldMultipleChoice
            index={props.index}
            question={props.question}
            form={props.form}
            handleQuestionChange={props.handleQuestionChange}
            handleRemoveQuestion={props.handleRemoveQuestion}
            handleQuestionFocus={props.handleQuestionFocus}
            handleQuestionBlur={props.handleQuestionBlur}
            key={props.question.id}
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
          description: '',
          placeholder: '',
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
          required: false,
          position: -1,
          id: 'create-form-field-0',
        },
        component: (props: ComponentProps) => (
          <FormFieldSingleChoice
            index={props.index}
            question={props.question}
            form={props.form}
            handleQuestionChange={props.handleQuestionChange}
            handleRemoveQuestion={props.handleRemoveQuestion}
            handleQuestionFocus={props.handleQuestionFocus}
            handleQuestionBlur={props.handleQuestionBlur}
            key={props.question.id}
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
          description: '',
          placeholder: '',
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
          required: false,
          position: -1,
          id: 'create-form-field-0'
        },
        component: (props: ComponentProps) => (
          <FormFieldDropdown
            index={props.index}
            question={props.question}
            form={props.form}
            handleQuestionChange={props.handleQuestionChange}
            handleRemoveQuestion={props.handleRemoveQuestion}
            handleQuestionFocus={props.handleQuestionFocus}
            handleQuestionBlur={props.handleQuestionBlur}
            key={props.question.id}
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
          description: '',
          placeholder: '',
          type: 'date',
          required: false,
          position: -1,
          id: 'create-form-field-0',
        },
        component: (props: ComponentProps) => (
          <FormFieldDatePicker
            index={props.index}
            question={props.question}
            form={props.form}
            handleQuestionChange={props.handleQuestionChange}
            handleRemoveQuestion={props.handleRemoveQuestion}
            handleQuestionFocus={props.handleQuestionFocus}
            handleQuestionBlur={props.handleQuestionBlur}
            key={props.question.id}
          />
        ), // Custom component
      },
    ],
  ]);
};
