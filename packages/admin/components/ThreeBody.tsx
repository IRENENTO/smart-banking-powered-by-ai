'use client';

interface ThreeBodyProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function ThreeBody({
  size = 20,
  color = 'currentColor',
  className = '',
}: ThreeBodyProps) {
  return (
    <div
      className={`three-body ${className}`}
      style={{
        '--uib-size': `${size}px`,
        '--uib-color': color,
      } as React.CSSProperties}
    >
      <div className="three-body__dot" />
      <div className="three-body__dot" />
      <div className="three-body__dot" />
    </div>
  );
}
