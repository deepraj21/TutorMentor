import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/components/ui/use-toast';
import { FileItem } from '@/types';

interface FileSystemContextType {
  files: FileItem[];
  currentPath: string[];
  navigateTo: (path: string[]) => void;
  navigateUp: () => void;
  createFolder: (name: string) => void;
  uploadFile: (file: File, meta?: { class?: string; description?: string }) => Promise<void>;
  deleteItem: (id: string) => void;
  searchFiles: (params: { query: string; currentPath: string[] }) => FileItem[];
  currentViewFiles: FileItem[];
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};

interface FileSystemProviderProps {
  children: React.ReactNode;
}

export const FileSystemProvider: React.FC<FileSystemProviderProps> = ({ children }) => {
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: uuidv4(),
      name: 'Mathematics',
      type: 'folder' as const,
      path: [],
      lastModified: new Date().toISOString(),
      owner: 'Pijush Tuition'
    },
    {
      id: uuidv4(),
      name: 'Physics',
      type: 'folder' as const,
      path: [],
      lastModified: new Date().toISOString(),
      owner: 'Pijush Tuition'
    },
    {
      id: uuidv4(),
      name: 'Chemistry',
      type: 'folder' as const,
      path: [],
      lastModified: new Date().toISOString(),
      owner: 'Pijush Tuition'
    },
    {
      id: uuidv4(),
      name: 'Yearly Plan.docx',
      type: 'file' as const,
      size: 1024 * 45,
      extension: 'docx',
      path: [],
      lastModified: new Date().toISOString(),
      owner: 'Pijush Tuition',
      class: 'All',
      description: 'Academic year planning document'
    },
    {
      id: uuidv4(),
      name: 'Welcome Note.pdf',
      type: 'file' as const,
      size: 1024 * 320,
      extension: 'pdf',
      path: [],
      lastModified: new Date().toISOString(),
      owner: 'Pijush Tuition',
      class: 'All',
      description: 'Welcome message for new students'
    }
  ]);

  // Add some example files to the Mathematics folder
  useEffect(() => {
    const mathFolderId = files.find(f => f.name === 'Mathematics')?.id;
    if (mathFolderId) {
      setFiles(prev => [
        ...prev,
        {
          id: uuidv4(),
          name: 'Algebra Test.pdf',
          type: 'file' as const,
          size: 1024 * 230,
          extension: 'pdf',
          path: ['Mathematics'],
          lastModified: new Date().toISOString(),
          owner: 'Pijush Tuition',
          class: 'Grade 10',
          description: 'Mid-term algebra assessment'
        },
        {
          id: uuidv4(),
          name: 'Geometry Notes.docx',
          type: 'file' as const,
          size: 1024 * 125,
          extension: 'docx',
          path: ['Mathematics'],
          lastModified: new Date().toISOString(),
          owner: 'Pijush Tuition',
          class: 'Grade 9',
          description: 'Comprehensive geometry study guide'
        }
      ]);
    }
  }, []);

  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const { toast } = useToast();

  // Get files for current path view
  const currentViewFiles = files.filter(file => {
    return JSON.stringify(file.path) === JSON.stringify(currentPath);
  });

  const navigateTo = (path: string[]) => {
    setCurrentPath(path);
  };

  const navigateUp = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const createFolder = (name: string) => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive"
      });
      return;
    }

    // Check if a folder with this name already exists at the current path
    const folderExists = files.some(
      file => file.type === 'folder' && file.name === name && JSON.stringify(file.path) === JSON.stringify(currentPath)
    );

    if (folderExists) {
      toast({
        title: "Error",
        description: `Folder "${name}" already exists`,
        variant: "destructive"
      });
      return;
    }

    const newFolder: FileItem = {
      id: uuidv4(),
      name,
      type: 'folder' as const,
      path: [...currentPath],
      lastModified: new Date().toISOString(),
      owner: 'Pijush Tuition'
    };

    setFiles([...files, newFolder]);
    toast({
      title: "Success",
      description: `Folder "${name}" created`
    });
  };

  const uploadFile = async (file: File, meta?: { class?: string; description?: string }) => {
    const fileExtension = file.name.split('.').pop() || '';

    // Check if a file with this name already exists at the current path
    const fileExists = files.some(
      f => f.type === 'file' && f.name === file.name && JSON.stringify(f.path) === JSON.stringify(currentPath)
    );

    if (fileExists) {
      toast({
        title: "Error",
        description: `File "${file.name}" already exists`,
        variant: "destructive"
      });
      return;
    }

    // Read file content for preview/download
    const content = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    const newFile: FileItem = {
      id: uuidv4(),
      name: file.name,
      type: 'file' as const,
      size: file.size,
      extension: fileExtension,
      path: [...currentPath],
      lastModified: new Date().toISOString(),
      content,
      owner: 'Pijush Tuition',
      class: meta?.class || '',
      description: meta?.description || ''
    };

    setFiles([...files, newFile]);
    toast({
      title: "Success",
      description: `File "${file.name}" uploaded`
    });
  };

  const deleteItem = (id: string) => {
    const item = files.find(file => file.id === id);
    if (!item) return;

    if (item.type === 'folder') {
      // If folder, delete all files inside the folder as well
      const itemPath = [...item.path, item.name];
      setFiles(files.filter(file => {
        return file.id !== id && !file.path.join('/').startsWith(itemPath.join('/'));
      }));
    } else {
      // If file, just delete the file
      setFiles(files.filter(file => file.id !== id));
    }

    toast({
      title: "Success",
      description: `"${item.name}" deleted`
    });
  };

  const searchFiles = (params: { query: string; currentPath: string[] }) => {
    const { query, currentPath } = params;
    
    if (!query) return [];

    return files.filter(file => {
      // Check if file name contains the query (case insensitive)
      const nameMatch = file.name.toLowerCase().includes(query.toLowerCase());
      
      // For searching in current directory only, we also check if file is in current path
      if (currentPath.length > 0) {
        return nameMatch && JSON.stringify(file.path) === JSON.stringify(currentPath);
      }
      
      return nameMatch;
    });
  };

  return (
    <FileSystemContext.Provider
      value={{
        files,
        currentPath,
        navigateTo,
        navigateUp,
        createFolder,
        uploadFile,
        deleteItem,
        searchFiles,
        currentViewFiles
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
};
