
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cloud, Plus, Settings, Folder, HardDrive } from "lucide-react";
import { S3Account, S3Bucket } from "@/types/s3";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  accounts: S3Account[];
  buckets: Record<string, S3Bucket[]>;
  onAddAccount: (account: Omit<S3Account, "id" | "createdAt">) => void;
  onSelectAccount: (accountId: string) => void;
  onSelectBucket: (accountId: string, bucketName: string) => void;
  activeAccountId?: string;
  activeBucket?: string;
}

const regions = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-east-2", label: "US East (Ohio)" },
  { value: "us-west-1", label: "US West (N. California)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "eu-west-1", label: "Europe (Ireland)" },
  { value: "eu-central-1", label: "Europe (Frankfurt)" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ap-southeast-2", label: "Asia Pacific (Sydney)" }
];

const Sidebar = ({
  accounts,
  buckets,
  onAddAccount,
  onSelectAccount,
  onSelectBucket,
  activeAccountId,
  activeBucket
}: SidebarProps) => {
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [accountType, setAccountType] = useState<"s3" | "local">("s3");
  const [newAccount, setNewAccount] = useState({
    name: "",
    accessKey: "",
    secretKey: "",
    region: "us-east-1",
    endpoint: "",
    isLocalStorage: false,
    localPath: "/local-storage"
  });

  const handleAddAccount = () => {
    // Set isLocalStorage based on account type
    const accountData = {
      ...newAccount,
      isLocalStorage: accountType === "local"
    };
    
    onAddAccount(accountData);
    
    // Reset form
    setNewAccount({
      name: "",
      accessKey: "",
      secretKey: "",
      region: "us-east-1",
      endpoint: "",
      isLocalStorage: false,
      localPath: "/local-storage"
    });
    setAccountType("s3");
    setIsAddingAccount(false);
  };

  return (
    <div className="w-60 border-r h-full flex flex-col bg-card">
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center">
          <Cloud className="h-5 w-5 text-primary mr-2" />
          <h1 className="text-lg font-semibold">CloudGlide</h1>
        </div>
        <div className="flex items-center space-x-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-grow overflow-auto p-2">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-muted-foreground">ACCOUNTS</h2>
          <Dialog open={isAddingAccount} onOpenChange={setIsAddingAccount}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Storage Account</DialogTitle>
                <DialogDescription>
                  Connect to Amazon S3 or use a local directory as object storage.
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="s3" value={accountType} onValueChange={(v) => setAccountType(v as "s3" | "local")}>
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="s3">Amazon S3</TabsTrigger>
                  <TabsTrigger value="local">Local Storage</TabsTrigger>
                </TabsList>
                
                <TabsContent value="s3" className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Account Name</Label>
                    <Input
                      id="name"
                      placeholder="My S3 Account"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="accessKey">Access Key</Label>
                    <Input
                      id="accessKey"
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                      value={newAccount.accessKey}
                      onChange={(e) => setNewAccount({ ...newAccount, accessKey: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="secretKey">Secret Key</Label>
                    <Input
                      id="secretKey"
                      type="password"
                      placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                      value={newAccount.secretKey}
                      onChange={(e) => setNewAccount({ ...newAccount, secretKey: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="region">Region</Label>
                    <Select 
                      value={newAccount.region}
                      onValueChange={(value) => setNewAccount({ ...newAccount, region: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a region" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.value} value={region.value}>
                            {region.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endpoint">
                      Custom Endpoint (optional)
                    </Label>
                    <Input
                      id="endpoint"
                      placeholder="https://minio.example.com:9000"
                      value={newAccount.endpoint}
                      onChange={(e) => setNewAccount({ ...newAccount, endpoint: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      For MinIO, Ceph, or other S3-compatible services
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="local" className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="localName">Account Name</Label>
                    <Input
                      id="localName"
                      placeholder="My Local Storage"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="localPath">Local Directory Path</Label>
                    <Input
                      id="localPath"
                      placeholder="/path/to/local/storage"
                      value={newAccount.localPath}
                      onChange={(e) => setNewAccount({ ...newAccount, localPath: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Directory that will be used as your object storage
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingAccount(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddAccount}>Add Account</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Accordion type="multiple" className="w-full">
          {accounts.map((account) => (
            <AccordionItem value={account.id} key={account.id}>
              <AccordionTrigger 
                className={`text-sm px-2 py-1 rounded ${activeAccountId === account.id ? 'bg-secondary' : ''}`}
                onClick={() => onSelectAccount(account.id)}
              >
                <div className="flex items-center gap-2">
                  {account.isLocalStorage ? (
                    <HardDrive className="h-3.5 w-3.5" />
                  ) : (
                    <Cloud className="h-3.5 w-3.5" />
                  )}
                  {account.name}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-2 space-y-1 mt-1">
                  {buckets[account.id]?.map((bucket) => (
                    <Button
                      key={bucket.name}
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start text-xs pl-2 ${
                        activeAccountId === account.id && activeBucket === bucket.name
                          ? 'bg-secondary'
                          : ''
                      }`}
                      onClick={() => onSelectBucket(account.id, bucket.name)}
                    >
                      <Folder className="h-3.5 w-3.5 mr-1.5" />
                      {bucket.name}
                    </Button>
                  ))}
                  {!buckets[account.id] || buckets[account.id].length === 0 ? (
                    <div className="text-xs text-muted-foreground px-2 py-1">
                      No buckets found
                    </div>
                  ) : null}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default Sidebar;
