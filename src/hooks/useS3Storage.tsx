
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { S3Account, S3Bucket, S3Object, BreadcrumbItem } from "@/types/s3";
import { createStorageAdapter } from "@/adapters";

// For demo purposes - typically we would handle this better in a production app
const mockAccounts: S3Account[] = [
  {
    id: "acc1",
    name: "Personal AWS",
    accessKey: "AKIAIOSFODNN7EXAMPLE",
    secretKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    region: "us-east-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "local1",
    name: "Local Storage",
    accessKey: "",
    secretKey: "",
    region: "",
    isLocalStorage: true,
    localPath: "/Users/cloudglide/storage",
    createdAt: new Date().toISOString(),
  }
];

const mockBuckets: Record<string, S3Bucket[]> = {
  acc1: [
    { name: "example-bucket-1", creationDate: new Date().toISOString() },
    { name: "example-bucket-2", creationDate: new Date().toISOString() },
  ],
  local1: [
    { name: "local-files", creationDate: new Date().toISOString(), isLocal: true },
    { name: "local-backups", creationDate: new Date().toISOString(), isLocal: true },
  ],
};

export function useS3Storage() {
  const [accounts, setAccounts] = useState<S3Account[]>(mockAccounts);
  const [buckets, setBuckets] = useState<Record<string, S3Bucket[]>>(mockBuckets);
  const [activeAccountId, setActiveAccountId] = useState<string | undefined>();
  const [activeBucket, setActiveBucket] = useState<string | undefined>();
  const [currentPath, setCurrentPath] = useState<string>("");
  const [files, setFiles] = useState<S3Object[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAddAccount = (account: Omit<S3Account, "id" | "createdAt">) => {
    const newAccount: S3Account = {
      ...account,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    
    setAccounts((prev) => [...prev, newAccount]);
    setBuckets((prev) => ({ ...prev, [newAccount.id]: [] }));
    toast.success(`Account "${account.name}" added successfully`);
    
    // Select the new account
    setActiveAccountId(newAccount.id);
    setActiveBucket(undefined);
    setCurrentPath("");
    setFiles([]);
    
    // Load buckets for the new account
    if (activeAccountId) {
      loadBuckets(newAccount.id);
    }
  };

  const handleSelectAccount = (accountId: string) => {
    setActiveAccountId(accountId);
    setActiveBucket(undefined);
    setCurrentPath("");
    setFiles([]);
    
    // Load buckets for this account
    loadBuckets(accountId);
  };

  const handleSelectBucket = (accountId: string, bucketName: string) => {
    setActiveAccountId(accountId);
    setActiveBucket(bucketName);
    setCurrentPath("");
    
    // Load files for this bucket
    loadFiles(accountId, bucketName, "");
  };

  const loadBuckets = async (accountId: string) => {
    setIsLoading(true);
    
    try {
      const account = accounts.find(acc => acc.id === accountId);
      if (!account) {
        toast.error("Account not found");
        setIsLoading(false);
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
      
      const accountBuckets = await adapter.listBuckets();
      setBuckets(prev => ({
        ...prev,
        [accountId]: accountBuckets
      }));
    } catch (error) {
      console.error("Failed to load buckets:", error);
      toast.error("Failed to load buckets");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFiles = async (accountId: string, bucketName: string, prefix: string) => {
    setIsLoading(true);
    
    try {
      const account = accounts.find(acc => acc.id === accountId);
      if (!account) {
        toast.error("Account not found");
        setIsLoading(false);
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
      
      const objects = await adapter.listObjects(bucketName, prefix);
      setFiles(objects);
      
      // Update breadcrumbs
      const pathParts = prefix.split("/").filter(Boolean);
      const newBreadcrumbs: BreadcrumbItem[] = [];
      
      newBreadcrumbs.push({ name: bucketName, path: "" });
      
      let currentPathAccumulator = "";
      pathParts.forEach((part) => {
        currentPathAccumulator += `${part}/`;
        newBreadcrumbs.push({
          name: part,
          path: currentPathAccumulator
        });
      });
      
      setBreadcrumbs(newBreadcrumbs);
      
    } catch (error) {
      console.error("Failed to load files:", error);
      toast.error("Failed to load files");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    
    if (activeAccountId && activeBucket) {
      loadFiles(activeAccountId, activeBucket, path);
    }
  };

  const handleSearch = (query: string) => {
    if (!query || !activeAccountId || !activeBucket) {
      // Reset to current folder content
      if (activeAccountId && activeBucket) {
        loadFiles(activeAccountId, activeBucket, currentPath);
      }
      return;
    }
    
    // Perform search
    setIsLoading(true);
    
    const account = accounts.find(acc => acc.id === activeAccountId);
    if (!account) {
      toast.error("Account not found");
      setIsLoading(false);
      return;
    }
    
    setTimeout(() => {
      // Filter the current files for the search query (simple client-side search)
      // In a real app, we would use the storage service's search capabilities
      const filteredFiles = files.filter(
        (file) => file.key.toLowerCase().includes(query.toLowerCase())
      );
      
      setFiles(filteredFiles);
      setIsLoading(false);
      toast.info(`Found ${filteredFiles.length} results for "${query}"`);
    }, 800);
  };

  const handleCreateBucket = async (name: string, region: string) => {
    if (!activeAccountId) return;
    
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
      
      const newBucket = await adapter.createBucket(name, region);
      
      setBuckets((prev) => ({
        ...prev,
        [activeAccountId]: [...(prev[activeAccountId] || []), newBucket],
      }));
      
      toast.success(`Bucket "${name}" created successfully`);
    } catch (error) {
      console.error("Failed to create bucket:", error);
      toast.error("Failed to create bucket");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    if (!activeAccountId || !activeBucket) return;

    const newFolderPath = currentPath ? `${currentPath}${folderName}/` : `${folderName}/`;
    
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
      
      await adapter.createFolder(activeBucket, newFolderPath);
      
      toast.success(`Folder "${folderName}" created successfully`);
      
      // Refresh file list
      await loadFiles(activeAccountId, activeBucket, currentPath);
      
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast.error("Failed to create folder");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRenameSubmit = async (fileToRename: S3Object | null, newName: string) => {
    if (!activeAccountId || !activeBucket || !fileToRename) return;

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

      const oldKey = fileToRename.key;
      const oldKeyParts = oldKey.split("/");
      oldKeyParts.pop(); // Remove the old name
      
      let newKey: string;
      if (fileToRename.isFolder) {
        // For folders, ensure the key ends with a slash
        newKey = oldKeyParts.length > 0 
          ? `${oldKeyParts.join("/")}/${newName}/`
          : `${newName}/`;
      } else {
        newKey = oldKeyParts.length > 0
          ? `${oldKeyParts.join("/")}/${newName}`
          : newName;
      }

      await adapter.renameObject(activeBucket, oldKey, newKey);

      toast.success(`Renamed successfully`);

      // Refresh file list
      await loadFiles(activeAccountId, activeBucket, currentPath);

    } catch (error) {
      console.error("Failed to rename:", error);
      toast.error("Failed to rename");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (keysToDelete: string[]) => {
    if (keysToDelete.length === 0 || !activeAccountId || !activeBucket) return;
    
    if (confirm(`Are you sure you want to delete ${keysToDelete.length} item(s)?`)) {
      toast.info(`Deleting ${keysToDelete.length} item(s)...`);
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
        
        await adapter.deleteObjects(activeBucket, keysToDelete);
        
        // Remove selected items from files
        const newFiles = files.filter((file) => !keysToDelete.includes(file.key));
        setFiles(newFiles);
        toast.success(`${keysToDelete.length} item(s) deleted successfully`);
      } catch (error) {
        console.error("Failed to delete items:", error);
        toast.error("Failed to delete items");
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // If we have accounts but no active account, select the first one
    if (accounts.length > 0 && !activeAccountId) {
      setActiveAccountId(accounts[0].id);
    }
  }, [accounts, activeAccountId]);

  return {
    accounts,
    buckets,
    activeAccountId,
    activeBucket,
    currentPath,
    files,
    breadcrumbs,
    isLoading,
    setFiles,
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
  };
}
