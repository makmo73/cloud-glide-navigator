
export interface S3Account {
  id: string;
  name: string;
  accessKey: string;
  secretKey: string;
  region: string;
  createdAt: string;
  lastUsed?: string;
}

export interface S3Bucket {
  name: string;
  creationDate?: string;
  region?: string;
}

export interface S3Object {
  key: string;
  size: number;
  lastModified: string;
  etag?: string;
  storageClass?: string;
  isFolder: boolean;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}
