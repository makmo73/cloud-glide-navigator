
// Enhanced version of file type utilities that includes video support
export const getEnhancedFileType = (filePath: string): 'image' | 'pdf' | 'text' | 'code' | 'video' | 'unknown' => {
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
