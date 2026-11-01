
import {
  ClipboardList,
  LoaderCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import type { Task } from "@/db/schema";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskRowProps {
  task: Task;
  isDeleting: boolean;
  showSeparator: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskRow = ({
  task,
  isDeleting,
  showSeparator,
  onEdit,
  onDelete,
}: TaskRowProps) => {
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

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Actions for ${task.title}`}
                className="size-9 shrink-0 rounded-lg text-muted-foreground opacity-100 transition-colors hover:bg-emerald-100 hover:text-emerald-900 sm:opacity-70 sm:group-hover:opacity-100 dark:hover:bg-emerald-900/60 dark:hover:text-emerald-100"
              />
            }
          >
            {isDeleting ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <MoreHorizontal className="size-5" />
            )}
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40">
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
            >
              <Trash2 className="mr-2 size-4" />
              Delete task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </article>

      {showSeparator && <Separator className="bg-border/70" />}
    </div>
  );
};

export default TaskRow;
