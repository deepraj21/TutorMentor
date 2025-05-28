import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Test, Question } from '@/types/test';
import { getBatchTests, createTest, publishTest, startTest, endTest, updateTest, deleteTest } from '@/utils/api';
import { useToast } from '@/components/ui/use-toast';
import { TestQuestionForm } from '@/components/TestQuestionForm';
import { useAuth } from "@/contexts/AuthContext";
import axios from 'axios';
import { TestLeaderboard } from '@/components/TestLeaderboard';

interface Batch {
    _id: string;
    name: string;
    batchCode: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export default function Tests() {
    const { batchId } = useParams();
    const navigate = useNavigate();
    const [tests, setTests] = useState<Test[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<string>('');
    const [editingTest, setEditingTest] = useState<Test | null>(null);
    const [selectedTest, setSelectedTest] = useState<Test | null>(null);
    const [newTest, setNewTest] = useState({
        title: '',
        description: '',
        duration: 60,
        questions: [] as Question[]
    });
    const { toast } = useToast();
    const { admin, isLoggedIn } = useAuth();

    useEffect(() => {
        if (admin?._id) {
            fetchBatches();
        }
    }, [admin]);

    useEffect(() => {
        if (selectedBatch) {
            loadTests(selectedBatch);
        }
    }, [selectedBatch]);

    const fetchBatches = async () => {
        try {
            const response = await axios.post(`${BACKEND_URL}/api/batch/all`, {
                adminId: admin?._id
            });
            setBatches(response.data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load batches',
                variant: 'destructive'
            });
        }
    };

    const loadTests = async (batchId: string) => {
        try {
            const data = await getBatchTests(batchId);
            setTests(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load tests',
                variant: 'destructive'
            });
        }
    };

    const handleEditTest = (test: Test) => {
        setEditingTest(test);
        setNewTest({
            title: test.title,
            description: test.description,
            duration: test.duration,
            questions: test.questions
        });
        setSelectedBatch(test.batch);
    };

    const handleUpdateTest = async () => {
        if (!editingTest) return;

        if (!validateTest()) {
            return;
        }

        try {
            const testData = {
                ...newTest,
                batch: selectedBatch,
                adminId: admin?._id
            };
            await updateTest(editingTest._id, testData);
            toast({
                title: 'Success',
                description: 'Test updated successfully'
            });
            setEditingTest(null);
            setNewTest({
                title: '',
                description: '',
                duration: 60,
                questions: []
            });
            loadTests(selectedBatch);
        } catch (error) {
            console.error('Error updating test:', error);
            toast({
                title: 'Error',
                description: 'Failed to update test. Please try again.',
                variant: 'destructive'
            });
        }
    };

