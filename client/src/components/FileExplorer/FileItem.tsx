
import { FileItem as FileItemType } from '@/types';
import { 
  File, 
  FileText, 
  FileImage, 
  FileVideo,
  FileAudio,
  Download,
  Trash2,
  Info,
  Folder
} from 'lucide-react';
import { useState } from 'react';
import { useFileSystem } from '@/contexts/FileSystemContext';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { fileTypeIcons, getFormattedSize, getFormattedDate } from '@/utils/fileUtils';
import { useTheme } from '@/contexts/ThemeContext';

interface FileItemProps {
  item: FileItemType;
  onItemClick: (item: FileItemType) => void;
}

const FileItem = ({ item, onItemClick }: FileItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const { deleteItem } = useFileSystem();
  const { language } = useTheme();

  const translations = {
    english: {
      delete: "Delete",
      download: "Download",
      properties: "Properties",
      fileProperties: "File Properties",
      fileName: "File Name",
      fileType: "File Type",
      fileSize: "File Size",
      location: "Location",
      dateAdded: "Date Added",
      description: "Description",
      class: "Class",
      owner: "Owner",
      close: "Close"
    },
    bengali: {
      delete: "মুছুন",
      download: "ডাউনলোড",
      properties: "বৈশিষ্ট্য",
      fileProperties: "ফাইল বৈশিষ্ট্য",
      fileName: "ফাইলের নাম",
      fileType: "ফাইলের ধরন",
      fileSize: "ফাইলের আকার",
      location: "অবস্থান",
      dateAdded: "যোগ করার তারিখ",
      description: "বিবরণ",
      class: "শ্রেণী",
      owner: "মালিক",
      close: "বন্ধ করুন"
    }
  };

  const t = translations[language];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteItem(item.id);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type !== 'file' || !item.content) return;
    
    const link = document.createElement('a');
    link.href = item.content as string;
    link.download = item.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProperties = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPropertiesOpen(true);
  };

  const renderIcon = () => {
    if (item.type === 'folder') {
      return <Folder className="h-10 w-10 text-tutor-primary dark:text-tutor-accent" />;
    } else {
      // Select icon based on file extension
      let IconComponent;
      
      switch(item.extension?.toLowerCase()) {
        case 'pdf':
          IconComponent = FileText;
          break;
        case 'doc':
        case 'docx':
          IconComponent = FileText;
          break;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
          IconComponent = FileImage;
          break;
        case 'mp4':
        case 'avi':
        case 'mov':
          IconComponent = FileVideo;
          break;
        case 'mp3':
        case 'wav':
          IconComponent = FileAudio;
          break;
        default:
          IconComponent = File;
      }
      
      return <IconComponent className="h-10 w-10 text-tutor-secondary dark:text-tutor-accent" />;
    }
  };

  const getLocationPath = () => {
    if (item.path.length === 0) return "Home";
    return item.path.join(" / ");
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className="flex flex-col items-center p-3 rounded-lg transition-all cursor-pointer hover:bg-tutor-accent/50 dark:hover:bg-gray-700"
            onClick={() => onItemClick(item)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="relative">
              {renderIcon()}
            </div>
            <span className="mt-2 text-sm font-medium text-center w-full truncate max-w-[120px] dark:text-gray-200">
              {item.name}
            </span>
            {item.type === 'file' && item.size && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{getFormattedSize(item.size)}</span>
            )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
          <ContextMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/30">
            <Trash2 className="h-4 w-4 mr-2" />
            {t.delete}
          </ContextMenuItem>
          {item.type === 'file' && (
            <ContextMenuItem onClick={handleDownload} className="text-blue-600 dark:text-blue-400 focus:bg-blue-50 dark:focus:bg-blue-900/30">
              <Download className="h-4 w-4 mr-2" />
              {t.download}
            </ContextMenuItem>
          )}
          <ContextMenuItem onClick={handleProperties} className="focus:bg-gray-100 dark:focus:bg-gray-700">
            <Info className="h-4 w-4 mr-2" />
            {t.properties}
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <Sheet open={propertiesOpen} onOpenChange={setPropertiesOpen}>
        <SheetContent side="right" className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
          <SheetHeader>
            <SheetTitle className="dark:text-white">{t.fileProperties}</SheetTitle>
            <SheetDescription className="dark:text-gray-400">
              {item.type === 'folder' ? 'Folder details' : 'File details'}
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-6">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                {renderIcon()}
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.fileName}</h4>
                <p className="mt-1 text-base">{item.name}</p>
              </div>
              
              {item.type === 'file' && (
                <>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.fileType}</h4>
                    <p className="mt-1 text-base">{item.extension?.toUpperCase() || 'Unknown'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.fileSize}</h4>
                    <p className="mt-1 text-base">{getFormattedSize(item.size || 0)}</p>
                  </div>
                </>
              )}
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.location}</h4>
                <p className="mt-1 text-base">{getLocationPath()}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.dateAdded}</h4>
                <p className="mt-1 text-base">{getFormattedDate(item.lastModified)}</p>
              </div>
              
              {item.class && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.class}</h4>
                  <p className="mt-1 text-base">{item.class}</p>
                </div>
              )}
              
              {item.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.description}</h4>
                  <p className="mt-1 text-base">{item.description}</p>
                </div>
              )}
              
              {item.owner && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t.owner}</h4>
                  <p className="mt-1 text-base">{item.owner}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <Button 
                variant="outline" 
                className="w-full dark:border-gray-600 dark:text-white"
                onClick={() => setPropertiesOpen(false)}
              >
                {t.close}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default FileItem;
