import Header from "@/components/layout/Header"
import { AddExpressionDialog } from "@/components/MathEditor/AddExpressionDialog";
import { ExpressionCard } from "@/components/MathEditor/ExpressionCard";
import { Button } from "@/components/ui/button";
import { BookOpen, Check, Download, Pencil, Plus, Share, X } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

export interface Expression {
    id: string;
    type: 'math' | 'graph';
    content: string;
    title?: string;
}

export interface Page {
    id: string;
    title: string;
    expressions: Expression[];
}

const MathEditor = () => {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editingPage, setEditingPage] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");

    const [pages, setPages] = useState<Page[]>([
        {
            id: '1',
            title: 'Getting Started',
            expressions: [
                {
                    id: '1',
                    type: 'math',
                    content: '\\frac{d}{dx}\\left(x^2\\right) = 2x',
                    title: 'Basic Derivative'
                },
                {
                    id: '2',
                    type: 'graph',
                    content: 'x^2',
                    title: 'Parabola'
                }
            ]
        }
    ]);

    const [currentPageId, setCurrentPageId] = useState('1');

    const currentPage = pages.find(p => p.id === currentPageId);

    // Helper to update the current page
    const onUpdatePage = (updatedPage: Partial<Page>) => {
        if (!currentPage) return;
        updatePage(currentPage.id, updatedPage);
    };

    const addPage = () => {
        const newPage: Page = {
            id: Date.now().toString(),
            title: `Page ${pages.length + 1}`,
            expressions: []
        };
        setPages([...pages, newPage]);
        setCurrentPageId(newPage.id);
    };

    const updatePage = (pageId: string, updatedPage: Partial<Page>) => {
        setPages(pages.map(p => p.id === pageId ? { ...p, ...updatedPage } : p));
    };

    const deletePage = (pageId: string) => {
        if (pages.length > 1) {
            const newPages = pages.filter(p => p.id !== pageId);
            setPages(newPages);
            if (currentPageId === pageId) {
                setCurrentPageId(newPages[0].id);
            }
        }
    };

    const startEditing = (page: Page) => {
        setEditingPage(page.id);
        setEditTitle(page.title);
    };

    // const saveEdit = (pageId: string) => {
    //     onUpdatePage(pageId, { title: editTitle.trim() || "Untitled Page" });
    //     setEditingPage(null);
    // };

    const cancelEdit = () => {
        setEditingPage(null);
        setEditTitle("");
    };


    const addExpression = (expression: Omit<Expression, 'id'>) => {
        if (!currentPage) return;
        const newExpression: Expression = {
            ...expression,
            id: Date.now().toString(),
        };
        onUpdatePage({
            expressions: [...currentPage.expressions, newExpression]
        });
    };

    const updateExpression = (id: string, updates: Partial<Expression>) => {
        if (!currentPage) return;
        onUpdatePage({
            expressions: currentPage.expressions.map(expr =>
                expr.id === id ? { ...expr, ...updates } : expr
            )
        });
    };

    const deleteExpression = (id: string) => {
        if (!currentPage) return;
        onUpdatePage({
            expressions: currentPage.expressions.filter(expr => expr.id !== id)
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header title="Math Editor" />
            <main className="flex-1 container max-w-6xl mx-auto px-4 bg-background max-h-[calc(100vh-75px)] overflow-y-scroll no-scrollbar">
                <div className="flex flex-row py-4 items-center justify-between">
                    <div className="flex flex-row items-center gap-4">
                        <Button onClick={addPage} className="bg-education-600 hover:bg-education-700" size={"sm"}>
                            <span className="hidden md:flex">New</span>
                            <Plus className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-2 text-sm p-2 bg-education-600 hover:bg-education-700 rounded-md text-primary-foreground font-medium">
                            {editingPage ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        // value={tempTitle}
                                        // onChange={(e) => setTempTitle(e.target.value)}
                                        className="bg-transparent outline-none"
                                        autoFocus
                                    />
                                    <Check className="h-4 w-4 opacity-70 hover:opacity-100 cursor-pointer" />
                                    <X className="h-4 w-4 opacity-70 hover:opacity-100 cursor-pointer" />
                                </div>
                            ) : (
                                <>
                                    <span>page 1</span>
                                    <Pencil className="h-4 w-4 cursor-pointer" />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="top-5 right-10 cursor-pointer flex items-center gap-4">
                        <Button onClick={addPage} className="bg-education-600 hover:bg-education-700" size={"sm"}>
                            <span className="hidden md:flex">Export</span>
                            <Download className="h-4 w-4" />
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button className="bg-education-600 hover:bg-education-700" size={"sm"}>
                                    <span className="hidden md:flex">Pages</span>
                                    <BookOpen className="h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[250px] mt-2 p-0" align="end">
                                <Command className="shadow-md">
                                    <CommandInput
                                        placeholder="Search pages..."
                                        // value={searchQuery}
                                        // onValueChange={setSearchQuery}
                                        className="h-9"
                                    />
                                    <CommandList>
                                        <CommandEmpty>No Pages found</CommandEmpty>
                                        <CommandGroup>
                                            {/* {loading ? (
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
                                                        )} */}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div id="math-editor-content">
                    <div className="border rounded-lg shadow-lg transition-shadow border-t-4 border-t-education-600 overflow-hidden">
                        {currentPage && currentPage.expressions.length > 0 && (
                            <div className="flex justify-center p-6 border-b">
                                <Button
                                    onClick={() => setShowAddDialog(true)}
                                    className="bg-education-600 hover:bg-education-700" size="sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Expression
                                </Button>
                            </div>
                        )}
                        {currentPage && currentPage.expressions.map((expression) => (
                            <div className="border-b">
                                <ExpressionCard
                                    key={expression.id}
                                    expression={expression}
                                    onUpdate={(updates) => updateExpression(expression.id, updates)}
                                    onDelete={() => deleteExpression(expression.id)}
                                />
                            </div>
                        ))}

                        {currentPage && currentPage.expressions.length === 0 && (
                            <div className="text-center py-12">
                                <h3 className="text-lg font-medium mb-2">
                                    No expressions yet
                                </h3>
                                <p className="text-sm mb-4">
                                    Add your first mathematical expression or graph on this page.
                                </p>
                                <Button
                                    onClick={() => setShowAddDialog(true)}
                                    className="bg-education-600 hover:bg-education-700" size="sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Expression
                                </Button>
                            </div>
                        )}
                    </div>
                    <AddExpressionDialog
                        open={showAddDialog}
                        onOpenChange={setShowAddDialog}
                        onAdd={addExpression}
                    />
                </div>
            </main>
        </div>
    )
}

export default MathEditor