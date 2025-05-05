import { useState, useEffect } from "react";
import { File, Folder, FolderOpen, FileX, ArrowUpDown, Grid3X3, List } from "lucide-react";
import { S3Object } from "@/types/s3";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatFileSize, formatDate } from "@/utils/fileUtils";
import FileContextMenu from "./FileContextMenu";

interface FileExplorerProps {
  files: S3Object[];
  isLoading: boolean;
  onFileClick: (file: S3Object) => void;
  onPreviewFile?: (file: S3Object) => void;
  onSelectionChange: (selectedKeys: string[]) => void;
  viewType: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
  onRenameFile?: (file: S3Object, newName: string) => void;
  onDeleteFile?: (file: S3Object) => void;
  onDownloadFile?: (file: S3Object) => void;
  onCreateFolder?: () => void;
  onShareFile?: (file: S3Object) => void;
}

const FileExplorer = ({
  files,
  isLoading,
  onFileClick,
  onPreviewFile,
  onSelectionChange,
  viewType,
  onViewChange,
  onRenameFile,
  onDeleteFile,
  onDownloadFile,
  onCreateFolder,
  onShareFile
}: FileExplorerProps) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: "key" | "size" | "lastModified";
    direction: "asc" | "desc";
  }>({ key: "key", direction: "asc" });

  const toggleSelect = (key: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const newSelectedItems = new Set(selectedItems);
    
    if (selectedItems.has(key)) {
      newSelectedItems.delete(key);
    } else {
      newSelectedItems.add(key);
    }
    
    setSelectedItems(newSelectedItems);
  };

  const sortedFiles = [...files].sort((a, b) => {
    // Always sort folders first
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;

    let comparison = 0;
    
    switch (sortConfig.key) {
      case "key":
        comparison = a.key.localeCompare(b.key);
        break;
      case "size":
        comparison = a.size - b.size;
        break;
      case "lastModified":
        comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
        break;
    }
    
    return sortConfig.direction === "asc" ? comparison : -comparison;
  });

  const handleSort = (key: "key" | "size" | "lastModified") => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const handleFileAction = (file: S3Object) => {
    if (file.isFolder) {
      onFileClick(file);
    } else if (onPreviewFile) {
      onPreviewFile(file);
    } else {
      onFileClick(file);
    }
  };

  useEffect(() => {
    onSelectionChange(Array.from(selectedItems));
  }, [selectedItems, onSelectionChange]);

  const renderGridItem = (file: S3Object) => {
    return (
      <FileContextMenu
        key={file.key}
        file={file}
        onRename={onRenameFile ? (f) => onRenameFile(f, "") : () => {}}
        onDelete={onDeleteFile ? (f) => onDeleteFile(f) : () => {}}
        onDownload={onDownloadFile ? (f) => onDownloadFile(f) : () => {}}
        onCreateFolder={() => {}}
        onShare={onShareFile}
      >
        <div
          className={`p-4 rounded-md border cursor-pointer transition-colors ${
            selectedItems.has(file.key) ? "bg-secondary border-primary" : "hover:bg-secondary/50"
          }`}
          onClick={() => handleFileAction(file)}
        >
          <div className="flex items-start mb-2">
            <div className="flex-1 flex items-center gap-2">
              {file.isFolder ? (
                <FolderOpen className="h-9 w-9 text-primary" />
              ) : (
                <File className="h-9 w-9 text-muted-foreground" />
              )}
            </div>
            <Checkbox
              checked={selectedItems.has(file.key)}
              onCheckedChange={() => {
                const newSet = new Set(selectedItems);
                if (selectedItems.has(file.key)) {
                  newSet.delete(file.key);
                } else {
                  newSet.add(file.key);
                }
                setSelectedItems(newSet);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="text-sm truncate font-medium">{file.key.split("/").pop()}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {file.isFolder ? "Folder" : formatFileSize(file.size)}
          </div>
        </div>
      </FileContextMenu>
    );
  };

  const renderListItem = (file: S3Object) => {
    return (
      <FileContextMenu
        key={file.key}
        file={file}
        onRename={onRenameFile ? (f) => onRenameFile(f, "") : () => {}}
        onDelete={onDeleteFile ? (f) => onDeleteFile(f) : () => {}}
        onDownload={onDownloadFile ? (f) => onDownloadFile(f) : () => {}}
        onCreateFolder={() => {}}
        onShare={onShareFile}
      >
        <div
          onClick={() => handleFileAction(file)}
          className={`file-list px-4 py-2 border-t first:border-t-0 cursor-pointer ${
            selectedItems.has(file.key) ? "bg-secondary" : "hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedItems.has(file.key)}
              onCheckedChange={() => {
                const newSet = new Set(selectedItems);
                if (selectedItems.has(file.key)) {
                  newSet.delete(file.key);
                } else {
                  newSet.add(file.key);
                }
                setSelectedItems(newSet);
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex items-center gap-2">
              {file.isFolder ? (
                <Folder className="h-4 w-4 text-primary" />
              ) : (
                <File className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm truncate">{file.key.split("/").pop()}</span>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            {file.isFolder ? "—" : formatFileSize(file.size)}
          </span>
          <span className="text-sm text-right text-muted-foreground ml-auto">
            {formatDate(file.lastModified)}
          </span>
          <div className="w-4"></div>
        </div>
      </FileContextMenu>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin-slow">
          <File className="h-12 w-12 text-muted-foreground" />
        </div>
        <p className="mt-4 text-muted-foreground">Loading files...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FileX className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">No files found</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="flex justify-between mb-2">
        <div className="flex space-x-1">
          <Button
            variant={viewType === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewChange("grid")}
            className="h-8 w-8 p-0"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewType === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewChange("list")}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <FileContextMenu
        onRename={() => {}}
        onDelete={() => {}}
        onDownload={() => {}}
        onCreateFolder={onCreateFolder || (() => {})}
      >
        {viewType === "grid" ? (
          <div className="file-grid">
            {sortedFiles.map(renderGridItem)}
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <div className="bg-muted text-xs font-medium text-muted-foreground">
              <div className="file-list px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedItems.size > 0 && selectedItems.size === files.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedItems(new Set(files.map((f) => f.key)));
                      } else {
                        setSelectedItems(new Set());
                      }
                    }}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="font-medium px-1" 
                    onClick={() => handleSort("key")}
                  >
                    Name
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="font-medium px-1"
                  onClick={() => handleSort("size")}
                >
                  Size
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="font-medium px-1 ml-auto text-right"
                  onClick={() => handleSort("lastModified")}
                >
                  Modified
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
                <div className="w-4"></div>
              </div>
            </div>
            <div>
              {sortedFiles.map(renderListItem)}
            </div>
          </div>
        )}
      </FileContextMenu>
    </div>
  );
};

export default FileExplorer;
