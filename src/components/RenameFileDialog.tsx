
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { S3Object } from "@/types/s3";

interface RenameFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => void;
  file: S3Object | null;
}

const RenameFileDialog = ({
  isOpen,
  onClose,
  onRename,
  file,
}: RenameFileDialogProps) => {
  const [newName, setNewName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (file) {
      const fileName = file.key.split("/").pop() || "";
      setNewName(fileName);
    }
  }, [file]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newName.trim()) return;
    
    setIsSubmitting(true);
    onRename(newName.trim());
    setIsSubmitting(false);
    onClose();
  };

  const itemType = file?.isFolder ? "folder" : "file";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Pencil className="mr-2 h-5 w-5" />
              Rename {itemType}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="newName" className="mb-2 block">
              New Name
            </Label>
            <Input
              id="newName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={`Enter new ${itemType} name`}
              className="w-full"
              autoFocus
            />
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!newName.trim() || isSubmitting}>
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RenameFileDialog;
