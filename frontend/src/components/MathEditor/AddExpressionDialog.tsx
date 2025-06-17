import { useState } from "react";
import { Calculator, LineChart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MathRenderer } from "@/components/MathEditor/MathRenderer";
import { GraphRenderer } from "@/components/MathEditor/GraphRenderer";

export interface Expression {
  _id: string;
  type: 'math' | 'graph';
  content: string;
  title?: string;
}

interface AddExpressionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (expression: Omit<Expression, '_id'>) => void;
}

export function AddExpressionDialog({ open, onOpenChange, onAdd }: AddExpressionDialogProps) {
  const [type, setType] = useState<'math' | 'graph'>('math');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!content.trim()) return;
    
    onAdd({
      type,
      title: title.trim() || undefined,
      content: content.trim(),
    });
    
    // Reset form
    setTitle('');
    setContent('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTitle('');
    setContent('');
    onOpenChange(false);
  };

  const mathExamples = [
    // Basic Operations
    { label: 'Fraction', value: '\\frac{a}{b}' },
    { label: 'Square Root', value: '\\sqrt{x}' },
    { label: 'Cube Root', value: '\\sqrt[3]{x}' },
    { label: 'Power', value: 'x^{n}' },
    { label: 'Subscript', value: 'x_{n}' },
    
    // Calculus
    { label: 'Integral', value: '\\int_{a}^{b} f(x) dx' },
    { label: 'Double Integral', value: '\\iint_{D} f(x,y) dA' },
    { label: 'Derivative', value: '\\frac{d}{dx}f(x)' },
    { label: 'Partial Derivative', value: '\\frac{\\partial f}{\\partial x}' },
    { label: 'Limit', value: '\\lim_{x \\to \\infty} f(x)' },
    
    // Summations & Products
    { label: 'Sum', value: '\\sum_{i=1}^{n} i' },
    { label: 'Product', value: '\\prod_{i=1}^{n} i' },
    { label: 'Infinite Sum', value: '\\sum_{n=0}^{\\infty} \\frac{1}{n!}' },
    
    // Matrices & Vectors
    { label: '2x2 Matrix', value: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
    { label: '3x3 Matrix', value: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}' },
    { label: 'Determinant', value: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}' },
    { label: 'Vector', value: '\\vec{v} = \\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix}' },
    
    // Greek Letters & Symbols
    { label: 'Greek Letters', value: '\\alpha, \\beta, \\gamma, \\delta, \\theta, \\lambda, \\pi, \\sigma' },
    { label: 'Infinity', value: '\\infty' },
    { label: 'Plus/Minus', value: '\\pm' },
    { label: 'Approximately', value: '\\approx' },
    { label: 'Not Equal', value: '\\neq' },
    { label: 'Less/Greater', value: '\\leq, \\geq' },
    
    // Sets & Logic
    { label: 'Set Notation', value: 'A = \\{x \\in \\mathbb{R} : x > 0\\}' },
    { label: 'Union/Intersection', value: 'A \\cup B, A \\cap B' },
    { label: 'Subset', value: 'A \\subseteq B' },
    { label: 'Element Of', value: 'x \\in A' },
    { label: 'Real Numbers', value: '\\mathbb{R}, \\mathbb{N}, \\mathbb{Z}, \\mathbb{Q}, \\mathbb{C}' },
    
    // Functions & Equations
    { label: 'Quadratic Formula', value: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}' },
    { label: 'Trigonometry', value: '\\sin^2(x) + \\cos^2(x) = 1' },
    { label: 'Logarithm', value: '\\log_a(x) = \\frac{\\ln(x)}{\\ln(a)}' },
    { label: 'Binomial Theorem', value: '(a+b)^n = \\sum_{k=0}^{n} \\binom{n}{k} a^{n-k}b^k' },
    { label: 'Euler\'s Formula', value: 'e^{i\\pi} + 1 = 0' },
  ];

  const graphExamples = [
    // Basic Functions
    { label: 'Linear', value: '2*x + 1' },
    { label: 'Parabola', value: 'x^2' },
    { label: 'Cubic', value: 'x^3 - 2*x' },
    { label: 'Quartic', value: 'x^4 - 4*x^2 + 1' },
    { label: 'Square Root', value: 'sqrt(x)' },
    { label: 'Absolute Value', value: 'abs(x)' },
    
    // Trigonometric Functions
    { label: 'Sine', value: 'sin(x)' },
    { label: 'Cosine', value: 'cos(x)' },
    { label: 'Tangent', value: 'tan(x)' },
    { label: 'Sine Wave', value: '2*sin(3*x + 1)' },
    { label: 'Cosine Wave', value: 'cos(2*x) + sin(x)' },
    
    // Exponential & Logarithmic
    { label: 'Exponential', value: 'exp(x)' },
    { label: 'Natural Log', value: 'log(x)' },
    { label: 'Exponential Decay', value: 'exp(-x)' },
    { label: 'Growth Function', value: '2^x' },
    { label: 'Log Base 10', value: 'log(x)/log(10)' },
    
    // Rational Functions
    { label: 'Reciprocal', value: '1/x' },
    { label: 'Rational', value: '(x^2 - 1)/(x^2 + 1)' },
    { label: 'Hyperbola', value: '1/(x^2)' },
    
    // Advanced Functions
    { label: 'Gaussian', value: 'exp(-x^2/2)' },
    { label: 'Sigmoid', value: '1/(1 + exp(-x))' },
    { label: 'Step Function', value: 'x > 0 ? 1 : 0' },
    { label: 'Piecewise', value: 'x < 0 ? x^2 : -x^2' },
    
    // Combinations
    { label: 'Trig + Poly', value: 'x^2 * sin(x)' },
    { label: 'Exp + Trig', value: 'exp(-x) * cos(x)' },
    { label: 'Complex Wave', value: 'sin(x) + sin(2*x)/2 + sin(3*x)/3' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>Add New Expression</DialogTitle>
        </DialogHeader>
        <div className="py-4 p-6 max-h-[18rem] overflow-y-auto">
          <Tabs value={type} onValueChange={(value) => setType(value as 'math' | 'graph')}>
            <TabsList className="grid w-full grid-cols-2 p-1">
              <TabsTrigger value="math" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Math Expression
              </TabsTrigger>
              <TabsTrigger value="graph" className="flex items-center gap-2">
                <LineChart className="h-4 w-4" />
                Graph
              </TabsTrigger>
            </TabsList>

            <TabsContent value="math" className="space-y-4">
              <div>
                <Label htmlFor="math-title">Title (optional)</Label>
                <Input
                  id="math-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Quadratic Formula"
                />
              </div>

              <div>
                <Label htmlFor="math-content">LaTeX Expression</Label>
                <Input
                  id="math-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="e.g., \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}"
                  className="font-mono"
                />
              </div>

              <div>
                <Label>Quick Examples</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                  {mathExamples.map((example) => (
                    <Button
                      key={example.label}
                      variant="outline"
                      size="sm"
                      onClick={() => setContent(example.value)}
                      className="text-xs justify-start h-8"
                    >
                      {example.label}
                    </Button>
                  ))}
                </div>
              </div>

              {content && (
                <div>
                  <Label>Preview</Label>
                  <div className="border rounded-lg p-4">
                    <MathRenderer content={content} />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="graph" className="space-y-4">
              <div>
                <Label htmlFor="graph-title">Title (optional)</Label>
                <Input
                  id="graph-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Parabola"
                />
              </div>

              <div>
                <Label htmlFor="graph-content">Function</Label>
                <Input
                  id="graph-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="e.g., x^2, sin(x), log(x)"
                  className="font-mono"
                />
              </div>

              <div>
                <Label>Quick Examples</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto">
                  {graphExamples.map((example) => (
                    <Button
                      key={example.label}
                      variant="outline"
                      size="sm"
                      onClick={() => setContent(example.value)}
                      className="text-xs justify-start h-8"
                    >
                      {example.label}
                    </Button>
                  ))}
                </div>
              </div>

              {content && (
                <div>
                  <Label>Preview</Label>
                    <div className="border rounded-lg p-4 bg-gray-50 w-full">
                    <GraphRenderer expression={content} width={400} height={200} />
                    </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
          <DialogFooter className="p-6 border-t">
          <Button variant="outline" onClick={handleCancel} className="hidden md:block">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!content.trim()}
          >
            Add Expression
          </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
