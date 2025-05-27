import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, X } from 'lucide-react';

interface ImageUploadProps {
    currentImage?: string;
    onImageUpload: (url: string) => void;
}

export function ImageUpload({ currentImage, onImageUpload }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            onImageUpload(data.url);
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative">
            {currentImage ? (
                <div className="relative w-24 h-24">
                    <img
                        src={currentImage}
                        alt="Uploaded"
                        className="w-full h-full object-cover rounded"
                    />
                    <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2"
                        onClick={() => onImageUpload('')}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="w-24 h-24 border-2 border-dashed rounded flex items-center justify-center">
                    <label className="cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                        />
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                    </label>
                </div>
            )}
        </div>
    );
} 