import { useState } from 'react';
import { File, Folder, Home, Search, ArrowUp, FolderPlus, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useFileSystem } from '@/contexts/FileSystemContext';
import { getFormattedDate } from '@/utils/fileUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import no_file from "@/assets/no-file.webp"

interface TestPapersProps {
  searchQuery?: string;
}

const TestPapers = ({ searchQuery = '' }: TestPapersProps) => {
  const { files, navigateTo, currentPath, currentViewFiles, navigateUp, createFolder, uploadFile } = useFileSystem();
  const { language } = useTheme();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);

  // New states for folder and file upload
  const [newFolderName, setNewFolderName] = useState('');
  const [fileClass, setFileClass] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const translations = {
    english: {
      noTestPapers: 'No test papers available',
      noTestPapersDesc: 'Your tutor hasn\'t shared any test papers yet',
      inFolder: 'In folder',
      rootFolder: 'Root folder',
      available: 'This test paper is available for your review.',
      view: 'View',
      close: 'Close',
      search: 'Search',
      createFolder: 'Create Folder',
      folderName: 'Folder Name',
      enterFolderName: 'Enter folder name',
      cancel: 'Cancel',
      create: 'Create',
      uploadFile: 'Upload File',
      selectFile: 'Select File',
      class: 'Class',
      description: 'Description',
      upload: 'Upload'
    },
    bengali: {
      noTestPapers: 'কোন পরীক্ষার কাগজপত্র উপলব্ধ নেই',
      noTestPapersDesc: 'আপনার শিক্ষক এখনও কোন পরীক্ষার কাগজপত্র শেয়ার করেননি',
      inFolder: 'ফোল্ডারে',
      rootFolder: 'মূল ফোল্ডার',
      available: 'এই পরীক্ষার কাগজটি আপনার পর্যালোচনার জন্য উপলব্ধ।',
      view: 'দেখুন',
      close: 'বন্ধ করুন',
      search: 'অনুসন্ধান করুন',
      createFolder: 'নতুন ফোল্ডার তৈরি করুন',
      folderName: 'ফোল্ডারের নাম',
      enterFolderName: 'ফোল্ডারের নাম লিখুন',
      cancel: 'বাতিল',
      create: 'তৈরি করুন',
      uploadFile: 'ফাইল আপলোড করুন',
      selectFile: 'ফাইল নির্বাচন করুন',
      class: 'ক্লাস',
      description: 'বর্ণনা',
      upload: 'আপলোড'
    }
  };

  const t = translations[language];

  // Get current folder and file items
  const folders = currentViewFiles.filter(item => item.type === 'folder');
  const testPapers = currentViewFiles.filter(item =>
    item.type === 'file' &&
    item.extension?.toLowerCase() === 'pdf' &&
    (searchInput ? item.name.toLowerCase().includes(searchInput.toLowerCase()) : true)
  );

  const handleFolderClick = (folderName: string) => {
    navigateTo([...currentPath, folderName]);
  };

  const handleFileView = (fileId: string) => {
    setSelectedFile(fileId);
  };

  // Update search on input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Trigger search (if you want to update parent or local state)
  const handleSearch = () => {
    // If searchQuery is a prop from parent, call a prop function to update it
    // Otherwise, set local state or filter as needed
    // For now, just filter locally
    // setSearchQuery(searchInput);
  };

  // Folder creation
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName, currentPath);
      setNewFolderName('');
      setFolderDialogOpen(false);
    }
  };

  // File input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  // File upload
  const handleFileUpload = () => {
    if (fileToUpload) {
      uploadFile(fileToUpload, {
        class: fileClass,
        description: fileDescription,
        path: currentPath
      });
      setFileToUpload(null);
      setFileClass('');
      setFileDescription('');
      setFileDialogOpen(false);
    }
  };

  return (
    <div>
      {/* Header: Breadcrumbs + Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        {/* Breadcrumbs */}
        <div className="flex-1 min-w-0">
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
              value={searchInput}
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

                {fileToUpload && (
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
                <Button onClick={handleFileUpload} disabled={!fileToUpload}>
                  {t.upload}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Display folders and test papers */}
      {(folders.length > 0 || testPapers.length > 0) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Folders */}
          {folders.map((folder) => (
            <Card
              key={folder.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700"
              onClick={() => handleFolderClick(folder.name)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Folder className="h-5 w-5 text-tutor-primary dark:text-tutor-accent" />
                  {folder.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {folder.path.length > 0 ? `${t.inFolder}: ${folder.path.join(' > ')}` : t.rootFolder}
                </p>
              </CardContent>
              <CardFooter className="text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {folder.lastModified && getFormattedDate(folder.lastModified)}
                </span>
              </CardFooter>
            </Card>
          ))}

          {/* Test papers */}
          {testPapers.map((paper) => (
            <Card
              key={paper.id}
              className="overflow-hidden hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <File className="h-5 w-5 text-tutor-primary dark:text-tutor-accent" />
                  {paper.name}
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  {paper.path.length > 0 ? `${t.inFolder}: ${paper.path.join(' > ')}` : t.rootFolder}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.available}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                  {paper.lastModified && getFormattedDate(paper.lastModified)}
                </span>
                <button
                  className="text-tutor-primary dark:text-tutor-accent hover:underline"
                  onClick={() => handleFileView(paper.id)}
                >
                  {t.view}
                </button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 flex flex-col items-center">
            <img src={no_file} />
          <h3 className="text-lg font-semibold dark:text-white">{t.noTestPapers}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t.noTestPapersDesc}
          </p>
        </div>
      )}

      {/* File preview dialog */}
      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-4xl h-[80vh] dark:bg-gray-800">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold dark:text-white">
                {files.find(f => f.id === selectedFile)?.name}
              </h2>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {t.close}
              </button>
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
              <p className="text-center text-gray-500 dark:text-gray-400">PDF Preview</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestPapers;
