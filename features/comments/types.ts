import type { Comment } from "@/db/schema";

// API responses serialize Date fields as ISO strings over JSON.
// Use these types for data coming from (or going to) the backend.
export type CommentFromApi = Omit<Comment, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export type CommentsPageResponse = {
  result: CommentFromApi[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};
