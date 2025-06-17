import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../contexts/AuthContext";
import { ArrowLeft, Plus, FileText, BookOpen, Paperclip, X, File, Image, Link as LinkIcon, Loader2, Upload, EllipsisVertical, Archive, Trash2, PencilLine, Share2 } from "lucide-react";
import { toast } from "sonner"
import { classroomApi } from "@/utils/api";
import noMaterial from "@/assets/no-material.png"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import pdfImg from "@/assets/pdfImg.png"

interface UserData {
  id: string;
  uid: string;
  email: string;
  name: string;
  displayName?: string;
  photoURL?: string;
  role: "student" | "teacher";
}

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

interface Material {
  _id: string;
  title: string;
  description?: string;
  pdfLinks: string[];
  postedBy: {
    _id: string;
    name: string;
    email: string;
  };
  classroom: {
    _id: string;
    name: string;
    section: string;
    createdAt: string;
    createdBy: {
      _id: string;
      name: string;
      email: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface ClassroomDetails {
  _id: string;
  name: string;
  section: string;
  classCode: string;
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  enrolledTeachers: {
    _id: string;
    name: string;
    email: string;
  }[];
  enrolledStudents: {
    _id: string;
    name: string;
    email: string;
  }[];
}

const MaterialsPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeTab, setActiveTab] = useState<"materials" | "info">("materials");
  const [classroomDetails, setClassroomDetails] = useState<ClassroomDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
    pdfLinks: [] as string[]
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInputs, setUrlInputs] = useState<string[]>(['']);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemovingTeacher, setIsRemovingTeacher] = useState(false);
  const [isRemovingStudent, setIsRemovingStudent] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<{ _id: string; name: string } | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<{ _id: string; name: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRemoveTeacherDialogOpen, setIsRemoveTeacherDialogOpen] = useState(false);
  const [isRemoveStudentDialogOpen, setIsRemoveStudentDialogOpen] = useState(false);

  useEffect(() => {
    if (classId) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          await fetchMaterials();
          await fetchClassroomDetails();
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [classId]);

  const fetchMaterials = async () => {
    try {
      const data = await classroomApi.getMaterials(classId!);
      setMaterials(data);
    } catch (error) {
      toast.error("Failed to fetch materials");
    }
  };

  const fetchClassroomDetails = async () => {
    try {
      const data = await classroomApi.getClassroomDetails(classId!);
      setClassroomDetails(data);
    } catch (error) {
      toast.error("Failed to fetch classroom details");
    }
  };

  const handleCreateMaterial = async () => {
    if (!newMaterial.title.trim()) {
      toast.error("Please enter a title for the material");
      return;
    }

    setIsSubmitting(true);
    try {
      // Combine uploaded file URLs and manually entered URLs
      const allLinks = [...newMaterial.pdfLinks, ...urlInputs.filter(url => url.trim() !== '')];

      const material = await classroomApi.createMaterial({
        title: newMaterial.title,
        description: newMaterial.description,
        pdfLinks: allLinks,
        classroomId: classId!
      });

      setMaterials([material, ...materials]);
      setNewMaterial({ title: "", description: "", pdfLinks: [] });
      setFiles([]);
      setUrlInputs(['']);
      setIsDialogOpen(false);

      toast.success("Material created successfully");
    } catch (error) {
      toast.error("Failed to create material");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      if (data.secure_url) {
        setNewMaterial(prev => ({
          ...prev,
          pdfLinks: [...prev.pdfLinks, data.secure_url]
        }));
        toast.success("File uploaded successfully");
      }
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prevFiles => [...prevFiles, ...droppedFiles]);

      // Upload each file
      for (const file of droppedFiles) {
        await handleFileUpload(file);
      }
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...selectedFiles]);

      // Upload each file
      for (const file of selectedFiles) {
        await handleFileUpload(file);
      }
    }
  };

  const addUrlInput = () => {
    setUrlInputs([...urlInputs, '']);
  };

  const removeUrlInput = (index: number) => {
    setUrlInputs(urlInputs.filter((_, i) => i !== index));
  };

  const updateUrlInput = (index: number, value: string) => {
    const newUrls = [...urlInputs];
    newUrls[index] = value;
    setUrlInputs(newUrls);
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setNewMaterial(prev => ({
      ...prev,
      pdfLinks: prev.pdfLinks.filter((_, i) => i !== index)
    }));
  };

  const handleShareToLibrary = async () => {
    if (!selectedMaterial) return;

    setIsSharing(true);
    try {
      await classroomApi.shareToLibrary(selectedMaterial._id);
      toast.success("Material shared to library successfully");
      setIsShareDialogOpen(false);
    } catch (error) {
      toast.error("Failed to share material to library");
    } finally {
      setIsSharing(false);
    }
  };

  const handleUpdateMaterial = async () => {
    if (!selectedMaterial) return;
    setIsUpdating(true);
    try {
      // Upload any new files
      const uploadedLinks = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('upload_preset', uploadPreset);

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
            {
              method: 'POST',
              body: formData,
            }
          );

          const data = await response.json();
          return data.secure_url;
        })
      );

      // Combine uploaded file URLs and manually entered URLs
      const allLinks = [...urlInputs.filter(url => url.trim() !== ''), ...uploadedLinks];

      const updatedMaterial = await classroomApi.updateMaterial(selectedMaterial._id, {
        title: newMaterial.title,
        description: newMaterial.description || '',
        pdfLinks: allLinks
      });

      setMaterials(materials.map(m => m._id === selectedMaterial._id ? updatedMaterial : m));
      setIsUpdateDialogOpen(false);
      setSelectedMaterial(null);
      setNewMaterial({ title: "", description: "", pdfLinks: [] });
      setFiles([]);
      setUrlInputs(['']);
      toast.success("Material updated successfully");
    } catch (error) {
      console.error('Update material error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to update material");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveTeacher = async () => {
    if (!classId || !selectedTeacher) return;
    try {
      await classroomApi.removeTeacher(classId, selectedTeacher._id);
      setClassroomDetails(prev => {
        if (!prev) return null;
        return {
          ...prev,
          enrolledTeachers: prev.enrolledTeachers.filter(t => t._id !== selectedTeacher._id)
        };
      });
      toast.success("Teacher removed successfully");
      setIsRemoveTeacherDialogOpen(false);
      setSelectedTeacher(null);
    } catch (error) {
      toast.error("Failed to remove teacher");
    } finally {
      setIsRemovingTeacher(false);
    }
  };

  const handleRemoveStudent = async () => {
    if (!classId || !selectedStudent) return;
    try {
      await classroomApi.removeStudent(classId, selectedStudent._id);
      setClassroomDetails(prev => {
        if (!prev) return null;
        return {
          ...prev,
          enrolledStudents: prev.enrolledStudents.filter(s => s._id !== selectedStudent._id)
        };
      });
      toast.success("Student removed successfully");
      setIsRemoveStudentDialogOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      toast.error("Failed to remove student");
    } finally {
      setIsRemovingStudent(false);
    }
  };

  const handleDeleteMaterial = async () => {
    if (!selectedMaterial) return;
    try {
      await classroomApi.deleteMaterial(selectedMaterial._id);
      setMaterials(materials.filter(m => m._id !== selectedMaterial._id));
      toast.success("Material deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedMaterial(null);
    } catch (error) {
      toast.error("Failed to delete material");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header title="Class Materials" />
        <main className="flex-1 container max-w-6xl mx-auto py-8 px-4 bg-background max-h-[calc(100vh-100px)] overflow-y-scroll no-scrollbar">
          <div className="">
            <Link to={user?.role === "teacher" ? "/teacher" : "/student"} className="inline-flex items-center text-sm text-education-600 mb-4 hover:text-education-800 transition-colors">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to dashboard
            </Link>
            <div className="flex justify-between items-start">
              <div>
                <div className="h-8 w-64 bg-muted rounded mb-2" />
                <div className="h-4 w-48 bg-muted rounded" />
              </div>
            </div>
            <div className="border-b">
              <div className="flex gap-4">
                <span className="p-2 text-education-600 border-b-4 border-education-600">Class Materials</span>
                <span className="p-2">Class Info</span>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <div className="flex flex-col gap-8">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="h-full border overflow-hidden border-t-4 border-t-education-600">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-6 border-b">
                      <div className="flex flex-col gap-2">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="h-3 w-24 bg-muted rounded" />
                      </div>
                      <div className="h-6 w-6 bg-muted rounded" />
                    </div>
                    <div className="p-6">
                      <div className="h-6 w-48 bg-muted rounded mb-4" />
                      <div className="h-4 w-full bg-muted rounded mb-4" />
                      <div className="h-4 w-32 bg-muted rounded mb-4" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        {[...Array(2)].map((_, fileIndex) => (
                          <div key={fileIndex} className="border rounded-md flex items-center overflow-hidden">
                            <div className="w-[20%] flex items-center justify-center p-4 bg-muted">
                              <div className="h-8 w-8 bg-muted rounded" />
                            </div>
                            <div className="flex-1 p-3">
                              <div className="h-4 w-32 bg-muted rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header title="Class Materials" />
      <main className="flex-1 container max-w-6xl mx-auto py-8 px-4 bg-background max-h-[calc(100vh-75px)] overflow-y-scroll no-scrollbar">
        <div>
          <Link to={user?.role === "teacher" ? "/teacher" : "/student"} className="inline-flex items-center text-sm text-education-600 mb-4 hover:text-education-800 transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to dashboard
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {classroomDetails?.name || 'Class'} - {classroomDetails?.section || 'Materials'}
              </h2>
              <div className="flex md:flex-row flex-col gap-2 mt-1 text-sm text-muted-foreground">
                {classroomDetails?.createdBy?.name && (
                  <>
                    <span>Created by {classroomDetails.createdBy.name}</span>
                    <span className="hidden md:block">•</span>
                    <span>Created on {classroomDetails.createdAt ? new Date(classroomDetails.createdAt).toLocaleDateString() : ''}</span>
                  </>
                )}
              </div>
            </div>

            {user?.role === "teacher" && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-education-600 hover:bg-education-700">
                    <Plus className="h-4 w-4" />
                    Add Material
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader className="p-6 border-b">
                    <DialogTitle>Add New Material</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 p-6 max-h-[18rem] overflow-y-auto">
                    <div className="grid gap-2">
                      <Label htmlFor="materialTitle">Material Title</Label>
                      <Input
                        id="materialTitle"
                        value={newMaterial.title}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Introduction to Variables"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="materialDescription">Description (Optional)</Label>
                      <Input
                        id="materialDescription"
                        value={newMaterial.description}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Add a description..."
                      />
                    </div>

                    {/* URL Inputs Section */}
                    <div className="grid gap-2">
                      <Label>Material Links</Label>
                      {urlInputs.map((url, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={url}
                            onChange={(e) => updateUrlInput(index, e.target.value)}
                            placeholder="Paste material URL here"
                          />
                          {urlInputs.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeUrlInput(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addUrlInput}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Link
                      </Button>
                    </div>

                    {/* File Upload Section */}
                    <div className="grid gap-2">
                      <Label>Upload Files</Label>
                      <Card
                        className={`border-2 border-dashed p-4 mb-4 text-center ${isDragging ? 'border-education-500 bg-education-50 dark:bg-education-900/20' : 'border-border'
                          }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                      >
                        <CardContent className="pt-4 flex flex-col items-center">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Drag and drop files here or click to browse
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
                              <Button variant="outline" size="sm" className="mx-auto" asChild>
                                <span>Browse Files</span>
                              </Button>
                            </label>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Uploaded Files List */}
                      {files.length > 0 && (
                        <div className="space-y-2">
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                              <div className="flex items-center gap-2">
                                <File className="h-6 w-6" />
                                <span className="text-sm truncate">{file.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter className="p-6 border-t">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="hidden md:block" disabled={isSubmitting || isUploading}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateMaterial} disabled={isSubmitting || isUploading}>
                      {isSubmitting || isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {isUploading ? 'Uploading...' : 'Creating...'}
                        </>
                      ) : (
                        'Create Material'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="border-b">
            <div className="flex gap-4">
              <button
                className={`p-2 border-b-4 ${activeTab === 'materials' ? 'border-education-600 text-education-600' : 'border-transparent text-muted-foreground'} transition-colors`}
                onClick={() => setActiveTab('materials')}
              >
                Class Materials
              </button>
              <button
                className={`p-2 border-b-4 ${activeTab === 'info' ? 'border-education-600 text-education-600' : 'border-transparent text-muted-foreground'} transition-colors`}
                onClick={() => setActiveTab('info')}
              >
                Class Info
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 max-h-[calc(100vh-100px)] overflow-y-scroll no-scrollbar">
          {activeTab === 'materials' && (
            <div className="flex flex-col gap-8">
              {materials.map((material) => (
                <Card key={material._id} className="h-full hover:shadow-md transition-shadow border overflow-hidden border-t-4 border-t-education-600">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-6 border-b">
                      <div className="flex flex-col text-sm gap-1">
                        <div className="flex gap-1">
                          <span className="text-muted-foreground">Posted by: </span>
                          <span className="font-medium uppercase">{material.postedBy.name}</span>
                        </div>

                        <span className="text-xs capitalize font-semibold text-gray-500">
                          {new Date(material.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <>
                        {user?.role === "teacher" && (
                          <div className="flex items-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger><EllipsisVertical /></DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuLabel>{material.title}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="flex flex-row justify-between items-center"
                                  onClick={() => {
                                    setSelectedMaterial(material);
                                    setIsShareDialogOpen(true);
                                  }}
                                >
                                  Share <Share2 className="h-4 w-4 text-gray-600" />
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex flex-row justify-between items-center"
                                  onClick={() => {
                                    setSelectedMaterial(material);
                                    setNewMaterial({
                                      title: material.title,
                                      description: material.description || "",
                                      pdfLinks: material.pdfLinks
                                    });
                                    setUrlInputs(material.pdfLinks.length > 0 ? [...material.pdfLinks] : ['']);
                                    setFiles([]);
                                    setIsUpdateDialogOpen(true);
                                  }}
                                >
                                  Update <PencilLine className="h-4 w-4 text-education-600" />
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex flex-row justify-between items-center text-red-600"
                                  onClick={() => {
                                    setSelectedMaterial(material);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  Delete <Trash2 className="h-4 w-4 text-red-800" />
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </>
                    </div >
                    <div className="p-6">
                      <h3 className="text-xl font-medium mb-2">{material.title}</h3>
                      {material.description && (
                        <p className="text-sm text-muted-foreground mb-3">{material.description}</p>
                      )}
                      {material.pdfLinks.length > 0 && (
                        <span className="text-sm text-education-600 flex items-center gap-1">
                          <Paperclip className="h-4 w-4" />
                          {material.pdfLinks.length} attachment(s)
                        </span>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        {material.pdfLinks.map((link, index) => {
                          // Extract filename from URL
                          const filename = link.split('/').pop() || 'File';
                          return (
                            <a
                              key={index}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="border rounded-md flex items-center overflow-hidden hover:bg-muted transition-colors"
                            >
                              {/* Preview Placeholder */}
                              <div className="w-[20%] flex items-center justify-center bg-gray-100 dark:bg-gray-700 border-r h-full">
                                <img
                                  src={link}
                                  alt="Material Preview"
                                  className="h-20 w-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = pdfImg;
                                    target.className = "h-20 w-full object-cover";
                                  }}
                                />
                              </div>
                              {/* Filename */}
                              <span className="flex-1 p-6 text-sm truncate">
                                {filename}
                              </span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {materials.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center text-center">
                  <img src={noMaterial} alt="" className="h-80 w-80 dark:invert" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Materials Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {user?.role === "teacher"
                      ? "Add your first material to share with your students"
                      : "No materials have been shared in this classroom yet"}
                  </p>
                  {user?.role === "teacher" && (
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="bg-education-600 hover:bg-education-700"
                    >
                      <Plus className="h-4 w-4" />
                      Add Material
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'info' && classroomDetails && (
            <div className="border rounded-md">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold mb-4">Classroom Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Class Name:</p>
                    <p className="font-medium">{classroomDetails.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Section:</p>
                    <p className="font-medium">{classroomDetails.section}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Class Code:</p>
                    {user?.role === "teacher" ? (
                      <p className="font-medium">{classroomDetails.classCode}</p>
                    ) : '•'.repeat(6)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created By:</p>
                    <p className="font-medium">{classroomDetails.createdBy.name}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Created On:</p>
                    <p className="font-medium">{new Date(classroomDetails.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 p-6 border-b">
                <h4 className="text-lg font-semibold mb-2">Teachers</h4>
                {classroomDetails.enrolledTeachers.length > 0 ? (
                  <ul className="space-y-2">
                    {classroomDetails.enrolledTeachers.map(teacher => (
                      <li key={teacher._id} className="flex justify-between items-center">
                        <span>{teacher.name} ({teacher.email})</span>
                        {user && classroomDetails?.createdBy._id === user.id && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedTeacher(teacher);
                                setIsRemoveTeacherDialogOpen(true);
                              }}
                              disabled={isRemovingTeacher}
                            >
                              {isRemovingTeacher && selectedTeacher?._id === teacher._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Remove"
                              )}
                            </Button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No additional teachers enrolled.</p>
                )}
              </div>
              <div className="md:col-span-2 p-6">
                <h4 className="text-lg font-semibold mb-2">Students</h4>
                {classroomDetails.enrolledStudents.length > 0 ? (
                  <ul className="space-y-2">
                    {classroomDetails.enrolledStudents.map(student => (
                      <li key={student._id} className="flex justify-between items-center">
                        <span>{student.name} ({student.email})</span>
                        {user && classroomDetails?.createdBy._id === user.id && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student);
                                setIsRemoveStudentDialogOpen(true);
                              }}
                              disabled={isRemovingStudent}
                            >
                              {isRemovingStudent && selectedStudent?._id === student._id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Remove"
                              )}
                            </Button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No students enrolled yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="p-6 border-b">
            <DialogTitle>Share to Library</DialogTitle>
          </DialogHeader>
          <div className="py-4 p-6">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to share "{selectedMaterial?.title}" to the public library?
            </p>
          </div>
          <DialogFooter className="p-6 border-t">
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)} className="hidden md:block">
              Cancel
            </Button>
            <Button
              onClick={handleShareToLibrary}
              disabled={isSharing}
            >
              {isSharing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sharing...
                </>
              ) : (
                'Share to Library'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Material Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="p-6 border-b">
            <DialogTitle>Update Material</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 p-6 max-h-[18rem] overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="title">Material Title</Label>
              <Input
                id="title"
                value={newMaterial.title}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Introduction to Variables"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={newMaterial.description}
                onChange={(e) => setNewMaterial(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add a description..."
              />
            </div>

            {/* URL Inputs Section */}
            <div className="grid gap-2">
              <Label>Material Links</Label>
              {urlInputs.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...urlInputs];
                      newUrls[index] = e.target.value;
                      setUrlInputs(newUrls);
                      setNewMaterial(prev => ({ ...prev, pdfLinks: newUrls.filter(u => u.trim()) }));
                    }}
                    placeholder="Paste material URL here"
                  />
                  {urlInputs.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newUrls = urlInputs.filter((_, i) => i !== index);
                        setUrlInputs(newUrls);
                        setNewMaterial(prev => ({ ...prev, pdfLinks: newUrls.filter(u => u.trim()) }));
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUrlInputs([...urlInputs, ''])}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another Link
              </Button>
            </div>

            {/* File Upload Section */}
            <div className="grid gap-2">
              <Label>Upload Files</Label>
              <Card
                className={`border-2 border-dashed p-4 mb-4 text-center ${isDragging ? 'border-education-500 bg-education-50 dark:bg-education-900/20' : 'border-border'}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <CardContent className="pt-4 flex flex-col items-center">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop files here or click to browse
                  </p>
                  <div>
                    <label htmlFor="file-upload-update">
                      <input
                        id="file-upload-update"
                        type="file"
                        multiple
                        onChange={handleFileInput}
                        className="hidden"
                      />
                      <Button variant="outline" size="sm" className="mx-auto" asChild>
                        <span>Browse Files</span>
                      </Button>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Uploaded Files List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div className="flex items-center gap-2">
                        <File className="h-6 w-6" />
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="p-6 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsUpdateDialogOpen(false);
                setSelectedMaterial(null);
                setNewMaterial({ title: "", description: "", pdfLinks: [] });
                setFiles([]);
                setUrlInputs(['']);
              }}
              className="hidden md:block"
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateMaterial}
              disabled={isUpdating || !newMaterial.title.trim()}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Material'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="p-6 border-b">
            <DialogTitle>Delete Material</DialogTitle>
          </DialogHeader>
          <div className="py-4 p-6">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete "{selectedMaterial?.title}"? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="p-6 border-t">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="hidden md:block">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteMaterial}
              variant="destructive"
            >
              Delete Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRemoveTeacherDialogOpen} onOpenChange={setIsRemoveTeacherDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="p-6 border-b">
            <DialogTitle>Remove Teacher</DialogTitle>
          </DialogHeader>
          <div className="py-4 p-6">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to remove {selectedTeacher?.name} from this classroom? They will no longer have access to this classroom.
            </p>
          </div>
          <DialogFooter className="p-6 border-t">
            <Button variant="outline" onClick={() => setIsRemoveTeacherDialogOpen(false)} className="hidden md:block">
              Cancel
            </Button>
            <Button
              onClick={handleRemoveTeacher}
              variant="destructive"
              disabled={isRemovingTeacher}
            >
              {isRemovingTeacher ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove Teacher'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isRemoveStudentDialogOpen} onOpenChange={setIsRemoveStudentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="p-6 border-b">
            <DialogTitle>Remove Student</DialogTitle>
          </DialogHeader>
          <div className="py-4 p-6">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to remove {selectedStudent?.name} from this classroom? They will no longer have access to this classroom.
            </p>
          </div>
          <DialogFooter className="p-6 border-t">
            <Button variant="outline" onClick={() => setIsRemoveStudentDialogOpen(false)} className="hidden md:block">
              Cancel
            </Button>
            <Button
              onClick={handleRemoveStudent}
              variant="destructive"
              disabled={isRemovingStudent}
            >
              {isRemovingStudent ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove Student'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialsPage;
