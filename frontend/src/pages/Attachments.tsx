
import { useState } from "react";
import Header from "../components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Paperclip, X, File, Image } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Attachments = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
      
      toast({
        title: "Files uploaded",
        description: `${droppedFiles.length} file(s) have been uploaded.`,
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
      
      toast({
        title: "Files uploaded",
        description: `${selectedFiles.length} file(s) have been uploaded.`,
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    const fileType = file.type.split('/')[0];
    switch (fileType) {
      case 'image':
        return <Image className="h-6 w-6" />;
      default:
        return <File className="h-6 w-6" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header title="Attachments" />
      
      <main className="flex-1 container max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Your Attachments</h2>
          <p className="text-muted-foreground mt-1">Manage your uploaded files here</p>
        </div>
        
        <Card 
          className={`border-2 border-dashed p-8 mb-8 text-center ${
            isDragging ? 'border-education-500 bg-education-50 dark:bg-education-900/20' : 'border-border'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="pt-0 flex flex-col items-center">
            <Paperclip className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Drag and drop files here</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Support for PDF, images, and other document formats
            </p>
            <div>
              <label htmlFor="file-upload">
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                />
                <Button variant="outline" className="mx-auto" asChild>
                  <span>Browse Files</span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
        
        {files.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Uploaded Files ({files.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file, index) => (
                <Card key={index} className="flex items-center p-3">
                  <div className="p-2 bg-muted rounded-md mr-3">
                    {getFileIcon(file)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeFile(index)}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Attachments;
