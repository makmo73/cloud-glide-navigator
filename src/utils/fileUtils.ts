
/**
 * Utility functions for file operations
 */

/**
 * Determines the type of file based on the file extension
 */
export const getFileType = (fileName: string): 'image' | 'pdf' | 'text' | 'unknown' => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) {
    return 'image';
  }
  
  if (extension === 'pdf') {
    return 'pdf';
  }
  
  if (['txt', 'md', 'json', 'xml', 'csv', 'html', 'css', 'js', 'ts', 'jsx', 'tsx'].includes(extension)) {
    return 'text';
  }
  
  return 'unknown';
};

/**
 * Format file size into human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "—";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Format date into human readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

