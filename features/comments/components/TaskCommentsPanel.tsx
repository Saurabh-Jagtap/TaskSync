
"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";

import type { Comment, Task } from "@/db/schema";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

interface TaskCommentsPanelProps {
    open: boolean;
    task: Task | null;
    onOpenChange: (open: boolean) => void;
}

const TaskCommentsPanel = ({ open, task, onOpenChange }: TaskCommentsPanelProps) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
    const [updatingCommentId, setUpdatingCommentId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // Fetch comments when the panel opens or the selected task changes.
    // AbortController ensures a stale response cannot overwrite comments for a
    // different task if the user switches tasks before the first request resolves.
    useEffect(() => {
        if (!open || !task) return;

        const controller = new AbortController();

        setIsLoading(true);
        setError("");
        setComments([]);

        fetch(`/api/tasks/${task.id}/comments`, { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error("Unable to load comments.");
                return res.json();
            })
            .then((data: { result: Comment[] }) => {
                if (controller.signal.aborted) return; // stale guard
                setComments(data.result ?? []);
            })
            .catch((err: unknown) => {
                if (err instanceof Error && err.name === "AbortError") return; // expected cancellation
                setError(
                    err instanceof Error ? err.message : "Unable to load comments."
                );
            })
            .finally(() => {
                if (!controller.signal.aborted) setIsLoading(false);
            });

        return () => controller.abort();
    }, [open, task?.id]); // task?.id in deps catches rapid task-switching

    // --- Handlers ---

    const handleAdd = async (content: string) => {
        if (!task) return;

        setIsAdding(true);
        setError("");

        try {
            const response = await fetch(`/api/tasks/${task.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to add comment.");
            }

            // POST returns { result: Comment } — the raw row, not wrapped in newTask.
            setComments((prev) => [...prev, data.result as Comment]);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Something went wrong while adding the comment."
            );
        } finally {
            setIsAdding(false);
        }
    };

    const handleUpdate = async (commentId: string, newContent: string) => {
        setUpdatingCommentId(commentId);
        setError("");

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

            // Replace matching comment in-place without a refetch.
            setComments((prev) =>
                prev.map((c) => (c.id === commentId ? (data.result as Comment) : c))
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Something went wrong while updating the comment."
            );
            // Re-throw so CommentItem keeps its edit form open.
            throw err;
        } finally {
            setUpdatingCommentId(null);
        }
    };

    const handleDelete = async (commentId: string) => {
        setDeletingCommentId(commentId);
        setError("");

        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to delete comment.");
            }

            setComments((prev) => prev.filter((c) => c.id !== commentId));
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Something went wrong while deleting the comment."
            );
        } finally {
            setDeletingCommentId(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] rounded-2xl border-border/80 p-5 sm:max-w-lg sm:p-6">
                <DialogHeader className="space-y-2">
                    <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <MessageSquare className="size-5" />
                    </div>

                    <DialogTitle className="text-xl tracking-tight">
                        Comments
                    </DialogTitle>

                    <DialogDescription className="leading-6 truncate">
                        {task?.title ?? "Task"}
                    </DialogDescription>
                </DialogHeader>

                {/* Error alert — covers fetch, add, edit, and delete failures */}
                {error && (
                    <Alert
                        variant="destructive"
                        className="rounded-xl"
                        role="alert"
                    >
                        <AlertTitle>{error}</AlertTitle>
                    </Alert>
                )}

                {/* Comments list */}
                <div className="max-h-[45vh] overflow-y-auto rounded-xl border border-border/80 bg-background/80">
                    {isLoading ? (
                        // Skeleton loading state
                        <div className="space-y-0">
                            {[0, 1, 2].map((i) => (
                                <div key={i}>
                                    <div className="flex items-start gap-3 px-4 py-4 sm:gap-4 sm:px-5">
                                        <Skeleton className="mt-0.5 size-8 shrink-0 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-full rounded" />
                                            <Skeleton className="h-3 w-24 rounded" />
                                        </div>
                                    </div>
                                    {i < 2 && <Separator className="bg-border/70" />}
                                </div>
                            ))}
                        </div>
                    ) : comments.length > 0 ? (
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
                        // Empty state
                        <div className="flex min-h-40 flex-col items-center justify-center px-5 py-8 text-center">
                            <span className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <MessageSquare className="size-5" />
                            </span>
                            <h3 className="text-sm font-semibold">No comments yet</h3>
                            <p className="mt-1 max-w-xs text-sm leading-6 text-muted-foreground">
                                Be the first to add a comment to this task.
                            </p>
                        </div>
                    )}
                </div>

                {/* Add comment form */}
                <div className="pt-1">
                    <CommentForm
                        onSubmit={handleAdd}
                        isSubmitting={isAdding}
                        placeholder="Write a comment..."
                        submitLabel="Add comment"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default TaskCommentsPanel;
