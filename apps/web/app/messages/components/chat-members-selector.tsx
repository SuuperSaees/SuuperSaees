'use client';

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
  isLoading?: boolean;
}

const membersSchema = z.object({
  members: z.array(z.string()),
});

export default function ChatMembersSelector({ 
  teams, 
  selectedMembers, 
  onMembersUpdate,
  isLoading = false
}: ChatMembersSelectorProps) {
  // Crear array de miembros seleccionados con sus detalles
  const selectedMembersDetails = selectedMembers
    .map(memberId => teams.members.find(m => m.id === memberId))
    .filter(member => member !== undefined);

  const memberOptions = teams.members.map(member => ({
    value: member.id,
    label: member.name,
    picture_url: member.picture_url
  }));

  const handleSubmit = (data: z.infer<typeof membersSchema>) => {
    onMembersUpdate(data.members);
  };

  const defaultValues = {
    members: selectedMembers
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="no-scrollbar flex max-h-[300px] flex-wrap items-center justify-start gap-2 overflow-y-auto">
        {/* Mostrar avatares de miembros seleccionados */}
        {selectedMembersDetails.map((member, index) => (
          member && (
            <AvatarDisplayer
              key={index + member.name}
              displayName={member.name}
              pictureUrl={member.picture_url}
              isAssignedOrFollower={true}
              className="h-8 w-8 border-2 border-white"
            />
          )
        ))}
        
        {/* Checkbox Combobox para seleccionar miembros */}
        <CheckboxCombobox
          options={memberOptions}
          onSubmit={handleSubmit}
          schema={membersSchema}
          defaultValues={defaultValues}
          customItem={CustomUserItem}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}