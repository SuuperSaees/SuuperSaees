import { InputTypes } from '../types/brief.types';
import Draggable from './draggable';
import InputCard from './input-card';

import type { JSX } from "react";

type Input = {
  name: string;
  icon: JSX.Element;
  action: () => void;
  type: InputTypes;
};
interface InputsProps {
  inputs: Input[];
}

export default function Inputs({ inputs }: InputsProps) {
  return (
    <div className="flex w-full flex-col gap-4">
      <h3 className="font-bold text-gray-600">Inputs</h3>
      <div className="flex w-full flex-wrap gap-2">
        {inputs.map((input, index) => (
          <Draggable
            id={'draggable-input-widget-' + index}
            key={'draggable-input-widget-' + index}
            className="flex h-auto w-full max-w-32 flex-1"
            data={{ type: input.type }}
          >
            <InputCard
              name={input.name}
              icon={input.icon}
              action={input.action}
            />
          </Draggable>
        ))}
      </div>
    </div>
  );
}
