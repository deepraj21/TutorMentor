import { ArrowUp, Check, Copy, CornerRightUp, FileDownIcon, History, Pencil, Play, Plus, RefreshCcw, ThumbsDown, ThumbsUp, Trash, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type React from "react"
import { useEffect, useState, useRef } from "react"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import ReactMarkdown from "react-markdown"
import { useAuth } from "@/contexts/AuthContext"
import tutormentor from "@/assets/tutor-mentor.png"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ChatMessage {
    role: "user" | "model"
    parts: { text: string }[]
}

interface ChatPreview {
    _id: string
    title: string
    createdAt: string
    isDeleting?: boolean
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"

export function TutorAi() {
    const { user } = useAuth()
    const studentId = localStorage.getItem("studentId")
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
        const savedChats = localStorage.getItem("chatHistory")
        return savedChats ? JSON.parse(savedChats) : []
    })
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

    useEffect(() => {
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

        if (user?.email) {
            fetchChats()
        }
    }, [user?.email])

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
                        userId: studentId,
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
            const response = await fetch(`${BACKEND_URL}/api/ai/${chatId}`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: user.email,
                }),
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
                    email: user.email,
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

    const handleSendMessage = async (userMessage: string) => {
        if (!userMessage.trim()) return

        if (!user) {
            setChatHistory([
                ...chatHistory,
                {
                    role: "model" as const,
                    parts: [
                        {
                            text: "Thank you for using `Tutor AI` but it seems you are not signed in.\nPlease Sign in with Google to continue",
                        },
                    ],
                },
            ])
            return
        }

        const newHistory = [...chatHistory, { role: "user" as const, parts: [{ text: userMessage }] }]

        setChatHistory(newHistory)
        setIsWaiting(true)
        setIsStreaming(true)
        setStreamingText("")
        setLoadingText("Thinking...")
        setUserMessage("")

        try {
            const response = await fetch(`${BACKEND_URL}/api/ai/stream`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: user.email,
                    query: userMessage,
                    history: chatHistory,
                }),
            })

            if (response.status === 401) {
                throw new Error("Please sign in to access Voyager AI chat")
            }

            if (!response.ok || !response.body) {
                throw new Error("Stream response error")
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let modelResponse = ""

            while (true) {
                const { value, done } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                setStreamingText((prev) => prev + chunk)
                modelResponse += chunk
            }

            setChatHistory([...newHistory, { role: "model" as const, parts: [{ text: modelResponse }] }])
        } catch (error) {
            console.error("Chat error:", error)
            setChatHistory([
                ...newHistory,
                {
                    role: "model" as const,
                    parts: [{ text: error instanceof Error ? error.message : "Error occurred while processing your request." }],
                },
            ])
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

    return (
        <>
            <div className="flex flex-row container mx-auto px-4 py-4 items-center justify-between relative">
                <div className="flex flex-row items-center gap-4">
                    <div className="cursor-pointer flex items-center gap-2 text-sm p-1 border bg-secondary rounded-lg hover:bg-transparent" onClick={handleNewChat}>
                        <span className="hidden md:flex">New Chat</span>
                        <Plus className="h-4 w-4 opacity-70 hover:opacity-100" />
                    </div>
                    <div className="flex items-center gap-2 text-sm p-1 border bg-secondary rounded-lg">
                        {isEditingTitle ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    className="bg-transparent outline-none"
                                    autoFocus
                                />
                                <Check className="h-4 w-4 opacity-70 hover:opacity-100 cursor-pointer" onClick={handleTitleSave} />
                                <X className="h-4 w-4 opacity-70 hover:opacity-100 cursor-pointer" onClick={handleTitleCancel} />
                            </div>
                        ) : (
                            <>
                                <span>{title}</span>
                                <Pencil className="h-4 w-4 opacity-70 hover:opacity-100 cursor-pointer" onClick={handleTitleEdit} />
                            </>
                        )}
                    </div>
                </div>

                <div className="top-5 right-10 cursor-pointer">
                    <Popover open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                        <PopoverTrigger asChild>
                            <div className="hover:bg-transparent flex items-center gap-2 text-sm p-1 border bg-secondary rounded-lg">
                                <span className="hidden md:flex">History</span>
                                <History className="h-4 w-4 opacity-70 hover:opacity-100" />
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-[250px] mt-2 p-0" align="end">
                            <Command className="shadow-md">
                                <CommandInput
                                    placeholder="Search chats..."
                                    value={searchQuery}
                                    onValueChange={setSearchQuery}
                                    className="h-9"
                                />
                                <CommandList>
                                    <CommandEmpty>No chats found.</CommandEmpty>
                                    <CommandGroup>
                                        {loading ? (
                                            <div className="py-6 text-center text-sm text-muted-foreground">Loading chats...</div>
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
            <div className="chatarea md:h-[calc(100vh-15rem)] h-[calc(100vh-19rem)] mb-2 container mx-auto px-4 overflow-hidden relative">
                {chatHistory.length == 0 && (
                    <div className="flex items-start justify-end h-full flex-col gap-2 py-4">
                        <span className="text-2xl">Hi there, {user.displayName}</span>
                        <span className="text-3xl">Welcome to Tutor AI</span>
                        <span className="text-sm">what would you like to know?</span>
                    </div>
                )}
                {chatHistory.length > 0 && (
                    <div ref={chatContainerRef} className="space-y-4 mb-4 h-full overflow-auto no-scrollbar">
                        {chatHistory.map((message, index) => (
                            <div
                                key={index}
                                className={`rounded-lg ${message.role === "user" ? "font-semibold text-[20px]" : "text-[15px]"}`}
                            >
                                <div className="markdown prose dark:prose-invert max-w-none break-words">
                                    {message.role === "user" ? (
                                        message.parts[0].text
                                    ) : (
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
                                            {message.parts[0].text}
                                        </ReactMarkdown>
                                    )}
                                </div>

                                {message.role === "user" && (
                                    <div className="text-zinc-400 text-sm border-b dark:border-zinc-800 border-zinc-300 mb-2 mt-2">
                                        <div className="w-fit border-b border-zinc-600 dark:border-zinc-200 p-1 flex items-center gap-1">
                                            <img src={tutormentor} alt="tutor-mentor-logo" className="h-5 w-5 dark:invert" />
                                            <span className="text-primary">Tutor AI</span>
                                        </div>
                                    </div>
                                )}

                                {message.role !== "user" && (
                                    <div className="text-zinc-400 text-sm mt-2">
                                        <div className="flex items-center gap-3 justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        setCopiedStates((prev) => ({
                                                            ...prev,
                                                            [`${index}-thumb`]: prev[`${index}-thumb`] === "up" ? null : "up",
                                                        }))
                                                    }
                                                    className="focus:outline-none"
                                                >
                                                    <ThumbsUp
                                                        className="h-3 w-3"
                                                        fill={copiedStates[`${index}-thumb`] === "up" ? "currentColor" : "none"}
                                                    />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setCopiedStates((prev) => ({
                                                            ...prev,
                                                            [`${index}-thumb`]: prev[`${index}-thumb`] === "down" ? null : "down",
                                                        }))
                                                    }
                                                    className="focus:outline-none"
                                                >
                                                    <ThumbsDown
                                                        className="h-3 w-3"
                                                        fill={copiedStates[`${index}-thumb`] === "down" ? "currentColor" : "none"}
                                                    />
                                                </button>
                                            </div>
                                           
                                            <div className="flex flex-row items-center gap-2">
                                                <button
                                                    className="text-zinc-400 dark:hover:text-white hover:text-black flex items-center"
                                                    onClick={() => handleExport(message)}
                                                >
                                                    <FileDownIcon className="h-3 w-3 mr-1" />
                                                    export
                                                </button>
                                                <div className="ml-auto flex items-center gap-1">
                                                    <button
                                                        className="text-zinc-400 dark:hover:text-white hover:text-black flex items-center"
                                                        onClick={() => handleCopy(index, message)}
                                                    >
                                                        {copiedStates[index] ? (
                                                            <>
                                                                <span className="text-green-400">
                                                                    <Check className="mr-1 h-3 w-3" />
                                                                </span>{" "}
                                                                copied
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="h-3 w-3 mr-1" />
                                                                copy
                                                            </>
                                                        )}
                                                    </button>
                                            </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {isWaiting && !isStreaming && <div className="text-zinc-400 text-sm italic">{loadingText}</div>}

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
            <div className="container mx-auto px-4 relative">
                <Textarea
                    placeholder="Type your message..."
                    onChange={(e) => setUserMessage(e.target.value)}
                    value={userMessage}
                    disabled={isWaiting}
                    className="resize-none bg-muted/30"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && userMessage.trim()) {
                            e.preventDefault(); // Prevents adding a new line
                            handleSendMessage(userMessage);
                        }
                    }}
                />
            </div>

            <div className="absolute md:bottom-10 md:right-[200px] bottom-[100px] right-6">
                <Button
                    className="h-6 w-16"
                    // variant="primary"
                    onClick={() => handleSendMessage(userMessage)}
                    disabled={isWaiting || !userMessage.trim()}
                >
                    <span className="-mr-2">Send</span>
                    <CornerRightUp />
                </Button>
            </div>
        </>
    )
}
