"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { CommentFromApi } from "@/comments/types";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

interface TaskCommentsProps {
  taskId: string;
  onCommentSummaryChange?: (
    taskId: string,
    commentCount: number,
    latestComment: { id: string; content: string; createdAt: string } | null
  ) => void;
}

const LIMIT = 10;

const TaskComments = ({ taskId, onCommentSummaryChange }: TaskCommentsProps) => {
  const [comments, setComments] = useState<CommentFromApi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [updatingCommentId, setUpdatingCommentId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const requestSeqRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchComments = useCallback(
    async (newOffset: number, append: boolean) => {
      requestSeqRef.current += 1;
      const seq = requestSeqRef.current;

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (!append) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const response = await fetch(
          `/api/tasks/${taskId}/comments?limit=${LIMIT}&offset=${newOffset}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to load comments.");
        }

        const data = await response.json();

        if (seq !== requestSeqRef.current) return;
        if (controller.signal.aborted) return;

        const pageComments: CommentFromApi[] = data.result ?? [];

        if (append) {
          setComments((prev) => [...prev, ...pageComments]);
          setOffset(data.pagination.offset);
          setHasMore(data.pagination.hasMore);
        } else {
          setComments(pageComments);
          setOffset(data.pagination.offset);
          setHasMore(data.pagination.hasMore);
          setTotalCount(data.pagination.total);
          notifySummaryChange();
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (seq !== requestSeqRef.current) return;
        setError(
          err instanceof Error ? err.message : "Unable to load comments."
        );
      } finally {
        if (seq === requestSeqRef.current && !controller.signal.aborted) {
          if (append) {
            setIsLoadingMore(false);
          } else {
            setIsLoading(false);
          }
        }
      }
    },
    [taskId]
  );

  useEffect(() => {
    (async () => {
      await fetchComments(0, false);
    })();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchComments]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOffset(0);
    setHasMore(false);
    setComments([]);
  }, [taskId]);

  const notifySummaryChange = useCallback(() => {
    const latest = comments.length > 0 ? comments[0] : null;
    onCommentSummaryChange?.(
      taskId,
      totalCount,
      latest
        ? { id: latest.id, content: latest.content, createdAt: latest.createdAt }
        : null
    );
  }, [taskId, totalCount, comments, onCommentSummaryChange]);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    await fetchComments(offset + LIMIT, true);
  };

  const handleAdd = async (content: string) => {
    setAdding(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to add comment.");
      }

      setComments((prev) => [data.result as Comment, ...prev]);
      notifySummaryChange();
      await fetchComments(0, false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while adding the comment."
      );
    } finally {
      setAdding(false);
    }
  };

  const handleUpdate = async (commentId: string, newContent: string) => {
    setUpdatingCommentId(commentId);
    setError(null);

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update comment.");
      }

      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? (data.result as Comment) : c))
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while updating the comment."
      );
      throw err;
    } finally {
      setUpdatingCommentId(null);
    }
  };

  const handleDelete = async (commentId: string) => {
    setDeletingCommentId(commentId);
    setError(null);

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete comment.");
      }

      setComments((prev) => prev.filter((c) => c.id !== commentId));
      await fetchComments(0, false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while deleting the comment."
      );
    } finally {
      setDeletingCommentId(null);
    }
  };

  if (isLoading && comments.length === 0) {
    return (
      <div className="space-y-0">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-4 sm:gap-4 sm:px-5">
            <Skeleton className="mt-0.5 size-8 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <Alert variant="destructive" className="rounded-xl" role="alert">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}

      <div className="max-h-[45vh] overflow-y-auto rounded-xl border border-border/80 bg-background/80">
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isDeleting={deletingCommentId === comment.id}
              isUpdating={updatingCommentId === comment.id}
              showSeparator={index < comments.length - 1}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))
        ) : (
          <div className="flex min-h-40 flex-col items-center justify-center px-5 py-8 text-center">
            <span className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </span>
            <h3 className="text-sm font-semibold">No comments yet</h3>
            <p className="mt-1 max-w-xs text-sm leading-6 text-muted-foreground">
              Be the first to add a comment to this task.
            </p>
          </div>
        )}
      </div>

      {hasMore && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoadingMore}
          onClick={handleLoadMore}
          className="w-full h-8 rounded-lg text-xs"
        >
          {isLoadingMore ? (
            <>
              <svg className="mr-2 size-3.5 animate-spin" fill="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </>
          ) : (
            "Load older comments"
          )}
        </Button>
      )}

      <Separator className="bg-border/70" />

      <CommentForm
        onSubmit={handleAdd}
        isSubmitting={adding}
        placeholder="Write a comment..."
        submitLabel="Add comment"
      />
    </div>
  );
};

export default TaskComments;
