import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ScoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  options: string[];
  selectedOptions: string[];
  onSelect: (option: string) => void;
  onSave: () => void;
}

const ScoringModal: React.FC<ScoringModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  options,
  selectedOptions,
  onSelect,
  onSave,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {options.map((option) => (
            <Button
              key={option}
              variant={selectedOptions.includes(option) ? "default" : "outline"}
              onClick={() => onSelect(option)}
            >
              {option}
            </Button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScoringModal;