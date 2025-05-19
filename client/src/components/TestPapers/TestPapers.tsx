
import { useState } from 'react';
import { File, Folder } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useFileSystem } from '@/contexts/FileSystemContext';
import { getFormattedDate } from '@/utils/fileUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface TestPapersProps {
  searchQuery?: string;
}

const TestPapers = ({ searchQuery = '' }: TestPapersProps) => {
  const { files, navigateTo, currentPath, currentViewFiles } = useFileSystem();
  const { language } = useTheme();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  const translations = {
    english: {
      noTestPapers: 'No test papers available',
      noTestPapersDesc: 'Your tutor hasn\'t shared any test papers yet',
      inFolder: 'In folder',
      rootFolder: 'Root folder',
      available: 'This test paper is available for your review.',
      view: 'View',
      close: 'Close'
    },
    bengali: {
      noTestPapers: 'কোন পরীক্ষার কাগজপত্র উপলব্ধ নেই',
      noTestPapersDesc: 'আপনার শিক্ষক এখনও কোন পরীক্ষার কাগজপত্র শেয়ার করেননি',
      inFolder: 'ফোল্ডারে',
      rootFolder: 'মূল ফোল্ডার',
      available: 'এই পরীক্ষার কাগজটি আপনার পর্যালোচনার জন্য উপলব্ধ।',
      view: 'দেখুন',
      close: 'বন্ধ করুন'
    }
  };

  const t = translations[language];
  
  // Get current folder and file items
  const folders = currentViewFiles.filter(item => item.type === 'folder');
  const testPapers = currentViewFiles.filter(item => 
    item.type === 'file' && 
    item.extension?.toLowerCase() === 'pdf' &&
    (searchQuery ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) : true)
  );

  const handleFolderClick = (folderName: string) => {
    navigateTo([...currentPath, folderName]);
  };

  const handleFileView = (fileId: string) => {
    setSelectedFile(fileId);
  };

  return (
    <div>
      {/* Breadcrumb navigation */}
      {currentPath.length > 0 && (
        <div className="flex items-center text-tutor-primary dark:text-tutor-accent mb-4 text-sm">
          <button 
            onClick={() => navigateTo([])}
            className="hover:underline"
          >
            {t.rootFolder}
          </button>
          {currentPath.map((folder, index) => (
            <div key={index} className="flex items-center">
              <span className="mx-2">/</span>
              <button 
                onClick={() => navigateTo(currentPath.slice(0, index + 1))}
                className="hover:underline"
              >
                {folder}
              </button>
            </div>
          ))}
        </div>
      )}
      
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
        <div className="text-center py-12">
          <File className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
