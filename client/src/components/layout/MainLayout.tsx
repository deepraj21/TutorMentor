
import React, { useState } from 'react';
import MobileNavigation from './MobileNavigation';
import { FileSystemProvider } from '@/contexts/FileSystemContext';
import { UserCircle } from 'lucide-react';
import UserProfileModal from '../UserProfile/UserProfileModal';
import { ThemeProvider } from '@/contexts/ThemeContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <ThemeProvider>
      <FileSystemProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 md:pb-0 font-poppins">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-tutor-primary dark:text-tutor-accent">Pijush-Tuition</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setIsProfileOpen(true)}
                  className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 p-1"
                >
                  <UserCircle className="h-8 w-8 text-tutor-primary dark:text-tutor-accent" />
                </button>
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
