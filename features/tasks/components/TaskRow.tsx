import type { TaskWithCommentSummary } from "@/features/tasks/types";
import { useState } from "react";

import { ClipboardList, MoreHorizontal, MessageSquare, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TaskComments from "@/features/comments/components/TaskComments";
import { formatDistanceToNow } from "date-fns";

interface TaskRowProps {
  task: TaskWithCommentSummary;
  isDeleting: boolean;
  showSeparator: boolean;
  onEdit: (task: TaskWithCommentSummary) => void;
  onDelete: (id: string) => void;
  onCommentSummaryChange?: (taskId: string, commentCount: number, latestComment: { id: string; content: string; createdAt: string } | null) => void;
}

const TaskRow = ({
  task,
  isDeleting,
  showSeparator,
  onEdit,
  onDelete,
}: TaskRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const triggerAriaLabel = isExpanded ? "Collapse comments" : "Expand comments";

  return (
    <div>
      <article className="group flex min-w-0 items-start gap-3 px-3 py-4 transition-colors hover:bg-emerald-50/60 sm:items-center sm:gap-4 sm:px-5 dark:hover:bg-emerald-950/25">
        <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-800 sm:mt-0 dark:group-hover:bg-emerald-900/70 dark:group-hover:text-emerald-200">
          <ClipboardList className="size-[17px]" />
        </span>

        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="break-words text-sm font-medium leading-5 text-foreground sm:text-[15px]">
            {task.title}
          </h3>

          <p className="break-words text-sm leading-5 text-muted-foreground">
            {task.description || "No description provided."}
          </p>
        </div>

        {/* Comment count and latest comment preview */}
        <div className="hidden sm:block sm:ml-6">
          {task.commentCount > 0 ? (
            <div className="text-xs text-muted-foreground">
              <span>{task.commentCount} comment{task.commentCount > 1 ? "s" : ""}</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No comments</span>
          )}

          {task.latestComment && (
            <p className="mt-1 text-xs text-muted-foreground">
              {task.latestComment.content.length > 50
                ? `${task.latestComment.content.substring(0, 50)}...`
                : task.latestComment.content}
              <span className="ml-2 text-[10px] opacity-60">
                {formatDistanceToNow(new Date(task.latestComment.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={triggerAriaLabel}
                className="size-9 shrink-0 rounded-lg text-muted-foreground opacity-100 transition-colors hover:bg-emerald-100 hover:text-emerald-900 sm:opacity-70 sm:group-hover:opacity-100 dark:hover:bg-emerald-900/60 dark:hover:text-emerald-100"
              >
                <MoreHorizontal className="size-5" />
              </Button>
            }
          >
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={toggleExpand}
              className="cursor-pointer"
            >
              <MessageSquare className="mr-2 size-4" />
              {isExpanded ? "Collapse comments" : "Expand comments"}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => onEdit(task)}
              className="cursor-pointer"
            >
              <Pencil className="mr-2 size-4" />
              Edit task
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(task.id)}
              className="cursor-pointer"
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 size-4" />
              Delete task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </article>

      {isExpanded && (
        <TaskComments taskId={task.id} onCommentSummaryChange={onCommentSummaryChange} />
      )}

      {showSeparator && <Separator className="bg-border/70" />}
    </div>
  );
};

export default TaskRow;