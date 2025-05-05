/**
 * Utility functions for file operations
 */

/**
 * Determines the type of file based on the file extension
 */
export const getFileType = (filePath: string): 'image' | 'pdf' | 'text' | 'code' | 'video' | 'unknown' => {
  const extension = filePath.split('.').pop()?.toLowerCase() || '';
  
  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(extension)) {
    return 'image';
  }
  
  // PDF files
  if (extension === 'pdf') {
    return 'pdf';
  }
  
  // Video files
  if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'flv', 'wmv', 'mkv'].includes(extension)) {
    return 'video';
  }
  
  // Text files
  if (['txt', 'csv', 'log', 'md', 'markdown'].includes(extension)) {
    return 'text';
  }
  
  // Code files
  if ([
    'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'less',
    'json', 'xml', 'yaml', 'yml', 'py', 'rb', 'java', 'c', 'cpp',
    'cs', 'go', 'rs', 'php', 'sh', 'bash', 'zsh', 'swift', 'kt',
    'sql', 'graphql', 'dockerfile', 'md'
  ].includes(extension)) {
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
