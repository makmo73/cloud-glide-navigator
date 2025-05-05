
import { useCallback } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { FolderPlus, Pencil, Download, Trash2, Share2 } from "lucide-react";
import { S3Object } from "@/types/s3";

interface FileContextMenuProps {
  children: React.ReactNode;
  file?: S3Object;
  onRename: (file: S3Object) => void;
  onDelete: (file: S3Object) => void;
  onDownload: (file: S3Object) => void;
  onCreateFolder: () => void;
  onShare?: (file: S3Object) => void;
}

const FileContextMenu = ({
  children,
  file,
  onRename,
  onDelete,
  onDownload,
  onCreateFolder,
  onShare,
}: FileContextMenuProps) => {
  const handleAction = useCallback(
    (action: "rename" | "delete" | "download" | "share") => {
      if (!file) return;

      switch (action) {
        case "rename":
          onRename(file);
          break;
        case "delete":
          onDelete(file);
          break;
        case "download":
          onDownload(file);
          break;
        case "share":
          onShare?.(file);
          break;
      }
    },
    [file, onRename, onDelete, onDownload, onShare]
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {!file && (
          <ContextMenuItem onClick={onCreateFolder} className="cursor-pointer">
            <FolderPlus className="mr-2 h-4 w-4" /> New folder
          </ContextMenuItem>
        )}
        
        {file && (
          <>
            <ContextMenuItem
              onClick={() => handleAction("rename")}
              className="cursor-pointer"
            >
              <Pencil className="mr-2 h-4 w-4" /> Rename
            </ContextMenuItem>
            
            {!file.isFolder && (
              <ContextMenuItem
                onClick={() => handleAction("download")}
                className="cursor-pointer"
              >
                <Download className="mr-2 h-4 w-4" /> Download
              </ContextMenuItem>
            )}
            
            {onShare && (
              <ContextMenuItem
                onClick={() => handleAction("share")}
                className="cursor-pointer"
              >
                <Share2 className="mr-2 h-4 w-4" /> Share
              </ContextMenuItem>
            )}
            
            <ContextMenuSeparator />
            
            <ContextMenuItem
              onClick={() => handleAction("delete")}
              className="text-destructive cursor-pointer focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default FileContextMenu;
