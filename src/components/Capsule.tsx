import React from 'react';
import { cn } from '@/lib/utils';

interface CapsuleProps {
  item: string;
  className?: string;
}

export const Capsule: React.FC<CapsuleProps> = ({ item, className }) => {
  return (
    <div
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-semibold bg-zinc-900 border border-white/10 text-zinc-300 transition-colors shadow-sm",
        className
      )}
    >
      {item}
    </div>
  );
};

export default Capsule;
