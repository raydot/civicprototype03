import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

interface TextViewDialogProps {
  showDialog: boolean;
  onClose: () => void;
  dialogContent: {
    title: string;
    text: string;
  };
}

export const TextViewDialog = ({ showDialog, onClose, dialogContent }: TextViewDialogProps) => {
  return (
    <Dialog open={showDialog} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogContent.title}</DialogTitle>
          <DialogDescription className="text-left whitespace-pre-wrap">
            {dialogContent.text}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
