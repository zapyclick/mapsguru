import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Hooks and services
import { ThemeProvider } from './context/ThemeContext.tsx';
import { useLocalStorage } from './hooks/useLocalStorage.ts';

// Components
import Header from './components/Header.tsx';
import PostGenerator from './features/post-generator/PostGenerator.tsx';
import ReviewAssistant from './features/review-assistant/ReviewAssistant.tsx';
import QnaAssistant from './features/qna-assistant/QnaAssistant.tsx';
import ProductAssistant from './features/product-assistant/ProductAssistant.tsx';
import InstructionsPDF from './features/pdf-generator/InstructionsPDF.tsx';
import BusinessProfileSetup from './features/profile/BusinessProfileSetup.tsx';
import { isGeminiConfigured } from './services/geminiService.ts';

// Types
import { Post, BusinessProfile } from './types/index.ts';

// Define the different views/tools available in the app
export type View = 'posts' | 'reviews' | 'qna' | 'products' | 'pdf' | 'profile';

// Initial state for a new post
const getInitialPostState = (): Post => ({
  id: uuidv4(),
  keywords: '',
  text: '',
  imageUrl: null,
  imageDescription: null,
  imageText: null,
  includeLogo: true,
});

const initialProfileState: BusinessProfile = {
  id: 'local-profile',
  name: '',
  whatsappNumber: '',
  gbpLink: '',
  logoUrl: null,
};


function App() {
  const [activeView, setActiveView] = useState<View>('posts');
  const [activePost, setActivePost] = useState<Post>(getInitialPostState);
  const [businessProfile, setBusinessProfile] = useLocalStorage<BusinessProfile>('businessProfile', initialProfileState);
  const geminiConfigured = isGeminiConfigured();

  const handleNewPost = () => {
    setActivePost(getInitialPostState());
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'reviews':
        return <ReviewAssistant businessProfile={businessProfile} />;
      case 'qna':
        return <QnaAssistant businessProfile={businessProfile} />;
      case 'products':
        return <ProductAssistant businessProfile={businessProfile} />;
      case 'profile':
        return (
          <div className="max-w-2xl mx-auto">
            <BusinessProfileSetup profile={businessProfile} onProfileChange={setBusinessProfile} />
          </div>
        );
      case 'pdf':
        return <InstructionsPDF />;
      case 'posts':
      default:
        return (
          <PostGenerator
            activePost={activePost}
            setActivePost={setActivePost}
            handleNewPost={handleNewPost}
            businessProfile={businessProfile}
          />
        );
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        <Header
          activeView={activeView}
          setActiveView={setActiveView}
        />
        {!geminiConfigured && (
            <div className="m-4 sm:m-6 lg:m-8 -mt-2">
                <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-center">
                    <p><strong>Ação Necessária:</strong> A chave da API do Google Gemini não está configurada. Siga as <strong>Instruções</strong> para adicionar sua chave e habilitar as funcionalidades de IA.</p>
                </div>
            </div>
        )}
        <main className="p-4 sm:p-6 lg:p-8">
          {renderActiveView()}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;