import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  options: { value: string; label: string; description?: string }[];
  onSelect: (value: string) => void;
  multiSelect?: boolean;
  selectedValues?: string;
}

const SelectionModal = ({
  open,
  onOpenChange,
  title,
  options,
  onSelect,
  multiSelect = false,
  selectedValues = "",
}: SelectionModalProps) => {
  const isSelected = (value: string) => selectedValues.includes(value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="grid gap-2 p-4">
            {options.map((option) => (
              <Button
                key={option.value}
                variant={isSelected(option.value) ? "default" : "outline"}
                className="justify-start h-auto py-3 px-4"
                onClick={() => {
                  onSelect(option.value);
                  if (!multiSelect) onOpenChange(false);
                }}
              >
                <div className="text-left">
                  <div className="font-semibold">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default SelectionModal;
