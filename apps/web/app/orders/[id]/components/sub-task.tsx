import { useTranslation } from "react-i18next";
import { priorityColors, statusColors } from '../utils/get-color-class-styles';
import { useState } from "react";
import SelectAction from "./ui/select-action";
import { DatePickerWithRange } from "./range-date-picker";
import { generateDropdownOptions } from "../utils/generate-options-and-classnames";
import { getPriorityClassName } from "../utils/generate-options-and-classnames";
import { getStatusClassName } from "../utils/generate-options-and-classnames";
import { DateRange } from '@kit/ui/calendar';
import { addDays} from 'date-fns';

interface SubTaskProps {
	name: string,
	status: string,
	priority : string
}

function SubTask({name, status, priority}:SubTaskProps) {

	const [selectedStatus, setSelectedStatus] = useState<string>(status);
	const [selectedPriority, setSelectedPriority] = useState<string>(priority);
	const [selectedPeriod, setSelectedPeriod] = useState<DateRange>({ from: new Date(), to: addDays(new Date(), 3) });

	const { t } = useTranslation('orders');
  const statuses = ['pending', 'in_progress', 'completed', 'in_review'];
	const priorities = ['low', 'medium', 'high'];
	const statusOptions = generateDropdownOptions(statuses, t, 'statuses')
	const priorityOptions = generateDropdownOptions(priorities, t, 'priorities')


	return (
		<div className="flex justify-between items-center py-3">

			<p className="font-semibold text-gray-900">{name}</p>

			<div className="flex">

				<SelectAction
					options={statusOptions}
					groupName="Status"
					defaultValue={selectedStatus}
					getitemClassName={getStatusClassName}
					className={
						selectedStatus ? statusColors[selectedStatus as 'pending' | 'in_progress' | 'completed' | 'in_review'] : undefined
					}
					onSelectHandler={(value) => {
						setSelectedStatus(value);
					}}
					showLabel={false}
				/>

				<SelectAction
					options={priorityOptions}
					groupName="Priority"
					defaultValue={selectedPriority}
					getitemClassName={getPriorityClassName}
					className={
						selectedPriority ? priorityColors[selectedPriority as 'low' | 'medium' | 'high'] : undefined
					}
					onSelectHandler={(value) => {
						setSelectedPriority(value);
					}}
					showLabel={false}
				/>

				<DatePickerWithRange 
					selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
				/>
			</div>
		</div>
	);
}

export default SubTask;