

// FIX: Define global types for process.env to align with the execution
// environment and resolve TypeScript errors. This replaces the previous
// declaration for `import.meta.env`.
// FIX: Changed from redeclaring `var process` to augmenting the `NodeJS.ProcessEnv` interface to prevent "Cannot redeclare block-scoped variable" error.
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly API_KEY: string;
      readonly UNSPLASH_ACCESS_KEY: string;
    }
  }
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