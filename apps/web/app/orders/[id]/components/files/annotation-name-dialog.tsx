// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@kit/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import { Send } from 'lucide-react';

interface AnnotationNameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  annotationName: string;
  setAnnotationName: (name: string) => void;
  t: any;
}

const AnnotationNameDialog = ({ isOpen, onClose, onSubmit, annotationName, setAnnotationName, t }: AnnotationNameDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('annotations.chat.title')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="flex gap-2 p-4">
            <Input
              type="text"
              value={annotationName}
              onChange={(e) => setAnnotationName(e.target.value)}
              placeholder={t('annotations.chat.placeholder')}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <Button type="submit"><Send className="w-4 h-4" /></Button>
          </form>
        </DialogContent>
      </Dialog>
  );
};

export default AnnotationNameDialog;
