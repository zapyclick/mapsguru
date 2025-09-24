import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext.tsx';
import { NeumorphicCard } from './ui/NeumorphicCard.tsx';
import { IconButton } from './ui/IconButton.tsx';
import { View } from '../App.tsx';

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
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
    profile: 'Perfil do Negócio',
    pdf: 'Instruções',
  };

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
          <span className="material-symbols-outlined">auto_awesome</span>
          <span className="md:hidden ml-2">Ferramentas</span>
        </IconButton>
        {isFeaturesMenuOpen && (
          <NeumorphicCard className="absolute top-14 right-0 w-64 p-2 z-20">
            <ul className="space-y-1">
              {(Object.keys(viewLabels) as View[]).map((key) => (
                <li key={key}>
                  <button
                    onClick={() => {
                      setActiveView(key);
                      setIsFeaturesMenuOpen(false);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between text-sm font-medium transition-colors ${
                      activeView === key
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'hover:bg-slate-300/50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {viewLabels[key]}
                    {activeView === key && <span className="material-symbols-outlined text-base">check</span>}
                  </button>
                </li>
              ))}
            </ul>
          </NeumorphicCard>
        )}
      </div>

      <IconButton onClick={toggleTheme} aria-label="Alternar tema">
        <span className="material-symbols-outlined">
          {theme === 'light' ? 'dark_mode' : 'light_mode'}
        </span>
         <span className="md:hidden ml-2">Tema</span>
      </IconButton>
    </>
  );

  return (
    <div className="m-4 sm:m-6 lg:m-8 print:hidden">
        <NeumorphicCard as="header" className="p-4 !rounded-xl">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">
                  Zmaps
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {renderNavItems()}
            </div>

            <div className="md:hidden" ref={mobileMenuRef}>
              <IconButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Menu">
                  <span className="material-symbols-outlined">menu</span>
              </IconButton>
              {isMobileMenuOpen && (
                  <NeumorphicCard className="absolute top-20 right-4 sm:right-6 lg:right-8 w-auto p-4 z-20">
                      <div className="flex flex-col items-start gap-3">
                          {renderNavItems(true)}
                      </div>
                  </NeumorphicCard>
              )}
            </div>
        </div>
        </NeumorphicCard>
    </div>
  );
};

export default Header;