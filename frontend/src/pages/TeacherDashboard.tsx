import { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { ArrowRight, Grid2X2Icon, List, Plus, Eye, EyeOff, EllipsisVertical, Copy, Archive, Trash2, Book, RefreshCw, Notebook, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { classroomApi } from "@/utils/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton";
import noClass from "@/assets/no-class.png"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface Classroom {
  _id: string;
  name: string;
  section: string;
  createdBy: string;
  createdAt: string;
  classCode: string;
  teacher: {
    name: string;
  };
}

const TeacherDashboard = () => {
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [enrolledClasses, setEnrolledClasses] = useState<Classroom[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [newClassSection, setNewClassSection] = useState("");
  const [classCode, setClassCode] = useState<string[]>(Array(6).fill(""));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [visibleClassCodes, setVisibleClassCodes] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Classroom | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const teacherId = localStorage.getItem('teacherId');
    if (!teacherId) {
      toast.error('Please login to access your classrooms');
      return;
    }
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const data = await classroomApi.getMyClassrooms();
      setClasses(data.created);
      setEnrolledClasses(data.enrolled);
    } catch (error) {
      toast.error('Failed to fetch classrooms', {
        description: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim() || !newClassSection.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsCreating(true);
    try {
      const response = await classroomApi.createClassroom({
        name: newClassName,
        section: newClassSection
      });

      setClasses([response.classroom, ...classes]);
      setNewClassName("");
      setNewClassSection("");
      setIsDialogOpen(false);

      toast.success(`${newClassName} has been created successfully.`);
    } catch (error) {
      toast.error("Failed to create classroom", {
        description: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinClass = async () => {
    const code = classCode.join("");
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit class code");
      return;
    }

    setIsJoining(true);
    try {
      const response = await classroomApi.joinClassroom(code);
      setEnrolledClasses([response.classroom, ...enrolledClasses]);
      setClassCode(Array(6).fill(""));
      setIsJoinDialogOpen(false);
      toast.success("Successfully joined the class");
    } catch (error) {
      toast.error("Failed to join class", {
        description: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveClass = async (classId: string, className: string) => {
    setIsLeaving(true);
    try {
      await classroomApi.leaveClassroom(classId);
      setEnrolledClasses(enrolledClasses.filter(cls => cls._id !== classId));
      toast.success(`Successfully left ${className}`);
      setLeaveDialogOpen(false);
    } catch (error) {
      toast.error("Failed to leave class", {
        description: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setIsLeaving(false);
    }
  };

  const toggleClassCodeVisibility = (classId: string) => {
    setVisibleClassCodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(classId)) {
        newSet.delete(classId);
      } else {
        newSet.add(classId);
      }
      return newSet;
    });
  };

  const handleRefreshClassCode = async (classId: string, className: string) => {
    setIsResetting(true);
    try {
      const response = await classroomApi.refreshClassCode(classId);
      setClasses(classes.map(cls => 
        cls._id === classId ? response.classroom : cls
      ));
      toast.success(`Class code for ${className} has been refreshed`);
      setResetDialogOpen(false);
    } catch (error) {
      toast.error("Failed to refresh class code", {
        description: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setIsResetting(false);
    }
  };

  const renderClassCode = (cls: Classroom) => {
    const isVisible = visibleClassCodes.has(cls._id);
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono">
          {isVisible ? cls.classCode : '•'.repeat(6)}
        </span>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleClassCodeVisibility(cls._id);
          }}
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        <button
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await navigator.clipboard.writeText(cls.classCode);
            toast.success("Class code copied to clipboard!");
          }}
        >
          <Copy className="h-4 w-4" />
        </button>
        <button
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            setSelectedClass(cls);
            setResetDialogOpen(true);
          }}
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        <button>
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    );
  };

  const handleDeleteClass = async (classId: string, className: string) => {
    setIsDeleting(true);
    try {
      await classroomApi.deleteClassroom(classId);
      setClasses(classes.filter(cls => cls._id !== classId));
      toast.success(`${className} has been deleted successfully`);
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete classroom", {
        description: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col bg-background">
      <Header title="Teacher Dashboard" />
      <main className="flex-1 container max-w-6xl mx-auto py-8 px-4 bg-background max-h-[calc(100vh-100px)] overflow-y-scroll no-scrollbar">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl text-foreground flex items-center gap-2 font-semibold">Classes</h2>

          <div className="flex flex-row items-center gap-4">
            <Tabs defaultValue="grid" onValueChange={(value) => setViewMode(value as "grid" | "list")} className="hidden md:flex">
              <TabsList className="rounded-lg overflow-hidden border">
                <TabsTrigger value="grid" className="rounded-lg"><Grid2X2Icon /></TabsTrigger>
                <TabsTrigger value="list" className="rounded-lg"><List /></TabsTrigger>
              </TabsList>
            </Tabs>

            <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-education-600 hover:bg-education-700">
                  <Plus className="h-4 w-4" />
                  Join
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="p-6 border-b">
                  <DialogTitle>Join a Class woth Classcode</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 p-6">
                  <div className="grid gap-2">
                    <InputOTP
                      maxLength={6}
                      value={classCode.join("")}
                      onChange={(value) => setClassCode(value.split(""))}
                      containerClassName="flex gap-2 justify-center"
                    >
                      <InputOTPGroup>
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot key={index} index={index} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                <DialogFooter className="p-6 border-t">
                  <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)} className="hidden md:block" disabled={isJoining}>Cancel</Button>
                  <Button onClick={handleJoinClass} disabled={isJoining}>
                    {isJoining ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      'Join Class'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-education-600 hover:bg-education-700">
                  <Plus className="h-4 w-4" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="p-6 border-b">
                  <DialogTitle>Create New Class</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 p-6">
                  <div className="grid gap-2">
                    <Label htmlFor="className">Class Name</Label>
                    <Input
                      id="className"
                      value={newClassName}
                      onChange={e => setNewClassName(e.target.value)}
                      placeholder="e.g., Mathematics 101"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="classSection">Section</Label>
                    <Input
                      id="classSection"
                      value={newClassSection}
                      onChange={e => setNewClassSection(e.target.value)}
                      placeholder="e.g., A"
                    />
                  </div>
                </div>
                <DialogFooter className="p-6 border-t">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="hidden md:block" disabled={isCreating}>Cancel</Button>
                  <Button onClick={handleCreateClass} disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Classroom'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className={viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
          }>
            {[...Array(6)].map((_, index) => (
              <Card key={index} className={`hover:shadow-md transition-shadow border-t-4 border-t-education-600 overflow-hidden ${viewMode === "list" ? "w-full" : "h-full"}`}>
                <CardContent className={`${viewMode === "list" ? "py-4" : "pt-6"}`}>
                  {viewMode === "list" ? (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <Skeleton className="h-6 w-48 mb-2" />
                            <div className="flex items-center gap-2 mt-1">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-4 w-4" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row gap-4">
                        <div className="flex flex-col justify-between items-end">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-6 w-6" />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Created Classes */}
            {classes.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl mb-4">Created Classrooms</h3>
                <div className={viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "flex flex-col gap-4"
                }>
                  {classes.map(cls => (
                    <Card key={cls._id} className={`hover:shadow-md transition-shadow border-t-4 border-t-education-600 overflow-hidden ${viewMode === "list" ? "w-full" : "h-full"}`}>
                      <CardContent className={`${viewMode === "list" ? "py-4" : "pt-6"}`}>
                        {viewMode === "list" ? (
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4">
                                <div>
                                  <h3 className="text-xl font-medium text-card-foreground">{cls.name}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-muted-foreground">Section: {cls.section}</span>
                                    <span className="text-sm text-muted-foreground">•</span>
                                    <span className="text-sm text-muted-foreground flex items-center gap-1">Classcode: {renderClassCode(cls)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-row gap-4">
                              <div className="flex flex-col justify-between items-end">
                                <span className="text-sm text-muted-foreground">
                                  Created: {new Date(cls.createdAt).toLocaleDateString()}
                                </span>
                                <Link to={`/materials/${cls._id}`}>
                                  <span className="text-xs text-education-600 font-medium flex items-center gap-1">
                                    Manage class <ArrowRight className="h-4 w-4" />
                                  </span>
                                </Link>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger><EllipsisVertical /></DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuLabel>{cls.name}</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="flex flex-row justify-between items-center">Archive <Archive className="h-4 w-4 text-gray-700" /></DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="flex flex-row justify-between items-center text-red-600"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setSelectedClass(cls);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    Delete <Trash2 className="h-4 w-4 text-red-800" />
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <h3 className="text-xl font-medium text-card-foreground">{cls.name}</h3>
                                <DropdownMenu>
                                  <DropdownMenuTrigger><EllipsisVertical /></DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuLabel>{cls.name}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="flex flex-row justify-between items-center">Archive <Archive className="h-4 w-4 text-gray-700" /></DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="flex flex-row justify-between items-center text-red-600"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedClass(cls);
                                        setDeleteDialogOpen(true);
                                      }}
                                    >
                                      Delete <Trash2 className="h-4 w-4 text-red-800" />
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <div className="flex flex-col gap-1">
                                <p className="text-sm text-muted-foreground">Section: {cls.section}</p>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  Classcode:  {renderClassCode(cls)}
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                              <p className="text-sm text-muted-foreground">
                                Created: {new Date(cls.createdAt).toLocaleDateString()}
                              </p>
                              <Link to={`/materials/${cls._id}`}>
                                <span className="text-xs text-education-600 font-medium flex items-center gap-1">
                                  Manage class <ArrowRight className="h-4 w-4" />
                                </span>
                              </Link>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Enrolled Classes */}
            {enrolledClasses.length > 0 && (
              <div>
                <h3 className="text-xl mb-4">Joined Classrooms</h3>
                <div className={viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "flex flex-col gap-4"
                }>
                  {enrolledClasses.map(cls => (
                    <Card key={cls._id} className={`hover:shadow-md transition-shadow border-t-4 border-t-education-600 overflow-hidden ${viewMode === "list" ? "w-full" : "h-full"}`}>
                      <CardContent className={`${viewMode === "list" ? "py-4" : "pt-6"}`}>
                        {viewMode === "list" ? (
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4">
                                <div>
                                  <h3 className="text-xl font-medium text-card-foreground">{cls.name}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm text-muted-foreground">Section: {cls.section}</span>
                                    <span className="text-sm text-muted-foreground">•</span>
                                    <span className="text-sm text-muted-foreground">Teacher: {cls.teacher.name}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-row gap-4">
                              <div className="flex flex-col justify-between items-end">
                                <span className="text-sm text-muted-foreground">
                                  Created: {new Date(cls.createdAt).toLocaleDateString()}
                                </span>
                                <Link to={`/materials/${cls._id}`}>
                                  <span className="text-xs text-education-600 font-medium flex items-center gap-1">
                                    View class <ArrowRight className="h-4 w-4" />
                                  </span>
                                </Link>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger><EllipsisVertical /></DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuLabel>{cls.name}</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="flex flex-row justify-between items-center text-red-600"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setSelectedClass(cls);
                                      setLeaveDialogOpen(true);
                                    }}
                                  >
                                    Leave <Trash2 className="h-4 w-4 text-red-800" />
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <h3 className="text-xl font-medium text-card-foreground">{cls.name}</h3>
                                <DropdownMenu>
                                  <DropdownMenuTrigger><EllipsisVertical /></DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuLabel>{cls.name}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="flex flex-row justify-between items-center text-red-600"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedClass(cls);
                                        setLeaveDialogOpen(true);
                                      }}
                                    >
                                      Leave <Trash2 className="h-4 w-4 text-red-800" />
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <div className="flex flex-col gap-1">
                                <p className="text-sm text-muted-foreground">Section: {cls.section}</p>
                                <p className="text-sm text-muted-foreground">Teacher: {cls.teacher.name}</p>
                              </div>
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                              <p className="text-sm text-muted-foreground">
                                Created: {new Date(cls.createdAt).toLocaleDateString()}
                              </p>
                              <Link to={`/materials/${cls._id}`}>
                                <span className="text-xs text-education-600 font-medium flex items-center gap-1">
                                  View class <ArrowRight className="h-4 w-4" />
                                </span>
                              </Link>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {classes.length === 0 && enrolledClasses.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center">
                <img src={noClass} alt="" className="h-80 w-80 dark:invert" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Classes Yet</h3>
                <p className="text-muted-foreground mb-4">Create your first class or join an existing one</p>
                <div className="flex gap-4">
                  <Button
                    onClick={() => setIsJoinDialogOpen(true)}
                    className="bg-education-600 hover:bg-education-700"
                  >
                    <Plus className="h-4 w-4" />
                    Join Class
                  </Button>
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="bg-education-600 hover:bg-education-700"
                    >
                      <Plus className="h-4 w-4" />
                      Create Class
                    </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="p-6 border-b">
              <DialogTitle>Delete Classroom</DialogTitle>
            </DialogHeader>
            <div className="py-4 p-6">
              <p>Are you sure you want to delete {selectedClass?.name}? This action cannot be undone.</p>
            </div>
            <DialogFooter className="p-6 border-t">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="hidden md:block" disabled={isDeleting}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={() => selectedClass && handleDeleteClass(selectedClass._id, selectedClass.name)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                   <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Class Code Dialog */}
        <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="p-6 border-b">
              <DialogTitle>Reset Class Code</DialogTitle>
            </DialogHeader>
            <div className="py-4 p-6">
              <p>Are you sure you want to reset the class code for {selectedClass?.name}? Students will need the new code to join the class.</p>
            </div>
            <DialogFooter className="p-6 border-t">
              <Button variant="outline" onClick={() => setResetDialogOpen(false)} className="hidden md:block" disabled={isResetting}>Cancel</Button>
              <Button 
                onClick={() => selectedClass && handleRefreshClassCode(selectedClass._id, selectedClass.name)}
                disabled={isResetting}
              >
                {isResetting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  'Reset Code'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Leave Confirmation Dialog */}
        <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="p-6 border-b">
              <DialogTitle>Leave Classroom</DialogTitle>
            </DialogHeader>
            <div className="py-4 p-6">
              <p>Are you sure you want to leave {selectedClass?.name}? You can rejoin later using the class code.</p>
            </div>
            <DialogFooter className="p-6 border-t">
              <Button variant="outline" onClick={() => setLeaveDialogOpen(false)} className="hidden md:block" disabled={isLeaving}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={() => selectedClass && handleLeaveClass(selectedClass._id, selectedClass.name)}
                disabled={isLeaving}
              >
                {isLeaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Leaving...
                  </>
                ) : (
                  'Leave Class'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default TeacherDashboard;
