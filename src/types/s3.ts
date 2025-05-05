
export interface S3Account {
  id: string;
  name: string;
  accessKey: string;
  secretKey: string;
  region: string;
  endpoint?: string;  // Custom endpoint for local object storage
  isLocalStorage?: boolean;  // Flag to identify local storage
  localPath?: string;  // Path to local storage directory
  createdAt: string;
  lastUsed?: string;
}

export interface S3Bucket {
  name: string;
  creationDate?: string;
  region?: string;
  isLocal?: boolean;  // Flag for local buckets
}

export interface S3Object {
  key: string;
  size: number;
  lastModified: string;
  etag?: string;
  storageClass?: string;
  isFolder: boolean;
  isLocal?: boolean;  // Flag for local objects
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface StorageAdapter {
  listBuckets: () => Promise<S3Bucket[]>;
  createBucket: (name: string, region?: string) => Promise<S3Bucket>;
  listObjects: (bucketName: string, prefix: string) => Promise<S3Object[]>;
  deleteObjects: (bucketName: string, keys: string[]) => Promise<void>;
  uploadFile: (bucketName: string, key: string, file: File) => Promise<void>;
  downloadObject: (bucketName: string, key: string) => Promise<Blob>;
}
