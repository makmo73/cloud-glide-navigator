
import { StorageAdapter, S3Bucket, S3Object } from "@/types/s3";

// This would be a real S3 implementation in a production app
// For now, we'll just create a mock implementation similar to local storage
export class S3Adapter implements StorageAdapter {
  private accessKey: string;
  private secretKey: string;
  private region: string;
  private endpoint?: string;
  private mockDelay = 800; // Mock network delay (ms)

  constructor(accessKey: string, secretKey: string, region: string, endpoint?: string) {
    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.region = region;
    this.endpoint = endpoint;
  }

  // Helper method to simulate async operations
  private async simulateDelay<T>(result: T): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(result), this.mockDelay));
  }

  async listBuckets(): Promise<S3Bucket[]> {
    console.log("Listing S3 buckets with credentials:", this.accessKey.substring(0, 4) + "...");
    
    // For demo purposes, return mock buckets
    const mockBuckets: S3Bucket[] = [
      { 
        name: "example-bucket-1", 
        creationDate: new Date().toISOString(),
        region: this.region
      },
      { 
        name: "example-bucket-2", 
        creationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        region: this.region
      },
    ];
    
    return this.simulateDelay(mockBuckets);
  }

  async createBucket(name: string, region?: string): Promise<S3Bucket> {
    console.log("Creating S3 bucket:", name);
    
    const newBucket: S3Bucket = {
      name,
      creationDate: new Date().toISOString(),
      region: region || this.region
    };
    
    return this.simulateDelay(newBucket);
  }

  async listObjects(bucketName: string, prefix: string = ""): Promise<S3Object[]> {
    console.log(`Listing objects in S3 bucket: ${bucketName}, prefix: ${prefix}`);
    
    // Generate mock files
    const mockFiles: S3Object[] = [];
    
    // Add folders
    const folderNames = ["documents", "images", "backups"];
    folderNames.forEach(folderName => {
      mockFiles.push({
        key: `${prefix}${folderName}/`,
        size: 0,
        lastModified: new Date().toISOString(),
        isFolder: true
      });
    });
    
    // Add files
    const fileNames = ["report.pdf", "presentation.pptx", "data.csv", "config.json", "notes.txt", "image.png"];
    fileNames.forEach(fileName => {
      mockFiles.push({
        key: `${prefix}${fileName}`,
        size: Math.floor(Math.random() * 10000000),
        lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        isFolder: false,
        storageClass: "STANDARD"
      });
    });
    
    return this.simulateDelay(mockFiles);
  }

  async deleteObjects(bucketName: string, keys: string[]): Promise<void> {
    console.log(`Deleting objects from bucket ${bucketName}:`, keys);
    return this.simulateDelay(undefined);
  }

  async uploadFile(bucketName: string, key: string, file: File): Promise<void> {
    console.log(`Uploading file to bucket ${bucketName}:`, key, file);
    return this.simulateDelay(undefined);
  }

  async downloadObject(bucketName: string, key: string): Promise<Blob> {
    console.log(`Downloading object from bucket ${bucketName}:`, key);
    const mockBlob = new Blob(["This is a mock file content for S3"], { type: "text/plain" });
    return this.simulateDelay(mockBlob);
  }

  async getObjectUrl(bucketName: string, key: string): Promise<string> {
    console.log(`Generating URL for object in bucket ${bucketName}:`, key);
    
    // In a real implementation, this would generate a signed URL
    // For the mock implementation, we'll generate a fake URL based on the file type
    const fileName = key.split('/').pop() || '';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    // Generate mock URLs for different file types
    let mockUrl = '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      // For images, use placeholder images
      mockUrl = `https://placehold.co/600x400?text=${encodeURIComponent(fileName)}`;
    } else if (extension === 'pdf') {
      // For PDFs, we'll use a sample PDF URL
      mockUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    } else {
      // For text files, we'll create a data URL with some sample content
      const content = `This is a mock content for the file: ${fileName}`;
      mockUrl = `data:text/plain;base64,${btoa(content)}`;
    }
    
    return this.simulateDelay(mockUrl);
  }

  // Implement the new methods required by the StorageAdapter interface
  async createFolder(bucketName: string, folderPath: string): Promise<void> {
    console.log(`Creating folder in bucket ${bucketName}:`, folderPath);
    
    // In S3, folders are just objects with a trailing slash and zero content
    // So we'd create an empty object with the key being the folder path
    const key = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
    
    // Just simulate the delay for now, no actual implementation needed for mock
    return this.simulateDelay(undefined);
  }

  async renameObject(bucketName: string, oldKey: string, newKey: string): Promise<void> {
    console.log(`Renaming object in bucket ${bucketName} from ${oldKey} to ${newKey}`);
    
    // In S3, renaming is actually copying to a new key and then deleting the old object
    // For the mock implementation, we'll just simulate the delay
    return this.simulateDelay(undefined);
  }

  // Optional method for generating shareable links
  async generateShareableLink(bucketName: string, key: string, expiresIn: number = 3600): Promise<string> {
    console.log(`Generating shareable link for object ${key} in bucket ${bucketName} with expiration ${expiresIn} seconds`);
    
    // In a real implementation, this would generate a pre-signed URL with expiration
    const mockUrl = `https://example-share.com/${bucketName}/${key}?expires=${Date.now() + expiresIn * 1000}`;
    return this.simulateDelay(mockUrl);
  }
}
