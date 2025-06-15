import { useEffect, useRef } from 'react';
import functionPlot from 'function-plot';

interface GraphRendererProps {
  expression: string;
  width?: number;
  height?: number;
}

export function GraphRenderer({ expression, width = 300, height = 300 }: GraphRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Clear previous graph
      containerRef.current.innerHTML = '';

      // Add a transparent background to make grid lines visible
      functionPlot({
        target: containerRef.current,
        width,
        height,
        grid: true,
        xAxis: {
          label: 'x',
          domain: [-10, 10]
        },
        yAxis: {
          label: 'y',
          domain: [-10, 10]
        },
        data: [{
          fn: expression,
          color: '#3b82f6',
          graphType: 'polyline'
        }]
      });
    } catch (error) {
      console.error('Graph rendering error:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <div style="
            width: ${width}px; 
            height: ${height}px; 
            background: transparent; 
            border: 1px solid #fecaca; 
            border-radius: 8px; 
            display: flex; 
            flex-direction: column; 
            justify-content: center; 
            align-items: center; 
            text-align: center;
            padding: 20px;
          ">
            <p style="color: #dc2626; font-weight: 600; margin-bottom: 8px;">Error rendering graph</p>
            <p style="color: #7f1d1d; font-size: 14px; margin-bottom: 12px;">Please check your function syntax</p>
            <code style="background: #fee2e2; padding: 8px; border-radius: 4px; font-size: 12px;">${expression}</code>
          </div>
        `;
      }
    }
  }, [expression, width, height]);

  return (
    <div
      ref={containerRef}
      className="flex justify-center"
      style={{ background: 'transparent' }}
    />
  );
}
