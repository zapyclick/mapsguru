import React, { ReactNode } from 'react';
import { NeumorphicCard } from './NeumorphicCard';
import { IconButton } from './IconButton';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  // Handle closing when the backdrop is clicked, but not the modal content itself
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 transition-opacity duration-300" 
      onClick={handleBackdropClick} 
      role="dialog" 
      aria-modal="true"
    >
      <NeumorphicCard 
        className="w-full max-w-2xl max-h-[85vh] flex flex-col p-6 gap-4 transform transition-transform duration-300 scale-95 animate-scale-in" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold">{title}</h2>
          <IconButton onClick={onClose} aria-label="Fechar" className="!w-10 !h-10">
            <span className="material-symbols-outlined">close</span>
          </IconButton>
        </div>
        <div className="overflow-y-auto pr-2 text-slate-700 dark:text-slate-300 space-y-4">
          {children}
        </div>
      </NeumorphicCard>
      <style>{`
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default InfoModal;
