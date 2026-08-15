import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeSVGProps {
  value: string;
  width?: number;
  height?: number;
  fontSize?: number;
  displayValue?: boolean;
  lineColor?: string;
  className?: string;
}

export const BarcodeSVG: React.FC<BarcodeSVGProps> = ({
  value,
  width = 1.4,
  height = 28,
  fontSize = 9,
  displayValue = true,
  lineColor = '#000000',
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: 'CODE128',
          width,
          height,
          displayValue,
          fontSize,
          margin: 0,
          background: 'transparent',
          lineColor,
          font: 'monospace'
        });
      } catch (e) {
        console.warn('Barcode render warning:', e);
      }
    }
  }, [value, width, height, fontSize, displayValue, lineColor]);

  return <svg ref={svgRef} className={`max-w-full ${className}`} />;
};
