import type { Task } from "@/db/schema";

// JSON-serialized dates arrive as ISO strings from the API.
export type TaskWithCommentSummary = Task & {
  commentCount: number;
  latestComment: {
    id: string;
    content: string;
    createdAt: string;
  } | null;
};
