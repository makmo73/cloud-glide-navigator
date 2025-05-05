
import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import FilePreview from "@/components/FilePreview";
import CreateBucketDialog from "@/components/CreateBucketDialog";
import CreateFolderDialog from "@/components/CreateFolderDialog";
import RenameFileDialog from "@/components/RenameFileDialog";
import { useS3Storage } from "@/hooks/useS3Storage";
import { useFileOperations } from "@/hooks/useFileOperations";

const Index = () => {
  const [showCreateBucket, setShowCreateBucket] = useState<boolean>(false);
  const [showCreateFolder, setShowCreateFolder] = useState<boolean>(false);
  const [showRenameDialog, setShowRenameDialog] = useState<boolean>(false);

  const {
    accounts,
    buckets,
    activeAccountId,
    activeBucket,
    currentPath,
    files,
    breadcrumbs,
    isLoading,
    handleAddAccount,
    handleSelectAccount,
    handleSelectBucket,
    handleNavigate,
    handleSearch,
    handleCreateBucket,
    handleCreateFolder,
    handleRenameSubmit,
    handleDelete,
    loadFiles,
  } = useS3Storage();

  const {
    selectedItems,
    previewFile,
    previewUrl,
    showPreview,
    fileToRename,
    fileInputRef,
    setSelectedItems,
    handleFileClick,
    handlePreviewFile,
    handleClosePreview,
    handleUpload,
    handleFileInputChange,
    handleDownload,
    handleRenameFile,
    handleDownloadFile,
    setFileToRename,
    setShowPreview,
  } = useFileOperations(
    activeAccountId,
    activeBucket,
    currentPath,
    accounts,
    loadFiles
  );

  const handleRenameSubmitProxy = (newName: string) => {
    handleRenameSubmit(fileToRename, newName);
    setShowRenameDialog(false);
    setFileToRename(null);
  };

  const onDeleteFile = (file: S3Object) => {
    handleDelete([file.key]);
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        accounts={accounts}
        buckets={buckets}
        onAddAccount={handleAddAccount}
        onSelectAccount={handleSelectAccount}
        onSelectBucket={handleSelectBucket}
        activeAccountId={activeAccountId}
        activeBucket={activeBucket}
      />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          currentPath={currentPath}
          onSearch={handleSearch}
          onCreateBucket={() => setShowCreateBucket(true)}
          onUpload={handleUpload}
          onDownload={handleDownload}
          onDelete={() => selectedItems.length > 0 && handleDelete(selectedItems)}
          onCreateFolder={() => setShowCreateFolder(true)}
          selectedItems={selectedItems}
        />
        
        <MainContent
          activeBucket={activeBucket}
          currentPath={currentPath}
          breadcrumbs={breadcrumbs}
          files={files}
          isLoading={isLoading}
          onNavigate={handleNavigate}
          onFileClick={handleFileClick}
          onPreviewFile={handlePreviewFile}
          onSelectionChange={setSelectedItems}
          onRenameFile={(file) => {
            handleRenameFile(file);
            setShowRenameDialog(true);
          }}
          onDeleteFile={onDeleteFile}
          onDownloadFile={handleDownloadFile}
          onCreateFolder={() => setShowCreateFolder(true)}
        />
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden-input"
        multiple
      />
      
      {activeAccountId && (
        <CreateBucketDialog
          isOpen={showCreateBucket}
          onClose={() => setShowCreateBucket(false)}
          onCreateBucket={handleCreateBucket}
          accountId={activeAccountId}
        />
      )}

      <CreateFolderDialog
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onCreateFolder={handleCreateFolder}
        currentPath={currentPath}
      />

      <RenameFileDialog
        isOpen={showRenameDialog}
        onClose={() => setShowRenameDialog(false)}
        onRename={handleRenameSubmitProxy}
        file={fileToRename}
      />

      {previewFile && (
        <FilePreview
          file={previewFile}
          url={previewUrl}
          isOpen={showPreview}
          onClose={handleClosePreview}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
};

export default Index;
