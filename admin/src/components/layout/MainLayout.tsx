import React, { useState } from 'react';
import MobileNavigation from './MobileNavigation';
import { UserCircle } from 'lucide-react';
import UserProfileModal from '../UserProfile/UserProfileModal';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Logo from '@/assets/brandLogo.png';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isLoggedIn } = useAuth()

  const adminData = localStorage.getItem('admin');
  let admin = null;
  try {
    admin = adminData ? JSON.parse(adminData) : null;
  } catch (e) {
    admin = null;
  }

  return (
    <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 md:pb-0 font-poppins">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <a href="/" className='flex items-end gap-2 flex-row'>
                <img src={Logo} alt="" className='h-8 w-8 dark:invert mb-1' />
                <div className='pt-2 flex gap-2'>
                  <h1 className="text-2xl text-black dark:text-white">TutorMentor</h1>
                  <span className='text-sm'>Admin</span>
                </div>
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
                      <AvatarFallback className="bg-tutor-primary text-white text-xl">
                        {admin?.name ? admin.name.charAt(0) : "A"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                ) : (
                  <button className='flex items-center'>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Sign in </span>
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
    </ThemeProvider>
  );
};

export default MainLayout;
