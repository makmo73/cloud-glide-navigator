
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FileExplorer from "@/components/FileExplorer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import CreateBucketDialog from "@/components/CreateBucketDialog";
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

const Index = () => {
  const [accounts, setAccounts] = useState<S3Account[]>(mockAccounts);
  const [buckets, setBuckets] = useState<Record<string, S3Bucket[]>>(mockBuckets);
  const [activeAccountId, setActiveAccountId] = useState<string | undefined>();
  const [activeBucket, setActiveBucket] = useState<string | undefined>();
  const [currentPath, setCurrentPath] = useState<string>("");
  const [files, setFiles] = useState<S3Object[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCreateBucket, setShowCreateBucket] = useState<boolean>(false);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileClick = (file: S3Object) => {
    if (file.isFolder) {
      const folderName = file.key.split("/").filter(Boolean).pop() || "";
      const newPath = currentPath ? `${currentPath}${folderName}/` : `${folderName}/`;
      setCurrentPath(newPath);
      
      if (activeAccountId && activeBucket) {
        loadFiles(activeAccountId, activeBucket, newPath);
      }
    } else {
      // Handle file selection/preview
      toast.info(`Selected file: ${file.key}`);
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
      setShowCreateBucket(false);
    }
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
    
    toast.info(`Downloading ${selectedItems.length} item(s)...`);
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
      
      // Download first item for demo
      const key = selectedItems[0];
      const blob = await adapter.downloadObject(activeBucket, key);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = key.split("/").pop() || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`${selectedItems.length} item(s) downloaded successfully`);
    } catch (error) {
      console.error("Failed to download items:", error);
      toast.error("Failed to download items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedItems.length === 0 || !activeAccountId || !activeBucket) return;
    
    if (confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
      toast.info(`Deleting ${selectedItems.length} item(s)...`);
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
        
        await adapter.deleteObjects(activeBucket, selectedItems);
        
        // Remove selected items from files
        const newFiles = files.filter((file) => !selectedItems.includes(file.key));
        setFiles(newFiles);
        setSelectedItems([]);
        toast.success(`${selectedItems.length} item(s) deleted successfully`);
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
          onDelete={handleDelete}
          selectedItems={selectedItems}
        />
        
        {activeBucket && (
          <>
            <BreadcrumbNav 
              items={breadcrumbs}
              onNavigate={handleNavigate}
            />
            
            <div className="flex-1 overflow-auto">
              <FileExplorer
                files={files}
                isLoading={isLoading}
                onFileClick={handleFileClick}
                onSelectionChange={setSelectedItems}
                viewType={viewType}
                onViewChange={setViewType}
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
              {accounts.length > 0 ? (
                <p className="text-muted-foreground">
                  Select a bucket from the sidebar to start managing your files.
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Add an account using the + button in the sidebar to get started.
                </p>
              )}
            </div>
          </div>
        )}
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
    </div>
  );
};

export default Index;
