
import { useRef, useState } from "react";
import { toast } from "sonner";
import { S3Object } from "@/types/s3";
import { createStorageAdapter } from "@/adapters";

export function useFileOperations(
  activeAccountId: string | undefined,
  activeBucket: string | undefined,
  currentPath: string,
  accounts: any[],
  loadFiles: (accountId: string, bucketName: string, prefix: string) => Promise<void>
) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [previewFile, setPreviewFile] = useState<S3Object | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [fileToRename, setFileToRename] = useState<S3Object | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = (file: S3Object) => {
    if (file.isFolder) {
      const folderName = file.key.split("/").filter(Boolean).pop() || "";
      const newPath = currentPath ? `${currentPath}${folderName}/` : `${folderName}/`;
      
      if (activeAccountId && activeBucket) {
        loadFiles(activeAccountId, activeBucket, newPath);
      }
    } else {
      // Handle file selection/preview
      handlePreviewFile(file);
    }
  };

  const handlePreviewFile = async (file: S3Object) => {
    if (file.isFolder || !activeAccountId || !activeBucket) return;
    
    setIsLoading(true);
    setPreviewFile(file);
    
    try {
      const account = accounts.find(acc => acc.id === activeAccountId);
      if (!account) {
        toast.error("Account not found");
        return;
      }
      
      const adapter = createStorageAdapter({
        accessKey: account.accessKey,
        secretKey: account.secretKey,
        region: account.region,
        endpoint: account.endpoint,
        isLocalStorage: account.isLocalStorage,
        localPath: account.localPath
      });
      
      const url = await adapter.getObjectUrl(activeBucket, file.key);
      setPreviewUrl(url);
      setShowPreview(true);
      
    } catch (error) {
      console.error("Failed to generate preview URL:", error);
      toast.error("Failed to generate preview");
      setPreviewFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  const handleUpload = () => {
    if (!activeBucket) {
      toast.error("Please select a bucket first");
      return;
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0 || !activeAccountId || !activeBucket) return;
    
    // Upload files
    toast.info(`Uploading ${selectedFiles.length} file(s)...`);
    setIsLoading(true);
    
    try {
      const account = accounts.find(acc => acc.id === activeAccountId);
      if (!account) {
        toast.error("Account not found");
        return;
      }
      
      const adapter = createStorageAdapter({
        accessKey: account.accessKey,
        secretKey: account.secretKey,
        region: account.region,
        endpoint: account.endpoint,
        isLocalStorage: account.isLocalStorage,
        localPath: account.localPath
      });
      
      // Process each file
      const uploadPromises = Array.from(selectedFiles).map(file => {
        const key = currentPath ? `${currentPath}${file.name}` : file.name;
        return adapter.uploadFile(activeBucket!, key, file);
      });
      
      await Promise.all(uploadPromises);
      toast.success(`${selectedFiles.length} file(s) uploaded successfully`);
      
      // Refresh file list
      await loadFiles(activeAccountId, activeBucket, currentPath);
      
    } catch (error) {
      console.error("Failed to upload files:", error);
      toast.error("Failed to upload files");
    } finally {
      setIsLoading(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDownload = async () => {
    if (selectedItems.length === 0 || !activeAccountId || !activeBucket) return;
    
    const fileToDownload = previewFile;
    if (!fileToDownload) {
      toast.error("No file selected for download");
      return;
    }
    
    await handleDownloadFile(fileToDownload);
  };

  const handleRenameFile = (file: S3Object) => {
    setFileToRename(file);
  };

  const handleDownloadFile = async (file: S3Object) => {
    if (!file || !activeAccountId || !activeBucket) return;
    
    toast.info(`Downloading ${file.key.split('/').pop()}...`);
    setIsLoading(true);
    
    try {
      const account = accounts.find(acc => acc.id === activeAccountId);
      if (!account) {
        toast.error("Account not found");
        return;
      }
      
      const adapter = createStorageAdapter({
        accessKey: account.accessKey,
        secretKey: account.secretKey,
        region: account.region,
        endpoint: account.endpoint,
        isLocalStorage: account.isLocalStorage,
        localPath: account.localPath
      });
      
      const blob = await adapter.downloadObject(activeBucket, file.key);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.key.split("/").pop() || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${file.key.split('/').pop()} successfully`);
    } catch (error) {
      console.error("Failed to download file:", error);
      toast.error("Failed to download file");
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
}
