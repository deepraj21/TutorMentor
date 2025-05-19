
import { useState } from 'react';
import { useFileSystem } from '@/contexts/FileSystemContext';
import { FileItem as FileItemType } from '@/types';
import FileItem from './FileItem';
import { 
  ArrowUp, 
  FolderPlus, 
  Upload, 
  Search, 
  Home,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useTheme } from '@/contexts/ThemeContext';

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
      cancel: "Cancel"
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
      cancel: "বাতিল"
    }
  };

  const t = translations[language];
  
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
    <div className="p-4 w-full max-w-6xl mx-auto dark:bg-gray-900 dark:text-white">
      {/* Top bar with breadcrumbs and actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        {/* Breadcrumbs */}
        <div className="flex-1 min-w-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigateTo([])} className="dark:text-white">
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

        {/* Actions */}
        <div className="flex space-x-2 w-full md:w-auto">
          {currentPath.length > 0 && (
            <Button
              variant="outline"
              size="icon"
              onClick={navigateUp}
              className="h-9 w-9 dark:border-gray-600 dark:text-white"
              title="Go up one level"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          )}
          
          <div className="relative flex-1 md:flex-none">
            <Input
              placeholder={t.search}
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="pr-8 w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full dark:text-gray-400"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* New folder dialog */}
          <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 dark:border-gray-600 dark:text-white" title="Create new folder">
                <FolderPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
              <DialogHeader>
                <DialogTitle>{t.createFolder}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="folderName" className="dark:text-white">{t.folderName}</Label>
                  <Input
                    id="folderName"
                    placeholder={t.enterFolderName}
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setFolderDialogOpen(false)} className="dark:border-gray-600 dark:text-white">
                    {t.cancel}
                  </Button>
                  <Button onClick={handleCreateFolder}>
                    {t.create}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Upload file dialog */}
          <Dialog open={fileDialogOpen} onOpenChange={setFileDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9 dark:border-gray-600 dark:text-white" title="Upload file">
                <Upload className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
              <DialogHeader>
                <DialogTitle>{t.uploadFile}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fileUpload" className="dark:text-white">{t.selectFile}</Label>
                  <Input
                    id="fileUpload"
                    type="file"
                    onChange={handleFileInputChange}
                    className="cursor-pointer dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                {selectedFile && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fileClass" className="dark:text-white">{t.class}</Label>
                      <Input
                        id="fileClass"
                        value={fileClass}
                        onChange={(e) => setFileClass(e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fileDescription" className="dark:text-white">{t.description}</Label>
                      <Textarea
                        id="fileDescription"
                        value={fileDescription}
                        onChange={(e) => setFileDescription(e.target.value)}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        rows={3}
                      />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFileDialogOpen(false)} className="dark:border-gray-600 dark:text-white">
                  {t.cancel}
                </Button>
                <Button onClick={handleFileUpload} disabled={!selectedFile}>
                  {t.upload}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search results indicator */}
      {searchResults.length > 0 && (
        <div className="mb-4 flex justify-between items-center dark:text-gray-300">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t.searchResults} {searchResults.length} {searchResults.length !== 1 ? t.results : t.result}
          </p>
          <Button 
            variant="link" 
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}
            className="h-8 p-0 dark:text-gray-400"
          >
            {t.clear}
          </Button>
        </div>
      )}

      {/* Files and folders grid */}
      {filesToDisplay.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filesToDisplay.map((item) => (
            <FileItem key={item.id} item={item} onItemClick={handleItemClick} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center dark:text-gray-300">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
            <FolderPlus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold">{t.emptyFolder}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
            {t.emptyDescription}
          </p>
        </div>
      )}

      {/* File Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={(open) => !open && setPreviewFile(null)}>
        <DialogContent className="max-w-5xl dark:bg-gray-800 dark:text-white dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewFile?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 flex justify-center items-center">
            {renderFilePreview()}
          </div>
          <DialogFooter>
            <Button onClick={() => setPreviewFile(null)} className="mt-4">
              {t.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileExplorer;
