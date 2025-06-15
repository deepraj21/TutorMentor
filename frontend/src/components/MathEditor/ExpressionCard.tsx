import { useState } from "react";
import { Edit, Trash2, Download, LineChart, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MathRenderer } from "@/components/MathEditor/MathRenderer";
import { GraphRenderer } from "@/components/MathEditor/GraphRenderer";
import html2canvas from "html2canvas";
import { toast } from "sonner";

export interface Expression {
  id: string;
  type: 'math' | 'graph';
  content: string;
  title?: string;
}

interface ExpressionCardProps {
  expression: Expression;
  onUpdate: (updates: Partial<Expression>) => void;
  onDelete: () => void;
}

export function ExpressionCard({ expression, onUpdate, onDelete }: ExpressionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(expression.content);
  const [editTitle, setEditTitle] = useState(expression.title || "");

  const saveEdit = () => {
    onUpdate({ 
      content: editContent, 
      title: editTitle || undefined 
    });
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditContent(expression.content);
    setEditTitle(expression.title || "");
    setIsEditing(false);
  };

  const exportExpression = async () => {
    try {
      const element = document.getElementById(`expression-${expression.id}`);
      if (!element) return;
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `${expression.title || 'expression'}-${expression.id}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success("Expression exported successfully!");
    } catch (error) {
      toast.error("Failed to export expression");
      console.error('Export error:', error);
    }
  };

  return (
    <Card 
      id={`expression-${expression.id}`}
      className="border-none"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {expression.type === 'math' ? (
              <Calculator className="h-5 w-5 text-blue-600" />
            ) : (
              <LineChart className="h-5 w-5 text-green-600" />
            )}
            {isEditing ? (
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Expression title (optional)"
                className="h-8 text-sm font-medium"
              />
            ) : (
              <h3 className="font-medium">
                {expression.title || `${expression.type === 'math' ? 'Math' : 'Graph'} Expression`}
              </h3>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={exportExpression}
              className="h-8 w-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {expression.type === 'math' ? 'LaTeX Expression' : 'Function (e.g., x^2, sin(x))'}
              </label>
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder={expression.type === 'math' ? '\\frac{d}{dx}(x^2) = 2x' : 'x^2'}
                className="font-mono"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveEdit} size="sm" className="bg-education-600 hover:bg-education-700">
                Save
              </Button>
              <Button onClick={cancelEdit} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            {expression.type === 'math' ? (
              <MathRenderer content={expression.content} />
            ) : (
              <GraphRenderer expression={expression.content} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
