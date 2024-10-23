import { Checkbox } from "@kit/ui/checkbox";
import { useTranslation } from "react-i18next";
import { priorityColors, statusColors } from '../utils/get-color-class-styles';
import { useState } from "react";
import SelectAction from "./ui/select-action";
import { DatePickerWithRange } from "./range-date-picker";

interface SubTaskProps {
	name: string,
	status: string,
	priority : string
}

function SubTask({name, status, priority}:SubTaskProps) {

	const [selectedStatus, setSelectedStatus] = useState(status);
	const [selectedPriority, setSelectedPriority] = useState(priority);

	const { t } = useTranslation('orders');
  const statuses = ['pending', 'in_progress', 'completed', 'in_review'];
	const priorities = ['low', 'medium', 'high'];


  const statusOptions = statuses.map((status) => {
    const camelCaseStatus = status.replace(/_./g, (match) =>
      match.charAt(1).toUpperCase(),
    );
    return {
      value: status,
      label: t(`details.statuses.${camelCaseStatus}`)
        .replace(/_/g, ' ')
        .replace(/^\w/, (c) => c.toUpperCase()),
    };
  });

	const priorityOptions = priorities.map((priority) => ({
    value: priority,
    label: t(`details.priorities.${priority}`)
      .replace(/_/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase()),
  }));

	const getPriorityClassName = (priority: string) =>
    priorityColors[priority as 'low' | 'medium' | 'high'] ?? '';

  const getStatusClassName = (status: string) =>
    statusColors[
      status as 'pending' | 'in_progress' | 'completed' | 'in_review'
    ] ?? '';

		


	return (
		<div className="flex justify-between items-center py-3">
			<div className="flex gap-2">
				<Checkbox id="terms" />
				<p className="font-semibold text-gray-900">{name}</p>
			</div>
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
						console.log(value)
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
						console.log(value)
					}}
					showLabel={false}
				/>

				<DatePickerWithRange />
			</div>
		</div>
	);
}

export default SubTask;