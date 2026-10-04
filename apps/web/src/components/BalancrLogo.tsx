import React from 'react';

interface BalancrLogoProps {
  size?: number;
  showText?: boolean;
}

const BalancrLogo: React.FC<BalancrLogoProps> = ({ size = 40, showText = false }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 800 600"
      width={showText ? size * 2 : size}
      height={size}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="hexLeftGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0052d4" />
          <stop offset="50%" stopColor="#4364f7" />
          <stop offset="100%" stopColor="#6fb1fc" />
        </linearGradient>
        <linearGradient id="hexRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00c9ff" />
          <stop offset="100%" stopColor="#92fe9d" />
        </linearGradient>
      </defs>
      <g transform={`translate(0, ${showText ? -10 : 60})`}>
        {showText && (
          <text
            x="400" y="90" textAnchor="middle"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            fontWeight="800" fontSize="36" letterSpacing="6" fill="#ffffff"
          >
            BALANCR
          </text>
        )}
        <g transform={`translate(0, ${showText ? 10 : 0})`}>
          <polygon
            points="370,225 440,265 440,345 370,385 300,345 300,265"
            fill="none" stroke="url(#hexLeftGrad)"
            strokeWidth="16" strokeLinejoin="round" strokeLinecap="round"
          />
          <polygon
            points="500,225 570,265 570,345 500,385 430,345 430,265"
            fill="none" stroke="url(#hexRightGrad)"
            strokeWidth="16" strokeLinejoin="round" strokeLinecap="round"
          />
          <path
            d="M 430,265 L 500,225 L 570,265"
            fill="none" stroke="url(#hexRightGrad)"
            strokeWidth="16" strokeLinejoin="round" strokeLinecap="round"
          />
          <path
            d="M 440,345 L 370,385 L 300,345"
            fill="none" stroke="url(#hexLeftGrad)"
            strokeWidth="16" strokeLinejoin="round" strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  );
};

export default BalancrLogo;
