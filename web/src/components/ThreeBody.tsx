import React from 'react';

interface ThreeBodyProps {
  size?: number;
  color?: string;
  className?: string;
}

const ThreeBody: React.FC<ThreeBodyProps> = ({
  size = 20,
  color = 'currentColor',
  className = '',
}) => {
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
};

export default ThreeBody;
