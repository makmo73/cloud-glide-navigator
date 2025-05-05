
import { StorageAdapter, S3Bucket, S3Object } from "@/types/s3";
import { toast } from "sonner";

export class LocalStorageAdapter implements StorageAdapter {
  private localPath: string;
  private mockDelay = 600; // Mock network delay for local operations (ms)

  constructor(localPath: string = "/local-storage") {
    this.localPath = localPath;
  }

  // Helper method to simulate async operations for mockup
  private async simulateDelay<T>(result: T): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(result), this.mockDelay));
  }

  async listBuckets(): Promise<S3Bucket[]> {
    console.log("Listing local buckets from:", this.localPath);
    
    // For demo purposes, return mock buckets
    const mockBuckets: S3Bucket[] = [
      { 
        name: "local-files", 
        creationDate: new Date().toISOString(),
        isLocal: true 
      },
      { 
        name: "local-backups", 
        creationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        isLocal: true 
      },
    ];
    
    return this.simulateDelay(mockBuckets);
  }

  async createBucket(name: string): Promise<S3Bucket> {
    console.log("Creating local bucket:", name);
    
    // Mock creating a local directory
    const newBucket: S3Bucket = {
      name,
      creationDate: new Date().toISOString(),
      isLocal: true
    };
    
    return this.simulateDelay(newBucket);
  }

  async listObjects(bucketName: string, prefix: string = ""): Promise<S3Object[]> {
    console.log(`Listing objects in local bucket: ${bucketName}, prefix: ${prefix}`);
    
    // Generate mock files based on the bucket and prefix
    const mockFiles: S3Object[] = [];
    
    // Add folders
    const folderCount = bucketName === "local-files" ? 3 : 2;
    for (let i = 1; i <= folderCount; i++) {
      mockFiles.push({
        key: `${prefix}folder-${i}/`,
        size: 0,
        lastModified: new Date().toISOString(),
        isFolder: true,
        isLocal: true
      });
    }
    
    // Add files with varying extensions and sizes
    const fileExtensions = [".txt", ".pdf", ".jpg", ".png", ".docx", ".xlsx"];
    for (let i = 1; i <= 8; i++) {
      const ext = fileExtensions[i % fileExtensions.length];
      mockFiles.push({
        key: `${prefix}file-${i}${ext}`,
        size: Math.floor(Math.random() * 10000000), // Random size
        lastModified: new Date(Date.now() - i * 10000000).toISOString(),
        isFolder: false,
        isLocal: true
      });
    }
    
    return this.simulateDelay(mockFiles);
  }

  async deleteObjects(bucketName: string, keys: string[]): Promise<void> {
    console.log(`Deleting objects from local bucket ${bucketName}:`, keys);
    // Mock implementation, just delay and return
    return this.simulateDelay(undefined);
  }

  async uploadFile(bucketName: string, key: string, file: File): Promise<void> {
    console.log(`Uploading file to local bucket ${bucketName}:`, key, file);
    // Mock implementation, just delay and return
    return this.simulateDelay(undefined);
  }

  async downloadObject(bucketName: string, key: string): Promise<Blob> {
    console.log(`Downloading object from local bucket ${bucketName}:`, key);
    // Mock implementation, create an empty blob
    const mockBlob = new Blob(["This is a mock file content"], { type: "text/plain" });
    return this.simulateDelay(mockBlob);
  }

  async getObjectUrl(bucketName: string, key: string): Promise<string> {
    console.log(`Generating URL for object in local bucket ${bucketName}:`, key);
    
    // For local files, we would typically use a file:// URL or a local server URL
    // For the mock implementation, we'll generate mock URLs based on file type
    const fileName = key.split('/').pop() || '';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    let mockUrl = '';
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      // Provide a sample image for preview
      mockUrl = `https://placehold.co/800x600?text=${encodeURIComponent(fileName)}`;
    } else if (extension === 'pdf') {
      // For PDFs, use a sample PDF URL
      mockUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    } else if (['txt', 'md', 'json', 'xml', 'csv'].includes(extension)) {
      // For text files, create a data URL with mock content
      const content = `This is a mock content for the local file: ${fileName}\n\nLocal path: ${this.localPath}/${bucketName}/${key}\n\nGenerated at ${new Date().toLocaleString()}`;
      mockUrl = `data:text/plain;base64,${btoa(content)}`;
    } else {
      // For other files, create a generic data URL
      mockUrl = `data:application/octet-stream;base64,${btoa(`Binary content for ${fileName}`)}`;
    }
    
    return this.simulateDelay(mockUrl);
  }
}
