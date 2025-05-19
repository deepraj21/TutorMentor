
import React, { useState } from 'react';
import TestPapers from '@/components/TestPapers/TestPapers';
import SearchBar from '@/components/SearchBar/SearchBar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FolderPlus, Upload } from 'lucide-react';
import { useFileSystem } from '@/contexts/FileSystemContext';
import { useTheme } from '@/contexts/ThemeContext';

const TestsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [isUploadFileOpen, setIsUploadFileOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileClass, setFileClass] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  
  const { createFolder, uploadFile } = useFileSystem();
  const { language } = useTheme();

  const translations = {
    english: {
      title: 'Test Papers',
      search: 'Search for test papers...',
      createFolder: 'Create Folder',
      uploadFile: 'Upload Test Paper',
      folderName: 'Folder Name',
      selectFile: 'Select a file',
      class: 'Class',
      description: 'Description (optional)',
      create: 'Create',
      upload: 'Upload',
      cancel: 'Cancel',
      newFolder: 'New Folder'
    },
    bengali: {
      title: 'পরীক্ষার কাগজপত্র',
      search: 'পরীক্ষার কাগজপত্র খুঁজুন...',
      createFolder: 'ফোল্ডার তৈরি করুন',
      uploadFile: 'পরীক্ষার কাগজপত্র আপলোড করুন',
      folderName: 'ফোল্ডারের নাম',
      selectFile: 'একটি ফাইল নির্বাচন করুন',
      class: 'শ্রেণী',
      description: 'বিবরণ (ঐচ্ছিক)',
      create: 'তৈরি করুন',
      upload: 'আপলোড করুন',
      cancel: 'বাতিল',
      newFolder: 'নতুন ফোল্ডার'
    }
  };

  const t = translations[language];

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName);
      setNewFolderName('');
      setIsCreateFolderOpen(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    await uploadFile(selectedFile, { class: fileClass, description: fileDescription });
    
    // Reset form
    setSelectedFile(null);
    setFileClass('');
    setFileDescription('');
    setIsUploadFileOpen(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setSelectedFile(files[0]);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-gray-900">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t.title}</h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsCreateFolderOpen(true)}
              className="flex items-center gap-2"
            >
              <FolderPlus className="h-4 w-4" />
              {t.createFolder}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setIsUploadFileOpen(true)}
              className="flex items-center gap-2 dark:border-gray-600 dark:text-white"
            >
              <Upload className="h-4 w-4" />
              {t.uploadFile}
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <SearchBar 
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <TestPapers searchQuery={searchQuery} />
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:text-white dark:border-gray-700">
          <DialogHeader>
            <DialogTitle>{t.createFolder}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name" className="text-sm font-medium dark:text-white">
                {t.folderName}
              </Label>
              <Input
                id="folder-name"
                placeholder={t.newFolder}
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)} className="dark:border-gray-600 dark:text-white">
              {t.cancel}
            </Button>
            <Button onClick={handleCreateFolder}>
              {t.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload File Dialog */}
      <Dialog open={isUploadFileOpen} onOpenChange={setIsUploadFileOpen}>
        <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:text-white dark:border-gray-700">
          <DialogHeader>
            <DialogTitle>{t.uploadFile}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="test-file-upload" className="text-sm font-medium dark:text-white">
                {t.selectFile}
              </Label>
              <Input
                id="test-file-upload"
                type="file"
                onChange={handleFileInputChange}
                className="cursor-pointer dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {selectedFile && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="test-class" className="text-sm font-medium dark:text-white">
                    {t.class}
                  </Label>
                  <Input
                    id="test-class"
                    value={fileClass}
                    onChange={(e) => setFileClass(e.target.value)}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="test-description" className="text-sm font-medium dark:text-white">
                    {t.description}
                  </Label>
                  <Textarea
                    id="test-description"
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
            <Button variant="outline" onClick={() => setIsUploadFileOpen(false)} className="dark:border-gray-600 dark:text-white">
              {t.cancel}
            </Button>
            <Button onClick={handleFileUpload} disabled={!selectedFile}>
              {t.upload}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestsPage;
