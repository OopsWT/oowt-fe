// lib/types.ts
// export Interface for Image Data
export interface ImageData {
  url: string;
}

// export Interface for Author Data
export interface Author {
  id: number;
  name: string;
  email: string;
  avatar: ImageData;
  description: string;
}

// export Interface for Category Data
export interface Category {
  documentId: string;
  name: string;
  description: string;
}

export interface MediaFile {
  alternativeText?: string;
  createdAt?: string;
  height?: number;
  width?: number;
  id: number;
  url: string;
  name: string;
  formats?: {
    thumbnail: {
      height: number;
      width: number;
      url: string;
    };
    large: {
      height: number;
      width: number;
      url: string;
    };
  };
}

export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string;
  content: string; // rich markdown text
  createdAt: Date; // ISO date string
  publishedAt: Date;
  cover: ImageData;
  author: Author; // The author of the blog post
  categories: Category[]; // An array of categories associated with the post
  distance: number;
  likes: number;
  views: number;
  pointers: {
    pointers: number[][];
  };
  blocks?: {
    files?: MediaFile[];
  }[];
}

export interface UserArticleData {
  title: string;
  slug: string;
  description: string;
  content: string; //  rich markdown text
}

// Example response structure when fetching posts
export interface ArticlesResponse {
  data: Article[];
}

// Example response structure when fetching a single post
export interface SingleArticleResponse {
  data: Article; // The single blog post object
}
