// FIX: Corrected the React import statement by removing the erroneous 'a,'.
import React, {
  useState,
  useEffect
} from 'react';
import {
  useLocalStorage
} from './hooks/useLocalStorage';
import {
  Post,
  BusinessProfile,
  User
} from './types';
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
import {
  auth,
  db
} from './services/firebase';
import {
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

export type View = 'posts' | 'reviews' | 'qna' | 'products' | 'subscription';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState < User | null > (null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [currentPost, setCurrentPost] = useState < Post | null > (null);
  const [businessProfile, setBusinessProfile] = useLocalStorage < BusinessProfile > ('businessProfile', {
    name: '',
    whatsappNumber: '',
    gbpLink: '',
    logoUrl: null,
  });
  const [activeView, setActiveView] = useState < View > ('posts');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [authView, setAuthView] = useState < 'login' | 'register' > ('login');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch their data from Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            ...userDocSnap.data()
          } as User);
        } else {
          // This case might happen if a user is created in Auth but not Firestore
          console.error("No such user document in Firestore!");
          setCurrentUser(null);
        }
      } else {
        // User is signed out
        setCurrentUser(null);
      }
      setIsLoadingAuth(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);


  const handleProfileChange = (updatedProfile: Partial < BusinessProfile > ) => {
    setBusinessProfile(prev => ({ ...prev,
      ...updatedProfile
    }));
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleUpgradePlan = async (userEmail: string, newPlan: 'pro' | 'premium') => {
    if (!currentUser) return;

    const userDocRef = doc(db, "users", currentUser.uid);

    try {
      await updateDoc(userDocRef, {
        plan: newPlan,
        trialEndDate: '' // Clear trial end date on upgrade
      });

      // Update the local state to reflect the change immediately
      setCurrentUser(prevUser => prevUser ? { ...prevUser,
        plan: newPlan,
        trialEndDate: ''
      } : null);
    } catch (error) {
      console.error("Error updating plan in Firestore: ", error);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="bg-slate-200 dark:bg-slate-900 min-h-screen flex items-center justify-center">
        <p className="text-slate-800 dark:text-slate-200">Carregando...</p>
      </div>
    );
  }

  if (!currentUser) {
    if (authView === 'login') {
      return <Login onNavigateToRegister={() => setAuthView('register')} />;
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
              <PostPreview
                post={currentPost}
                businessProfile={businessProfile}
              />
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
            <SubscriptionManager
              currentUser={currentUser}
              onUpgradePlan={handleUpgradePlan}
            />
          )}

        </div>
      </main>

      {/* Business Profile Modal */}
      {isProfileModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
          onClick={() => setIsProfileModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
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