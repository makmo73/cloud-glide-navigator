
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateBucketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBucket: (name: string, region: string) => void;
  accountId: string;
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

const CreateBucketDialog = ({
  isOpen,
  onClose,
  onCreateBucket,
  accountId
}: CreateBucketDialogProps) => {
  const [bucketName, setBucketName] = useState("");
  const [region, setRegion] = useState("us-east-1");
  const [nameError, setNameError] = useState("");

  const validateBucketName = (name: string) => {
    if (!name) return "Bucket name is required";
    if (name.length < 3) return "Bucket name must be at least 3 characters";
    if (name.length > 63) return "Bucket name cannot exceed 63 characters";
    if (!/^[a-z0-9.-]+$/.test(name)) return "Bucket name can only contain lowercase letters, numbers, periods, and hyphens";
    if (/^[^a-z0-9]/.test(name)) return "Bucket name must start with a letter or number";
    if (/[^a-z0-9]$/.test(name)) return "Bucket name must end with a letter or number";
    if (/\.\./.test(name)) return "Bucket name cannot contain consecutive periods";
    return "";
  };

  const handleCreateBucket = () => {
    const error = validateBucketName(bucketName);
    if (error) {
      setNameError(error);
      return;
    }

    onCreateBucket(bucketName, region);
    setBucketName("");
    setRegion("us-east-1");
    setNameError("");
  };

  const handleBucketNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBucketName(value);
    setNameError(validateBucketName(value));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Bucket</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="bucket-name">Bucket Name</Label>
            <Input
              id="bucket-name"
              placeholder="my-unique-bucket-name"
              value={bucketName}
              onChange={handleBucketNameChange}
            />
            {nameError && (
              <p className="text-sm text-destructive">{nameError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Bucket names must be unique across all AWS accounts in all AWS Regions within a partition.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bucket-region">Region</Label>
            <Select value={region} onValueChange={setRegion}>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateBucket} disabled={!!nameError || !bucketName}>
            Create Bucket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBucketDialog;
