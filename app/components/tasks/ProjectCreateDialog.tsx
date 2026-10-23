
import { FolderKanban, LoaderCircle } from "lucide-react";
import type {
  SubmitHandler,
  UseFormReturn,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IFormInput } from "./TaskCreateForm";

interface ProjectCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<IFormInput>;
  onSubmit: SubmitHandler<IFormInput>;
  isCreating: boolean;
}

const ProjectCreateDialog = ({
  open,
  onOpenChange,
  form,
  onSubmit,
  isCreating,
}: ProjectCreateDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] rounded-2xl border-border/80 p-5 sm:max-w-lg sm:p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <DialogHeader className="space-y-2">
            <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <FolderKanban className="size-5" />
            </div>

            <DialogTitle className="text-xl tracking-tight">
              Create project
            </DialogTitle>

            <DialogDescription className="leading-6">
              Give your project a title and a description to organize related work.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-project-title">Title</Label>
              <Input
                id="create-project-title"
                aria-invalid={Boolean(form.formState.errors.title)}
                className="h-11 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 dark:focus-visible:border-emerald-400 dark:focus-visible:ring-emerald-400/20"
                {...form.register("title", {
                  required: "Title is required",
                  minLength: {
                    value: 3,
                    message: "Title must be at least 3 characters long",
                  },
                })}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive" role="alert">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-project-description">
                Description
              </Label>
              <Textarea
                id="create-project-description"
                rows={3}
                aria-invalid={Boolean(form.formState.errors.description)}
                className="resize-y focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 dark:focus-visible:border-emerald-400 dark:focus-visible:ring-emerald-400/20"
                {...form.register("description", {
                  required: "Description is required",
                })}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive" role="alert">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-2">
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={isCreating} />
              }
            >
              Cancel
            </DialogClose>

            <Button
              type="submit"
              disabled={isCreating}
              className="w-full rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-300 sm:w-auto"
            >
              {isCreating && (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              )}
              {isCreating ? "Creating..." : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectCreateDialog;
