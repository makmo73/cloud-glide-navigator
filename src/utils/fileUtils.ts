
/**
 * Utility functions for file operations
 */

/**
 * Determines the type of file based on the file extension
 */
export const getFileType = (fileName: string): 'image' | 'pdf' | 'text' | 'code' | 'unknown' => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) {
    return 'image';
  }
  
  if (extension === 'pdf') {
    return 'pdf';
  }
  
  if (['txt', 'md', 'json', 'xml', 'csv', 'html'].includes(extension)) {
    return 'text';
  }

  if (['js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'less', 'py', 'java', 'c', 'cpp', 'cs', 'go', 'php', 'rb', 'rs', 'swift'].includes(extension)) {
    return 'code';
  }
  
  return 'unknown';
};

/**
 * Gets the language name for Prism.js based on file extension
 */
export const getCodeLanguage = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    css: 'css',
    scss: 'scss',
    less: 'less',
    html: 'html',
    xml: 'xml',
    json: 'json',
    py: 'python',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    go: 'go',
    php: 'php',
    rb: 'ruby',
    rs: 'rust',
    swift: 'swift',
    sh: 'bash',
    yaml: 'yaml',
    yml: 'yaml',
    md: 'markdown',
  };
  
  return languageMap[extension] || 'plaintext';
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
