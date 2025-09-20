
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Hooks and services
import { useLocalStorage } from './hooks/useLocalStorage';
import { onAuthChange, signOut, getUserProfile } from './services/firebase';
import { User as FirebaseUser } from 'firebase/auth';

// Components
import Header from './components/Header';
import PostCreator from './components/PostCreator';
import PostPreview from './components/PostPreview';
import BusinessProfileSetup from './components/BusinessProfileSetup';
import ReviewAssistant from './components/ReviewAssistant';
import QnaAssistant from './components/QnaAssistant';
import ProductAssistant from './components/ProductAssistant';
import Login from './components/Login';
import Register from './components/Register';
import SubscriptionManager from './components/SubscriptionManager';

// Types
import { Post, BusinessProfile, User } from './types';

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
  // Authentication state
  const [authStatus, setAuthStatus] = useState<'loading' | 'unauthenticated' | 'authenticated'>('loading');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginView, setIsLoginView] = useState(true);

  // App state
  const [activeView, setActiveView] = useLocalStorage<View>('activeView', 'posts');
  const [activePost, setActivePost] = useState<Post>(getInitialPostState);
  const [businessProfile, setBusinessProfile] = useLocalStorage<BusinessProfile>('businessProfile', initialProfileState);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Effect to handle authentication changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userProfile = await getUserProfile(firebaseUser.uid);
        setCurrentUser(userProfile);
        setAuthStatus('authenticated');
        // Check if the business profile is empty on first login to prompt user
        const storedProfile = localStorage.getItem('businessProfile');
        if (!storedProfile || !JSON.parse(storedProfile).name) {
          setIsProfileModalOpen(true);
        }
      } else {
        setCurrentUser(null);
        setAuthStatus('unauthenticated');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut();
    // Clear local storage on logout for security
    localStorage.removeItem('businessProfile');
    localStorage.removeItem('activeView');
  };

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
        return <SubscriptionManager currentUser={currentUser} onUpgradePlan={(email, plan) => console.log(`Upgrading ${email} to ${plan}`)} />;
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

  // Loading state while checking auth
  if (authStatus === 'loading') {
    return <div className="min-h-screen bg-slate-200 dark:bg-slate-900 flex items-center justify-center"><p>Carregando...</p></div>;
  }
  
  // Auth pages if not authenticated
  if (authStatus === 'unauthenticated') {
    return isLoginView ? (
      <Login onLoginSuccess={() => {}} onSwitchToRegister={() => setIsLoginView(false)} />
    ) : (
      <Register onRegisterSuccess={() => {}} onSwitchToLogin={() => setIsLoginView(true)} />
    );
  }

  // Main application view
  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
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
