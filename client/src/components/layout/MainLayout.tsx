import React, { useState } from 'react';
import MobileNavigation from './MobileNavigation';
import { FileSystemProvider } from '@/contexts/FileSystemContext';
import { Bot, FileArchiveIcon, Home, Inbox, MessageSquareDot, MessageSquareDotIcon, UserCircle } from 'lucide-react';
import UserProfileModal from '../UserProfile/UserProfileModal';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useAuth } from "@/contexts/AuthContext"
import google_img from "@/assets/google.png"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Logo from "@/assets/brandLogo.png"
import { Link } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isLoggedIn, signIn } = useAuth()

  return (
    <ThemeProvider>
      <FileSystemProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 md:pb-0 font-poppins">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center">
                <a href="/" className='flex items-end gap-2 flex-row'>
                  <img src={Logo} alt="" className='h-8 w-8 dark:invert mb-1' />
                  <div className='pt-2'>
                    <h1 className="text-2xl text-black dark:text-white">TutorMentor</h1>
                  </div>
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <div className='md:flex items-center gap-4 hidden'>
                  <Link to="/" className='flex items-center hover:text-tutor-primary gap-1'><Home className='h-4 w-4' /> Home</Link>
                  <Link to="/drive" className='flex items-center hover:text-tutor-primary gap-1'><Inbox className='h-4 w-4' />Drive</Link>
                  <Link to="/tests" className='flex items-center hover:text-tutor-primary gap-1'><FileArchiveIcon className='h-4 w-4' /> Tests</Link>
                  <Link to="/tutor-ai" className='flex items-center hover:text-tutor-primary gap-1'><Bot className="h-4 w-4" /> Tutor AI</Link>
                  <Link to="/chats" className='flex items-center hover:text-tutor-primary gap-1'><MessageSquareDot className="h-4 w-4" /> Chats</Link>
                </div>
                {
                  isLoggedIn ? (
                    <button
                      onClick={() => setIsProfileOpen(true)}
                      className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 p-1"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} />
                        <AvatarFallback className="bg-tutor-primary text-white text-xl">
                          {user?.displayName ? user.displayName.charAt(0) : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </button>

                  ) : (
                    <button className='flex items-center p-2 border lounded-lg'>
                      <img src={google_img} alt="Google" className="w-4 h-4 mr-2" />
                      <span onClick={signIn} className="text-sm font-medium text-gray-700 dark:text-gray-200">Sign In</span>
                    </button>
                  )
                }
              </div>
            </div>
          </header>

          <main>
            {children}
          </main>

          <MobileNavigation />

          <UserProfileModal open={isProfileOpen} onOpenChange={setIsProfileOpen} />

        </div>
      </FileSystemProvider>
    </ThemeProvider>
  );
};

export default MainLayout;
