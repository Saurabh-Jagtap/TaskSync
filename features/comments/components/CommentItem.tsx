
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { LoaderCircle, MessageSquare, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import type { CommentFromApi } from "../types";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CommentForm from "./CommentForm";

interface CommentItemProps {
    comment: CommentFromApi;
    isDeleting: boolean;
    isUpdating: boolean;
    showSeparator: boolean;
    onDelete: (commentId: string) => void;
    onUpdate: (commentId: string, newContent: string) => Promise<void>;
}

const CommentItem = ({
    comment,
    isDeleting,
    isUpdating,
    showSeparator,
    onDelete,
    onUpdate,
}: CommentItemProps) => {
    const [isEditing, setIsEditing] = useState(false);

    const handleUpdate = async (content: string) => {
        await onUpdate(comment.id, content);
        // Only close the edit form if the parent did not throw (parent sets error instead).
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    // createdAt arrives as an ISO string over JSON — hydrate with new Date() before date-fns.
    const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
        addSuffix: true,
    });

    return (
        <div>
            <article className="group flex min-w-0 items-start gap-3 px-3 py-4 transition-colors hover:bg-emerald-50/60 sm:gap-4 sm:px-5 dark:hover:bg-emerald-950/25">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-800 dark:group-hover:bg-emerald-900/70 dark:group-hover:text-emerald-200">
                    <MessageSquare className="size-4" />
                </span>

                <div className="min-w-0 flex-1 space-y-1">
                    {isEditing ? (
                        <CommentForm
                            onSubmit={handleUpdate}
                            isSubmitting={isUpdating}
                            defaultValue={comment.content}
                            submitLabel="Save changes"
                            onCancel={handleCancelEdit}
                        />
                    ) : (
                        <>
                            <p className="break-words text-sm leading-5 text-foreground">
                                {comment.content}
                            </p>
                            <p className="text-xs text-muted-foreground">{timeAgo}</p>
                        </>
                    )}
                </div>

                {!isEditing && (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Comment actions"
                                    className="size-8 shrink-0 rounded-lg text-muted-foreground opacity-100 transition-colors hover:bg-emerald-100 hover:text-emerald-900 sm:opacity-70 sm:group-hover:opacity-100 dark:hover:bg-emerald-900/60 dark:hover:text-emerald-100"
                                />
                            }
                        >
                            {isDeleting ? (
                                <LoaderCircle className="size-4 animate-spin" />
                            ) : (
                                <MoreHorizontal className="size-4" />
                            )}
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                                onClick={() => setIsEditing(true)}
                                className="cursor-pointer"
                            >
                                <Pencil className="mr-2 size-4" />
                                Edit
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => onDelete(comment.id)}
                                className="cursor-pointer"
                            >
                                <Trash2 className="mr-2 size-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </article>

            {showSeparator && <Separator className="bg-border/70" />}
        </div>
    );
};

export default CommentItem;
