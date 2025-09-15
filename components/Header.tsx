import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { NeumorphicCard } from './NeumorphicCard';
import { IconButton } from './IconButton';
import { View } from '../App';
import { User } from '../types';

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onProfileClick: () => void;
  onLogout: () => void;
  currentUser: User | null;
}

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, onProfileClick, onLogout, currentUser }) => {
  const { theme, toggleTheme } = useTheme();
  const [isFeaturesMenuOpen, setIsFeaturesMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const featuresMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const viewLabels: Record<View, string> = {
    posts: 'Gerador de Posts',
    reviews: 'Assistente de Avaliações',
    qna: 'Gerador de Q&A',
    products: 'Catálogo de Produtos',
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (featuresMenuRef.current && !featuresMenuRef.current.contains(event.target as Node)) {
        setIsFeaturesMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const TrialStatusBanner = () => {
    if (!currentUser?.trialEndDate) return null;

    const endDate = new Date(currentUser.trialEndDate);
    const now = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
        return (
            <div className="text-center bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 text-sm py-2 px-4 rounded-b-lg">
                Seu período de teste expirou. Para continuar usando, considere um upgrade.
            </div>
        );
    }

    return (
        <div className="text-center bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm py-2 px-4 rounded-b-lg">
            Você tem <strong>{daysRemaining} dia{daysRemaining !== 1 ? 's' : ''}</strong> restantes no seu período de teste.
        </div>
    );
  };

  const renderNavItems = (isMobile = false) => (
    <>
      <div className="relative" ref={isMobile ? null : featuresMenuRef}>
        <IconButton onClick={() => setIsFeaturesMenuOpen(!isFeaturesMenuOpen)} aria-label="Recursos">
          <span className="material-symbols-outlined">auto_awesome</span>
        </IconButton>
        {isFeaturesMenuOpen && (
          <NeumorphicCard className="absolute top-14 right-0 w-64 p-2 z-20">
            <ul className="space-y-1">
              {Object.keys(viewLabels).map((key) => (
                <li key={key}>
                  <button
                    onClick={() => {
                      setActiveView(key as View);
                      setIsFeaturesMenuOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between text-sm font-medium transition-colors ${
                      activeView === key
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {viewLabels[key as View]}
                    {activeView === key && <span className="material-symbols-outlined text-base">check</span>}
                  </button>
                </li>
              ))}
            </ul>
          </NeumorphicCard>
        )}
      </div>

      <a href="https://zapy.click" target="_blank" rel="noopener noreferrer" title="Dicas" className="w-12 h-12 rounded-full flex items-center justify-center 
        bg-slate-200 dark:bg-slate-800 
        text-slate-600 dark:text-slate-300 
        shadow-light-neumorphic dark:shadow-dark-neumorphic 
        hover:shadow-light-neumorphic-inset dark:hover:shadow-dark-neumorphic-inset 
        active:shadow-light-neumorphic-inset dark:active:shadow-dark-neumorphic-inset
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
        <span className="material-symbols-outlined">help</span>
      </a>

      <IconButton onClick={onProfileClick} aria-label="Perfil do Negócio">
        <span className="material-symbols-outlined">storefront</span>
      </IconButton>

      <IconButton onClick={toggleTheme} aria-label="Alternar tema">
        <span className="material-symbols-outlined">
          {theme === 'light' ? 'dark_mode' : 'light_mode'}
        </span>
      </IconButton>
      
      <IconButton onClick={onLogout} aria-label="Sair">
        <span className="material-symbols-outlined">logout</span>
      </IconButton>
    </>
  );

  return (
    <div className="m-4 sm:m-6 lg:m-8">
        <NeumorphicCard as="header" className="p-4 !rounded-xl">
        <div className="flex justify-between items-center">
            {/* Left Side: Logo and Title */}
            <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                Zmaps gestão inteligente para negócios locais
            </h1>
            </div>

            {/* Right Side: Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
            {renderNavItems()}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden" ref={mobileMenuRef}>
            <IconButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Menu">
                <span className="material-symbols-outlined">menu</span>
            </IconButton>
            {isMobileMenuOpen && (
                <NeumorphicCard className="absolute top-20 right-4 sm:right-6 lg:right-8 w-auto p-4 z-20">
                    <div className="flex flex-col items-center gap-3">
                        {renderNavItems(true)}
                    </div>
                </NeumorphicCard>
            )}
            </div>
        </div>
        </NeumorphicCard>
        <TrialStatusBanner />
    </div>
  );
};

export default Header;