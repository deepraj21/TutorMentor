import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Image, Check, List, Copy, Search } from 'lucide-react';
import { toast } from 'sonner';
import Header from "../components/layout/Header";
import noQuestion from "@/assets/no-class.png"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";

interface Question {
    id: string;
    question: string;
    questionImage?: string;
    options: { text: string; image?: string; isCorrect: boolean }[];
    createdAt: Date;
}

const QuestionBank = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        question: '',
        questionImage: '',
        options: [
            { text: '', image: '', isCorrect: false },
            { text: '', image: '', isCorrect: false },
            { text: '', image: '', isCorrect: false },
            { text: '', image: '', isCorrect: false }
        ]
    });

    const handleAddQuestion = () => {
        if (!newQuestion.question.trim()) {
            toast.error("Please enter a question");
            return;
        }

        const hasCorrectAnswer = newQuestion.options.some(opt => opt.isCorrect);
        if (!hasCorrectAnswer) {
            toast.error("Please select at least one correct answer");
            return;
        }

        const question: Question = {
            id: `q_${Date.now()}`,
            question: newQuestion.question,
            questionImage: newQuestion.questionImage || undefined,
            options: newQuestion.options.filter(opt => opt.text.trim()),
            createdAt: new Date()
        };

        setQuestions([...questions, question]);
        setNewQuestion({
            question: '',
            questionImage: '',
            options: [
                { text: '', image: '', isCorrect: false },
                { text: '', image: '', isCorrect: false },
                { text: '', image: '', isCorrect: false },
                { text: '', image: '', isCorrect: false }
            ]
        });

        toast.success(`Question created with ID: ${question.id}`);
    };

    const handleOptionChange = (index: number, field: string, value: string | boolean) => {
        const updatedOptions = [...newQuestion.options];
        updatedOptions[index] = { ...updatedOptions[index], [field]: value };
        setNewQuestion({ ...newQuestion, options: updatedOptions });
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header title="Question Bank" />
            <main className="flex-1 container max-w-6xl mx-auto py-8 px-4 bg-background max-h-[calc(100vh-75px)] overflow-y-scroll no-scrollbar">
                <div className="flex flex-col items-center w-full">
                    <div className="flex justify-between items-center mb-8 w-full">
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    onClick={() => setDialogOpen(true)}
                                    className="bg-education-600 hover:bg-education-700" size="sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden md:block">Add Question</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader className='border-b p-6'>
                                    <DialogTitle>Create New Question</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4 p-6 max-h-[18rem] overflow-y-auto">
                                    <div>
                                        <Label htmlFor="question">Question</Label>
                                        <Textarea
                                            id="question"
                                            value={newQuestion.question}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                                            placeholder="Enter your question here..."
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="question-image">Question Image URL (Optional)</Label>
                                        <Input
                                            id="question-image"
                                            value={newQuestion.questionImage}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, questionImage: e.target.value })}
                                            placeholder="https://example.com/image.jpg"
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <Label>Answer Options</Label>
                                        <div className="space-y-4 mt-2">
                                            {newQuestion.options.map((option, index) => (
                                                <div key={index} className="flex items-center space-x-4 p-2 border rounded-lg">
                                                    <div className="flex-1">
                                                        <Input
                                                            value={option.text}
                                                            onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                                                            placeholder={`Option ${index + 1}`}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Input
                                                            value={option.image}
                                                            onChange={(e) => handleOptionChange(index, 'image', e.target.value)}
                                                            placeholder="Image URL (optional)"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant={option.isCorrect ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handleOptionChange(index, 'isCorrect', !option.isCorrect)}
                                                        className={option.isCorrect ? "bg-green-500 hover:bg-green-600" : ""}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className='p-6 border-t'>
                                    <Button variant="outline" onClick={() => setDialogOpen(false)} className='hidden md:block'>
                                        Cancel
                                    </Button>
                                    <Button onClick={() => { handleAddQuestion(); setDialogOpen(false); }} className="bg-education-600 hover:bg-education-700">
                                        Create Question
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <div className="mr-[2px] flex items-center border rounded-md focus-within:ring-0 focus-within:border-education-600">
                            <Search className="h-4 w-4 ml-2 text-muted-foreground" />
                            <Input
                                placeholder="Search by id or question..."
                                // value={searchQuery}
                                // onChange={(e) => handleSearch(e.target.value)}
                                className="w-[200px] md:w-[300px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                        {questions.map((question) => (
                            <Card key={question.id} className="hover:shadow-lg transition-shadow duration-300">
                                <CardHeader className='border-b'>
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-md flex gap-2 items-center">
                                            {question.id}
                                            <Copy className='h-4 w-4' />
                                        </CardTitle>
                                        <span className="text-xs text-gray-500">
                                            {question.createdAt.toLocaleDateString()}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4 pt-6">
                                        <div>
                                            <p className="font-medium">{question.question}</p>
                                            {question.questionImage && (
                                                <div className="mt-2">
                                                    <Image className="h-4 w-4 inline mr-2" />
                                                    <span className="text-sm text-blue-600">Image attached</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            {question.options.map((option, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-2 rounded border text-sm ${option.isCorrect ? 'bg-green-100 dark:bg-green-600/50 border-green-300' : 'bg-muted'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span>{option.text}</span>
                                                        {option.isCorrect && <Check className="h-4 w-4 text-green-600" />}
                                                    </div>
                                                    {option.image && (
                                                        <div className="mt-1">
                                                            <Image className="h-3 w-3 inline mr-1" />
                                                            <span className="text-xs text-blue-600">Image</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {questions.length === 0 && (
                        <div className="flex flex-col items-center justify-center  text-center">
                            <img src={noQuestion} alt="" className="h-80 w-80 dark:invert" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">No Questions Yet</h3>
                            <p className="text-muted-foreground mb-4">Create your first Question to get started</p>
                            <Button
                                onClick={() => setDialogOpen(true)}
                                className="bg-education-600 hover:bg-education-700"
                            >
                                <Plus className="h-4 w-4" />
                                Add Your First Question
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default QuestionBank;