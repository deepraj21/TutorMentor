import { useState } from 'react';
import { useFileSystem } from '@/contexts/FileSystemContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileItem as FileItemType } from '@/types';
import { File, Folder, Clock, ArrowRight, FileText, Search, LayoutGrid } from 'lucide-react';
import { getFormattedDate } from '@/utils/fileUtils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import SearchBar from '@/components/SearchBar/SearchBar';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import no_user from "@/assets/no-user.webp"
import google_img from "@/assets/google.png"
import AllFilesImg from "@/assets/all-files.webp"
import TestFilesImg from "@/assets/test-files.webp"
import TutorAiImg from "@/assets/tutor-ai.webp"
import ChatHistoryImg from "@/assets/chat-history.webp"
import pdf_icon from "@/assets/pdf_icon.webp"

const HomePage = () => {
  const { files } = useFileSystem();
  const [searchQuery, setSearchQuery] = useState('');
  const { language } = useTheme();
  const { user, isLoggedIn, signIn } = useAuth()

  const translations = {
    english: {
      welcome: 'Welcome to TutorMentor',
      quickAccess: 'Quick Access',
      allFiles: 'All Files',
      testPapers: 'Test',
      recentFiles: 'Recently Visited',
      viewAll: 'View all',
      noRecentFiles: 'No recent files to display',
      recentTestPapers: 'Recent Test Papers',
      noTestPapers: 'No test papers available',
      rootFolder: 'Root folder',
      searchPlaceholder: 'Search files and folders...'
    },
    bengali: {
      welcome: 'পিজুশ-টিউশনে স্বাগতম',
      quickAccess: 'দ্রুত অ্যাক্সেস',
      allFiles: 'সমস্ত ফাইল',
      testPapers: 'পরীক্ষার কাগজপত্র',
      recentFiles: 'সাম্প্রতিক ফাইল',
      viewAll: 'সব দেখুন',
      noRecentFiles: 'প্রদর্শন করার জন্য কোন সাম্প্রতিক ফাইল নেই',
      recentTestPapers: 'পরীক্ষার কাগজপত্র',
      noTestPapers: 'কোন পরীক্ষার কাগজপত্র উপলব্ধ নেই',
      rootFolder: 'মূল ফোল্ডার',
      searchPlaceholder: 'ফাইল এবং ফোল্ডার খুঁজুন...'
    }
  };

  const t = translations[language];

  // Get recent files (most recent first)
  const recentFiles = [...files]
    .filter(file => file.type === 'file')
    .sort((a, b) => {
      if (!a.lastModified || !b.lastModified) return 0;
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    })
    .slice(0, 5);

  // Get test papers (PDFs)
  const testPapers = files.filter(file => 
    file.type === 'file' && 
    file.extension?.toLowerCase() === 'pdf'
  ).slice(0, 3);

  // Get top-level folders
  const folders = files.filter(file => 
    file.type === 'folder' && 
    file.path.length === 0
  );

  // Filter files based on search
  const filteredRecentFiles = searchQuery 
    ? recentFiles.filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : recentFiles;

  const renderFileIcon = (file: FileItemType) => {
    if (file.type === 'folder') {
      return <Folder className="h-5 w-5 text-tutor-primary dark:text-tutor-accent" />;
    }
    return <File className="h-5 w-5 text-tutor-secondary dark:text-tutor-secondary" />;
  };

  return (
    <>
    {
      isLoggedIn ? (
          <div className="container mx-auto pb-10">
            <div className="fixed left-1/2 transform -translate-x-1/2 shadow-lg w-[92%] overflow-hidden pt-4 bg-white dark:bg-gray-900 rounded-[22px] overflow-hidden">
              <SearchBar
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full shadow-lg"
              />
            </div>

            {/* Quick access section */}
            <section className="mb-8 pt-24">
              <div className="flex items-center mb-4">
                <LayoutGrid className="h-5 w-5 mr-2 text-tutor-primary dark:text-tutor-accent" />
                <h2 className="text-lg dark:text-white">{t.quickAccess}</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/drive" className="block">
                  <Card className="hover:shadow-md transition-shadow h-full dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="flex flex-col items-center justify-center py-6">
                      <img src={AllFilesImg} alt="All Files" className='h-24 w-24' />
                      <h3 className="font-medium dark:text-white w-full truncate text-center">{t.allFiles}</h3>
                    </CardContent>
                  </Card>
                </Link>

                <Link to="/tests" className="block">
                  <Card className="hover:shadow-md transition-shadow h-full dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="flex flex-col items-center justify-center py-6">
                      <img src={TestFilesImg} alt="Test Files" className='h-24 w-24' />
                      <h3 className="font-medium dark:text-white w-full truncate text-center">{t.testPapers}</h3>
                    </CardContent>
                  </Card>
                </Link>

                  <Link to="" className="block">
                    <Card className="hover:shadow-md transition-shadow h-full dark:bg-gray-800 dark:border-gray-700">
                      <CardContent className="flex flex-col items-center justify-center py-6">
                        <img src={TutorAiImg} alt="Tutor Ai" className='h-24 w-24' />
                      <h3 className="font-medium dark:text-white w-full truncate text-center">Tutor AI</h3>
                      </CardContent>
                    </Card>
                  </Link>

                <Link to="" className="block">
                  <Card className="hover:shadow-md transition-shadow h-full dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="flex flex-col items-center justify-center py-6">
                      <img src={ChatHistoryImg} alt="Tutor Ai" className='h-24 w-24' />
                      <h3 className="font-medium dark:text-white w-full truncate text-center">Chat History</h3>
                    </CardContent>
                  </Card>
                </Link>
                
              </div>
            </section>

            {/* Recent files section */}
            <section className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg flex items-center dark:text-white">
                  <Clock className="h-5 w-5 mr-2 text-tutor-primary dark:text-tutor-accent" />
                  {t.recentFiles}
                </h2>
                <Link to="/drive">
                  <Button variant="ghost" className="text-tutor-primary dark:text-tutor-accent">
                    {t.viewAll} <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {filteredRecentFiles.length > 0 ? (
                <div className="space-y-2">
                  {filteredRecentFiles.map(file => (
                    <Card key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 dark:border-gray-700">
                      <CardContent className="flex items-center justify-between p-0">
                        <div className="flex items-center flex-row gap-2 w-[70%]">
                          {/* {renderFileIcon(file)} */}
                          <div className='p-2 border-r dark:border-gray-700 border-gray-200'>
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
                            {file.lastModified && getFormattedDate(file.lastModified)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400">{t.noRecentFiles}</p>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Test papers preview */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg dark:text-white flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-tutor-primary dark:text-tutor-accent" />
                  {t.recentTestPapers}
                  </h2>
                <Link to="/tests">
                  <Button variant="ghost" className="text-tutor-primary dark:text-tutor-accent">
                    {t.viewAll} <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {testPapers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {testPapers.map(paper => (
                    <Card key={paper.id} className="overflow-hidden hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                          <File className="h-5 w-5 text-tutor-primary dark:text-tutor-accent" />
                          {paper.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-gray-600 truncate dark:text-gray-400">
                          {paper.path.length > 0 ? `In: ${paper.path.join(' > ')}` : t.rootFolder}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          {paper.lastModified && getFormattedDate(paper.lastModified)}
                        </span>
                        <button className="text-tutor-primary dark:text-tutor-accent hover:underline">{t.viewAll}</button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500 dark:text-gray-400">{t.noTestPapers}</p>
                  </CardContent>
                </Card>
              )}
            </section>
          </div>
      ) : (
        <div className='h-[calc(100vh-10rem)] flex items-center justify-center flex-col'>
              <img src={no_user} />
              <button onClick={signIn} className='flex gap-2 items-center border p-2 rounded-lg'>
                <img src={google_img} className='h-4 w-4' />
                Sign in with Google
              </button>
        </div>
      )
    }
    </>
  );
};

export default HomePage;