    const handleDeleteTest = async (testId: string) => {
        if (!admin?._id) return;

        if (window.confirm('Are you sure you want to delete this test?')) {
            try {
                await deleteTest(testId, admin._id);
                toast({
                    title: 'Success',
                    description: 'Test deleted successfully'
                });
                loadTests(selectedBatch);
            } catch (error) {
                console.error('Error deleting test:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to delete test. Only draft tests can be deleted.',
                    variant: 'destructive'
                });
            }
        }
    };

    const validateTest = () => {
        if (!newTest.title.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a title for the test',
                variant: 'destructive'
            });
            return false;
        }

        if (!newTest.description.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter a description for the test',
                variant: 'destructive'
            });
            return false;
        }

        if (newTest.duration < 1) {
            toast({
                title: 'Error',
                description: 'Duration must be at least 1 minute',
                variant: 'destructive'
            });
            return false;
        }

        if (newTest.questions.length === 0) {
            toast({
                title: 'Error',
                description: 'Please add at least one question',
                variant: 'destructive'
            });
            return false;
        }

        // Validate each question
        for (let i = 0; i < newTest.questions.length; i++) {
            const question = newTest.questions[i];
            if (!question.question.trim()) {
                toast({
                    title: 'Error',
                    description: `Question ${i + 1} is empty`,
                    variant: 'destructive'
                });
                return false;
            }

            if (question.options.length < 2) {
                toast({
                    title: 'Error',
                    description: `Question ${i + 1} must have at least 2 options`,
                    variant: 'destructive'
                });
                return false;
            }

            // Check if at least one option has text
            const hasValidOption = question.options.some(opt => opt.text?.trim());
            if (!hasValidOption) {
                toast({
                    title: 'Error',
                    description: `Question ${i + 1} must have at least one option with text`,
                    variant: 'destructive'
                });
                return false;
            }

            if (question.marks < 1) {
                toast({
                    title: 'Error',
                    description: `Question ${i + 1} must have at least 1 mark`,
                    variant: 'destructive'
                });
                return false;
            }
        }

        return true;
    };

    const handleSaveDraft = async () => {
        if (!selectedBatch) {
            toast({
                title: 'Error',
                description: 'Please select a batch first',
                variant: 'destructive'
            });
            return;
        }

        if (!validateTest()) {
            return;
        }

        try {
            const testData = {
                ...newTest,
                batch: selectedBatch,
                adminId: admin?._id
            };
            await createTest(testData);
            toast({
                title: 'Success',
                description: 'Test saved as draft successfully'
            });
            // Reset form
            setNewTest({
                title: '',
                description: '',
                duration: 60,
                questions: []
            });
            setSelectedBatch('');
            // Reload tests if we're on the same batch
            if (batchId === selectedBatch) {
                loadTests(selectedBatch);
            }
        } catch (error) {
            console.error('Error saving test:', error);
            toast({
                title: 'Error',
                description: 'Failed to save test. Please try again.',
                variant: 'destructive'
            });
        }
    };

    const handlePublishTest = async (testId: string) => {
        try {
            await publishTest(testId, admin?._id!);
            loadTests(selectedBatch);
            toast({
                title: 'Success',
                description: 'Test published successfully'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to publish test',
                variant: 'destructive'
            });
        }
    };

    const handleStartTest = async (testId: string) => {
        try {
            await startTest(testId, admin?._id!);
            loadTests(selectedBatch);
            toast({
                title: 'Success',
                description: 'Test started successfully'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to start test',
                variant: 'destructive'
            });
        }
    };

    const handleEndTest = async (testId: string) => {
        try {
            await endTest(testId, admin?._id!);
            loadTests(selectedBatch);
            toast({
                title: 'Success',
                description: 'Test ended successfully'
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to end test',
                variant: 'destructive'
            });
        }
    };

    const addQuestion = () => {
        const newQuestion: Question = {
            question: '',
            options: [
                { text: '' },
                { text: '' },
                { text: '' },
                { text: '' }
            ],
            correctAnswer: 0,
            marks: 1
        };
        setNewTest({
            ...newTest,
            questions: [...newTest.questions, newQuestion]
        });
    };

    const updateQuestion = (index: number, question: Question) => {
        const updatedQuestions = [...newTest.questions];
        updatedQuestions[index] = question;
        setNewTest({
            ...newTest,
            questions: updatedQuestions
        });
    };

    const deleteQuestion = (index: number) => {
        const updatedQuestions = newTest.questions.filter((_, i) => i !== index);
        setNewTest({
            ...newTest,
            questions: updatedQuestions
        });
    };

    if (!isLoggedIn || !admin) {
        return <div className="container mx-auto p-6">Please login to access tests</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Create/Edit Test Form */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">
                            {editingTest ? 'Edit Test' : 'Create New Test'}
                        </h1>
                        {editingTest && (
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setEditingTest(null);
                                    setNewTest({
                                        title: '',
                                        description: '',
                                        duration: 60,
                                        questions: []
                                    });
                                    setSelectedTest(null);
                                }}
                            >
                                Cancel Edit
                            </Button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="batch">Select Batch</Label>
                            <Select
                                value={selectedBatch}
                                onValueChange={setSelectedBatch}
                                disabled={!!editingTest}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a batch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {batches.map((batch) => (
                                        <SelectItem key={batch._id} value={batch._id}>
                                            {batch.name} ({batch.batchCode})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={newTest.title}
                                onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={newTest.description}
                                onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input
                                id="duration"
                                type="number"
                                value={newTest.duration}
                                onChange={(e) => setNewTest({ ...newTest, duration: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Questions</h3>
                                <Button onClick={addQuestion}>Add Question</Button>
                            </div>
                            {newTest.questions.map((question, index) => (
                                <TestQuestionForm
                                    key={index}
                                    question={question}
                                    onChange={(q) => updateQuestion(index, q)}
                                    onDelete={() => deleteQuestion(index)}
                                />
                            ))}
                        </div>

                        <Button 
                            onClick={editingTest ? handleUpdateTest : handleSaveDraft}
                            className="w-full"
                        >
                            {editingTest ? 'Update Test' : 'Save as Draft'}
                        </Button>
                    </div>
                </div>

                {/* Test List */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Existing Tests</h2>
                    <div className="space-y-4">
                        {tests.map((test) => (
                            <Card key={test._id}>
                                <CardHeader>
                                    <CardTitle>{test.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-500 mb-4">{test.description}</p>
                                    <div className="space-y-2">
                                        <p>Status: <span className="font-semibold">{test.status}</span></p>
                                        <p>Duration: <span className="font-semibold">{test.duration} minutes</span></p>
                                        <p>Total Marks: <span className="font-semibold">{test.totalMarks}</span></p>
                                        <p>Questions: <span className="font-semibold">{test.questions.length}</span></p>
                                        <p>Submissions: <span className="font-semibold">{test.submissions.length}</span></p>
                                    </div>
                                    <div className="mt-4 space-x-2">
                                        {test.status === 'draft' && (
                                            <>
                                                <Button onClick={() => handleEditTest(test)}>Edit</Button>
                                                <Button onClick={() => handlePublishTest(test._id)}>Publish</Button>
                                                <Button 
                                                    variant="destructive"
                                                    onClick={() => handleDeleteTest(test._id)}
                                                >
                                                    Delete
                                                </Button>
                                            </>
                                        )}
                                        {test.status === 'published' && (
                                            <Button onClick={() => handleStartTest(test._id)}>Start</Button>
                                        )}
                                        {test.status === 'started' && (
                                            <Button onClick={() => handleEndTest(test._id)}>End</Button>
                                        )}
                                        {test.status === 'ended' && (
                                            <Button onClick={() => setSelectedTest(test)}>View Results</Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {selectedTest?.status === 'ended' && selectedTest.submissions.length > 0 && (
                        <div className="mt-8">
                            <TestLeaderboard testId={selectedTest._id} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 