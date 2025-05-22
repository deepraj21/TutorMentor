
import { Home, FolderOpen, FileText, MessageSquareDotIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const MobileNavigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700 z-10">
      <div className="flex justify-around items-center h-16">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/') ? 'text-tutor-primary' : 'text-gray-500'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link 
          to="/drive" 
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/drive') ? 'text-tutor-primary' : 'text-gray-500'
          }`}
        >
          <FolderOpen className="h-5 w-5" />
          <span className="text-xs mt-1">Drive</span>
        </Link>
        
        <Link 
          to="/tests" 
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/tests') ? 'text-tutor-primary' : 'text-gray-500'
          }`}
        >
          <FileText className="h-5 w-5" />
          <span className="text-xs mt-1">Tests</span>
        </Link>
        <Link
          to="/chat"
          className={`flex flex-col items-center justify-center w-full h-full ${isActive('/chat') ? 'text-tutor-primary' : 'text-gray-500'
            }`}
        >
          <MessageSquareDotIcon className="h-5 w-5" />
          <span className="text-xs mt-1">Chat</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNavigation;
