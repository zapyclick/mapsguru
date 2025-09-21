import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Hooks and services
import { useLocalStorage } from './hooks/useLocalStorage.ts';
import { useAuth } from './context/AuthContext.tsx';

// Components
import Header from './components/Header.tsx';
import PostCreator from './components/PostCreator.tsx';
import PostPreview from './components/PostPreview.tsx';
import BusinessProfileSetup from './components/BusinessProfileSetup.tsx';
import ReviewAssistant from './components/ReviewAssistant.tsx';
import QnaAssistant from './components/QnaAssistant.tsx';
import ProductAssistant from './components/ProductAssistant.tsx';
import SubscriptionManager from './components/SubscriptionManager.tsx';
import Auth from './components/Auth.tsx';

// Types
import { Post, BusinessProfile } from './types.ts';

// Define the different views/tools available in the app
export type View = 'posts' | 'reviews' | 'qna' | 'products' | 'subscription';

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
  const { isAuthenticated, user } = useAuth();

  // Create user-specific keys for localStorage to ensure data isolation
  const userPrefix = isAuthenticated && user ? user.uid : 'guest';
  const activeViewKey = `activeView_${userPrefix}`;
  const businessProfileKey = `businessProfile_${userPrefix}`;

  // App state
  const [activeView, setActiveView] = useLocalStorage<View>(activeViewKey, 'posts');
  const [activePost, setActivePost] = useState<Post>(getInitialPostState);
  const [businessProfile, setBusinessProfile] = useLocalStorage<BusinessProfile>(businessProfileKey, initialProfileState);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    // On first load with authentication, prompt for profile setup if empty.
    if (isAuthenticated) {
      // Check the user-specific profile key in localStorage
      const storedProfile = localStorage.getItem(businessProfileKey);
      if (!storedProfile || !JSON.parse(storedProfile).name) {
        setIsProfileModalOpen(true);
      }
    }
  }, [isAuthenticated, businessProfileKey]);

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
      case 'subscription':
        return <SubscriptionManager />;
      case 'posts':
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <PostCreator
              post={activePost}
              businessProfile={businessProfile}
              onPostChange={setActivePost}
              onNewPost={handleNewPost}
            />
            <PostPreview post={activePost} businessProfile={businessProfile} />
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <Auth />;
  }

  // Main application view
  return (
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
  );
}

export default App;
