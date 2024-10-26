import { useTranslation } from "react-i18next";
import { priorityColors, statusColors } from '../utils/get-color-class-styles';
import { useState } from "react";
import SelectAction from "./ui/select-action";
import { DatePickerWithRange } from "./range-date-picker";
import { generateDropdownOptions } from "../utils/generate-options-and-classnames";
import { getPriorityClassName } from "../utils/generate-options-and-classnames";
import { getStatusClassName } from "../utils/generate-options-and-classnames";
import { Button } from "@kit/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@kit/ui/sheet";
import { Subtask } from "~/lib/tasks.types";
import { CalendarIcon, FlagIcon, Loader, Trash } from "lucide-react";
import { useRealTimeSubtasks } from "../hooks/use-subtasks";
import RichTextEditor from "~/components/ui/rich-text-editor";


function SubTask({initialSubtask, userRole } : {initialSubtask : Subtask.Type, userRole: string}) {

	const { 
		selectedStatus, 
		handleStatusChange, 
		selectedPriority, 
		handlePriorityChange, 
		selectedPeriod, 
		handleDateRangeChange, 
		name, 
		setName,
		handleNameChange, 
		content,
		setContent,
		handleContentChange,
		handleDeleteSubtask,
		isDeleted
	} = useRealTimeSubtasks(initialSubtask);

	const [isHovered, setIsHovered] = useState<boolean>(false);
	const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

	const { t } = useTranslation('orders');
  	const statuses = ['pending', 'in_progress', 'completed', 'in_review'];
	const priorities = ['low', 'medium', 'high'];
	const statusOptions = generateDropdownOptions(statuses, t, 'statuses');
	const priorityOptions = generateDropdownOptions(priorities, t, 'priorities');

	if (isDeleted) {
		return null;
	}

	return (
		<div 
			className="flex justify-between items-center py-3"
			onMouseEnter={() => setIsHovered(true)} 
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className="justify-start gap-2 flex">
				<input
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					onBlur={handleNameChange}
					className="border-none p-2 rounded-md focus:outline-none w-full font-semibold text-gray-900"
				/>
			</div>
			

			{isHovered && (
				<>
				<Button
					className="bg-gray-200 text-gray-500"
					onClick={() => setIsSheetOpen(true)} 
				>
					{t('openOrders')}
				</Button>
				</>
			)}

			<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}> 
				<SheetContent>
				<SheetHeader>
					<SheetTitle>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							onBlur={handleNameChange}
							className="border-none p-2 rounded-md focus:outline-none w-full"
						/>
					</SheetTitle>
				</SheetHeader>
				<div className="grid gap-4 py-4">
					<div className="flex items-center justify-between">
						<span className="flex text-sm font-semibold">
						<CalendarIcon className="mr-2 h-4 w-4" /> {t('details.deadline')}{' '}
						</span>
						<DatePickerWithRange 
							selectedPeriod={selectedPeriod}
							setSelectedPeriod={handleDateRangeChange}
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
								handleStatusChange(value).catch((error) => console.error(error));
							}}
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
								handlePriorityChange(value).catch((error) => console.error(error));
							}}
						/>
					</div>

					<RichTextEditor
						content={content}
						onChange= {
							(value) => {
								setContent(value);
							}
						}
						onBlur={() => {
							handleContentChange().catch((error) => console.error(error));
						}}
						userRole={userRole}
						hideSubmitButton={true}
						showToolbar={true}
						isEditable={true}
					/>
				</div>
				</SheetContent>
			</Sheet>

			<div className="flex gap-0 items-center">
				<div className="flex">
					<SelectAction
						options={statusOptions}
						groupName={t('details.status')}
						defaultValue={selectedStatus}
						getitemClassName={getStatusClassName}
						className={
							selectedStatus ? statusColors[selectedStatus as 'pending' | 'in_progress' | 'completed' | 'in_review'] : undefined
						}
						onSelectHandler={(value) => {
							handleStatusChange(value).catch((error) => console.error(error));
						}}
						showLabel={false}
					/>

					<SelectAction
						options={priorityOptions}
						groupName={t('details.priority')}
						defaultValue={selectedPriority}
						getitemClassName={getPriorityClassName}
						className={
							selectedPriority ? priorityColors[selectedPriority as 'low' | 'medium' | 'high'] : undefined
						}
						onSelectHandler={(value) => {
							handlePriorityChange(value).catch((error) => console.error(error));
						}}
						showLabel={false}
					/>

					<DatePickerWithRange 
						selectedPeriod={selectedPeriod}
						setSelectedPeriod={handleDateRangeChange}
					/>
				</div>
				{isHovered && (
				<Trash className="h-4 w-4 text-gray-500 cursor-pointer hover:text-red-500" onClick={handleDeleteSubtask} />
				)}
			</div>


			
		</div>
	);
}

export default SubTask;
