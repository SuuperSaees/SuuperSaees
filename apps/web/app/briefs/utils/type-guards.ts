import { ContentTypes, InputTypes } from '../types/brief.types';

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
  const allowedTypes = new Set(['h1', 'h2', 'h3', 'h4', 'rich-text', 'image', 'video']);
  return allowedTypes.has(type);
};
