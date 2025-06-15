import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathRendererProps {
  content: string;
  inline?: boolean;
}

export function MathRenderer({ content, inline = false }: MathRendererProps) {
  try {
    if (inline) {
      return <InlineMath math={content} />;
    }
    return (
      <div className="text-center py-4">
        <BlockMath math={content} />
      </div>
    );
  } catch (error) {
    console.error('Math rendering error:', error);
    return (
      <div className="border border-red-200 rounded p-4 text-center bg-transparent">
        <p className="text-red-700 font-medium">Error rendering math expression</p>
        <p className="text-red-600 text-sm mt-1">Please check your LaTeX syntax</p>
        <code className="block mt-2 text-sm p-2 rounded bg-transparent">{content}</code>
      </div>
    );
  }
}
