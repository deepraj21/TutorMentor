import Header from "../components/layout/Header";
import { ArrowUp, Check, Copy, CornerRightUp, FileDownIcon, History, Pencil, Play, Plus, RefreshCcw, ThumbsDown, ThumbsUp, Trash, X, Image as ImageIcon, Volume2, Share2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type React from "react"
import { useEffect, useState, useRef } from "react"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import ReactMarkdown from "react-markdown"
import { useAuth } from "@/contexts/AuthContext"
import tutormentor from "@/assets/tutor-mentor.png"
import { toast } from "sonner";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { WhatsappShareButton, EmailShareButton, TelegramShareButton, WhatsappIcon, EmailIcon, TelegramIcon, FacebookShareButton, FacebookIcon } from "react-share";
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ChatMessage {
    role: "user" | "model"
    parts: { text: string, images?: string[] }[]
}

interface ChatPreview {
    _id: string
    title: string
    createdAt: string
    isDeleting?: boolean
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB in bytes

const TutorAi = () => {
    const { user, isLoggedIn } = useAuth()
    const role = user?.role;
    const userId = role === "teacher"
        ? localStorage.getItem("teacherId")
        : localStorage.getItem("studentId");
    const userModel = role === "teacher" ? "Teacher" : "Student";
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
        const savedChats = localStorage.getItem("chatHistory")
        return savedChats ? JSON.parse(savedChats) : []
    })
    const [chatLanguage, setChatLanguage] = useState("English")
    const [chats, setChats] = useState<ChatPreview[]>([])
    const [error, setError] = useState<string>("")
    const [title, setTitle] = useState("New Chat")
    const [isStreaming, setIsStreaming] = useState(false)
    const [streamingText, setStreamingText] = useState("")
    const [isWaiting, setIsWaiting] = useState(false)
    const [loadingText, setLoadingText] = useState("")
    const chatContainerRef = useRef<HTMLDivElement>(null)
    const [copiedStates, setCopiedStates] = useState<{ [key: number]: boolean }>({})
    const [userMessage, setUserMessage] = useState("")
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [tempTitle, setTempTitle] = useState("")
    const [loading, setLoading] = useState(true)
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [filteredChats, setFilteredChats] = useState<ChatPreview[]>([])
    const [selectedImages, setSelectedImages] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null)
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
    const messageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [shareIndex, setShareIndex] = useState<number | null>(null);
    const [isShareOpen, setIsShareOpen] = useState(false);

    const fetchChats = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${BACKEND_URL}/api/ai/chats`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: user.email,
                    userModel,
                }),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            setChats(data)
            setFilteredChats(data)
            setError("")
        } catch {
            setChats([])
            setFilteredChats([])
        } finally {
            setLoading(false)
        }
    }

    // Filter chats based on search query
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredChats(chats)
        } else {
            const filtered = chats.filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))
            setFilteredChats(filtered)
        }
    }, [searchQuery, chats])

    const handleNewChat = async () => {
        try {
            const currentChat = localStorage.getItem("chatHistory")
            if (currentChat) {
                await fetch(`${BACKEND_URL}/api/ai/save`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title,
                        messages: JSON.parse(currentChat),
                        userId,
                        userModel,
                    }),
                })
            }
            localStorage.removeItem("chatHistory")
            setChatHistory([])
            setTitle("New Chat")
        } catch (error) {
            console.error("Error saving chat history:", error)
        }
    }

    const handleExport = (message: ChatMessage) => {
        const data = JSON.stringify(message, null, 2)
        const blob = new Blob([data], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `chat-${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleCopy = (index: number, message: ChatMessage) => {
        const textContent = message.parts[0].text
        navigator.clipboard.writeText(textContent).then(() => {
            setCopiedStates((prev) => ({ ...prev, [index]: true }))
            setTimeout(() => {
                setCopiedStates((prev) => ({ ...prev, [index]: false }))
            }, 2000)
        })
    }

    const handleLoadChat = async (chatId: string) => {
        try {
            setLoading(true)
            const response = await fetch(`${BACKEND_URL}/api/ai/${chatId}?userId=${userId}&userModel=${userModel}`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            if (data.messages && Array.isArray(data.messages)) {
                setChatHistory(data.messages)
                setTitle(data.title || "Chat")
                localStorage.setItem("chatHistory", JSON.stringify(data.messages))
            }
        } catch (error) {
            console.error("Error loading chat:", error)
            setError("Failed to load chat history")
        } finally {
            setLoading(false)
            setIsHistoryOpen(false)
        }
    }

    const handleDeleteChat = async (chatId: string) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/ai/${chatId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    userModel, // send userModel
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to delete chat");
            }

            // Update the chats state by removing the deleted chat
            setChats(prevChats => prevChats.filter(chat => chat._id !== chatId));
            setFilteredChats(prevChats => prevChats.filter(chat => chat._id !== chatId));
        } catch (error) {
            console.error("Error deleting chat:", error);
        }
    };

    const handleImageUpload = async (files: FileList | null) => {
        if (!files) return;

        // Check if adding these files would exceed the 4 image limit
        if (selectedImages.length + files.length > 4) {
            toast.error('Maximum 4 images allowed.');
            return;
        }

        const newFiles = Array.from(files);

        // Check file sizes and types
        for (const file of newFiles) {
            if (file.size > MAX_IMAGE_SIZE) {
                toast.error('One or more images exceed the maximum size of 20MB.');
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload only image files.');
                return;
            }
        }

        setIsUploadingImage(true);
        try {
            const newPreviews: string[] = [];
            const uploadedFiles: File[] = [];

            for (const file of newFiles) {
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
                    newPreviews.push(data.secure_url);
                    uploadedFiles.push(file);
                }
            }

            setSelectedImages(prev => [...prev, ...uploadedFiles]);
            setImagePreviews(prev => [...prev, ...newPreviews]);
        } catch (error) {
            console.error('Error uploading images:', error);
            toast.error('Failed to upload images');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSendMessage = async (userMessage: string) => {
        if (!userMessage.trim() && selectedImages.length === 0) return;

        if (!user) {
            setChatHistory([
                ...chatHistory,
                {
                    role: "model" as const,
                    parts: [
                        {
                            text: "Thank you for using `TutorAI` but it seems you are not signed in.\nPlease Sign in with Google to continue",
                        },
                    ],
                },
            ])
            return
        }

        // Store imagePreviews in chatHistory for user message
        const newHistory = [
            ...chatHistory,
            {
                role: "user" as const,
                parts: [{ text: userMessage, images: imagePreviews.length > 0 ? [...imagePreviews] : undefined }]
            }
        ];

        setChatHistory(newHistory)
        setIsWaiting(true)
        setIsStreaming(true)
        setStreamingText("")
        setLoadingText("Thinking...")
        setUserMessage("")

        try {
            let imageData = null;
            if (selectedImages.length > 0) {
                // Convert images to base64
                imageData = await Promise.all(selectedImages.map(file =>
                    new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64data = reader.result as string;
                            resolve(base64data.split(',')[1]);
                        };
                        reader.readAsDataURL(file);
                    })
                ));
            }

            const response = await fetch(`${BACKEND_URL}/api/ai/stream`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: userMessage,
                    chatLanguage,
                    history: chatHistory,
                    imageData,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to process request' }));
                throw new Error(errorData.error || 'Failed to process request');
            }

            if (response.status === 401) {
                throw new Error("Please sign in to access Voyager AI chat")
            }

            if (!response.body) {
                throw new Error("Stream response error")
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let modelResponse = ""

            try {
                while (true) {
                    const { value, done } = await reader.read()
                    if (done) break

                    const chunk = decoder.decode(value, { stream: true })
                    setStreamingText((prev) => prev + chunk)
                    modelResponse += chunk
                }
            } catch (streamError) {
                console.error("Stream reading error:", streamError);
                throw new Error("Error reading stream response");
            }

            setChatHistory([...newHistory, { role: "model" as const, parts: [{ text: modelResponse }] }])
            // Clear images after sending
            setSelectedImages([]);
            setImagePreviews([]);
        } catch (error) {
            console.error("Chat error:", error)
            setChatHistory([
                ...newHistory,
                {
                    role: "model" as const,
                    parts: [{ text: error instanceof Error ? error.message : "Error occurred while processing your request." }],
                },
            ])
            toast.error(error instanceof Error ? error.message : "Error occurred while processing your request.");
        } finally {
            setIsStreaming(false)
            setStreamingText("")
            setIsWaiting(false)
            setLoadingText("")
        }
    }
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "smooth",
            })
        }
    }, [chatHistory, streamingText])
    useEffect(() => {
        localStorage.setItem("chatHistory", JSON.stringify(chatHistory))
    }, [chatHistory])

    const handleTitleEdit = () => {
        setTempTitle(title)
        setIsEditingTitle(true)
    }

    const handleTitleSave = () => {
        setTitle(tempTitle)
        setIsEditingTitle(false)
    }

    const handleTitleCancel = () => {
        setIsEditingTitle(false)
    }

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const groupChatsByDate = (chats: ChatPreview[]) => {
        const groupedChats: { [key: string]: ChatPreview[] } = {};

        chats.forEach(chat => {
            const date = new Date(chat.createdAt);
            const dateKey = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            if (!groupedChats[dateKey]) {
                groupedChats[dateKey] = [];
            }
            groupedChats[dateKey].push(chat);
        });

        return groupedChats;
    };

    // Speak functionality for model responses
    const handleSpeak = (text: string, index: number) => {
        if (!window.speechSynthesis) {
            toast.error("Speech synthesis not supported in this browser.");
            return;
        }
        if (speakingIndex !== null) {
            window.speechSynthesis.cancel();
            setSpeakingIndex(null);
            return;
        }
        const utterance = new window.SpeechSynthesisUtterance(text);
        utterance.onstart = () => setSpeakingIndex(index);
        utterance.onend = () => setSpeakingIndex(null);
        utterance.onerror = () => setSpeakingIndex(null);
        window.speechSynthesis.speak(utterance);
    };

    const getMessagePairs = () => {
        const pairs: { userIdx: number, modelIdx: number }[] = [];
        for (let i = 0; i < chatHistory.length - 1; i++) {
            if (chatHistory[i].role === "user" && chatHistory[i + 1].role === "model") {
                pairs.push({ userIdx: i, modelIdx: i + 1 });
            }
        }
        return pairs;
    };

    const handleShare = async (pairIdx: number) => {
        setShareIndex(pairIdx);
        setIsShareOpen(true);
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header title="TutorAI Chat" />
            <main className="flex-1 container max-w-6xl mx-auto px-4 bg-background max-h-[calc(100vh-75px)] overflow-y-scroll no-scrollbar">
                <div className="flex flex-row py-4 items-center justify-between">
                    <div className="flex flex-row items-center gap-4">
                        <Button onClick={handleNewChat} className="bg-education-600 hover:bg-education-700" size={"sm"}>
                            <span className="hidden md:flex">New</span>
                            <Plus className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2 text-sm p-2 bg-education-600 hover:bg-education-700 rounded-md text-primary-foreground font-medium">
                            {isEditingTitle ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={tempTitle}
                                        onChange={(e) => setTempTitle(e.target.value)}
                                        className="bg-transparent outline-none max-w-[100px] truncate"
                                        autoFocus
                                    />
                                    <Check className="h-4 w-4 cursor-pointer" onClick={handleTitleSave} />
                                    <X className="h-4 w-4 cursor-pointer" onClick={handleTitleCancel} />
                                </div>
                            ) : (
                                <>
                                    <span>{title}</span>
                                    <Pencil className="h-4 w-4 cursor-pointer" onClick={handleTitleEdit} />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="top-5 right-10 cursor-pointer">
                        <Popover
                            open={isHistoryOpen}
                            onOpenChange={(open) => {
                                setIsHistoryOpen(open);
                                if (open && user?.email) {
                                    fetchChats();
                                }
                            }}
                        >
                            <PopoverTrigger asChild>
                                <Button className="bg-education-600 hover:bg-education-700" size={"sm"}>
                                    <span className="hidden md:flex">history</span>
                                    <History className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[250px] mt-2 p-0" align="end">
                                <Command className="shadow-md">
                                    <CommandInput
                                        placeholder="Search Chats..."
                                        value={searchQuery}
                                        onValueChange={setSearchQuery}
                                        className="h-9"
                                    />
                                    <CommandList>
                                        <CommandEmpty>No Chats Found</CommandEmpty>
                                        <CommandGroup>
                                            {loading ? (
                                                <div className="py-6 text-center text-sm text-muted-foreground">loadingChats...</div>
                                            ) : filteredChats.length > 0 ? (
                                                Object.entries(groupChatsByDate(filteredChats)).map(([date, chats]) => (
                                                    <div key={date}>
                                                        <div className="px-1 py-2 text-[10px] font-medium text-muted-foreground">
                                                            {date}
                                                        </div>
                                                        {chats.map((chat) => (
                                                            <CommandItem
                                                                key={chat._id}
                                                                onSelect={() => handleLoadChat(chat._id)}
                                                                className="flex flex-row justify-between items-center cursor-pointer"
                                                            >
                                                                <div className="flex gap-1">
                                                                    <div className="font-medium w-fit">{chat.title}</div>
                                                                    <div className="text-xs text-muted-foreground mt-1">
                                                                        {new Date(chat.createdAt).toLocaleTimeString('en-US', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-4 w-4 p-0"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteChat(chat._id);
                                                                    }}
                                                                >
                                                                    <Trash className="h-3 w-3 text-red-700" />
                                                                </Button>
                                                            </CommandItem>
                                                        ))}
                                                    </div>
                                                ))
                                            ) : (
                                                <></>
                                            )}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div className="chatarea md:h-[calc(100vh-18rem)] h-[calc(100vh-18rem)] mb-2 overflow-hidden relative">
                    {chatHistory.length == 0 && (
                        <div className="flex items-start justify-end h-full flex-col gap-2 py-4">
                            <img src={tutormentor} alt="tutor-mentor-logo" className="h-20 w-20 dark:invert" />
                            <span className="text-2xl">Hi there, {user?.displayName || user?.name}</span>
                            <span className="text-3xl">Welcome to TutorAI</span>
                            <span className="text-sm">what would you like to know?</span>
                        </div>
                    )}
                    {chatHistory.length > 0 && (
                        <div ref={chatContainerRef} className="space-y-4 mb-4 h-full overflow-auto no-scrollbar">
                            {getMessagePairs().map((pair, pairIdx) => (
                                <div key={pairIdx} className="mb-4">
                                    {/* User message */}
                                    <div className={`rounded-lg font-semibold text-[20px]`}>
                                        <div className="markdown prose dark:prose-invert max-w-none break-words">
                                            {chatHistory[pair.userIdx].parts[0].text}
                                            {chatHistory[pair.userIdx].parts[0].images && chatHistory[pair.userIdx].parts[0].images.length > 0 && (
                                                <div className="flex gap-2 mt-2">
                                                    {chatHistory[pair.userIdx].parts[0].images.map((img, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={img}
                                                            alt={`User uploaded ${idx + 1}`}
                                                            className="h-20 w-20 object-contain rounded cursor-pointer"
                                                            onClick={() => setSelectedPreviewImage(img)}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-zinc-400 text-sm border-b dark:border-zinc-800 border-zinc-300 mb-2 mt-2">
                                            <div className="w-fit border-b border-zinc-600 dark:border-zinc-200 p-1 flex items-center gap-1">
                                                <img src={tutormentor} alt="tutor-mentor-logo" className="h-5 w-5 dark:invert" />
                                                <span className="text-primary">TutorAI</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Model message */}
                                    <div className={`rounded-lg text-[15px]`}>
                                        <div className="markdown prose dark:prose-invert max-w-none break-words">
                                            <ReactMarkdown
                                                rehypePlugins={[rehypeRaw]}
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: ({ children }) => <p className="mb-2">{children}</p>,
                                                    h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                                                    h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                                                    h3: ({ children }) => <h3 className="text-base font-bold mb-2">{children}</h3>,
                                                    h4: ({ children }) => <h4 className="text-base font-semibold mb-2">{children}</h4>,
                                                    h5: ({ children }) => <h5 className="text-sm font-semibold mb-2">{children}</h5>,
                                                    h6: ({ children }) => <h6 className="text-sm font-medium mb-2">{children}</h6>,
                                                    ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                                                    ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                                                    li: ({ children }) => <li className="mb-1">{children}</li>,
                                                    a: ({ href, children }) => (
                                                        <a
                                                            href={href}
                                                            className="text-blue-600 underline hover:text-blue-800"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            {children}
                                                        </a>
                                                    ),
                                                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                                    em: ({ children }) => <em className="italic">{children}</em>,
                                                    del: ({ children }) => <del className="line-through">{children}</del>,
                                                    code: ({
                                                        inline,
                                                        className,
                                                        children,
                                                        ...props
                                                    }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
                                                        const match = /language-(\w+)/.exec(className || "")
                                                        const lang = match?.[1]

                                                        if (inline) {
                                                            return (
                                                                <code className="dark:bg-zinc-800 bg-zinc-300 px-1 py-0.5 text-sm font-mono">
                                                                    {children}
                                                                </code>
                                                            )
                                                        }

                                                        return (
                                                            <div className="relative border dark:border-zinc-800 rounded-lg overflow-hidden">
                                                                <div className="flex justify-between items-center text-xs text-zinc-400 bg-[#101011] px-3 py-3 font-mono rouned-t">
                                                                    <span>{lang || "text"}</span>
                                                                    <div className="flex flex-row gap-3">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                navigator.clipboard.writeText(String(children).trim())
                                                                                const button = e.currentTarget
                                                                                const original = button.textContent
                                                                                button.textContent = "Copied!"
                                                                                setTimeout(() => {
                                                                                    button.textContent = original
                                                                                }, 2000)
                                                                            }}
                                                                            className="hover:text-white transition flex items-center gap-1"
                                                                        >
                                                                            <Copy className="h-3 w-3" />
                                                                            Copy
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <pre className="overflow-x-auto whitespace-pre p-3 text-sm font-mono dark:bg-zinc-800 bg-zinc-300">
                                                                    <code className={className} {...props}>
                                                                        {children}
                                                                    </code>
                                                                </pre>
                                                            </div>
                                                        )
                                                    },

                                                    pre: ({ children }) => (
                                                        <pre className="dark:bg-zinc-800 bg-zinc-300 rounded-lg mb-2 overflow-x-auto">{children}</pre>
                                                    ),
                                                    blockquote: ({ children }) => (
                                                        <blockquote className="border-l-4 border-zinc-500 pl-4 italic mb-2 text-zinc-700 dark:text-zinc-300">
                                                            {children}
                                                        </blockquote>
                                                    ),
                                                    hr: () => <hr className="my-4 border-zinc-300 dark:border-zinc-700" />,
                                                    table: ({ children }) => <table className="table-auto w-full mb-4">{children}</table>,
                                                    thead: ({ children }) => <thead className="bg-zinc-100 dark:bg-zinc-700">{children}</thead>,
                                                    tbody: ({ children }) => <tbody>{children}</tbody>,
                                                    tr: ({ children }) => <tr className="border-b dark:border-zinc-600">{children}</tr>,
                                                    th: ({ children }) => <th className="text-left font-bold p-2">{children}</th>,
                                                    td: ({ children }) => <td className="p-2">{children}</td>,
                                                    img: ({ src, alt }) => (
                                                        <img src={src || "/placeholder.svg"} alt={alt} className="my-4 rounded max-w-full" />
                                                    ),
                                                }}
                                            >
                                                {chatHistory[pair.modelIdx].parts[0].text}
                                            </ReactMarkdown>
                                        </div>
                                        <div className="text-zinc-400 text-sm mt-3">
                                            <div className="flex items-center gap-3 justify-between">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() =>
                                                            setCopiedStates((prev) => ({
                                                                ...prev,
                                                                [`${pair.userIdx}-thumb`]: prev[`${pair.userIdx}-thumb`] === "up" ? null : "up",
                                                            }))
                                                        }
                                                        className="focus:outline-none"
                                                    >
                                                        <ThumbsUp
                                                            className="h-4 w-4"
                                                            fill={copiedStates[`${pair.userIdx}-thumb`] === "up" ? "currentColor" : "none"}
                                                        />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setCopiedStates((prev) => ({
                                                                ...prev,
                                                                [`${pair.userIdx}-thumb`]: prev[`${pair.userIdx}-thumb`] === "down" ? null : "down",
                                                            }))
                                                        }
                                                        className="focus:outline-none"
                                                    >
                                                        <ThumbsDown
                                                            className="h-4 w-4"
                                                            fill={copiedStates[`${pair.userIdx}-thumb`] === "down" ? "currentColor" : "none"}
                                                        />
                                                    </button>
                                                    {/* Speak button */}
                                                    <button
                                                        onClick={() => handleSpeak(chatHistory[pair.modelIdx].parts[0].text, pair.modelIdx)}
                                                        className={`focus:outline-none ${speakingIndex === pair.modelIdx ? 'animate-pulse text-education-600' : ''}`}
                                                        aria-label="Speak response"
                                                        disabled={speakingIndex !== null && speakingIndex !== pair.modelIdx}
                                                    >
                                                        <Volume2 className={`h-5 w-5 ${speakingIndex === pair.modelIdx ? 'animate-pulse' : ''}`} />
                                                    </button>
                                                </div>

                                                <div className="flex flex-row items-center gap-3">
                                                    <button
                                                        className="text-zinc-400 dark:hover:text-white hover:text-black flex items-center"
                                                        onClick={() => handleShare(pairIdx)}
                                                    >
                                                        <Share2 className="h-4 w-4 mr-1" />
                                                        <span className="text-[16px]">share</span>
                                                    </button>
                                                    <button
                                                        className="text-zinc-400 dark:hover:text-white hover:text-black flex items-center"
                                                        onClick={() => handleExport(chatHistory[pair.modelIdx])}
                                                    >
                                                        <FileDownIcon className="h-4 w-4 mr-1" />
                                                        <span className="text-[16px]">export</span>
                                                    </button>
                                                    <div className="ml-auto flex items-center gap-1">
                                                        <button
                                                            className="text-zinc-400 dark:hover:text-white hover:text-black flex items-center"
                                                            onClick={() => handleCopy(pair.modelIdx, chatHistory[pair.modelIdx])}
                                                        >
                                                            {copiedStates[pair.modelIdx] ? (
                                                                <>
                                                                    <span className="text-green-400">
                                                                        <Check className="mr-1 h-4 w-4" />
                                                                    </span>{" "}
                                                                    <span className="text-[16px]">copied</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="h-4 w-4 mr-1" />
                                                                    <span className="text-[16px]">copy</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isWaiting && !isStreaming && <div className="text-zinc-400 text-sm italic">thinking...</div>}

                            {isStreaming && (
                                <div className="text-[15px]">
                                    <div className="markdown prose dark:prose-invert max-w-none break-words">
                                        <ReactMarkdown
                                            rehypePlugins={[rehypeRaw]}
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p: ({ children }) => <p className="mb-2">{children}</p>,
                                                h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
                                                h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
                                                h3: ({ children }) => <h3 className="text-base font-bold mb-2">{children}</h3>,
                                                h4: ({ children }) => <h4 className="text-base font-semibold mb-2">{children}</h4>,
                                                h5: ({ children }) => <h5 className="text-sm font-semibold mb-2">{children}</h5>,
                                                h6: ({ children }) => <h6 className="text-sm font-medium mb-2">{children}</h6>,
                                                ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                                a: ({ href, children }) => (
                                                    <a
                                                        href={href}
                                                        className="text-blue-600 underline hover:text-blue-800"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {children}
                                                    </a>
                                                ),
                                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                                em: ({ children }) => <em className="italic">{children}</em>,
                                                del: ({ children }) => <del className="line-through">{children}</del>,
                                                code: ({
                                                    inline,
                                                    className,
                                                    children,
                                                    ...props
                                                }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
                                                    const match = /language-(\w+)/.exec(className || "")
                                                    const lang = match?.[1]

                                                    if (inline) {
                                                        return (
                                                            <code className="dark:bg-zinc-800 bg-zinc-300 px-1 py-0.5 text-sm font-mono">
                                                                {children}
                                                            </code>
                                                        )
                                                    }

                                                    return (
                                                        <div className="relative mb-2 border dark:border-zinc-800 rounded-lg overflow-hidden">
                                                            <div className="flex justify-between items-center text-xs text-zinc-400 bg-[#101011] px-3 py-3 font-mono rouned-t">
                                                                <span>{lang || "text"}</span>
                                                                <button
                                                                    onClick={(e) => {
                                                                        navigator.clipboard.writeText(String(children).trim())

                                                                        const button = e.currentTarget
                                                                        const original = button.textContent
                                                                        button.textContent = "Copied!"

                                                                        setTimeout(() => {
                                                                            button.textContent = original
                                                                        }, 2000)
                                                                    }}
                                                                    className="hover:text-white transition"
                                                                >
                                                                    Copy
                                                                </button>
                                                            </div>
                                                            <pre className="overflow-x-auto whitespace-pre p-3 text-sm font-mono dark:bg-zinc-800 bg-zinc-300">
                                                                <code className={className} {...props}>
                                                                    {children}
                                                                </code>
                                                            </pre>
                                                        </div>
                                                    )
                                                },

                                                pre: ({ children }) => (
                                                    <pre className="dark:bg-zinc-800 bg-zinc-300 rounded-lg mb-2 overflow-x-auto">{children}</pre>
                                                ),
                                                blockquote: ({ children }) => (
                                                    <blockquote className="border-l-4 border-zinc-500 pl-4 italic mb-2 text-zinc-700 dark:text-zinc-300">
                                                        {children}
                                                    </blockquote>
                                                ),
                                                hr: () => <hr className="my-4 border-zinc-300 dark:border-zinc-700" />,
                                                table: ({ children }) => <table className="table-auto w-full mb-4">{children}</table>,
                                                thead: ({ children }) => <thead className="bg-zinc-100 dark:bg-zinc-700">{children}</thead>,
                                                tbody: ({ children }) => <tbody>{children}</tbody>,
                                                tr: ({ children }) => <tr className="border-b dark:border-zinc-600">{children}</tr>,
                                                th: ({ children }) => <th className="text-left font-bold p-2">{children}</th>,
                                                td: ({ children }) => <td className="p-2">{children}</td>,
                                                img: ({ src, alt }) => (
                                                    <img src={src || "/placeholder.svg"} alt={alt} className="my-4 rounded max-w-full" />
                                                ),
                                            }}
                                        >
                                            {streamingText}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="relative">
                    {imagePreviews.length > 0 && (
                        <div className="-mt-20 absolute bg-muted p-1 rounded-lg border shadow-lg flex gap-2">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="h-14 w-14 rounded-lg object-contain cursor-pointer"
                                        onClick={() => setSelectedPreviewImage(preview)}
                                    />
                                    <button
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute -top-1 -right-1 p-1 bg-black/50 rounded-full hover:bg-black/70"
                                    >
                                        <X className="h-4 w-4 text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="border rounded-lg dark:bg-gray-800 dark:border-gray-700 border-gray-300 overflow-hidden shadow-lg">
                        <Textarea
                            placeholder={isLoggedIn ? 'Type your message...' : "Sign in with Google to chat with TutorAI"}
                            onChange={(e) => setUserMessage(e.target.value)}
                            value={userMessage}
                            disabled={isWaiting || !isLoggedIn}
                            className="resize-none dark:bg-gray-800/50 border-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey && (userMessage.trim() || selectedImages.length > 0)) {
                                    e.preventDefault();
                                    handleSendMessage(userMessage);
                                }
                            }}
                        />
                        <div className="p-2 flex items-center justify-between">
                            <Tabs defaultValue="English" onValueChange={(value) => setChatLanguage(value)}>
                                <TabsList className="border rounded-full dark:border-gray-700 shadow-lg">
                                    <TabsTrigger value="English" className="h-7 w-10 rounded-full">en</TabsTrigger>
                                    <TabsTrigger value="Bengali" className="h-7 w-10 rounded-full">বাং</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => {
                                            handleImageUpload(e.target.files);
                                            // Reset the input value so the same files can be selected again
                                            e.target.value = '';
                                        }}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={isUploadingImage}
                                        onClick={() => {
                                            const input = document.getElementById('image-upload') as HTMLInputElement;
                                            if (input) {
                                                input.click();
                                            }
                                        }}
                                    >
                                        {isUploadingImage ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <ImageIcon className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <Button
                                    className="h-7 w-16"
                                    onClick={() => handleSendMessage(userMessage)}
                                    disabled={isWaiting || (!userMessage.trim() && selectedImages.length === 0)}
                                >
                                    <span className="-mr-2">send</span>
                                    <CornerRightUp />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Image Preview Modal */}
            {selectedPreviewImage && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setSelectedPreviewImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] p-4">
                        <img
                            src={selectedPreviewImage}
                            alt="Preview"
                            className="max-w-full max-h-[80vh] object-contain rounded-lg"
                        />
                        <button
                            onClick={() => setSelectedPreviewImage(null)}
                            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70"
                        >
                            <X className="h-6 w-6 text-white" />
                        </button>
                    </div>
                </div>
            )}

            {isShareOpen && shareIndex !== null && (
                <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader className="p-6 border-b">
                            <DialogTitle>Share your Chat</DialogTitle>
                        </DialogHeader>
                        <div className="p-6 pt-0 flex flex-col gap-4 items-center">
                            <div className="flex gap-4">
                                <WhatsappShareButton
                                    title={chatHistory[getMessagePairs()[shareIndex].modelIdx].parts[0].text}
                                    url={window.location.href}
                                    separator=" "
                                >
                                    <div className="flex items-center gap-2"><WhatsappIcon size={40} round /></div>
                                </WhatsappShareButton>
                                <TelegramShareButton
                                    title={chatHistory[getMessagePairs()[shareIndex].modelIdx].parts[0].text}
                                    url={window.location.href}
                                >
                                    <div className="flex items-center gap-2"><TelegramIcon size={40} round /></div>
                                </TelegramShareButton>
                                <EmailShareButton
                                    subject="Shared from TutorAI"
                                    body={chatHistory[getMessagePairs()[shareIndex].modelIdx].parts[0].text + '\n'}
                                    url={window.location.href}
                                >
                                    <div className="flex items-center gap-2"><EmailIcon size={40} round /></div>
                                </EmailShareButton>
                                <FacebookShareButton
                                    url={window.location.href}
                                    hashtag="#TutorAI"
                                >
                                    <div className="flex items-center gap-2"><FacebookIcon size={40} round /></div>
                                </FacebookShareButton>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
};

export default TutorAi;
