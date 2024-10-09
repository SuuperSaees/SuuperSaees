import { ContentTypes, InputTypes } from '../contexts/briefs-context';

export const isInputType = (type: string): type is InputTypes => {
  return [
    'date',
    'text-short',
    'text-large',
    'select',
    'multiple_choice',
    'dropdown',
    'file',
  ].includes(type);
};

export const isContentType = (type: string): type is ContentTypes => {
  return ['h1', 'h2', 'h3', 'h4'].includes(type);
};
