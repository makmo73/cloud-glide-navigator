
import { useState } from "react";
import { S3Object } from "@/types/s3";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import FileExplorer from "@/components/FileExplorer";

interface MainContentProps {
  activeBucket: string | undefined;
  currentPath: string;
  breadcrumbs: any[];
  files: S3Object[];
  isLoading: boolean;
  onNavigate: (path: string) => void;
  onFileClick: (file: S3Object) => void;
  onPreviewFile: (file: S3Object) => void;
  onSelectionChange: (selectedKeys: string[]) => void;
  onRenameFile: (file: S3Object) => void;
  onDeleteFile: (file: S3Object) => void;
  onDownloadFile: (file: S3Object) => void;
  onCreateFolder: () => void;
}

const MainContent = ({
  activeBucket,
  currentPath,
  breadcrumbs,
  files,
  isLoading,
  onNavigate,
  onFileClick,
  onPreviewFile,
  onSelectionChange,
  onRenameFile,
  onDeleteFile,
  onDownloadFile,
  onCreateFolder,
}: MainContentProps) => {
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  const handleDeleteFile = (file: S3Object) => {
    onDeleteFile(file);
  };

  return (
    <>
      {activeBucket && (
        <>
          <BreadcrumbNav 
            items={breadcrumbs}
            onNavigate={onNavigate}
          />
          
          <div className="flex-1 overflow-auto">
            <FileExplorer
              files={files}
              isLoading={isLoading}
              onFileClick={onFileClick}
              onPreviewFile={onPreviewFile}
              onSelectionChange={onSelectionChange}
              viewType={viewType}
              onViewChange={setViewType}
              onRenameFile={onRenameFile}
              onDeleteFile={handleDeleteFile}
              onDownloadFile={onDownloadFile}
              onCreateFolder={onCreateFolder}
            />
          </div>
        </>
      )}
      
      {!activeBucket && !isLoading && (
        <div className="flex-1 flex items-center justify-center flex-col">
          <div className="text-center max-w-md p-8">
            <h2 className="text-2xl font-bold mb-2">CloudGlide S3 Manager</h2>
            <p className="text-muted-foreground mb-6">
              Connect to AWS S3 accounts or use local storage directories as object storage.
            </p>
            <p className="text-muted-foreground">
              Select a bucket from the sidebar to start managing your files.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default MainContent;
