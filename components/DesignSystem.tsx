
import React from 'react';

// --- Layout ---
export const Layout: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`h-[100dvh] bg-background text-text-primary font-sans flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden ${className}`}>
    {children}
  </div>
);

export const Container: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-6 flex-1 flex flex-col overflow-y-auto scrollbar-hide ${className}`}>
    {children}
  </div>
);

export const FadeIn: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = '' }) => (
  <div 
    className={`animate-[fadeIn_0.5s_ease-out_forwards] opacity-0 ${className}`}
    style={{ animationDelay: `${delay}ms` }}
  >
    {children}
  </div>
);

// --- Typography ---
export const Heading: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h1 className={`font-heading text-2xl font-semibold text-text-primary mb-2 tracking-tight ${className}`}>
    {children}
  </h1>
);

export const SubHeading: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h2 className={`font-heading text-lg font-medium text-text-primary mb-4 ${className}`}>
    {children}
  </h2>
);

export const BodyText: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-base text-text-secondary leading-relaxed ${className}`}>
    {children}
  </p>
);

// --- Cards ---
export const Card: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string; isSelected?: boolean }> = ({ 
  children, 
  onClick, 
  className = '', 
  isSelected = false 
}) => (
  <div 
    onClick={onClick}
    className={`
      bg-white rounded-2xl p-5 mb-4 shadow-sm transition-all duration-300 border
      ${isSelected ? 'border-primary ring-1 ring-primary/20 bg-accent/30 shadow-md' : 'border-transparent hover:border-secondary/30 hover:shadow-lg hover:-translate-y-0.5'}
      ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);

// --- Buttons ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'floating' | 'outline' | 'gradient';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "rounded-2xl py-4 px-6 font-semibold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 tracking-wide text-sm relative overflow-hidden group";
  
  const variants = {
    // New Beautiful Gradient Button
    primary: "bg-gradient-to-br from-[#3A7D6E] to-[#2A5C52] text-white shadow-[0_10px_20px_-10px_rgba(58,125,110,0.5)] border border-transparent hover:shadow-[0_15px_25px_-10px_rgba(58,125,110,0.6)] hover:brightness-110",
    
    gradient: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 border-none",

    secondary: "bg-white border border-secondary/20 text-text-primary hover:bg-accent/20 hover:border-primary/30 shadow-sm hover:shadow-md",
    
    ghost: "bg-transparent text-text-secondary hover:text-primary hover:bg-accent/30",
    
    floating: "absolute bottom-24 right-6 bg-gradient-to-r from-[#1F2D2A] to-[#3A7D6E] text-white shadow-2xl shadow-black/20 z-50 rounded-full py-4 px-8 text-sm font-bold tracking-wider hover:scale-105",
    
    outline: "bg-transparent border-2 border-primary/40 text-primary hover:bg-primary/5 hover:border-primary"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className} disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none`}
      {...props}
    >
      {/* Gloss effect overlay */}
      {variant === 'primary' || variant === 'gradient' ? (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      ) : null}
      
      {children}
    </button>
  );
};

// --- Inputs ---
export const RangeSlider: React.FC<{ value: number; onChange: (val: number) => void; labels: string[] }> = ({ value, onChange, labels }) => (
  <div className="w-full py-4">
    <div className="relative h-2 bg-secondary/20 rounded-full mb-4">
        <div 
            className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(value / (labels.length - 1)) * 100}%` }}
        ></div>
        <input 
            type="range" 
            min="0" 
            max={labels.length - 1} 
            step="1"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        />
        {/* Thumbs visual */}
        <div 
            className="absolute top-1/2 -translate-y-1/2 h-6 w-6 bg-white border-2 border-primary rounded-full shadow-md pointer-events-none transition-all duration-300"
            style={{ left: `calc(${(value / (labels.length - 1)) * 100}% - 12px)` }}
        ></div>
    </div>
    
    <div className="flex justify-between mt-2">
      {labels.map((label, idx) => (
        <span 
          key={label} 
          onClick={() => onChange(idx)}
          className={`text-xs cursor-pointer transition-colors ${idx === value ? 'text-primary font-bold' : 'text-text-disabled hover:text-text-secondary'}`}
        >
          {label}
        </span>
      ))}
    </div>
  </div>
);

export const Checkbox: React.FC<{ label: string; checked: boolean; onChange: () => void }> = ({ label, checked, onChange }) => (
  <div 
    onClick={onChange}
    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${checked ? 'bg-accent/40' : 'hover:bg-gray-50'}`}
  >
    <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${checked ? 'bg-primary border-primary' : 'border-secondary/50 bg-white'}`}>
      {checked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
    </div>
    <span className={`text-sm ${checked ? 'text-text-primary line-through opacity-70' : 'text-text-primary'}`}>
      {label}
    </span>
  </div>
);

// --- Modals ---
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title?: string; fullScreen?: boolean }> = ({ isOpen, onClose, children, title, fullScreen = false }) => {
    if (!isOpen) return null;
    return (
        <div className={`fixed inset-0 z-50 flex ${fullScreen ? 'items-center justify-center bg-background' : 'items-end sm:items-center justify-center bg-black/20 backdrop-blur-sm sm:p-4'}`}>
            <div 
                className={`bg-white w-full ${fullScreen ? 'h-full rounded-none' : 'max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] shadow-2xl'} flex flex-col animate-[slideUp_0.3s_ease-out] overflow-hidden`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 pb-2 flex-shrink-0 border-b border-gray-100">
                    {title && <h3 className="text-lg font-bold text-primary">{title}</h3>}
                    <button onClick={onClose} className="p-2 -mr-2 text-text-disabled hover:text-text-primary rounded-full hover:bg-gray-100 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

// --- Bottom Navigation ---
// Changed to absolute to stick to the bottom of the container, not the viewport
export const BottomNav: React.FC<{ activeTab: string; onTabChange: (tab: string) => void; onScan: () => void }> = ({ activeTab, onTabChange, onScan }) => (
  <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-secondary/10 px-6 py-2 flex justify-between items-center z-40 pb-5 shadow-[0_-5px_30px_rgba(0,0,0,0.03)]">
    <button 
      onClick={() => onTabChange('Today')}
      className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${activeTab === 'Today' ? 'text-primary' : 'text-text-disabled hover:text-text-secondary'}`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      <span className="text-[10px] font-bold">Today</span>
    </button>

    {/* Center Scan Button (PhonePe style) */}
    <div className="relative -top-6">
       <button 
          onClick={onScan}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3A7D6E] to-[#2A5C52] text-white shadow-lg flex items-center justify-center transform hover:scale-105 active:scale-95 transition-all ring-4 ring-white"
       >
         <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
       </button>
       <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-primary bg-white px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">Scan Food</span>
    </div>

    <button 
      onClick={() => onTabChange('Progress')}
      className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${activeTab === 'Progress' ? 'text-primary' : 'text-text-disabled hover:text-text-secondary'}`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
      <span className="text-[10px] font-bold">Progress</span>
    </button>
  </div>
);
