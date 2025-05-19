
import React, { useState } from 'react';
import MobileNavigation from './MobileNavigation';
import { FileSystemProvider } from '@/contexts/FileSystemContext';
import { UserCircle } from 'lucide-react';
import UserProfileModal from '../UserProfile/UserProfileModal';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useAuth } from "@/contexts/AuthContext"
import google_img from "@/assets/google.png"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

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
                <a href="/">
                  <h1 className="text-xl font-semibold text-tutor-primary dark:text-tutor-accent">Pijush-Tuition</h1>
                </a>
              </div>
              <div className="flex items-center space-x-4">
                {
                  isLoggedIn ? (
                    <button
                      onClick={() => setIsProfileOpen(true)}
                      className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 p-1"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} />
                        <AvatarFallback className="bg-tutor-primary text-white text-xl">
                          {user?.displayName ? user.displayName.charAt(0) : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </button>

                  ) : (
                    <button className='flex items-center'>
                      <img src={google_img} alt="Google" className="w-4 h-4 mr-2" />
                      <span onClick={signIn} className="text-sm font-medium text-gray-700 dark:text-gray-200">Sign in with Google</span>
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
