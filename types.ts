// Represents a single Google Business Profile post being created
export interface Post {
  id: string;
  keywords: string;
  text: string;
  imageUrl: string | null;
  imageDescription: string | null;
  imageText: ImageText | null;
  includeLogo: boolean;
}

// Represents the text overlay on an image
export interface ImageText {
  text: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  bold: boolean;
  italic: boolean;
  x: number; // Position as percentage of width
  y: number; // Position as percentage of height
  rotation: number; // Rotation in degrees
  strokeWidth: number;
  strokeColor: string;
  cornerRadius: number;
}

// Represents the structure of an image object from the Unsplash API
export interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
    links: {
      html: string;
    };
  };
  isMock?: boolean;
}

// Represents the business profile information
export interface BusinessProfile {
  name: string;
  whatsappNumber: string;
  gbpLink: string;
  logoUrl: string | null;
}

// Represents a user account
export interface User {
  email: string;
  password: string; // In a real app, this would be a hash
  registrationDate: string; // ISO 8601 string format
  trialEndDate: string;   // ISO 8601 string format
  plan: 'trial' | 'pro' | 'admin';
}