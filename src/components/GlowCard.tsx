import React from 'react';
import styled, { keyframes } from 'styled-components';

export interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  width?: string;
  height?: string;
  children?: React.ReactNode;
  className?: string;
}

const spin = keyframes`
  0% {
    --angle: 0deg;
  }
  100% {
    --angle: 360deg;
  }
`;

const CardWrapper = styled.div<{ $width?: string; $height?: string }>`
  @property --angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }

  --angle: 0deg;
  position: relative;
  width: ${(props) => props.$width || '190px'};
  height: ${(props) => props.$height || '254px'};
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  border-radius: 10px;
  padding: 1.5px;
  background: transparent;

  /* Animated glowing border via rotating conic-gradient on ::before */
  &::before {
    content: '';
    position: absolute;
    inset: -1.5px;
    border-radius: 10px;
    background: conic-gradient(
      from var(--angle),
      #00e5ff 0%,
      #ff00e5 50%,
      #00e5ff 100%
    );
    animation: ${spin} 4s linear infinite;
    z-index: 0;
    pointer-events: none;
  }

  /* Ambient glowing blur effect on ::after */
  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 12px;
    background: conic-gradient(
      from var(--angle),
      #00e5ff 0%,
      #ff00e5 50%,
      #00e5ff 100%
    );
    animation: ${spin} 4s linear infinite;
    z-index: -1;
    filter: blur(14px);
    opacity: 0.45;
    pointer-events: none;
    transition: opacity 0.3s ease, filter 0.3s ease;
  }

  &:hover::after {
    opacity: 0.8;
    filter: blur(20px);
  }

  /* Inner black card content container (border-radius 8px) */
  .glow-card-content {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    background-color: #000000;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow: hidden;
  }
`;

export const GlowCard: React.FC<GlowCardProps> = ({
  title,
  width,
  height,
  children,
  className = '',
  ...rest
}) => {
  return (
    <CardWrapper $width={width} $height={height} className={className} {...rest}>
      <div className="glow-card-content">
        {title && (
          <div className="px-4 pt-3 pb-1 text-sm font-bold text-white tracking-tight border-b border-white/10">
            {title}
          </div>
        )}
        {children}
      </div>
    </CardWrapper>
  );
};

export default GlowCard;
