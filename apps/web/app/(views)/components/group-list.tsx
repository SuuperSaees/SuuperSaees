import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@kit/ui/button';

import { ViewManageableProperty } from '../views.types';
import GroupItem from './group-item';

interface GroupListProps {
  groups: ViewManageableProperty[];
  onGroupAction: (group: ViewManageableProperty) => void;
  showAll?: boolean;
  buttonLabel: string;
}

const GroupList = ({
  groups,
  onGroupAction,
  showAll,
  buttonLabel,
}: GroupListProps) => (
  <div className="flex w-full flex-col gap-2 space-y-2 text-sm">
    <div className="flex w-full flex-col gap-2">
      {groups.map((group) => (
        <GroupItem
          key={group.key}
          group={group}
          onAction={() => onGroupAction(group)}
        />
      ))}
    </div>
    <Button size="sm" variant="outline" className="flex w-full gap-1">
      <span>{buttonLabel}</span>
      {showAll ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </Button>
  </div>
);

export default GroupList;
