import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Hooks and services
import { useLocalStorage } from './hooks/useLocalStorage.ts';
import { ThemeProvider } from './context/ThemeContext.tsx';

// Components
import Header from './components/Header.tsx';
import PostGenerator from './features/post-generator/PostGenerator.tsx';
import BusinessProfileSetup from './features/profile/BusinessProfileSetup.tsx';
import ReviewAssistant from './features/review-assistant/ReviewAssistant.tsx';
import QnaAssistant from './features/qna-assistant/QnaAssistant.tsx';
import ProductAssistant from './features/product-assistant/ProductAssistant.tsx';
import InstructionsPDF from './features/pdf-generator/InstructionsPDF.tsx';

// Types
import { Post, BusinessProfile } from './types/index.ts';

// Define the different views/tools available in the app
export type View = 'posts' | 'reviews' | 'qna' | 'products' | 'pdf';

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

// Initial state for the business profile
const initialProfileState: BusinessProfile = {
  name: '',
  whatsappNumber: '',
  gbpLink: '',
  logoUrl: null,
};

function App() {
  const [activeView, setActiveView] = useLocalStorage<View>('activeView_local', 'posts');
  const [activePost, setActivePost] = useState<Post>(getInitialPostState);
  const [businessProfile, setBusinessProfile] = useLocalStorage<BusinessProfile>('businessProfile_local', initialProfileState);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    // On first load, prompt for profile setup if the name is empty.
    const storedProfile = localStorage.getItem('businessProfile_local');
    if (!storedProfile || !JSON.parse(storedProfile).name) {
      setIsProfileModalOpen(true);
    }
  }, []);

  const handleProfileChange = (updatedProfile: Partial<BusinessProfile>) => {
    setBusinessProfile(prev => ({ ...prev, ...updatedProfile }));
  };

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

  // Main application view
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        <Header
          activeView={activeView}
          setActiveView={setActiveView}
          onProfileClick={() => setIsProfileModalOpen(true)}
        />
        <main className="p-4 sm:p-6 lg:p-8">
          {renderActiveView()}
        </main>

        {isProfileModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <BusinessProfileSetup
                profile={businessProfile}
                onProfileChange={handleProfileChange}
                onClose={() => setIsProfileModalOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;