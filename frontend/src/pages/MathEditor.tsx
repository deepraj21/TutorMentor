import Header from "@/components/layout/Header"
import { AddExpressionDialog } from "@/components/MathEditor/AddExpressionDialog";
import { ExpressionCard } from "@/components/MathEditor/ExpressionCard";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { toast } from "sonner";

export interface Expression {
    _id: string;
    type: 'math' | 'graph';
    content: string;
    title?: string;
    createdAt?: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const MathEditor = () => {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [expressions, setExpressions] = useState<Expression[]>([]);
    const [loading, setLoading] = useState(true);
    const teacherId = localStorage.getItem('teacherId');

    useEffect(() => {
        if (teacherId) {
            fetchExpressions();
        }
    }, [teacherId]);

    const fetchExpressions = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/expressions`, {
                params: { teacherId }
            });
            // Sort expressions by createdAt in descending order
            const sortedExpressions = response.data.sort((a: Expression, b: Expression) => {
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            });
            setExpressions(sortedExpressions);
        } catch (error) {
            toast.error('Failed to fetch expressions');
            console.error('Error fetching expressions:', error);
        } finally {
            setLoading(false);
        }
    };

    const searchExpressions = async (query: string) => {
        try {
            const response = await axios.get(`${BACKEND_URL}/api/expressions/search`, {
                params: { query, teacherId }
            });
            // Sort search results by createdAt in descending order
            const sortedExpressions = response.data.sort((a: Expression, b: Expression) => {
                return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
            });
            setExpressions(sortedExpressions);
        } catch (error) {
            toast.error('Failed to search expressions');
            console.error('Error searching expressions:', error);
        }
    };

    const addExpression = async (expression: Omit<Expression, '_id'>) => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/expressions`, {
                ...expression,
                teacherId
            });
            // Add new expression at the beginning of the array
            setExpressions([response.data, ...expressions]);
            toast.success('Expression added successfully');
        } catch (error) {
            toast.error('Failed to add expression');
            console.error('Error adding expression:', error);
        }
    };

    const updateExpression = async (_id: string, updates: Partial<Expression>) => {
        try {
            const response = await axios.put(`${BACKEND_URL}/api/expressions/${_id}`, {
                ...updates,
                teacherId
            });
            setExpressions(expressions.map(expr =>
                expr._id === _id ? response.data : expr
            ));
            toast.success('Expression updated successfully');
        } catch (error) {
            toast.error('Failed to update expression');
            console.error('Error updating expression:', error);
        }
    };

    const deleteExpression = async (_id: string) => {
        try {
            await axios.delete(`${BACKEND_URL}/api/expressions/${_id}`, {
                params: { teacherId }
            });
            setExpressions(expressions.filter(expr => expr._id !== _id));
            toast.success('Expression deleted successfully');
        } catch (error) {
            toast.error('Failed to delete expression');
            console.error('Error deleting expression:', error);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim()) {
            searchExpressions(query);
        } else {
            fetchExpressions();
        }
    };

    if (!teacherId) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h2 className="text-xl font-semibold mb-4">Please login as a teacher to access this page</h2>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-background">
            <Header title="Math Editor" />
            <main className="flex-1 container max-w-6xl mx-auto py-8 px-4 bg-background max-h-[calc(100vh-75px)] overflow-y-scroll no-scrollbar">
                <div className="flex justify-between items-center mb-8">
                    <Button
                        onClick={() => setShowAddDialog(true)}
                        className="bg-education-600 hover:bg-education-700" size="sm"
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden md:block">Add Expression</span>
                    </Button>
                    <div className="mr-[2px] flex items-center border rounded-md focus-within:ring-0 focus-within:border-education-600">
                        <Search className="h-4 w-4 ml-2 text-muted-foreground" />
                        <Input
                            placeholder="Search by title..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-[200px] md:w-[300px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                        />
                    </div>
                </div>
                <div>
                    <div className="border rounded-lg shadow-lg transition-shadow border-t-4 border-t-education-600 overflow-hidden">
                        {loading ? (
                            <div className="space-y-4 p-4">
                                {[1, 2, 3].map((index) => (
                                    <div key={index}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-5 w-5" />
                                                <Skeleton className="h-6 w-48" />
                                            </div>
                                            <div className="flex gap-1">
                                                <Skeleton className="h-8 w-8" />
                                                <Skeleton className="h-8 w-8" />
                                                <Skeleton className="h-8 w-8" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-24 w-full" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                {expressions.map((expression) => (
                                    <div key={expression._id} className="border-b">
                                        <ExpressionCard
                                            expression={expression}
                                            onUpdate={(updates) => updateExpression(expression._id, updates)}
                                            onDelete={() => deleteExpression(expression._id)}
                                        />
                                    </div>
                                ))}

                                {expressions.length === 0 && (
                                    <div className="text-center p-6">
                                        <h3 className="text-lg font-medium mb-2">
                                            {searchQuery ? 'No matching expressions found' : 'No expressions yet'}
                                        </h3>
                                        <p className="text-sm mb-4">
                                            {searchQuery
                                                ? 'Try adjusting your search query'
                                                : 'Add your first mathematical expression or graph on this page.'}
                                        </p>
                                        {!searchQuery && (
                                            <Button
                                                onClick={() => setShowAddDialog(true)}
                                                className="bg-education-600 hover:bg-education-700" size="sm"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add Expression
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <AddExpressionDialog
                        open={showAddDialog}
                        onOpenChange={setShowAddDialog}
                        onAdd={addExpression}
                    />
                </div>
            </main >
        </div >
    )
}

export default MathEditor