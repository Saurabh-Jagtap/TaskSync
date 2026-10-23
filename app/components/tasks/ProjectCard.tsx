
import {
    FolderKanban,
    LoaderCircle,
    MoreHorizontal,
    Pencil,
    Trash2,
} from "lucide-react";

import type { Project } from "@/db/schema";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectCardProps {
    project: Project;
    isDeleting: boolean;
    onEdit: (project: Project) => void;
    onDelete: (id: string) => void;
}

const ProjectCard = ({
    project,
    isDeleting,
    onEdit,
    onDelete,
}: ProjectCardProps) => {
    return (
        <div className="group flex min-h-48 flex-col rounded-xl border border-emerald-900/10 bg-white/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-600/40 hover:shadow-md dark:border-emerald-100/10 dark:bg-[#17231c] dark:hover:bg-[#1a2a21]">
            <div className="mb-4 flex items-start justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <FolderKanban className="size-5" />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={`Actions for ${project.title}`}
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
                            onClick={() => onEdit(project)}
                            className="cursor-pointer"
                        >
                            <Pencil className="mr-2 size-4" />
                            Edit project
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(project.id)}
                            className="cursor-pointer"
                        >
                            <Trash2 className="mr-2 size-4" />
                            Delete project
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <h3 className="break-words text-base font-semibold tracking-tight">
                {project.title}
            </h3>

            <p className="mt-1 flex-1 break-words text-sm leading-6 text-muted-foreground">
                {project.description || "No description provided."}
            </p>

            <div className="mt-4 border-t border-border/70 pt-3">
                <p className="text-xs text-muted-foreground">Project</p>
            </div>
        </div>
    );
};

export default ProjectCard;
