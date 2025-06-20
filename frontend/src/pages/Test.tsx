
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, Users, Calendar, Check, X, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [isCreating, setIsCreating] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    duration: 60,
    questionIds: ['']
  });
  const { toast } = useToast();

  const handleCreateTest = () => {
    if (!newTest.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a test title",
        variant: "destructive"
      });
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
    setIsCreating(false);
    
    toast({
      title: "Success",
      description: `Test "${test.title}" created successfully`,
    });
  };

  const handleEditTest = () => {
    if (!editingTest || !newTest.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a test title",
        variant: "destructive"
      });
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
    
    toast({
      title: "Success",
      description: `Test "${newTest.title}" updated successfully`,
    });
  };

  const startEdit = (test: Test) => {
    setEditingTest(test);
    setNewTest({
      title: test.title,
      description: test.description,
      duration: test.duration,
      questionIds: test.questionIds.length > 0 ? test.questionIds : ['']
    });
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setEditingTest(null);
    setNewTest({ title: '', description: '', duration: 60, questionIds: [''] });
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
    
    toast({
      title: "Status Updated",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Test Management</h1>
            <p className="text-gray-600">Create and manage your tests</p>
          </div>
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-blue-500 hover:bg-blue-600"
            disabled={editingTest !== null}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Test
          </Button>
        </div>

        {(isCreating || editingTest) && (
          <Card className="mb-8 border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle>{editingTest ? 'Edit Test' : 'Create New Test'}</CardTitle>
              <CardDescription>
                {editingTest ? 'Update your test configuration' : 'Set up your test configuration'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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

              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={editingTest ? cancelEdit : () => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={editingTest ? handleEditTest : handleCreateTest} 
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {editingTest ? 'Update Test' : 'Create Test'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                          disabled={editingTest !== null || isCreating}
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

        {tests.length === 0 && !isCreating && !editingTest && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <BookOpen className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No tests created yet</h3>
            <p className="text-gray-600 mb-4">Start by creating your first test.</p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Test
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestManagement;