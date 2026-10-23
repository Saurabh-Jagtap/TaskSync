
import { ClipboardList, LoaderCircle, Plus } from "lucide-react";
import {
    type SubmitHandler,
    type UseFormReturn,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface IFormInput {
    title: string;
    description: string;
}

interface TaskCreateFormProps {
    form: UseFormReturn<IFormInput>;
    onSubmit: SubmitHandler<IFormInput>;
    isCreating: boolean;
}

const TaskCreateForm = ({
    form,
    onSubmit,
    isCreating,
}: TaskCreateFormProps) => {
    return (
        <section
            aria-labelledby="create-task-heading"
            className="mb-10 rounded-2xl border border-emerald-900/10 bg-emerald-50/70 p-4 shadow-sm shadow-emerald-950/[0.02] sm:p-6 dark:border-emerald-100/10 dark:bg-emerald-950/20 dark:shadow-none"
        >
            <div className="mb-5 flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200">
                    <Plus className="size-5" />
                </span>

                <div className="space-y-1">
                    <h2
                        id="create-task-heading"
                        className="text-base font-semibold tracking-tight sm:text-lg"
                    >
                        Create a task
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Get your next task out of your head and into your workspace.
                    </p>
                </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="create-title">Title</Label>
                    <Input
                        id="create-title"
                        placeholder="What needs to get done?"
                        autoComplete="off"
                        aria-invalid={Boolean(form.formState.errors.title)}
                        className="h-11 border-border/90 bg-background shadow-none placeholder:text-muted-foreground/80 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 dark:focus-visible:border-emerald-400 dark:focus-visible:ring-emerald-400/20"
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
                    <Label htmlFor="create-description">
                        Description{" "}
                        <span className="font-normal text-muted-foreground">
                            (optional)
                        </span>
                    </Label>

                    <Textarea
                        id="create-description"
                        placeholder="Add a few details..."
                        rows={2}
                        aria-invalid={Boolean(form.formState.errors.description)}
                        className="min-h-20 resize-y border-border/90 bg-background shadow-none placeholder:text-muted-foreground/80 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 dark:focus-visible:border-emerald-400 dark:focus-visible:ring-emerald-400/20"
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

                <div className="flex justify-end pt-1">
                    <Button
                        type="submit"
                        disabled={isCreating}
                        className="h-10 w-full rounded-lg bg-emerald-700 px-5 font-medium text-white shadow-sm transition-all hover:bg-emerald-800 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 sm:w-auto dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-300 dark:focus-visible:ring-emerald-400"
                    >
                        {isCreating ? (
                            <LoaderCircle className="mr-2 size-4 animate-spin" />
                        ) : (
                            <Plus className="mr-2 size-4" />
                        )}
                        {isCreating ? "Creating..." : "Create task"}
                    </Button>
                </div>
            </form>
        </section>
    );
};

export default TaskCreateForm;
