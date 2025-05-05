
import { useState, useEffect } from 'react';
import { X, FileText, File, FileImage, FileCode } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ScrollArea } from '@/components/ui/scroll-area';
import { S3Object } from '@/types/s3';
import { getFileType, getCodeLanguage } from '@/utils/fileUtils';
import Prism from 'prismjs';
// Import Prism CSS theme
import 'prismjs/themes/prism-tomorrow.css';
// Import languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup'; // for HTML and XML
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-scss';

interface FilePreviewProps {
  file: S3Object | null;
  url: string | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

const FilePreview = ({ file, url, isOpen, onClose, onDownload }: FilePreviewProps) => {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!file || !url || file.isFolder) return;
    
    // For text or code files, load the content
    const fileType = getFileType(file.key);
    if (fileType === 'text' || fileType === 'code') {
      setIsLoading(true);
      setError(null);
      
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to load file content');
          }
          return response.text();
        })
        .then(text => {
          setContent(text);
        })
        .catch(err => {
          console.error('Error loading text file:', err);
          setError('Failed to load file content');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [file, url]);
  
  useEffect(() => {
    // Highlight code when content changes
    if (file && content && getFileType(file.key) === 'code') {
      Prism.highlightAll();
    }
  }, [content, file]);
  
  if (!file || !isOpen) return null;
  
  const fileName = file.key.split('/').pop() || file.key;
  const fileType = getFileType(file.key);
  
  const renderPreview = () => {
    if (!url) return <div className="text-center p-4 text-muted-foreground">Preview not available</div>;
    
    switch (fileType) {
      case 'image':
        return (
          <div className="flex items-center justify-center">
            <img src={url} alt={fileName} className="max-w-full max-h-[calc(100vh-200px)] object-contain" />
          </div>
        );
        
      case 'pdf':
        return (
          <AspectRatio ratio={16/9} className="bg-muted">
            <iframe 
              src={`${url}#toolbar=0&navpanes=0`} 
              className="w-full h-full" 
              title={fileName}
            />
          </AspectRatio>
        );
        
      case 'text':
        if (isLoading) {
          return <div className="text-center p-4">Loading content...</div>;
        }
        
        if (error) {
          return <div className="text-center p-4 text-destructive">{error}</div>;
        }
        
        return (
          <ScrollArea className="h-[70vh] w-full border rounded-md bg-muted p-4">
            <pre className="text-sm whitespace-pre-wrap font-mono">{content}</pre>
          </ScrollArea>
        );
      
      case 'code':
        if (isLoading) {
          return <div className="text-center p-4">Loading content...</div>;
        }
        
        if (error) {
          return <div className="text-center p-4 text-destructive">{error}</div>;
        }

        const language = getCodeLanguage(fileName);
        
        return (
          <ScrollArea className="h-[70vh] w-full border rounded-md bg-muted">
            <pre className="p-4 text-sm">
              <code className={`language-${language}`}>
                {content}
              </code>
            </pre>
          </ScrollArea>
        );
        
      default:
        return (
          <div className="text-center p-12 flex flex-col items-center gap-4">
            {fileType === 'unknown' && <FileText className="h-20 w-20 text-muted-foreground" />}
            <p>Preview not available for this file type</p>
            <Button onClick={onDownload}>Download File</Button>
          </div>
        );
    }
  };

  const FileIcon = () => {
    switch (fileType) {
      case 'image':
        return <FileImage className="mr-2 h-5 w-5" />;
      case 'pdf':
        return <File className="mr-2 h-5 w-5" />;
      case 'code':
        return <FileCode className="mr-2 h-5 w-5" />;
      default:
        return <FileText className="mr-2 h-5 w-5" />;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileIcon />
            <span className="truncate">{fileName}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {renderPreview()}
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-muted-foreground">
            {!file.isFolder && `Size: ${file.size ? file.size.toLocaleString() : 0} bytes`}
          </div>
          <Button onClick={onDownload}>Download</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreview;
