import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Test, TestSubmission } from '@/types/test';
import { getBatchTests, getTest, submitTest, getTestResults } from '@/utils/api';
import { toast } from 'sonner';
import { Clock, Lock, CheckCircle2, XCircle, AlertCircle, FileArchiveIcon, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SearchBar from '@/components/SearchBar/SearchBar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export default function TestsPage() {
    const [tests, setTests] = useState<Test[]>([]);
    const [selectedTest, setSelectedTest] = useState<Test | null>(null);
    const [answers, setAnswers] = useState<{ [key: number]: number }>({});
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [submission, setSubmission] = useState<TestSubmission | null>(null);
    const [testResults, setTestResults] = useState<{
        test: { title: string; totalMarks: number };
        submission: TestSubmission;
    } | null>(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    const batchId = localStorage.getItem('batchId');
    const userId = localStorage.getItem('studentId');

    useEffect(() => {
        if (batchId) {
            loadTests();
        }
    }, [batchId]);

    useEffect(() => {
        if (selectedTest?.status === 'started' && !submission && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit(); // Auto-submit when time is 0 or less
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        } else if (selectedTest?.status === 'started' && !submission && timeLeft <= 0) {
             // If timeLeft is already 0 or less on load, auto-submit
             handleSubmit();
        }
    }, [selectedTest, submission, timeLeft]);

    const loadTests = async () => {
        try {
            const data = await getBatchTests(batchId!);
            setTests(data);
        } catch (error) {
            toast.error('Failed to load tests');
        }
    };

    const handleStartTest = async (test: Test) => {
        if (!userId) {
            toast.error('User not logged in');
            return;
        }

        try {
            const testData = await getTest(test._id);
            
            // Check if user has already submitted
            const existingSubmission = testData.submissions.find(
                sub => sub.student.toString() === userId
            );

            if (existingSubmission) {
                toast.info('You have already submitted this test');
                handleViewResults(testData);
                return;
            }

            setSelectedTest(testData);
            setAnswers({});
            setSubmission(null);
            setTestResults(null); // Clear previous results

            if (testData.status === 'started') {
                const endTime = new Date(testData.endTime!).getTime();
                const now = new Date().getTime();
                const remainingTime = Math.max(0, Math.floor((endTime - now) / 1000));
                setTimeLeft(remainingTime);
                if (remainingTime <= 0) {
                    // If the test has already ended based on time, auto-submit
                    handleSubmit();
                }
            } else if (testData.status === 'ended') {
                 // If status is ended on click, show results directly
                 handleViewResults(testData);
            }

        } catch (error) {
             console.error('Error starting test:', error);
            toast.error('Failed to load test. Please try again');
        }
    };

    const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: optionIndex
        }));
    };

    const handleSubmit = async () => {
        if (!selectedTest || !userId) return;

        // Prevent multiple submissions
        if (submission) {
             toast.info('You have already submitted this test');
            return;
        }

        try {
            const answerArray = Object.entries(answers).map(([questionIndex, selectedOption]) => ({
                questionIndex: parseInt(questionIndex),
                selectedOption
            }));

            const result = await submitTest(selectedTest._id, {
                answers: answerArray,
                userId
            });

            // After successful submission, load and show results
            handleViewResults(selectedTest);

            toast.success('Test submitted successfully');
        } catch (error) {
             console.error('Error submitting test:', error);
             if (axios.isAxiosError(error) && error.response?.status === 400 && error.response.data?.message === 'You have already submitted this test') {
                toast.info('You have already submitted this test');
                 handleViewResults(selectedTest);
            } else {
                toast.error('Failed to submit test. Please try again');
            }
        }
    };

    const handleViewResults = async (test: Test) => {
         if (!userId) {
            toast.error('User not logged in');
            return;
        }
        try {
            const results = await getTestResults(test._id, userId || '');
            setTestResults(results);
            setSelectedTest(test); // Still keep selectedTest for context
             setSubmission(results.submission); // Set the submission state
        } catch (error) {
             console.error('Error viewing results:', error);
            toast.error('Failed to load test results');
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getTestStatus = (test: Test) => {
        if (test.status === 'draft') return 'Draft';
        if (test.status === 'published') return 'Locked';
        if (test.status === 'started') return 'Active';
        if (test.status === 'ended') return 'Ended';
        return test.status;
    };

    const getTestStatusIcon = (test: Test) => {
        switch (test.status) {
            case 'published':
                return <Lock className="h-4 w-4" />;
            case 'started':
                return <Clock className="h-4 w-4" />;
            case 'ended':
                return <CheckCircle2 className="h-4 w-4" />;
            default:
                return null;
        }
    };

    if (!selectedTest) {
        return (
            <>
                <div className="fixed left-1/2 transform -translate-x-1/2 md:container w-[92%] pt-4 bg-white dark:bg-gray-900 rounded-[22px]">
                    <SearchBar
                        //   placeholder={t.searchPlaceholder}
                        //   value={searchQuery}
                        //   onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full shadow-lg rounded-[23px]"
                    />
                </div>
                <div className="container mx-auto p-8 pt-24">
                    <h1 className="text-xl mb-4 flex items-center">
                        <FileArchiveIcon className="h-5 w-5 mr-2 text-tutor-primary dark:text-tutor-accent" />
                        Test Series</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tests.map((test) => (
                            <Card key={test._id} className="hover:shadow-md transition-shadow h-full dark:bg-gray-800 dark:border-gray-700">
                                <CardHeader className='border-b dark:border-gray-700 p-4'>
                                    <CardTitle className="flex items-center justify-between">
                                        <span className='w-[70%] truncate'>{test.title}</span>
                                        <div
                                            className={`
                                            flex text-sm font-normal gap-1 items-center rounded-full pl-2 pr-1
                                            ${test.status === 'published'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                    : test.status === 'started'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : test.status === 'ended'
                                                            ? 'bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-200'
                                                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                                                }
                                        `}
                                        >
                                            {getTestStatus(test)}
                                            {getTestStatusIcon(test)}
                                        </div>
                                    </CardTitle>
                                    <p className="text-sm text-gray-500 mb-4 w-full truncate">{test.description}</p>
                                </CardHeader>
                                <CardContent className="flex flex-row py-6 p-4 justify-between">
                                    <div className="space-y-2">
                                        <p>Total Questions: <span className="font-semibold">{test.questions.length}</span></p>
                                        <p>Total Marks: <span className="font-semibold">{test.totalMarks}</span></p>
                                    </div>
                                    <p>Duration: <span className="font-semibold">{test.duration} </span>min</p>
                                </CardContent>
                                <CardFooter>
                                    {test.status === 'published' ? (
                                        <Button disabled className="w-full">
                                            <Lock className="h-4 w-4 mr-2" />
                                            Test Locked
                                        </Button>
                                    ) : test.status === 'started' ? (
                                        <Button onClick={() => handleStartTest(test)} className="w-full">
                                            <Clock className="h-4 w-4 mr-2" />
                                            Start Test
                                        </Button>
                                    ) : test.status === 'ended' ? (
                                        <Button
                                            onClick={() => handleViewResults(test)}
                                            className='w-full'
                                        >
                                            View Results
                                        </Button>
                                    ) : null}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className="container mx-auto pb-8">
            <div className="flex justify-between items-center fixed left-1/2 transform -translate-x-1/2 md:container w-[92%] bg-white dark:bg-gray-900 pb-4">
                <div className='flex gap-3 pt-4'>
                    <Button
                        onClick={() => setSelectedTest(null)}
                        size='icon'
                        variant='outline'
                        className='h-8 w-8'
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl">{selectedTest.title}</h1>
                </div>
                {selectedTest.status === 'started' && !submission && (
                    <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-red-500" />
                        <span className="text-lg font-semibold">{formatTime(timeLeft)}</span>
                    </div>
                )}
            </div>

            {selectedTest?.status === 'ended' && testResults && (
                <div className="pt-24 mb-8">
                    <Card className="hover:shadow-md transition-shadow h-full dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader className='p-4 border-b dark:border-gray-700'>
                            <CardTitle>Test Results</CardTitle>
                        </CardHeader>
                        <CardContent className='p-4'>
                            <div className="space-y-4">
                                <div>
                                    <div className='flex gap-2 items-end'>
                                        <h3 className="text-2xl font-medium">Score :</h3>
                                        <p className="text-xl">
                                            {testResults.submission.totalMarksObtained}/{testResults.test.totalMarks}
                                        </p>
                                    </div>
                                    <div className='flex gap-2 items-end'>
                                        <h3 className="text-2xl font-medium">Percentage :</h3>
                                        <p className="text-xl">
                                            {((testResults.submission.totalMarksObtained / testResults.test.totalMarks) * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium mb-2">Question-wise Results</h3>
                                    <div className="space-y-2">
                                        {testResults.submission.answers.map((answer, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                {answer.isCorrect ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-500" />
                                                )}
                                                <span>Question {index + 1}: {answer.marksObtained} marks</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {submission ? (
                <div className="space-y-6">
                    <Card className="hover:shadow-md transition-shadow h-full dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader className='p-4 border-b dark:border-gray-700 flex flex-row justify-between items-center'>
                            <CardTitle>Test Results</CardTitle>
                            <div className="text-center flex flex-row gap-3 items-end">
                                <h3 className="text-2xl font-semibold">Score :</h3>
                                <p className="text-xl text-tutor-primary">
                                    {submission.totalMarksObtained}/{selectedTest.totalMarks}
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className='p-4'>
                            <div className="space-y-4">
                                <div className="space-y-6">
                                    {selectedTest.questions.map((question, index) => {
                                        const answer = submission.answers[index];
                                        const isCorrect = answer.isCorrect;

                                        return (
                                            <div key={index} className="space-y-2">
                                                <div className="flex items-start gap-2">
                                                    {isCorrect ? (
                                                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                                                    ) : (
                                                        <XCircle className="h-5 w-5 text-red-500 mt-1" />
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="font-medium">{question.question}</p>
                                                        {question.questionImage && (
                                                            <img
                                                                src={question.questionImage}
                                                                alt="Question"
                                                                className="mt-2 max-w-md rounded-lg"
                                                            />
                                                        )}
                                                        <div className="mt-2 space-y-2">
                                                            {question.options.map((option, optIndex) => (
                                                                <div
                                                                    key={optIndex}
                                                                    className={`p-2 rounded-lg border dark:border-gray-700 ${optIndex === answer.selectedOption
                                                                            ? isCorrect
                                                                                ? 'bg-green-100 dark:bg-green-900'
                                                                                : 'bg-red-100 dark:bg-red-900'
                                                                            : optIndex === question.correctAnswer
                                                                                ? 'bg-green-100 dark:bg-green-900'
                                                                                : 'bg-gray-100 dark:bg-gray-800'
                                                                        }`}
                                                                >
                                                                    {option.text}
                                                                    {option.image && (
                                                                        <img
                                                                            src={option.image}
                                                                            alt="Option"
                                                                            className="mt-2 max-w-sm rounded-lg"
                                                                        />
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <p className="mt-2 text-sm">
                                                            Marks: {answer.marksObtained}/{question.marks}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="space-y-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                {selectedTest.questions.map((question, index) => (
                                    <div key={index} className="space-y-4">
                                        <p className="font-medium">
                                            Question {index + 1}: {question.question}
                                        </p>
                                        {question.questionImage && (
                                            <img
                                                src={question.questionImage}
                                                alt="Question"
                                                className="mt-2 max-w-md rounded-lg"
                                            />
                                        )}
                                        <RadioGroup
                                            value={answers[index]?.toString() || ''}
                                            onValueChange={(value) => handleAnswerSelect(index, parseInt(value))}
                                            className="space-y-2"
                                            disabled={selectedTest.status !== 'started' || !!submission}
                                        >
                                            {question.options.map((option, optIndex) => (
                                                <div key={optIndex} className="flex items-center space-x-2">
                                                     <RadioGroupItem value={optIndex.toString()} id={`q${index}-o${optIndex}`} />
                                                    <Label htmlFor={`q${index}-o${optIndex}`} className="flex-1 cursor-pointer">
                                                        {option.text}
                                                        {option.image && (
                                                            <img
                                                                src={option.image}
                                                                alt="Option"
                                                                className="mt-2 max-w-sm rounded-lg"
                                                            />
                                                        )}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button
                                variant="outline"
                                onClick={() => setSelectedTest(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={Object.keys(answers).length !== selectedTest.questions.length || selectedTest.status !== 'started' || !!submission}
                            >
                                Submit Test
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

        </div>
    );
}
