import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Hooks and services
import { useLocalStorage } from './hooks/useLocalStorage.ts';
import { useAuth } from './context/AuthContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';

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
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failure' | null>(null);

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

  // Check for payment status from Mercado Pago redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const collectionStatus = urlParams.get('collection_status'); // Alternative param

    if (status === 'approved' || collectionStatus === 'approved') {
      setPaymentStatus('success');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'failure' || collectionStatus === 'failure' || status === 'rejected' || collectionStatus === 'rejected') {
      setPaymentStatus('failure');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (status || collectionStatus) {
      setTimeout(() => setPaymentStatus(null), 5000); // Hide message after 5 seconds
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
  
  const PaymentStatusBanner = () => {
    if (!paymentStatus) return null;

    const isSuccess = paymentStatus === 'success';
    const bgColor = isSuccess ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50';
    const textColor = isSuccess ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200';
    const icon = isSuccess ? 'check_circle' : 'error';
    const title = isSuccess ? 'Pagamento Aprovado!' : 'Pagamento Falhou';
    const message = isSuccess 
      ? 'Seu plano será atualizado em breve. Pode levar alguns instantes para a confirmação.' 
      : 'Ocorreu um problema ao processar seu pagamento. Por favor, tente novamente.';

    return (
      <div className={`fixed top-24 right-8 p-4 rounded-lg shadow-lg z-50 ${bgColor} ${textColor} animate-fade-in-out`}>
        <div className="flex items-center gap-3">
            <span className="material-symbols-outlined">{icon}</span>
            <div>
                <p className="font-bold">{title}</p>
                <p className="text-sm">{message}</p>
            </div>
            <button onClick={() => setPaymentStatus(null)} className="ml-4">&times;</button>
        </div>
         <style>{`
            @keyframes fade-in-out {
              0% { opacity: 0; transform: translateY(-20px); }
              10% { opacity: 1; transform: translateY(0); }
              90% { opacity: 1; transform: translateY(0); }
              100% { opacity: 0; transform: translateY(-20px); }
            }
            .animate-fade-in-out {
              animation: fade-in-out 5s ease-in-out forwards;
            }
        `}</style>
      </div>
    );
  };


  // Main application view
  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <PaymentStatusBanner />
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