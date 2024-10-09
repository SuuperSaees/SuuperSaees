import { ContentCard } from './content-card';

type Content = {
  name: string;
  icon: JSX.Element;
  action: () => void;
};

interface ContentProps {
  content: Content[];
}

export default function Content({ content }: ContentProps) {
  return (
    <div className="flex w-full flex-col gap-4">
      <h3 className="font-bold text-gray-600">Content</h3>
      <div className="flex w-full flex-wrap gap-2">
        {content.map((item, index) => (
          <ContentCard
            key={index}
            name={item.name}
            icon={item.icon}
            action={item.action}
          />
        ))}
      </div>
    </div>
  );
}
