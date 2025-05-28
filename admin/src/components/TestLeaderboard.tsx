import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getTestResults } from '@/utils/api';
import { TestSubmission } from '@/types/test';
import { Trophy, Medal } from 'lucide-react';

interface TestResults {
    test: {
        title: string;
        totalMarks: number;
        status: string;
    };
    submissions: (TestSubmission & {
        student: {
            name: string;
            email: string;
        };
    })[];
}

interface TestLeaderboardProps {
    testId: string;
}

export function TestLeaderboard({ testId }: TestLeaderboardProps) {
    const [results, setResults] = useState<TestResults | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await getTestResults(testId);
                setResults(data);
                setError(null);
            } catch (err) {
                setError('Failed to load test results');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [testId]);

    if (loading) {
        return <div>Loading results...</div>;
    }

    if (error || !results) {
        return <div className="text-red-500">{error || 'Failed to load results'}</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    Leaderboard - {results.test.title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Rank</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Percentage</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {results.submissions.map((submission, index) => (
                            <TableRow key={submission.student.email}>
                                <TableCell className="font-medium">
                                    {index === 0 ? (
                                        <Medal className="h-5 w-5 text-yellow-500" />
                                    ) : index === 1 ? (
                                        <Medal className="h-5 w-5 text-gray-400" />
                                    ) : index === 2 ? (
                                        <Medal className="h-5 w-5 text-amber-700" />
                                    ) : (
                                        index + 1
                                    )}
                                </TableCell>
                                <TableCell>{submission.student.name}</TableCell>
                                <TableCell>{submission.totalMarksObtained}/{results.test.totalMarks}</TableCell>
                                <TableCell>
                                    {((submission.totalMarksObtained / results.test.totalMarks) * 100).toFixed(1)}%
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
} 