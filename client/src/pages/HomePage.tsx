import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileItem as FileItemType } from '@/types';
import { File, Folder, Clock, ArrowRight, FileText, LayoutGrid, Lock, CheckCircle2 } from 'lucide-react';
import { getFormattedDate } from '@/utils/fileUtils';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import SearchBar from '@/components/SearchBar/SearchBar';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import BatchCodeInput from '@/components/BatchCode/BatchCodeInput';
import no_user from "@/assets/no-user.webp"
import google_img from "@/assets/google.png"
import AllFilesImg from "@/assets/all-files.webp"
import TestFilesImg from "@/assets/test-files.webp"
import TutorAiImg from "@/assets/tutor-ai.webp"
import pdf_icon from "@/assets/pdf_icon.webp"
import axios from "axios";
import joingBatchImg from "@/assets/join-batch.webp"
import pendingImg from "@/assets/pending.webp"
import aboutimg from "@/assets/tutor-mentor.png"
import { Test } from '@/types/test';
import { getBatchTests } from '@/utils/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

interface UserData {
  _id: string;
  name: string;
  email: string;
  status: string;
  recent_files: any[];
  __v: number;
}

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { language } = useTheme();
  const { user, isLoggedIn, signIn } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [tests, setTests] = useState<Test[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const studentId = localStorage.getItem("studentId");
        if (isLoggedIn && user && (user.email || studentId)) {
          const userDataResponse = await axios.get(`${BACKEND_URL}/api/auth/get-data/${studentId}`);
          setUserData(userDataResponse.data.user);
        }
      } catch (error) {
        setUserData(null);
      }
    };

    if (isLoggedIn && user) {
      fetchUserData();
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    const loadTests = async () => {
      try {
        const batchId = localStorage.getItem('batchId');
        if (batchId) {
          const data = await getBatchTests(batchId);
          setTests(data.slice(0, 3)); // Get only latest 3 tests
        }
      } catch (error) {
        toast.error('Failed to load tests');
      }
    };

    if (userData?.status === "Accepted") {
      loadTests();
    }
  }, [userData?.status]);

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
      searchPlaceholder: 'Search files and folders...',
      tutorAi: 'Tutor AI',
      about: 'About'
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
      searchPlaceholder: 'ফাইল এবং ফোল্ডার খুঁজুন...',
      tutorAi: 'টিউটর এআই',
      about: 'সম্পর্কে'
    }
  };

  const t = translations[language];

  const renderFileIcon = (file: FileItemType) => {
    if (file.type === 'folder') {
      return <Folder className="h-5 w-5 text-tutor-primary dark:text-tutor-accent" />;
    }
    return <File className="h-5 w-5 text-tutor-secondary dark:text-tutor-secondary" />;
  };

  const getTestStatus = (test: Test) => {
    if (test.status === 'draft') return 'Draft';
    if (test.status === 'published') return 'Locked';
    if (test.status === 'started') return 'Active';
    if (test.status === 'ended') return 'Ended';
    return test.status;
  };

  const getTestStatusIcon = (test: Test) => {
    switch (test.status) {
      case 'published':
        return <Lock className="h-4 w-4" />;
      case 'started':
        return <Clock className="h-4 w-4" />;
      case 'ended':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <>
      {
        isLoggedIn ? (
          <div className="container mx-auto pb-10">
            {userData?.status === "NoBatch" && (
              <div className='h-[calc(100vh-12rem)] flex items-center justify-center flex-col'>
                <img src={joingBatchImg} />
                <Dialog>
                  <DialogTrigger asChild>
                    <button className='flex gap-2 items-center border p-2 rounded-lg'>
                      Join Batch Now
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:text-white">
                    <DialogTitle>Join Batch</DialogTitle>
                    <BatchCodeInput
                      studentId={userData?._id}
                      onSuccess={() => {
                        window.location.reload();
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}
            {
              userData?.status === "Pending" && (
                <div className='h-[calc(100vh-12rem)] flex items-center justify-center flex-col'>
                  <img src={pendingImg} />
                  <p className='text-gray-900 dark:text-gray-200 bg-yellow-600/50 p-1 pl-2 pr-2  rounded-full'>Approval pending</p>
                </div>
              )
            }
            {
              userData?.status === "Rejected" && (
                <div className='h-[calc(100vh-12rem)] flex items-center justify-center flex-col'>
                  <img src={pendingImg} />
                  <p className="text-gray-500 dark:text-gray-400">Your request has been rejected. Please contact support.</p>
                </div>
              )
            }

            {
              userData?.status == "Accepted" && (
                <>
                  <div className="fixed left-1/2 transform -translate-x-1/2 md:container w-[92%] pt-4 bg-white dark:bg-gray-900 rounded-[22px]">
                    <SearchBar
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full shadow-lg rounded-[23px]"
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

                      <Link to="/tutor-ai" className="block">
                        <Card className="hover:shadow-md transition-shadow h-full dark:bg-gray-800 dark:border-gray-700">
                          <CardContent className="flex flex-col items-center justify-center py-6">
                            <img src={TutorAiImg} alt="Tutor Ai" className='h-24 w-24' />
                            <h3 className="font-medium dark:text-white w-full truncate text-center">{t.tutorAi}</h3>
                          </CardContent>
                        </Card>
                      </Link>

                      <Link to="/about" className="block">
                        <Card className="hover:shadow-md transition-shadow h-full dark:bg-gray-800 dark:border-gray-700">
                          <CardContent className="flex flex-col items-center justify-center py-6">
                            <img src={aboutimg} alt="Tutor Ai" className='h-24 w-24 dark:invert' />
                            <h3 className="font-medium dark:text-white w-full truncate text-center">{t.about}</h3>
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


                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500 dark:text-gray-400">{t.noRecentFiles}</p>
                      </CardContent>
                    </Card>

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

                    {tests.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {tests.map((test) => (
                          <Card key={test._id} className="hover:shadow-md transition-shadow h-full dark:bg-gray-800 dark:border-gray-700">
                            <CardHeader className='border-b dark:border-gray-700 p-4'>
                              <CardTitle className="flex items-center justify-between">
                                <span className='w-[70%] truncate'>{test.title}</span>
                                <div
                                  className={`
                                    flex text-sm font-normal gap-1 items-center rounded-full pl-2 pr-1
                                    ${test.status === 'published'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                      : test.status === 'started'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : test.status === 'ended'
                                          ? 'bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-200'
                                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                                    }
                                  `}
                                >
                                  {getTestStatus(test)}
                                  {getTestStatusIcon(test)}
                                </div>
                              </CardTitle>
                              <p className="text-sm text-gray-500 mb-4 w-full truncate">{test.description}</p>
                            </CardHeader>
                            <CardContent className="flex flex-row py-6 p-4 justify-between">
                              <div className="space-y-2">
                                <p>Total Questions: <span className="font-semibold">{test.questions.length}</span></p>
                                <p>Total Marks: <span className="font-semibold">{test.totalMarks}</span></p>
                              </div>
                              <p>Duration: <span className="font-semibold">{test.duration} </span>min</p>
                            </CardContent>
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
                </>
              )
            }
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
