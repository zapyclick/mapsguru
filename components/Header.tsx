import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { NeumorphicCard } from './NeumorphicCard';
import { IconButton } from './IconButton';
import { View } from '../App';
import { logoDataUri } from '../assets/logo';

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, onProfileClick }) => {
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

  const renderNavItems = (isMobile = false) => (
    <>
      <div className="relative" ref={isMobile ? null : featuresMenuRef}>
        <IconButton onClick={() => setIsFeaturesMenuOpen(!isFeaturesMenuOpen)} aria-label="Recursos">
          <span className="material-symbols-outlined">settings</span>
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

      <IconButton onClick={() => alert('Nenhuma notificação no momento!')} aria-label="Avisos">
        <span className="material-symbols-outlined">notifications</span>
      </IconButton>
      
      <a href="https://zapy.click" target="_blank" rel="noopener noreferrer" className="py-3 px-5 rounded-lg bg-slate-200 dark:bg-slate-800 shadow-light-neumorphic dark:shadow-dark-neumorphic font-semibold hover:shadow-light-neumorphic-inset dark:hover:shadow-dark-neumorphic-inset transition-all duration-200 ease-in-out text-sm">
        Dicas
      </a>

      <IconButton onClick={onProfileClick} aria-label="Perfil do Negócio">
        <span className="material-symbols-outlined">account_circle</span>
      </IconButton>

      <IconButton onClick={toggleTheme} aria-label="Alternar tema">
        <span className="material-symbols-outlined">
          {theme === 'light' ? 'dark_mode' : 'light_mode'}
        </span>
      </IconButton>
    </>
  );

  return (
    <NeumorphicCard as="header" className="p-4 m-4 sm:m-6 lg:m-8 !rounded-xl">
      <div className="flex justify-between items-center">
        {/* Left Side: Logo and Title */}
        <div className="flex items-center gap-3">
          <img src={logoDataUri} alt="Logo Maps na Mão" className="h-10 w-10" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 hidden sm:block">
            Maps na Mão
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
  );
};

export default Header;
