import React from 'react';
import PostCreator from './PostCreator.tsx';
import PostPreview from './PostPreview.tsx';
import { Post, BusinessProfile } from '../../types/index.ts';

interface PostGeneratorProps {
    activePost: Post;
    setActivePost: (post: Post) => void;
    handleNewPost: () => void;
    businessProfile: BusinessProfile;
}

const PostGenerator: React.FC<PostGeneratorProps> = ({ activePost, setActivePost, handleNewPost, businessProfile }) => {
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
};

export default PostGenerator;
