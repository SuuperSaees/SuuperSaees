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
import { Button } from "@kit/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@kit/ui/sheet";
import { Subtask } from "~/lib/tasks.types";
import { CalendarIcon, FlagIcon, Loader } from "lucide-react";



function SubTask({subtask} : {subtask: Subtask.Type}) {

	const [selectedStatus, setSelectedStatus] = useState<string>(subtask.state ?? 'pending');
	const [selectedPriority, setSelectedPriority] = useState<string>(subtask.priority ?? 'low');
	const [selectedPeriod, setSelectedPeriod] = useState<DateRange>({ from: new Date(), to: addDays(new Date(), 3) });
	const [isHovered, setIsHovered] = useState<boolean>(false);
	const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

	const { t } = useTranslation('orders');
  	const statuses = ['pending', 'in_progress', 'completed', 'in_review'];
	const priorities = ['low', 'medium', 'high'];
	const statusOptions = generateDropdownOptions(statuses, t, 'statuses');
	const priorityOptions = generateDropdownOptions(priorities, t, 'priorities');


	return (
		<div 
			className="flex justify-between items-center py-3"
			onMouseEnter={() => setIsHovered(true)} 
			onMouseLeave={() => setIsHovered(false)}
		>

			<p className="font-semibold text-gray-900">{subtask.name}</p>

			{isHovered && (
				<>
				<Button
					className="bg-gray-200 text-gray-500"
					onClick={() => setIsSheetOpen(true)} // Abrir el Sheet manualmente
				>
					Open
				</Button>
				</>
			)}

			<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}> {/* Controla si el Sheet está abierto o cerrado */}
				<SheetContent>
				<SheetHeader>
					<SheetTitle>{subtask.name}</SheetTitle>
				</SheetHeader>
				<div className="grid gap-4 py-4">
					<div className="flex items-center justify-between">
						<span className="flex text-sm font-semibold">
						<CalendarIcon className="mr-2 h-4 w-4" /> {t('details.deadline')}{' '}
						</span>
						<DatePickerWithRange 
							selectedPeriod={selectedPeriod}
							setSelectedPeriod={setSelectedPeriod}
						/>
					</div>
					<div className="flex items-center text-sm justify-between">
						<span className="flex text-sm font-semibold">
						<Loader className="mr-2 h-4 w-4" />
						</span>
						<SelectAction
							options={statusOptions}
							groupName={t('details.status')}
							defaultValue={selectedStatus}
							getitemClassName={getStatusClassName}
							className={
								selectedStatus ? statusColors[selectedStatus as 'pending' | 'in_progress' | 'completed' | 'in_review'] : undefined
							}
							onSelectHandler={(value) => {
								setSelectedStatus(value);
							}}
							// showLabel={false}
						/>
					</div>
					<div className="flex items-center text-sm justify-between">
						
						<span className="flex text-sm font-semibold">
						<FlagIcon className="mr-2 h-4 w-4" />
						</span>
						<SelectAction
							options={priorityOptions}
							groupName={t('details.priority')}
							defaultValue={selectedPriority}
							getitemClassName={getPriorityClassName}
							className={
								selectedPriority ? priorityColors[selectedPriority as 'low' | 'medium' | 'high'] : undefined
							}
							onSelectHandler={(value) => {
								setSelectedPriority(value);
							}}
							// showLabel={false}
						/>
					</div>
					<div dangerouslySetInnerHTML={{ __html: subtask.content ?? '' }} />
				</div>
				</SheetContent>
			</Sheet>


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