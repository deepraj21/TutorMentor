
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "../contexts/AuthContext";
import { ArrowLeft, FileText, BookOpen, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Mock material content data
const getMaterialData = (materialId: string) => {
  switch (materialId) {
    case 'mat-1':
      return {
        title: "Example (12th CS)",
        type: "lecture",
        content: "# Computer Science Fundamentals\n\nThis lecture covers the basic principles of computer science including algorithms, data structures, and programming paradigms.\n\n## Topics Covered\n\n- Introduction to Algorithms\n- Basic Data Structures\n- Object-Oriented Programming"
      };
    case 'mat-2':
      return {
        title: "Homework Assignment",
        type: "assignment",
        content: "# Homework Assignment 1\n\nComplete the following exercises by the next class:\n\n1. Implement a simple calculator program\n2. Create a function that sorts an array using bubble sort\n3. Write a short essay on the importance of code documentation"
      };
    case 'mat-3':
      return {
        title: "Example (Revision hour)",
        type: "revision",
        content: "# Exam Revision\n\nUse this document to prepare for the upcoming exam.\n\n## Key Concepts to Review\n\n- Variables and data types\n- Control structures (if-else, loops)\n- Functions and parameters\n- Arrays and basic operations\n\n## Practice Questions\n\n1. What is the difference between a while loop and a for loop?\n2. Explain the concept of recursion with an example."
      };
    default:
      return {
        title: "Material Content",
        type: "document",
        content: "No content available for this material."
      };
  }
};

const MaterialDetail = () => {
  const { classId, materialId } = useParams<{ classId: string; materialId: string }>();
  const { role } = useAuth();
  const { toast } = useToast();
  
  const materialData = getMaterialData(materialId || '');
  const [content, setContent] = useState(materialData.content);
  
  const handleSave = () => {
    // In a real app, this would save to a backend
    toast({
      title: "Changes saved",
      description: "Your changes have been saved successfully.",
    });
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'lecture':
        return <BookOpen className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header title={materialData.title} />
      
      <main className="flex-1 container max-w-6xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link to={`/materials/${classId}`} className="inline-flex items-center text-sm text-education-600 mb-4 hover:text-education-800 transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to materials
          </Link>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {getIconForType(materialData.type)}
              <h2 className="text-2xl font-bold text-gray-800 ml-2">{materialData.title}</h2>
              <span className="ml-4 px-2 py-1 bg-education-100 text-education-800 text-xs uppercase rounded-md font-semibold">
                {materialData.type}
              </span>
            </div>
            
            {role === "teacher" && (
              <Button onClick={handleSave} className="bg-education-600 hover:bg-education-700">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        </div>
        
        <Card className="mb-6 shadow-sm">
          <CardContent className="p-6">
            {role === "teacher" ? (
              <Textarea
                className="min-h-[400px] font-mono"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            ) : (
              <div className="prose max-w-none">
                {content.split('\n').map((line, idx) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={idx} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={idx} className="text-xl font-bold mt-4 mb-2">{line.substring(3)}</h2>;
                  } else if (line.startsWith('- ')) {
                    return <li key={idx} className="ml-4">{line.substring(2)}</li>;
                  } else if (line.match(/^\d+\. /)) {
                    return <li key={idx} className="ml-4">{line.substring(line.indexOf(' ') + 1)}</li>;
                  } else if (line === '') {
                    return <br key={idx} />;
                  } else {
                    return <p key={idx} className="my-2">{line}</p>;
                  }
                })}
              </div>
            )}
          </CardContent>
        </Card>
        
        {materialData.type === "assignment" && (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Submit Your Work</h3>
              <Textarea 
                placeholder={role === "student" ? "Type your answer here..." : "Students will submit their work here."} 
                className="min-h-[150px]"
                disabled={role !== "student"}
              />
              {role === "student" && (
                <Button className="mt-4 bg-education-600 hover:bg-education-700">
                  Submit Assignment
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default MaterialDetail;
