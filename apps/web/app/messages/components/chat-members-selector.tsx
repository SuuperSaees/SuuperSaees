'use client';

import { useState } from 'react';
import { Popover } from '@kit/ui/popover';
import { Members } from '~/lib/members.types';
import CheckboxCombobox, { CustomItemProps, Option } from '~/components/ui/checkbox-combobox';
import { z } from 'zod';
import AvatarDisplayer from '~/orders/[id]/components/ui/avatar-displayer';

const CustomUserItem: React.FC<
  CustomItemProps<
    Option & {
      picture_url?: string | null;
    }
  >
> = ({ option }) => (
  <div className="flex items-center space-x-2">
    <AvatarDisplayer
      className="font-normal"
      pictureUrl={option?.picture_url ?? null}
      displayName={option.label}
    />
    <span>{option.label}</span>
  </div>
);

interface ChatMembersSelectorProps {
  teams: Members.Type;
  selectedMembers: string[];
  onMembersUpdate: (memberIds: string[]) => void;
}

const membersSchema = z.object({
  members: z.array(z.string()),
});

export default function ChatMembersSelector({ 
  teams, 
  selectedMembers, 
  onMembersUpdate 
}: ChatMembersSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const memberOptions = teams.members.map(member => ({
    value: member.id,
    label: member.name,
    picture_url: member.picture_url
  }));

  const handleSubmit = (data: z.infer<typeof membersSchema>) => {
    onMembersUpdate(data.members);
    setIsOpen(false);
  };

  const selectedMembersData = selectedMembers.map(id => 
    teams.members.find(m => m.id === id)
  ).filter((member): member is Members.Member => member !== undefined);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
          <CheckboxCombobox
            options={memberOptions}
            onSubmit={handleSubmit}
            schema={membersSchema}
            defaultValues={{ members: selectedMembers }}
            customItem={CustomUserItem}
          />
    </Popover>
  );
}