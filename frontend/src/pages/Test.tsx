import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, Users, Calendar, Check, X, Edit, Search } from 'lucide-react';
import Header from "../components/layout/Header";
import noTest from "@/assets/no-class.png"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from 'sonner';

interface Test {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  questionIds: string[];
  status: 'draft' | 'published' | 'started' | 'ended';
  createdAt: Date;
  startTime?: Date;
  endTime?: Date;
}

const TestManagement = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    duration: 60,
    questionIds: ['']
  });

  const handleCreateTest = () => {
    if (!newTest.title.trim()) {
      toast.error("Please enter a test title");
      return;
    }
    const test: Test = {
      id: `test_${Date.now()}`,
      title: newTest.title,
      description: newTest.description,
      duration: newTest.duration,
      questionIds: newTest.questionIds.filter(id => id.trim()),
      status: 'draft',
      createdAt: new Date()
    };
    setTests([...tests, test]);
    setNewTest({ title: '', description: '', duration: 60, questionIds: [''] });
    setDialogOpen(false);
    toast.success(`Test "${test.title}" created successfully`);
  };

  const handleEditTest = () => {
    if (!editingTest || !newTest.title.trim()) {
      toast.error("Please enter a test title");
      return;
    }
    const updatedTests = tests.map(test => {
      if (test.id === editingTest.id) {
        return {
          ...test,
          title: newTest.title,
          description: newTest.description,
          duration: newTest.duration,
          questionIds: newTest.questionIds.filter(id => id.trim())
        };
      }
      return test;
    });
    setTests(updatedTests);
    setNewTest({ title: '', description: '', duration: 60, questionIds: [''] });
    setEditingTest(null);
    setDialogOpen(false);
    toast.success(`Test "${newTest.title}" updated successfully`);
  };

  const startEdit = (test: Test) => {
    setEditingTest(test);
    setNewTest({
      title: test.title,
      description: test.description,
      duration: test.duration,
      questionIds: test.questionIds.length > 0 ? test.questionIds : ['']
    });
    setDialogOpen(true);
  };

  const cancelEdit = () => {
    setEditingTest(null);
    setNewTest({ title: '', description: '', duration: 60, questionIds: [''] });
    setDialogOpen(false);
  };

  const updateTestStatus = (testId: string, newStatus: Test['status']) => {
    setTests(tests.map(test => {
      if (test.id === testId) {
        const updatedTest = { ...test, status: newStatus };
        if (newStatus === 'started') {
          updatedTest.startTime = new Date();
        } else if (newStatus === 'ended') {
          updatedTest.endTime = new Date();
        }
        return updatedTest;
      }
      return test;
    }));

    toast.success("Status Updated",{
      description: `Test status changed to ${newStatus}`,
    });
  };

  const getStatusColor = (status: Test['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'published': return 'bg-blue-500';
      case 'started': return 'bg-green-500';
      case 'ended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const addQuestionId = () => {
    setNewTest({
      ...newTest,
      questionIds: [...newTest.questionIds, '']
    });
  };

  const removeQuestionId = (index: number) => {
    const updated = newTest.questionIds.filter((_, i) => i !== index);
    setNewTest({ ...newTest, questionIds: updated });
  };

  const updateQuestionId = (index: number, value: string) => {
    const updated = [...newTest.questionIds];
    updated[index] = value;
    setNewTest({ ...newTest, questionIds: updated });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header title="Test Series" />
      <main className="flex-1 container max-w-6xl mx-auto py-8 px-4 bg-background max-h-[calc(100vh-75px)] overflow-y-scroll no-scrollbar">
        <div className="flex justify-between items-center mb-8">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => { setDialogOpen(true); setEditingTest(null); setNewTest({ title: '', description: '', duration: 60, questionIds: [''] }); }}
                className="bg-education-600 hover:bg-education-700" size="sm"
                disabled={editingTest !== null}
              >
                <Plus className="h-4 w-4" />
                <span className='hidden md:block'>Create Test</span>
                
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader className='border-b p-6'>
                <DialogTitle>{editingTest ? 'Edit Test' : 'Create New Test'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4 p-6 max-h-[18rem] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Test Title</Label>
                    <Input
                      id="title"
                      value={newTest.title}
                      onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                      placeholder="Enter test title"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newTest.duration}
                      onChange={(e) => setNewTest({ ...newTest, duration: parseInt(e.target.value) || 60 })}
                      placeholder="60"
                      className="mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTest.description}
                    onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                    placeholder="Enter test description"
                    className="mt-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Question IDs</Label>
                    <Button type="button" onClick={addQuestionId} size="sm" variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {newTest.questionIds.map((id, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={id}
                          onChange={(e) => updateQuestionId(index, e.target.value)}
                          placeholder="Enter question ID (e.g., q_1234567890)"
                          className="flex-1"
                        />
                        {newTest.questionIds.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeQuestionId(index)}
                            size="sm"
                            variant="outline"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter className="p-6 border-t">
                <Button variant="outline" onClick={cancelEdit} className='hidden md:block'>
                  Cancel
                </Button>
                <Button
                  onClick={editingTest ? handleEditTest : handleCreateTest}
                 className="bg-education-600 hover:bg-education-700"
                >
                  {editingTest ? 'Update Test' : 'Create Test'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="mr-[2px] flex items-center border rounded-md focus-within:ring-0 focus-within:border-education-600">
            <Search className="h-4 w-4 ml-2 text-muted-foreground" />
            <Input
              placeholder="Search tests..."
              // value={searchQuery}
              // onChange={(e) => handleSearch(e.target.value)}
              className="w-[200px] md:w-[300px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{test.title}</CardTitle>
                    <CardDescription className="mt-1">{test.description}</CardDescription>
                  </div>
                  <Badge className={`${getStatusColor(test.status)} text-white`}>
                    {test.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {test.duration} minutes
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {test.questionIds.length} questions
                    </div>
                  </div>

                  <div className="text-sm text-gray-500">
                    ID: {test.id}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {test.status === 'draft' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => startEdit(test)}
                          variant="outline"
                          className="bg-yellow-50 hover:bg-yellow-100 border-yellow-300"
                          disabled={editingTest !== null}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateTestStatus(test.id, 'published')}
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          Publish
                        </Button>
                      </>
                    )}
                    {test.status === 'published' && (
                      <Button
                        size="sm"
                        onClick={() => updateTestStatus(test.id, 'started')}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        Start Test
                      </Button>
                    )}
                    {test.status === 'started' && (
                      <Button
                        size="sm"
                        onClick={() => updateTestStatus(test.id, 'ended')}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        End Test
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tests.length === 0 && (
          <div className="flex flex-col items-center justify-center  text-center">
            <img src={noTest} alt="" className="h-80 w-80 dark:invert" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Tests Yet</h3>
            <p className="text-muted-foreground mb-4">Create your first test paper to get started</p>
              <Button
                className="bg-education-600 hover:bg-education-700"
                onClick={() => { setDialogOpen(true); setEditingTest(null); setNewTest({ title: '', description: '', duration: 60, questionIds: [''] }); }}
              >
                <Plus className="h-4 w-4" />
                Add Your first test
              </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default TestManagement;