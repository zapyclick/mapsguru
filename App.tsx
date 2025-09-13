import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Post, BusinessProfile } from './types';
import Header from './components/Header';
import PostCreator from './components/PostCreator';
import PostPreview from './components/PostPreview';
import BusinessProfileSetup from './components/BusinessProfileSetup';
import ReviewAssistant from './components/ReviewAssistant';
import QnaAssistant from './components/QnaAssistant';
import ProductAssistant from './components/ProductAssistant';
import { NeumorphicCard } from './components/NeumorphicCard';

export type View = 'posts' | 'reviews' | 'qna' | 'products';

const App: React.FC = () => {
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [businessProfile, setBusinessProfile] = useLocalStorage<BusinessProfile>('businessProfile', {
    name: '',
    whatsappNumber: '',
    gbpLink: '',
    logoUrl: null,
  });
  const [activeView, setActiveView] = useState<View>('posts');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
  
  return (
    <div className="bg-slate-200 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      <Header 
        activeView={activeView}
        setActiveView={setActiveView}
        onProfileClick={() => setIsProfileModalOpen(true)}
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