import { useState, useEffect } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, FileText, ArrowUpDown, Loader2, Share2, Trash2, EllipsisVertical, Paperclip, Share } from "lucide-react";
import { toast } from "sonner"
import { classroomApi } from "@/utils/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import noClass from "@/assets/no-class.png"

interface SharedMaterial {
  _id: string;
  material: {
    _id: string;
    title: string;
    description?: string;
    pdfLinks: string[];
  };
  sharedBy: {
    _id: string;
    name: string;
    email: string;
  };
  sharedAt: string;
}

interface Classroom {
  _id: string;
  name: string;
  section: string;
}

const MaterialsLibrary = () => {
  const [materials, setMaterials] = useState<SharedMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('sharedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<SharedMaterial | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [isPosting, setIsPosting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      const response = await classroomApi.getLibraryMaterials({
        page: currentPage,
        limit: 9,
        sortBy,
        sortOrder
      });
      setMaterials(response.materials);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error("Failed to fetch materials");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClassrooms = async () => {
    try {
      const response = await classroomApi.getMyClassrooms();
      setClassrooms(response.created);
    } catch (error) {
      toast.error("Failed to fetch classrooms");
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchClassrooms();
  }, [currentPage, sortBy, sortOrder]);

  const handleSort = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handlePostToClassroom = async () => {
    if (!selectedMaterial || !selectedClassroom) return;

    setIsPosting(true);
    try {
      await classroomApi.postToClassroom(selectedMaterial.material._id, selectedClassroom);
      toast.success("Material posted to classroom successfully");
      setIsPostDialogOpen(false);
      setSelectedMaterial(null);
      setSelectedClassroom('');
    } catch (error) {
      toast.error("Failed to post material to classroom");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeleteFromLibrary = async () => {
    if (!selectedMaterial) return;

    setIsDeleting(true);
    try {
      await classroomApi.deleteFromLibrary(selectedMaterial._id);
      setMaterials(materials.filter(m => m._id !== selectedMaterial._id));
      toast.success("Material removed from library");
      setIsDeleteDialogOpen(false);
      setSelectedMaterial(null);
    } catch (error) {
      toast.error("Failed to remove material from library");
    } finally {
      setIsDeleting(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <Card key={index} className="h-full border overflow-hidden border-t-4 border-t-education-600">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-6 rounded-lg" />
            </div>
            <div className="p-6">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header title="Materials Library" />
      <main className="flex-1 container max-w-6xl mx-auto py-8 px-4 bg-background max-h-[calc(100vh-75px)] overflow-y-scroll no-scrollbar">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-foreground">Library</h2>

          <div className="flex items-center gap-4">
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={handleSort}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sharedAt-desc">Newest First</SelectItem>
                <SelectItem value="sharedAt-asc">Oldest First</SelectItem>
                <SelectItem value="material.title-asc">Title A-Z</SelectItem>
                <SelectItem value="material.title-desc">Title Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map((item) => (
                <Card key={item._id} className="h-full hover:shadow-md transition-shadow border overflow-hidden border-t-4 border-t-education-600">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-6 border-b">
                      <div className="flex flex-col text-sm gap-1">
                        <div className="flex gap-1">
                          <span className="text-muted-foreground">Posted by: </span>
                          <span className="font-medium uppercase">{item.sharedBy.name}</span>
                        </div>

                        <span className="text-xs capitalize font-semibold text-gray-500">
                          {new Date(item.sharedAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger><EllipsisVertical /></DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuLabel>{item.material.title}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="flex flex-row justify-between items-center"
                              onClick={() => {
                                setSelectedMaterial(item);
                                setIsPostDialogOpen(true);
                              }}
                            >
                              Post <Share className="h-4 w-4 text-education-600" />
                            </DropdownMenuItem>
                            {item.sharedBy._id === localStorage.getItem('teacherId') && (
                              <DropdownMenuItem
                                className="flex flex-row justify-between items-center text-red-600"
                                onClick={() => {
                                  setSelectedMaterial(item);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                Delete <Trash2 className="h-4 w-4 text-red-800" />
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-medium mb-2">{item.material.title}</h3>
                      {item.material.description && (
                        <p className="text-sm text-muted-foreground mb-3">{item.material.description}</p>
                      )}
                      {item.material.pdfLinks.length > 0 && (
                        <span className="text-sm text-education-600 flex items-center gap-1">
                          <Paperclip className="h-4 w-4" />
                          {item.material.pdfLinks.length} attachment(s)
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {materials.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center">
                <img src={noClass} alt="" className="h-80 w-80 dark:invert" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Material yet</h3>
                <p className="text-muted-foreground mb-4">Share your Material to Library to make it public</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </main>

      {/* Post to Classroom Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="p-6 border-b">
            <DialogTitle>Post to Classroom</DialogTitle>
          </DialogHeader>
          <div className="py-4 p-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select a classroom to post "{selectedMaterial?.material.title}"
              </p>
              <Select
                value={selectedClassroom}
                onValueChange={setSelectedClassroom}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a classroom" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((classroom) => (
                    <SelectItem key={classroom._id} value={classroom._id}>
                      {classroom.name} - {classroom.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="p-6 border-t">
            <Button variant="outline" onClick={() => setIsPostDialogOpen(false)} className="hidden md:block">
              Cancel
            </Button>
            <Button
              onClick={handlePostToClassroom}
              disabled={!selectedClassroom || isPosting}
            >
              {isPosting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post to Classroom'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="p-6 border-b">
            <DialogTitle>Delete from Library</DialogTitle>
          </DialogHeader>
          <div className="py-4 p-6">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to remove "{selectedMaterial?.material.title}" from the library? This action cannot be undone.
            </p>
          </div>
          <DialogFooter className="p-6 border-t">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="hidden md:block">
              Cancel
            </Button>
            <Button
              onClick={handleDeleteFromLibrary}
              variant="destructive"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete from Library'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialsLibrary;
