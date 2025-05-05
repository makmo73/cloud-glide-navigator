
import { StorageAdapter } from "@/types/s3";
import { LocalStorageAdapter } from "./LocalStorageAdapter";
import { S3Adapter } from "./S3Adapter";

export const createStorageAdapter = (accountConfig: {
  accessKey: string;
  secretKey: string;
  region: string;
  endpoint?: string;
  isLocalStorage?: boolean;
  localPath?: string;
}): StorageAdapter => {
  if (accountConfig.isLocalStorage) {
    return new LocalStorageAdapter(accountConfig.localPath);
  } else {
    return new S3Adapter(
      accountConfig.accessKey,
      accountConfig.secretKey,
      accountConfig.region,
      accountConfig.endpoint
    );
  }
};
