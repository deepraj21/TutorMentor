
import { useState } from 'react';
import { useFileSystem } from '@/contexts/FileSystemContext';
import { FileItem as FileItemType } from '@/types';
import pdf_icon from "@/assets/pdf_icon.webp"
import doc_img from "@/assets/doc_img.webp"
import {
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useTheme } from '@/contexts/ThemeContext';
import SearchBar from '../SearchBar/SearchBar';
import { Card, CardContent } from '../ui/card';
import folder_img from "@/assets/all-files.webp"

const FileExplorer = () => {
  const {
    currentPath,
    navigateUp,
    navigateTo,
    currentViewFiles,
    createFolder,
    uploadFile,
    searchFiles
  } = useFileSystem();

  const { language } = useTheme();

  const translations = {
    english: {
      search: "Search files...",
      createFolder: "Create new folder",
      uploadFile: "Upload file",
      folderName: "Folder name",
      enterFolderName: "Enter folder name",
      selectFile: "Select a file",
      create: "Create Folder",
      upload: "Upload",
      class: "Class",
      description: "Description (optional)",
      emptyFolder: "This folder is empty",
      emptyDescription: "Upload files or create folders to populate this space",
      searchResults: "Found",
      result: "result",
      results: "results",
      clear: "Clear",
      filePreview: "File Preview",
      close: "Close",
      goBack: "Go back",
      cancel: "Cancel",
      rootFolder: "Root",
      noRecentFiles: "No recent files found"
    },
    bengali: {
      search: "ফাইল খুঁজুন...",
      createFolder: "নতুন ফোল্ডার তৈরি করুন",
      uploadFile: "ফাইল আপলোড করুন",
      folderName: "ফোল্ডারের নাম",
      enterFolderName: "ফোল্ডারের নাম লিখুন",
      selectFile: "একটি ফাইল নির্বাচন করুন",
      create: "ফোল্ডার তৈরি করুন",
      upload: "আপলোড",
      class: "শ্রেণী",
      description: "বিবরণ (ঐচ্ছিক)",
      emptyFolder: "এই ফোল্ডারটি খালি",
      emptyDescription: "এই স্থানটি পূরণ করতে ফাইল আপলোড করুন বা ফোল্ডার তৈরি করুন",
      searchResults: "পাওয়া গেছে",
      result: "ফলাফল",
      results: "ফলাফল",
      clear: "মুছে ফেলুন",
      filePreview: "ফাইল প্রিভিউ",
      close: "বন্ধ করুন",
      goBack: "ফিরে যান",
      cancel: "বাতিল",
      rootFolder: "মূল ফোল্ডার",
      noRecentFiles: "কোনও সাম্প্রতিক ফাইল পাওয়া যায়নি"
    }
  };

  const t = translations[language];

  const recentFiles = [...currentViewFiles]
    .filter(file => file.type === 'file')
    .sort((a, b) => {
      if (!a.lastModified || !b.lastModified) return 0;
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    })
    .slice(0, 5);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FileItemType[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileClass, setFileClass] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const [previewFile, setPreviewFile] = useState<FileItemType | null>(null);

  const handleItemClick = (item: FileItemType) => {
    if (item.type === 'folder') {
      navigateTo([...item.path, item.name]);
    } else {
      // Preview file
      setPreviewFile(item);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = searchFiles({ query: searchQuery, currentPath });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!e.target.value.trim()) {
      setSearchResults([]);
    } else {
      // Real-time search
      handleSearch();
    }
  };

  const handleCreateFolder = () => {
    createFolder(newFolderName);
    setNewFolderName('');
    setFolderDialogOpen(false);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    await uploadFile(selectedFile, { class: fileClass, description: fileDescription });

    // Reset form
    setSelectedFile(null);
    setFileClass('');
    setFileDescription('');
    setFileDialogOpen(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setSelectedFile(files[0]);
  };

  // Files to display: search results if there are any, otherwise current directory files
  const filesToDisplay = searchResults.length > 0 ? searchResults : currentViewFiles;

  // Function to get appropriate component for file preview
  const renderFilePreview = () => {
    if (!previewFile || previewFile.type !== 'file') return null;

    const extension = previewFile.extension?.toLowerCase();
    const content = previewFile.content as string;

    // For images
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <img src={content} alt={previewFile.name} className="max-w-full max-h-[70vh] object-contain" />;
    }

    // For PDFs
    if (extension === 'pdf') {
      return (
        <iframe
          src={content}
          className="w-full h-[70vh]"
          title={previewFile.name}
        />
      );
    }

    // For videos
    if (['mp4', 'webm', 'ogg'].includes(extension || '')) {
      return (
        <video controls className="w-full max-h-[70vh]">
          <source src={content} type={`video/${extension}`} />
          Your browser does not support the video tag.
        </video>
      );
    }

    // For audio
    if (['mp3', 'wav', 'ogg'].includes(extension || '')) {
      return (
        <audio controls className="w-full">
          <source src={content} type={`audio/${extension}`} />
          Your browser does not support the audio tag.
        </audio>
      );
    }

    // For documents and other file types, offer download option
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <p className="text-lg mb-4">This file type cannot be previewed</p>
          <Button
            onClick={() => {
              const link = document.createElement('a');
              link.href = content;
              link.download = previewFile.name;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Download
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className=" w-full max-w-6xl mx-auto dark:bg-gray-900 dark:text-white">
      <div className="fixed left-1/2 transform -translate-x-1/2 w-[92%] overflow-hidden pt-4 bg-white dark:bg-gray-900 rounded-lg">
        <div className='shadow-lg rounded-full overflow-hidden'>
          <SearchBar
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full shadow-lg"
          />
        </div>
        {/* Breadcrumbs */}
        <div className="flex-1 min-w-0 p-2 pt-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigateTo([])} className="dark:text-white flex items-center">
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>

              {currentPath.map((path, index) => (
                <BreadcrumbItem key={index}>
                  <BreadcrumbSeparator />
                  <BreadcrumbLink
                    onClick={() => navigateTo(currentPath.slice(0, index + 1))}
                    className="dark:text-white"
                  >
                    {path}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <section className="mb-8 p-8 pt-32">

        {recentFiles.length > 0 ? (
          <div className="space-y-2">
            {recentFiles.map(file => (
              <Card key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="flex items-center justify-between p-0">
                  <div className="flex items-center flex-row gap-2 w-[70%]">
                    {/* {renderFileIcon(file)} */}
                    <div className='p-2 border-r border-gray-700'>
                      <img src={pdf_icon} alt="pdf_icon" className='h-12 w-12' />
                    </div>

                    <div className="w-[65%]">
                      <h3 className="font-medium text-sm dark:text-white truncate">{file.name} </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">In :
                        {file.path.length > 0 ? file.path.join(' > ') : t.rootFolder}
                      </p>
                    </div>
                  </div>
                  <div className='flex flex-col mr-2'>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex justify-end">
                      10:29 PM
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {/* {file.lastModified && getFormattedDate(file.lastModified)} */}
                      May 22, 2025
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="flex items-center justify-between p-0">
                <div className="flex items-center flex-row gap-2 w-[70%]">
                  {/* {renderFileIcon(file)} */}
                  <div className='p-2 border-r border-gray-700'>
                    <img src={doc_img} alt="pdf_icon" className='h-12 w-12' />
                  </div>

                  <div className="w-[65%]">
                    <h3 className="font-medium text-sm dark:text-white truncate">name Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolore unde magni veritatis, mollitia eius illo! Omnis sed quibusdam ex distinctio!</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">In :
                      Home
                    </p>
                  </div>
                </div>
                <div className='flex flex-col mr-2'>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex justify-end">
                    10:29 PM
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {/* {file.lastModified && getFormattedDate(file.lastModified)} */}
                    May 22, 2025
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card  className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="flex items-center justify-between p-0">
                <div className="flex items-center flex-row gap-2 w-[70%]">
                  {/* {renderFileIcon(file)} */}
                  <div className='p-2 border-r border-gray-700'>
                    <img src={folder_img} alt="pdf_icon" className='h-12 w-12' />
                  </div>

                  <div className="w-[65%]">
                    <h3 className="font-medium text-sm dark:text-white truncate">name Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolore unde magni veritatis, mollitia eius illo! Omnis sed quibusdam ex distinctio!</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">In :
                     Home
                    </p>
                  </div>
                </div>
                <div className='flex flex-col mr-2'>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex justify-end">
                    10:29 PM
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {/* {file.lastModified && getFormattedDate(file.lastModified)} */}
                    May 22, 2025
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">{t.noRecentFiles}</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
};

export default FileExplorer;
