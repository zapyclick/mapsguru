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

// Represents the business profile information stored locally
export interface BusinessProfile {
  id: string; 
  name: string;
  whatsappNumber: string;
  gbpLink: string;
  logoUrl: string | null;
}

// FIX: Correctly augment the global `process.env` type instead of redeclaring `process`.
// The original `var process` declaration caused a conflict with existing global Node.js types.
// This uses namespace augmentation to add properties to the `NodeJS.ProcessEnv` interface, which is the standard and safe way.
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY?: string;
      VITE_UNSPLASH_ACCESS_KEY?: string;
    }
  }
}
