import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Post, BusinessProfile, User } from './types';
import Header from './components/Header';
import PostCreator from './components/PostCreator';
import PostPreview from './components/PostPreview';
import BusinessProfileSetup from './components/BusinessProfileSetup';
import ReviewAssistant from './components/ReviewAssistant';
import QnaAssistant from './components/QnaAssistant';
import ProductAssistant from './components/ProductAssistant';
import SubscriptionManager from './components/SubscriptionManager';
import Login from './components/Login';
import Register from './components/Register';

export type View = 'posts' | 'reviews' | 'qna' | 'products' | 'subscription';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>('isAuthenticated', false);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [users, setUsers] = useLocalStorage<User[]>('users', []);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [businessProfile, setBusinessProfile] = useLocalStorage<BusinessProfile>('businessProfile', {
    name: '',
    whatsappNumber: '',
    gbpLink: '',
    logoUrl: null,
  });
  const [activeView, setActiveView] = useState<View>('posts');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  // This effect runs on app start and ensures the user data schema is up-to-date.
  useEffect(() => {
    const requiresMigration = users.some(u => !u.plan);
    if (requiresMigration) {
      const migratedUsers = users.map(u => (u.plan ? u : { ...u, plan: 'trial' as const }));
      setUsers(migratedUsers);
      
      // If a user is logged in, update their session data too
      if (currentUser) {
        const updatedCurrentUser = migratedUsers.find(u => u.email === currentUser.email);
        if (updatedCurrentUser) {
          setCurrentUser(updatedCurrentUser);
        }
      }
    }
  }, [users, setUsers, currentUser, setCurrentUser]);


  const handleProfileChange = (updatedProfile: Partial<BusinessProfile>) => {
    setBusinessProfile(prev => ({ ...prev, ...updatedProfile }));
  };

  const createNewPostObject = (): Post => {
    return {
      id: `post_${Date.now()}`,
      keywords: '',
      text: '',
      imageUrl: null,
      imageDescription: null,
      imageText: null,
      includeLogo: true,
    };
  };

  const handleCreateNewPost = () => {
    setCurrentPost(createNewPostObject());
  };

  // On first load, if no current post, create one.
  useEffect(() => {
    if (!currentPost) {
      handleCreateNewPost();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePostUpdate = (updatedPost: Post) => {
    setCurrentPost(updatedPost);
  };
  
  const handleLoginSuccess = (user: User) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const handleUpgradePlan = (userEmail: string, newPlan: 'pro') => {
    // Update the master list of users
    const updatedUsers = users.map(user => 
      user.email === userEmail ? { ...user, plan: newPlan, trialEndDate: '' } : user
    );
    setUsers(updatedUsers);

    // Update the currently logged-in user's state
    if (currentUser && currentUser.email === userEmail) {
      setCurrentUser({ ...currentUser, plan: newPlan, trialEndDate: '' });
    }
  };


  if (!isAuthenticated) {
    if (authView === 'login') {
      return <Login onLoginSuccess={handleLoginSuccess} onNavigateToRegister={() => setAuthView('register')} />;
    }
    return <Register onNavigateToLogin={() => setAuthView('login')} />;
  }

  return (
    <div className="bg-slate-200 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      <Header 
        activeView={activeView}
        setActiveView={setActiveView}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
      />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Conditional Content */}
          {activeView === 'posts' && currentPost && (
            <>
              <PostCreator
                post={currentPost}
                onPostChange={handlePostUpdate}
                onNewPost={handleCreateNewPost}
                businessProfile={businessProfile}
              />
              <PostPreview post={currentPost} businessProfile={businessProfile} />
            </>
          )}

          {activeView === 'reviews' && (
            <ReviewAssistant businessProfile={businessProfile} />
          )}
          
          {activeView === 'qna' && (
            <QnaAssistant businessProfile={businessProfile} />
          )}

          {activeView === 'products' && (
            <ProductAssistant businessProfile={businessProfile} />
          )}

          {activeView === 'subscription' && (
            <SubscriptionManager currentUser={currentUser} onUpgradePlan={handleUpgradePlan} />
          )}

        </div>
      </main>

      {/* Business Profile Modal */}
      {isProfileModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
          onClick={() => setIsProfileModalOpen(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl">
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
};

export default App;