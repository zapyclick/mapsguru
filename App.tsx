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
import Login from './components/Login';
import Register from './components/Register';
import { auth, db } from './firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export type View = 'posts' | 'reviews' | 'qna' | 'products';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [businessProfile, setBusinessProfile] = useLocalStorage<BusinessProfile>('businessProfile', {
    name: '',
    whatsappNumber: '',
    gbpLink: '',
    logoUrl: null,
  });
  const [activeView, setActiveView] = useState<View>('posts');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    // onAuthStateChanged é o listener em tempo real para o status de auth do usuário
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Usuário está logado. Buscar dados do Firestore.
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            registrationDate: userData.registrationDate,
            trialEndDate: userData.trialEndDate,
          });
        } else {
          // O usuário existe no Auth, mas não no Firestore.
          // Isso pode acontecer se o registro falhou no meio.
          // Por segurança, deslogamos o usuário.
          console.error("Usuário autenticado não encontrado no Firestore. Deslogando.");
          await signOut(auth);
          setCurrentUser(null);
        }
      } else {
        // Usuário está deslogado.
        setCurrentUser(null);
      }
      setIsLoadingAuth(false);
    });

    // Limpa o listener quando o componente é desmontado
    return () => unsubscribe();
  }, []);

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
      // onAuthStateChanged irá lidar com a atualização do estado do currentUser
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
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

        </div>
      </main>

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