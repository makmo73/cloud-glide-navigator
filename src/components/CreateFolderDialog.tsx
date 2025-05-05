
import { useState } from "react";
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
import { FolderPlus } from "lucide-react";

interface CreateFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folderName: string) => void;
  currentPath: string;
}

const CreateFolderDialog = ({
  isOpen,
  onClose,
  onCreateFolder,
  currentPath,
}: CreateFolderDialogProps) => {
  const [folderName, setFolderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) return;
    
    setIsSubmitting(true);
    onCreateFolder(folderName.trim());
    setIsSubmitting(false);
    setFolderName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FolderPlus className="mr-2 h-5 w-5" />
              Create New Folder
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="folderName" className="mb-2 block">
              Folder Name
            </Label>
            <Input
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="w-full"
              autoFocus
            />
            {currentPath && (
              <p className="mt-2 text-sm text-muted-foreground">
                Creating folder in: {currentPath}
              </p>
            )}
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
            <Button type="submit" disabled={!folderName.trim() || isSubmitting}>
              Create Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderDialog;
