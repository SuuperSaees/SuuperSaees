'use client';

import { Settings } from 'lucide-react';

import { Button } from '@kit/ui/button';

import { CustomDropdownMenu } from '../../components/ui/dropdown-menu';
import { useViewContext } from '../contexts/view-context';
import { useMenuConfiguration } from '../hooks/view/use-menu-configuration';

const ViewConfigurations = () => {
  const { configurations, manageConfigurations } = useViewContext();
  const { menuConfig } = useMenuConfiguration(
    configurations,
    manageConfigurations,
  );
  return (
    <div className='flex gap-2 justify-end'>
      <CustomDropdownMenu
        trigger={
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        }
        items={menuConfig}
        className="w-[300px]"
      />
    </div>
  );
};

export default ViewConfigurations;
