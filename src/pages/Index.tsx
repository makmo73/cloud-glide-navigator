
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FileExplorer from "@/components/FileExplorer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import CreateBucketDialog from "@/components/CreateBucketDialog";
import { S3Account, S3Bucket, S3Object, BreadcrumbItem } from "@/types/s3";

// Mock data for demonstration
const mockAccounts: S3Account[] = [
  {
    id: "acc1",
    name: "Personal AWS",
    accessKey: "AKIAIOSFODNN7EXAMPLE",
    secretKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    region: "us-east-1",
    createdAt: new Date().toISOString(),
  },
];

const mockBuckets: Record<string, S3Bucket[]> = {
  acc1: [
    { name: "example-bucket-1", creationDate: new Date().toISOString() },
    { name: "example-bucket-2", creationDate: new Date().toISOString() },
  ],
};

const generateMockObjects = (prefix: string = ""): S3Object[] => {
  const folders = [
    { name: "documents", count: 5 },
    { name: "images", count: 3 },
    { name: "backups", count: 2 },
  ];

  const files = [
    "report.pdf",
    "presentation.pptx",
    "data.csv",
    "config.json",
    "notes.txt",
    "image.png",
    "screenshot.jpg",
  ];

  const result: S3Object[] = [];

  // Add folders
  folders.forEach((folder) => {
    result.push({
      key: `${prefix}${folder.name}/`,
      size: 0,
      lastModified: new Date().toISOString(),
      isFolder: true,
    });
  });

  // Add files
  files.forEach((file) => {
    result.push({
      key: `${prefix}${file}`,
      size: Math.floor(Math.random() * 10000000),
      lastModified: new Date().toISOString(),
      storageClass: "STANDARD",
      isFolder: false,
    });
  });

  return result;
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
  };

  const handleSelectAccount = (accountId: string) => {
    setActiveAccountId(accountId);
    setActiveBucket(undefined);
    setCurrentPath("");
    setFiles([]);
  };

  const handleSelectBucket = (accountId: string, bucketName: string) => {
    setActiveAccountId(accountId);
    setActiveBucket(bucketName);
    setCurrentPath("");
    
    // Load files for this bucket
    setIsLoading(true);
    setTimeout(() => {
      setFiles(generateMockObjects());
      setIsLoading(false);
      
      // Update breadcrumbs
      setBreadcrumbs([
        { name: bucketName, path: "" }
      ]);
    }, 800);
  };

  const handleFileClick = (file: S3Object) => {
    if (file.isFolder) {
      const folderName = file.key.split("/").filter(Boolean).pop() || "";
      const newPath = currentPath ? `${currentPath}${folderName}/` : `${folderName}/`;
      setCurrentPath(newPath);
      
      // Load files for this folder
      setIsLoading(true);
      setTimeout(() => {
        setFiles(generateMockObjects(newPath));
        setIsLoading(false);
        
        // Update breadcrumbs
        const pathParts = newPath.split("/").filter(Boolean);
        const newBreadcrumbs: BreadcrumbItem[] = [];
        
        if (activeBucket) {
          newBreadcrumbs.push({ name: activeBucket, path: "" });
        }
        
        let currentPathAccumulator = "";
        pathParts.forEach((part) => {
          currentPathAccumulator += `${part}/`;
          newBreadcrumbs.push({
            name: part,
            path: currentPathAccumulator
          });
        });
        
        setBreadcrumbs(newBreadcrumbs);
      }, 800);
    } else {
      // Handle file selection/preview
      toast.info(`Selected file: ${file.key}`);
    }
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    
    // Load files for this path
    setIsLoading(true);
    setTimeout(() => {
      setFiles(generateMockObjects(path));
      setIsLoading(false);
      
      // Update breadcrumbs
      const pathParts = path.split("/").filter(Boolean);
      const newBreadcrumbs: BreadcrumbItem[] = [];
      
      if (activeBucket) {
        newBreadcrumbs.push({ name: activeBucket, path: "" });
      }
      
      let currentPathAccumulator = "";
      pathParts.forEach((part) => {
        currentPathAccumulator += `${part}/`;
        newBreadcrumbs.push({
          name: part,
          path: currentPathAccumulator
        });
      });
      
      setBreadcrumbs(newBreadcrumbs);
    }, 800);
  };

  const handleSearch = (query: string) => {
    if (!query) {
      // Reset to current folder content
      setIsLoading(true);
      setTimeout(() => {
        setFiles(generateMockObjects(currentPath));
        setIsLoading(false);
      }, 400);
      return;
    }
    
    // Perform search (mock implementation)
    setIsLoading(true);
    setTimeout(() => {
      const allFiles = [
        ...generateMockObjects(""),
        ...generateMockObjects("documents/"),
        ...generateMockObjects("images/"),
      ];
      
      const filteredFiles = allFiles.filter(
        (file) => file.key.toLowerCase().includes(query.toLowerCase())
      );
      
      setFiles(filteredFiles);
      setIsLoading(false);
      toast.info(`Found ${filteredFiles.length} results for "${query}"`);
    }, 800);
  };

  const handleCreateBucket = (name: string, region: string) => {
    if (!activeAccountId) return;
    
    // Create bucket (mock implementation)
    const newBucket: S3Bucket = {
      name,
      region,
      creationDate: new Date().toISOString(),
    };
    
    setBuckets((prev) => ({
      ...prev,
      [activeAccountId]: [...(prev[activeAccountId] || []), newBucket],
    }));
    
    setShowCreateBucket(false);
    toast.success(`Bucket "${name}" created successfully`);
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    // Mock file upload
    toast.info(`Uploading ${selectedFiles.length} file(s)...`);
    
    setTimeout(() => {
      // Refresh file list
      setIsLoading(true);
      setTimeout(() => {
        setFiles(generateMockObjects(currentPath));
        setIsLoading(false);
        toast.success(`${selectedFiles.length} file(s) uploaded successfully`);
      }, 500);
    }, 1500);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = () => {
    if (selectedItems.length === 0) return;
    
    toast.info(`Downloading ${selectedItems.length} item(s)...`);
    
    setTimeout(() => {
      toast.success(`${selectedItems.length} item(s) downloaded successfully`);
    }, 1500);
  };

  const handleDelete = () => {
    if (selectedItems.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
      toast.info(`Deleting ${selectedItems.length} item(s)...`);
      
      setTimeout(() => {
        // Remove selected items from files
        const newFiles = files.filter((file) => !selectedItems.includes(file.key));
        setFiles(newFiles);
        setSelectedItems([]);
        toast.success(`${selectedItems.length} item(s) deleted successfully`);
      }, 800);
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
                Connect to your AWS S3 accounts, manage buckets, and handle files with ease.
              </p>
              {accounts.length > 0 ? (
                <p className="text-muted-foreground">
                  Select a bucket from the sidebar to start managing your files.
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Add an S3 account using the + button in the sidebar to get started.
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
