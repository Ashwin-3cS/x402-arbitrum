import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverEffect = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        glass rounded-2xl p-6 relative overflow-hidden group
        ${hoverEffect ? 'glass-hover cursor-pointer' : ''}
        ${className}
      `}
    >
      {hoverEffect && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#9BF2D5]/5 to-[#9BF2D5]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;
