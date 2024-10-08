import InputCard from './input-card';

type Input = {
  name: string;
  icon: JSX.Element;
  action: () => void;
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
          <InputCard
            key={index}
            name={input.name}
            icon={input.icon}
            action={input.action}
          />
        ))}
      </div>
    </div>
  );
}
