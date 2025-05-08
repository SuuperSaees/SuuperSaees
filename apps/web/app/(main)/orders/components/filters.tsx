import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';

import {
  CheckSquare,
  ListFilter,
  LucideIcon,
  SquareIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';

import { darkenColor, hexToRgba } from '~/utils/generate-colors';

import Avatar from '../../../components/ui/avatar';
import {
  CustomDropdownMenu,
  MenuItem,
} from '../../../components/ui/dropdown-menu';

export type FilterOption = {
  label: string;
  value: string;
  color?: string;
  onFilter: (value: string) => void;
};

export type FilterGroup = {
  type: 'multiple-choice' | 'users'; // Add more types as needed (e.g., date, status, etc.). This helps with the UI and filtering logic.
  icon?: LucideIcon;
  title: string;
  key: string;
  options: FilterOption[];
};

interface FiltersProps {
  filters: FilterGroup[];
  defaultFilters?: Record<string, string[]>;
  onReset: () => void;
}

const FilterLabel = ({
  filterGroup,
  appliedFilters,
}: {
  filterGroup?: FilterGroup;
  appliedFilters: number;
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      {filterGroup?.title
        ? t(`common:filters.groups.${filterGroup?.key}.title`)
        : filterGroup?.title ?? ''}
      {/* Applied filters */}
      {appliedFilters > 0 && (
        <span className="text-xs font-normal text-gray-400">
          {t(
            appliedFilters === 1
              ? 'common:filters.appliedFilters.singular'
              : 'common:filters.appliedFilters.plural',
            { number: appliedFilters },
          )}
        </span>
      )}
    </div>
  );
};

const Filters = ({ filters, defaultFilters, onReset }: FiltersProps) => {
  const { t } = useTranslation();
  const [filterKeyOpen, setFilterKeyOpen] = useState(filters[0]?.key);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(defaultFilters ?? {});

  const handleReset = useCallback(() => {
    setSelectedFilters({});
    onReset();
  }, [onReset]);

  const handleFilterChange = (groupKey: string, option: FilterOption) => {
    const value = option.value;
    
    setSelectedFilters((prev) => {
      const currentValues = prev[groupKey] ?? [];
      const hasValue = currentValues.includes(value);

      if (hasValue) {
        // Remove the value
        const updatedValues = currentValues.filter((v) => v !== value);
        return updatedValues.length > 0
          ? { ...prev, [groupKey]: updatedValues }
          : Object.fromEntries(
              Object.entries(prev).filter(([key]) => key !== groupKey),
            );
      } else {
        // Add the value
        return { ...prev, [groupKey]: [...currentValues, value] };
      }
    });

    option.onFilter(value);
  };

  const filtersConfig: MenuItem[] = useMemo(() => {
    const submenus: MenuItem[] = filters.map((filterGroup) => ({
      id: filterGroup.title,
      type: 'submenu',
      label: (
        <FilterLabel
          filterGroup={filterGroup}
          appliedFilters={
            filterGroup.options.filter((option) =>
              selectedFilters?.[filterGroup.key]?.includes(option.value),
            ).length
          }
        />
      ),
      defaultOpen: filterGroup.title === filterKeyOpen,
      icon: filterGroup.icon,
      triggerBehavior: 'close-others',
      content: (
        <FiltersMenuContent
          type={filterGroup.type}
          filterGroup={filterGroup}
          selectedFilters={selectedFilters}
          onFilterChange={handleFilterChange}
          setFilterKeyOpen={setFilterKeyOpen}
        />
      ),
    }));
    const headers: MenuItem[] = [
      {
        id: 'header',
        type: 'label',
        label: <FiltersHeaderMenu t={t} onReset={handleReset} />,
      },
    ];
    return [...headers, ...submenus];
  }, [selectedFilters, filters, filterKeyOpen, t, handleReset]);

  return (
    <CustomDropdownMenu
      trigger={
        <Button
          className="flex w-fit items-center gap-2 px-4 py-1 text-sm font-semibold text-gray-600"
          variant="outline"
          size="icon"
        >
          <ListFilter className="h-4 w-4" />
          <span>{t('common:filters.title')}</span>
          <FilterLabel
            appliedFilters={Object.values(selectedFilters ?? {}).reduce((sum, values) => sum + values.length, 0)}
          />
        </Button>
      }
      items={filtersConfig}
      className="w-[300px]"
    />
  );
};

const FiltersHeaderMenu = ({
  t,
  onReset,
}: {
  t: (key: string) => string;
  onReset: () => void;
}) => {
  return (
    <div className="flex w-full justify-between px-2">
      {/* Reset button */}

      <Button
        variant={'ghost'}
        className="ml-auto h-fit w-fit rounded-lg bg-gray-100 px-2 py-1 text-gray-600"
        onClick={onReset}
      >
        <span>{t('common:filters.resetFilters')}</span>
      </Button>
    </div>
  );
};

const FiltersMenuContent = ({
  type,
  filterGroup,
  selectedFilters,
  onFilterChange,
  setFilterKeyOpen,
}: {
  type: 'multiple-choice' | 'users';
  filterGroup: FilterGroup;
  selectedFilters: Record<string, string[]>;
  onFilterChange: (groupKey: string, option: FilterOption) => void;
  setFilterKeyOpen: Dispatch<SetStateAction<string | undefined>>;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const groupKey = filterGroup.key;

  const handleToggleFilter = (option: FilterOption) => {
    onFilterChange(groupKey, option);
    setFilterKeyOpen(filterGroup.key);
  };

  const filteredOptions = useMemo(() => {
    if (searchTerm === '') {
      return filterGroup.options;
    }
    return filterGroup.options.filter((option) => {
      return option.label.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [filterGroup.options, searchTerm]);

  return (
    <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
      <Input
        type="search"
        placeholder="Search"
        className="w-full"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {filteredOptions.map((option) => {
        const label =
          type === 'users' ? JSON.parse(option.label) : option.label;
        return (
          <Button
            key={option.value}
            className="border-1 flex w-full justify-start gap-2 border border-transparent bg-transparent px-4 py-1 text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-100"
            size="icon"
            onClick={() => handleToggleFilter(option)}
            style={{
              backgroundColor: hexToRgba(option.color ?? '', 1),
              color: darkenColor(option.color ?? '', 0.8),
            }}
          >
            {type === 'users' ? (
              <div className="flex items-center gap-2">
                <Avatar
                  username={label.name}
                  src={label.picture_url}
                  alt={label.name}
                />
                <span>{label.name}</span>
              </div>
            ) : (
              <span>{option.label}</span>
            )}

            {selectedFilters[groupKey]?.includes(option.value) ? (
              <CheckSquare className="ml-auto h-4 w-4" />
            ) : (
              <SquareIcon className="ml-auto h-4 w-4" />
            )}
          </Button>
        );
      })}
    </div>
  );
};

export default Filters;
