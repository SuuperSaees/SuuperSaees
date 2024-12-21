import { Button } from "@kit/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@kit/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@kit/ui/command";
import { ArrowDownToLine, Check, ChevronDown } from "lucide-react";
import { scales } from "../../utils/file-utils";
import { cn } from "@kit/ui/utils";

interface FileToolbarProps {
  currentFileType: string;
  value: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  isCreatingAnnotation: boolean;
  setIsCreatingAnnotation: (isCreatingAnnotation: boolean) => void;
  handleZoomChange: (value: string) => void;
  handleFileDownload: (url: string, name: string) => void;
  selectedFile: any;
  t: (key: string) => string;
}

export const FileToolbar: React.FC<FileToolbarProps> = ({
  currentFileType,
  value,
  open,
  setOpen,
  isCreatingAnnotation,
  setIsCreatingAnnotation,
  handleZoomChange,
  handleFileDownload,
  selectedFile,
  t
}) => {
  return (
     <div className='flex items-center justify-between w-full h-10'>
      {
        currentFileType.startsWith('image/') || currentFileType.startsWith('application/pdf') ? (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-auto justify-between"
              >
                {value || "100%"}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandList>
                  <CommandEmpty>No zoom level found.</CommandEmpty>
                  <CommandGroup>
                    {scales.map((scale) => (
                      <CommandItem
                        key={scale.value}
                        value={scale.value}
                        onSelect={handleZoomChange}
                      >
                        {scale.label}
                        <Check
                          className={cn(
                            "ml-auto",
                            value === scale.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
      ) : (
        <div></div>
      )}
      {
        currentFileType.startsWith('image/') ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreatingAnnotation(!isCreatingAnnotation)}
              className={cn(isCreatingAnnotation && "bg-blue-100")}
            >
              {t('annotations.add')}
            </Button>
          </div>
        ) : (
          <div></div>
        )
      }
      <ArrowDownToLine className="w-4 h-4 cursor-pointer text-gray-900" onClick={() => handleFileDownload(selectedFile?.url, selectedFile?.name)} />
    </div>
  );
};
