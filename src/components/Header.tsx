
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Upload, Download, Trash2, FolderPlus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  currentPath: string;
  onSearch: (query: string) => void;
  onCreateBucket: () => void;
  onUpload: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onCreateFolder?: () => void;
  selectedItems: string[];
}

const Header = ({
  currentPath,
  onSearch,
  onCreateBucket,
  onUpload,
  onDownload,
  onDelete,
  onCreateFolder,
  selectedItems
}: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="border-b bg-card sticky top-0 z-10 shadow-sm">
      <div className="flex items-center justify-between p-2 px-4">
        <div className="flex items-center gap-2 w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files or folders..."
              className="pl-8 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!currentPath && (
            <Button
              onClick={onCreateBucket}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              <span>Bucket</span>
            </Button>
          )}
          {currentPath && onCreateFolder && (
            <Button
              onClick={onCreateFolder}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <FolderPlus size={16} />
              <span>New Folder</span>
            </Button>
          )}
          <Button
            onClick={onUpload}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Upload size={16} />
            <span>Upload</span>
          </Button>
          <Button
            onClick={onDownload}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            disabled={selectedItems.length === 0}
          >
            <Download size={16} />
            <span>Download</span>
          </Button>
          <Button
            onClick={onDelete}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive"
            disabled={selectedItems.length === 0}
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default Header;
