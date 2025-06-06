import { useState, useEffect } from "react";
import Header from "../components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { ArrowRight, Book, EllipsisVertical, Grid2X2Icon, Info, List, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { classroomApi } from "@/utils/api";
import noClass from "@/assets/no-class.png"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Skeleton } from "@/components/ui/skeleton";

interface StudentClassroom {
  _id: string;
  name: string;
  section: string;
  createdBy: string;
  createdAt: string;
  teacher: {
    name: string;
    email: string;
  };
}

const StudentDashboard = () => {
  const [classes, setClasses] = useState<StudentClassroom[]>([]);
  const [classCode, setClassCode] = useState<string[]>(Array(6).fill(""));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<StudentClassroom | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    fetchEnrolledClassrooms();
  }, []);

  const fetchEnrolledClassrooms = async () => {
    try {
      const data = await classroomApi.getEnrolledClassrooms();
      setClasses(data);
    } catch (error) {
      toast.error('Failed to fetch enrolled classrooms', {
        description: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setIsLoading(false);
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
      setClasses([response.classroom, ...classes]);
      setClassCode(Array(6).fill(""));
      setIsDialogOpen(false);
      toast.success("Successfully joined the class");
    } catch (error) {
      toast.error("Failed to join class", {
        description: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleUnenroll = async (classId: string, className: string) => {
    setIsLeaving(true);
    try {
      await classroomApi.unenrollFromClassroom(classId);
      setClasses(classes.filter(cls => cls._id !== classId));
      toast.success(`Successfully unenrolled from ${className}`);
      setLeaveDialogOpen(false);
    } catch (error) {
      toast.error("Failed to unenroll from class", {
        description: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header title="Student Dashboard" />
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size={"sm"}
                  className="bg-education-600 hover:bg-education-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Join Class</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="p-6 border-b">
                  <DialogTitle>Join a Class</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 p-6">
                  <div className="grid gap-2">
                    <label htmlFor="classCode" className="text-foreground">Class Code</label>
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
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="hidden md:block" disabled={isJoining}>Cancel</Button>
                  <Button onClick={handleJoinClass} disabled={isJoining}>
                    {isJoining ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      'Join Classroom'
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
        ) : classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center  text-center">
           <img src={noClass} alt="" className="h-80 w-80 dark:invert" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Classes Yet</h3>
            <p className="text-muted-foreground mb-4">Join your first class to get started</p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-education-600 hover:bg-education-700"
            >
              <Plus className="h-4 w-4" />
              Join Your First Class
            </Button>
          </div>
        ) : (
          <div className={viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-4"
          }>
            {classes.map((cls) => (
              <Card key={cls._id} className={`hover:shadow-md transition-shadow border-t-4 border-t-education-400 overflow-hidden bg-card ${
                viewMode === "list" ? "w-full" : "h-full"
              }`}>
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
                      <div className="flex flex-row items-center gap-4">
                        <div className="flex flex-col justify-between">
                          <span className="text-xs text-muted-foreground">Created: {new Date(cls.createdAt).toLocaleDateString()}</span>
                          <Link to={`/materials/${cls._id}`}>
                            <span className="text-xs text-education-600 font-medium flex items-center">Click to view class <ArrowRight className="h-4 w-4" /></span>
                          </Link>
                        </div>
                        <div>
                          <DropdownMenu>
                            <DropdownMenuTrigger><EllipsisVertical /></DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel>{cls.name}</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="flex flex-row justify-between items-center">Info <Info className="h-4 w-4 text-education-600" /></DropdownMenuItem>
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
                              <DropdownMenuItem className="flex flex-row justify-between items-center">Info <Info className="h-4 w-4 text-education-600"/></DropdownMenuItem>
                              <DropdownMenuItem 
                                className="flex flex-row justify-between items-center text-red-600"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedClass(cls);
                                  setLeaveDialogOpen(true);
                                }}
                              >
                                Leave <Trash2 className="h-4 w-4 text-red-800"/>
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
                        <span className="text-xs text-muted-foreground">Created: {new Date(cls.createdAt).toLocaleDateString()}</span>
                        <Link to={`/materials/${cls._id}`}>
                          <span className="text-xs text-education-600 font-medium flex items-center">Click to view class <ArrowRight className="h-4 w-4" /></span>
                        </Link>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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
                onClick={() => selectedClass && handleUnenroll(selectedClass._id, selectedClass.name)}
                disabled={isLeaving}
              >
                {isLeaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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

export default StudentDashboard;
