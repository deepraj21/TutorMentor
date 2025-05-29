import { useState, useEffect } from 'react';
import { FileItem as FileItemType } from '@/types';
import pdf_icon from "@/assets/pdf_icon.webp"
import doc_img from "@/assets/doc_img.webp"
import {
  Home,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useTheme } from '@/contexts/ThemeContext';
import SearchBar from '../SearchBar/SearchBar';
import { Card, CardContent } from '../ui/card';
import folder_img from "@/assets/all-files.webp"
import axios from 'axios';
import { updateRecentFiles } from '@/utils/api';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

interface DriveFile {
  _id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy: { name: string };
  createdAt: string;
}

interface Folder {
  _id: string;
  name: string;
  path: string;
  createdBy: { name: string };
  createdAt: string;
}

const FileExplorer = () => {


  const { language } = useTheme();
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [path, setPath] = useState<{ id: string; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DriveFile[]>([]);
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Get batchId from localStorage on component mount
  useEffect(() => {
    const batchId = localStorage.getItem('batchId');
    if (batchId) {
      setSelectedBatch(batchId);
    }
  }, []);

  const fetchContents = async (folderId?: string) => {
    if (!selectedBatch) return;

    try {
      const url = folderId
        ? `${BACKEND_URL}/api/folder/${selectedBatch}/folder/${folderId}`
        : `${BACKEND_URL}/api/folder/${selectedBatch}`;
      const response = await axios.get(url);
      setFolders(response.data.folders);
      setFiles(response.data.files);
    } catch (error) {
      console.error('Error fetching contents:', error);
    }
  };

  useEffect(() => {
    if (selectedBatch) {
      setCurrentFolder(null);
      setPath([]);
      fetchContents();
    }
  }, [selectedBatch]);

  const handleFolderClick = (folder: Folder) => {
    setCurrentFolder(folder._id);
    setPath([...path, { id: folder._id, name: folder.name }]);
    fetchContents(folder._id);
  };

  const handleBreadcrumbClick = (index: number) => {
    const newPath = path.slice(0, index + 1);
    setPath(newPath);
    const folderId = newPath[newPath.length - 1]?.id || null;
    setCurrentFolder(folderId);
    fetchContents(folderId || undefined);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    // UI-based search
    const searchTerm = searchQuery.toLowerCase();
    const results = files.filter(file =>
      file.name.toLowerCase().includes(searchTerm)
    );
    setSearchResults(results);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!e.target.value.trim()) {
      setSearchResults([]);
    } else {
      handleSearch();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatMimeType = (mimeType: string) => {
    const mimeMap: { [key: string]: string } = {
      'application/pdf': 'PDF',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'application/vnd.ms-excel': 'XLS',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
      'application/vnd.ms-powerpoint': 'PPT',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
      'image/jpeg': 'JPG',
      'image/png': 'PNG',
      'image/gif': 'GIF',
      'text/plain': 'TXT',
      'text/csv': 'CSV',
      'application/zip': 'ZIP',
      'application/x-rar-compressed': 'RAR',
      'audio/mpeg': 'MP3',
      'audio/wav': 'WAV',
      'video/mp4': 'MP4',
      'video/mpeg': 'MPEG',
      'video/quicktime': 'MOV'
    };

    return mimeMap[mimeType] || mimeType.split('/')[1].toUpperCase();
  };

  // Files to display: search results if there are any, otherwise current directory files
  const filesToDisplay = searchResults.length > 0 ? searchResults : files;

  const handleFileClick = async (file: DriveFile) => {
    // Update recent files
    const studentId = localStorage.getItem("studentId");
    if (studentId) {
      try {
        await updateRecentFiles(studentId, file._id);
      } catch (error) {
        console.error('Error updating recent files:', error);
      }
    }

    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  const renderFilePreview = () => {
    if (!previewFile) return null;

    // Handle PDF files
    if (previewFile.mimeType === 'application/pdf') {
      return (
        <iframe
          src={previewFile.url}
          className="w-full h-[70vh]"
          title={previewFile.name}
        />
      );
    }

    // Handle images
    if (previewFile.mimeType.startsWith('image/')) {
      return (
        <img
          src={previewFile.url}
          alt={previewFile.name}
          className="max-w-full max-h-[70vh] object-contain"
        />
      );
    }

    // For other file types, show a download link
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <p className="text-lg mb-4">This file type cannot be previewed</p>
        <Button
          onClick={() => window.open(previewFile.url, '_blank')}
          className="bg-tutor-primary hover:bg-tutor-primary/90"
        >
          Download File
        </Button>
      </div>
    );
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/pdf') {
      return pdf_icon;
    }
    if (mimeType.startsWith('image/')) {
      return doc_img; // You might want to add a specific image icon
    }
    if (mimeType.includes('word') || mimeType.includes('document')) {
      return doc_img;
    }
    // Add more mime type conditions as needed
    return pdf_icon; // Default icon
  };

  return (
    <div className="w-full mx-auto dark:bg-gray-900 dark:text-white">
      <div className="fixed left-1/2 transform -translate-x-1/2 w-[92%] md:container overflow-hidden pt-4 bg-white dark:bg-gray-900 rounded-lg">
        <div className='shadow-lg rounded-full overflow-hidden'>
          <SearchBar
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            className="w-full shadow-lg"
          />
        </div>
        {/* Breadcrumbs */}
        <div className="flex-1 min-w-0 p-2 pt-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => {
                  setCurrentFolder(null);
                  setPath([]);
                  fetchContents();
                }} className="dark:text-white flex items-center cursor-pointer">
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>

              {path.map((item, index) => (
                <BreadcrumbItem key={item.id}>
                  <BreadcrumbSeparator />
                  <BreadcrumbLink
                    onClick={() => handleBreadcrumbClick(index)}
                    className="dark:text-white cursor-pointer"
                  >
                    {item.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <section className="mb-8 pt-32">
        <div className="space-y-2">
          {/* Folders */}
          {folders.map((folder) => (
            <Card
              key={folder._id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
              onClick={() => handleFolderClick(folder)}
            >
              <CardContent className="flex items-center justify-between p-0">
                <div className="flex items-center flex-row gap-2 w-[70%]">
                  <div className='p-2 border-r border-gray-200 dark:border-gray-700'>
                    <img src={folder_img} alt="folder_icon" className='h-12 w-12' />
                  </div>
                  <div className="w-[65%]">
                    <h3 className="font-medium text-sm dark:text-white truncate">{folder.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Created by {folder.createdBy.name}</p>
                  </div>
                </div>
                <div className='flex flex-col mr-2'>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(folder.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Files */}
          {filesToDisplay.map((file) => (
            <Card
              key={file._id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
              onClick={() => handleFileClick(file)}
            >
              <CardContent className="flex items-center justify-between p-0">
                <div className="flex items-center flex-row gap-2 w-[70%]">
                  <div className='p-2 border-r border-gray-200 dark:border-gray-700'>
                    <img src={getFileIcon(file.mimeType)} alt="file_icon" className='h-12 w-12' />
                  </div>
                  <div className="w-[65%]">
                    <h3 className="font-medium text-sm dark:text-white truncate">{file.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">File Size : {formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className='flex flex-col mr-2'>
                  <span className="text-xs">
                    {formatMimeType(file.mimeType)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* File Preview Dialog */}
      {isPreviewOpen && previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-medium dark:text-white">{previewFile.name}</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPreviewOpen(false)}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-4rem)]">
              {renderFilePreview()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
