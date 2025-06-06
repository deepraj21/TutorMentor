"use client"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Settings, LogOut, ChevronUp, User2, Home, BookOpen, LibraryBig, Bot, BookmarkXIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { classroomApi } from "@/utils/api"
import { Skeleton } from "@/components/ui/skeleton"
import logoImg from "@/assets/Logo.png"

interface Classroom {
  _id: string
  name: string
  section: string
  createdBy: string
  createdAt: string
  classCode: string
  teacher: {
    name: string
  }
}

interface ClassroomResponse {
  created: Classroom[]
  enrolled: Classroom[]
}

export function AppSidebar() {
  const { signOut, isLoggedIn } = useAuth()
  const user = JSON.parse(localStorage.getItem("classroomUser") || "{}")
  const location = useLocation()
  const { theme, setTheme } = useTheme()
  const [classes, setClasses] = useState<Classroom[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Add useSidebar hook to control mobile sidebar
  const { isMobile, setOpenMobile } = useSidebar()

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        let fetchedClasses: Classroom[] = []

        if (user?.role === "teacher") {
          const response = await classroomApi.getMyClassrooms()
          const data = response as unknown as ClassroomResponse
          fetchedClasses = data.created
        } else {
          // For students, use getEnrolledClassrooms
          fetchedClasses = await classroomApi.getEnrolledClassrooms()
        }

        setClasses(fetchedClasses)
      } catch (error) {
        console.error("Failed to fetch classes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (isLoggedIn) {
      fetchClasses()
    }
  }, [isLoggedIn, user?.role])

  const handleLogout = () => {
    signOut()
  }

  const isTeacher = user?.role !== "student"
  const isActive = (path: string) => location.pathname.startsWith(path)

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Function to close mobile sidebar when navigation link is clicked
  const handleMobileNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b dark:border-zinc-700/40 py-[10px]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to={`/${user?.role}`} onClick={handleMobileNavClick}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-education-600 text-white">
                  <img src={logoImg || "/placeholder.svg"} alt="" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">TutorMentor</span>
                  <span className="truncate text-xs">Learning Platform</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive(`/${user?.role}`)} tooltip="Dashboard">
                  <Link to={`/${user?.role}`} onClick={handleMobileNavClick}>
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {isTeacher && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/materials-library")} tooltip="Materials Library">
                    <Link to="/materials-library" onClick={handleMobileNavClick}>
                      <LibraryBig />
                      <span>Library</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Classrooms</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                // Loading skeleton for classes
                [...Array(3)].map((_, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton>
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : classes.length > 0 ? (
                classes.map((cls) => (
                  <SidebarMenuItem key={cls._id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(`/materials/${cls._id}`)}
                      tooltip={`${cls.name} - ${cls.section}`}
                    >
                      <Link to={`/materials/${cls._id}`} onClick={handleMobileNavClick}>
                        <BookOpen className="h-4 w-4" />
                        <span className="truncate">{cls.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="No classes yet">
                    <div>
                      <BookmarkXIcon />
                      <span>No classes yet</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isTeacher && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>AIs</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/tutor-ai")} tooltip="TutorAI Chat">
                      <Link to="/tutor-ai" onClick={handleMobileNavClick}>
                        <Bot />
                        <span>TutorAI</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user?.photoURL || "/placeholder.svg"} alt={user?.displayName} />
                    <AvatarFallback className="rounded-lg bg-education-600 text-white">
                      {user?.displayName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.displayName || user?.name}</span>
                    <span className="truncate text-xs capitalize">{user?.role}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={user?.photoURL || "/placeholder.svg"} alt={user?.displayName} />
                      <AvatarFallback className="rounded-lg bg-education-600 text-white">
                        {user?.displayName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.displayName || user?.name}</span>
                      <span className="truncate text-xs capitalize">{user?.role}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" onClick={handleMobileNavClick}>
                    <User2 className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" onClick={handleMobileNavClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
