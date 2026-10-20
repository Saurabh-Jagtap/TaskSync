
"use client";

import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
    CheckCircle2,
    ClipboardList,
    FolderKanban,
    Leaf,
    LoaderCircle,
    Moon,
    MoreHorizontal,
    Pencil,
    Plus,
    Sun,
    Trash2,
} from "lucide-react";

import type { Project, Task } from "@/db/schema";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface IFormInput {
    title: string;
    description: string;
}

const emptyFormValues: IFormInput = {
    title: "",
    description: "",
};

const TasksPage = () => {
    const createForm = useForm<IFormInput>({
        defaultValues: emptyFormValues,
    });

    const editForm = useForm<IFormInput>({
        defaultValues: emptyFormValues,
    });

    const createProjectForm = useForm<IFormInput>({
        defaultValues: emptyFormValues,
    });

    const editProjectForm = useForm<IFormInput>({
        defaultValues: emptyFormValues,
    });

    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskCreated, setTaskCreated] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDark, setIsDark] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
    const [pageError, setPageError] = useState("");

    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
    const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
    const [isCreatingProject, setIsCreatingProject] = useState(false);
    const [isUpdatingProject, setIsUpdatingProject] = useState(false);

    // Apply the selected theme to the document.
    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDark);
    }, [isDark]);

    const handleFetchTasks = async () => {
        try {
            const response = await fetch("/api/tasks");

            if (!response.ok) {
                throw new Error("Unable to load tasks.");
            }

            const data = await response.json();
            setTasks(data.result);
            setPageError("");
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
            setPageError("We couldn't load your tasks. Please try again.");
        }
    };

    useEffect(() => {
        handleFetchTasks();
    }, []);

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        setIsCreating(true);
        setPageError("");
        setTaskCreated(false);

        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to create task.");
            }

            createForm.reset();
            setTasks((prev) => [...prev, result.newTask]);
            setTaskCreated(true);
        } catch (error) {
            console.error("Failed to create task:", error);
            setPageError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while creating the task."
            );
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteTask = async (id: string) => {
        setDeletingTaskId(id);
        setPageError("");

        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || "Unable to delete task.");
            }

            setTasks((prev) => prev.filter((task) => task.id !== id));
        } catch (error) {
            console.error("Failed to delete task:", error);
            setPageError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while deleting the task."
            );
        } finally {
            setDeletingTaskId(null);
        }
    };

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);

        editForm.reset({
            title: task.title,
            description: task.description ?? "",
        });
    };

    const handleUpdateTask: SubmitHandler<IFormInput> = async (data) => {
        if (!selectedTask) return;

        setIsUpdating(true);
        setPageError("");

        try {
            const response = await fetch(`/api/tasks/${selectedTask.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to update task.");
            }

            // Update the existing row without refetching the whole list.
            const updatedTask = result.updatedTask;

            setTasks((prev) =>
                prev.map((task) =>
                    task.id === updatedTask.id ? updatedTask : task
                )
            );

            setSelectedTask(null);
            editForm.reset();
        } catch (error) {
            console.error("Failed to update task:", error);
            setPageError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while updating the task."
            );
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelEdit = () => {
        setSelectedTask(null);
        editForm.reset();
    };

    const onProjectSubmit: SubmitHandler<IFormInput> = async (data) => {
        setIsCreatingProject(true);

        try {
            const response = await fetch("/api/projects", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to create project.");
            }

            setProjects((prev) => [...prev, result.newProject]);

            createProjectForm.reset();
            setIsCreateProjectOpen(false);
        } catch (error) {
            console.error("Failed to create project:", error);
            setPageError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while creating the project."
            );
        } finally {
            setIsCreatingProject(false);
        }
    }
    const handleFetchProjects = async () => {
        const response = await fetch('/api/projects', {
            method: "GET",
        })

        if (!response.ok) {
            throw new Error("Failed to fetch projects")
        }

        const result = await response.json()

        setProjects(result.result)
        console.log(result)
    }

    useEffect(() => {
        handleFetchProjects()
    }, [])

    const handleProjectDelete = async (id: string) => {
        setDeletingProjectId(id);
        setPageError("");

        try {
            const response = await fetch(`/api/projects/${id}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to delete project.");
            }

            setProjects((prev) => prev.filter((project) => project.id !== id));
        } catch (error) {
            console.error("Failed to delete project:", error);
            setPageError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while deleting the project."
            );
        } finally {
            setDeletingProjectId(null);
        }
    };

    const handleEditProject = (project: Project) => {
        setSelectedProject(project);
        editProjectForm.reset({
            title: project.title,
            description: project.description ?? "",
        });
    };

    const handleUpdateProject: SubmitHandler<IFormInput> = async (data) => {
        if (!selectedProject) return;

        setIsUpdatingProject(true);
        setPageError("");

        try {
            const response = await fetch(`/api/projects/${selectedProject.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Unable to update project.");
            }

            const updatedProject = result.updatedProject;

            setProjects((prev) =>
                prev.map((project) =>
                    project.id === updatedProject.id ? updatedProject : project
                )
            );

            setSelectedProject(null);
            editProjectForm.reset(emptyFormValues);
        } catch (error) {
            console.error("Failed to update project:", error);
            setPageError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while updating the project."
            );
        } finally {
            setIsUpdatingProject(false);
        }
    };

    const handleCancelProjectEdit = () => {
        setSelectedProject(null);
        editProjectForm.reset(emptyFormValues);
    };

    return (
        <main className="min-h-screen bg-[#F5F3ED] text-foreground transition-colors duration-300 dark:bg-[#171C19]">
            {/* Navbar */}
            <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-xl">
                <nav
                    aria-label="Main navigation"
                    className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
                >
                    <a
                        href="/"
                        className="group inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                        aria-label="TaskSync home"
                    >
                        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 transition-colors group-hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:group-hover:bg-emerald-900">
                            <Leaf className="size-5" strokeWidth={2.2} />
                        </span>
                        <span className="text-lg font-semibold tracking-tight">
                            TaskSync
                        </span>
                    </a>

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
                        title={isDark ? "Switch to light theme" : "Switch to dark theme"}
                        onClick={() => setIsDark((current) => !current)}
                        className="size-10 rounded-full border-border bg-background transition-all hover:border-emerald-600/40 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                    >
                        {isDark ? (
                            <Sun className="size-[18px]" />
                        ) : (
                            <Moon className="size-[18px]" />
                        )}
                    </Button>
                </nav>
            </header>

            {/* Main workspace */}
            <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-8 sm:px-6 sm:pt-12 lg:px-8">
                {/* Page heading */}
                <section className="mb-8 space-y-2 sm:mb-9">
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                        <span className="size-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                        Your workspace
                    </div>

                    <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                        Your tasks
                    </h1>

                    <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                        Capture, organize, and complete what matters.
                    </p>
                </section>

                {/* Error feedback */}
                {pageError && (
                    <Alert
                        variant="destructive"
                        className="mb-6 rounded-xl"
                        role="alert"
                    >
                        <AlertTitle>{pageError}</AlertTitle>
                    </Alert>
                )}

                {/* Success feedback */}
                {taskCreated && (
                    <Alert className="mb-6 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                        <CheckCircle2 className="size-4 text-emerald-700 dark:text-emerald-400" />
                        <AlertTitle>Task created successfully.</AlertTitle>
                    </Alert>
                )}

                {/* Compact inline composer */}
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

                    <form
                        onSubmit={createForm.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="create-title">Title</Label>
                            <Input
                                id="create-title"
                                placeholder="What needs to get done?"
                                autoComplete="off"
                                aria-invalid={Boolean(createForm.formState.errors.title)}
                                className="h-11 border-border/90 bg-background shadow-none placeholder:text-muted-foreground/80 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 dark:focus-visible:border-emerald-400 dark:focus-visible:ring-emerald-400/20"
                                {...createForm.register("title", {
                                    required: "Title is required",
                                    minLength: {
                                        value: 3,
                                        message: "Title must be at least 3 characters long",
                                    },
                                })}
                            />

                            {createForm.formState.errors.title && (
                                <p className="text-sm text-destructive" role="alert">
                                    {createForm.formState.errors.title.message}
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
                                aria-invalid={Boolean(
                                    createForm.formState.errors.description
                                )}
                                className="min-h-20 resize-y border-border/90 bg-background shadow-none placeholder:text-muted-foreground/80 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 dark:focus-visible:border-emerald-400 dark:focus-visible:ring-emerald-400/20"
                                {...createForm.register("description", {
                                    required: "Description is required",
                                })}
                            />

                            {createForm.formState.errors.description && (
                                <p className="text-sm text-destructive" role="alert">
                                    {createForm.formState.errors.description.message}
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

                {/* Projects Section */}
                <section className="mb-10">
                        <div className="mb-4 flex items-end justify-between">
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight">
                                    Your projects
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Keep related work together.
                                </p>
                            </div>
                            <Button
                                type="button"
                                disabled={isCreatingProject}
                                onClick={() => setIsCreateProjectOpen(true)}
                                className="h-10 w-full rounded-lg bg-emerald-700 px-5 font-medium text-white shadow-sm transition-all hover:bg-emerald-800 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 sm:w-auto dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-300 dark:focus-visible:ring-emerald-400"
                            >
                                {isCreatingProject ? (
                                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                                ) : (
                                    <Plus className="mr-2 size-4" />
                                )}
                                {isCreatingProject ? "Creating..." : "Create project"}
                            </Button>

                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {projects.slice(0, 3).map((project) => (
                                <div
                                    key={project.id}
                                    className="group flex min-h-48 flex-col rounded-xl border border-emerald-900/10 bg-white/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-600/40 hover:shadow-md dark:border-emerald-100/10 dark:bg-[#17231c] dark:hover:bg-[#1a2a21]"
                                >
                                    {/* Project icon */}
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
                                                {deletingProjectId === project.id ? (
                                                    <LoaderCircle className="size-4 animate-spin" />
                                                ) : (
                                                    <MoreHorizontal className="size-5" />
                                                )}
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem
                                                    onClick={() => handleEditProject(project)}
                                                    className="cursor-pointer"
                                                >
                                                    <Pencil className="mr-2 size-4" />
                                                    Edit project
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onClick={() => handleProjectDelete(project.id)}
                                                    className="cursor-pointer"
                                                >
                                                    <Trash2 className="mr-2 size-4" />
                                                    Delete project
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Project details */}
                                    <h3 className="text-base font-semibold tracking-tight break-words">
                                        {project.title}
                                    </h3>

                                    <p className="mt-1 flex-1 text-sm leading-6 text-muted-foreground break-words">
                                        {project.description || "No description provided."}
                                    </p>

                                    {/* Card footer */}
                                    <div className="mt-4 border-t border-border/70 pt-3">
                                        <p className="text-xs text-muted-foreground">
                                            Project
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                </section>


                {/* Tasks Section */}
                <section aria-labelledby="all-tasks-heading">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-background text-muted-foreground">
                                <ClipboardList className="size-[18px]" />
                            </span>
                            <div>
                                <h2
                                    id="all-tasks-heading"
                                    className="text-lg font-semibold tracking-tight sm:text-xl"
                                >
                                    All tasks
                                </h2>
                                <p className="text-xs text-muted-foreground sm:text-sm">
                                    {tasks.length} {tasks.length === 1 ? "task" : "tasks"} in your workspace
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Rows */}
                    {tasks.length > 0 ? (
                        <div className="overflow-hidden rounded-xl border border-border/80 bg-background/80">
                            {tasks.map((task, index) => (
                                <div key={task.id}>
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
                                                {deletingTaskId === task.id ? (
                                                    <LoaderCircle className="size-4 animate-spin" />
                                                ) : (
                                                    <MoreHorizontal className="size-5" />
                                                )}
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuItem
                                                    onClick={() => handleEditTask(task)}
                                                    className="cursor-pointer"
                                                >
                                                    <Pencil className="mr-2 size-4" />
                                                    Edit task
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    className="cursor-pointer"
                                                >
                                                    <Trash2 className="mr-2 size-4" />
                                                    Delete task
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </article>

                                    {index < tasks.length - 1 && (
                                        <Separator className="bg-border/70" />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/50 px-5 py-10 text-center">
                            <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <ClipboardList className="size-6" />
                            </span>

                            <h3 className="text-base font-semibold">Nothing on your list yet</h3>
                            <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                                Start small. Create your first task and give your next step a place to live.
                            </p>
                        </div>
                    )}
                </section>
            </div>

            {/* Edit dialog */}
            <Dialog
                open={selectedTask !== null}
                onOpenChange={(open) => {
                    if (!open) handleCancelEdit();
                }}
            >
                <DialogContent className="w-[calc(100%-2rem)] rounded-2xl border-border/80 p-5 sm:max-w-lg sm:p-6">
                    <form
                        onSubmit={editForm.handleSubmit(handleUpdateTask)}
                        className="space-y-5"
                    >
                        <DialogHeader className="space-y-2">
                            <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <Pencil className="size-5" />
                            </div>

                            <DialogTitle className="text-xl tracking-tight">
                                Edit task
                            </DialogTitle>
                            <DialogDescription className="leading-6">
                                Make your changes below. Your task will be updated when you save.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-title">Title</Label>
                                <Input
                                    id="edit-title"
                                    aria-invalid={Boolean(editForm.formState.errors.title)}
                                    className="h-11 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 dark:focus-visible:border-emerald-400 dark:focus-visible:ring-emerald-400/20"
                                    {...editForm.register("title", {
                                        required: "Title is required",
                                        minLength: {
                                            value: 3,
                                            message: "Title must be at least 3 characters long",
                                        },
                                    })}
                                />
                                {editForm.formState.errors.title && (
                                    <p className="text-sm text-destructive" role="alert">
                                        {editForm.formState.errors.title.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    rows={3}
                                    aria-invalid={Boolean(
                                        editForm.formState.errors.description
                                    )}
                                    className="resize-y focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 dark:focus-visible:border-emerald-400 dark:focus-visible:ring-emerald-400/20"
                                    {...editForm.register("description", {
                                        required: "Description is required",
                                    })}
                                />
                                {editForm.formState.errors.description && (
                                    <p className="text-sm text-destructive" role="alert">
                                        {editForm.formState.errors.description.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-2">
                            <DialogClose
                                render={
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isUpdating}
                                    />
                                }
                            >
                                Cancel
                            </DialogClose>

                            <Button
                                type="submit"
                                disabled={isUpdating}
                                className="w-full rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-300 sm:w-auto"
                            >
                                {isUpdating && (
                                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                                )}
                                {isUpdating ? "Saving..." : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Create Project dialog */}
            <Dialog
                open={isCreateProjectOpen}
                onOpenChange={setIsCreateProjectOpen}
            >
                <DialogContent className="w-[calc(100%-2rem)] rounded-2xl border-border/80 p-5 sm:max-w-lg sm:p-6">
                    <form
                        onSubmit={createProjectForm.handleSubmit(onProjectSubmit)}
                        className="space-y-5"
                    >
                        <DialogHeader className="space-y-2">
                            <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <Pencil className="size-5" />
                            </div>

                            <DialogTitle className="text-xl tracking-tight">
                                Create Project
                            </DialogTitle>
                            <DialogDescription className="leading-6">
                                Make your changes below. Your task will be updated when you save.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-title">Title</Label>
                                <Input
                                    id="edit-title"
                                    aria-invalid={Boolean(createProjectForm.formState.errors.title)}
                                    className="h-11 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 dark:focus-visible:border-emerald-400 dark:focus-visible:ring-emerald-400/20"
                                    {...createProjectForm.register("title", {
                                        required: "Title is required",
                                        minLength: {
                                            value: 3,
                                            message: "Title must be at least 3 characters long",
                                        },
                                    })}
                                />
                                {createProjectForm.formState.errors.title && (
                                    <p className="text-sm text-destructive" role="alert">
                                        {createProjectForm.formState.errors.title.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Description</Label>
                                <Textarea
                                    id="edit-description"
                                    rows={3}
                                    aria-invalid={Boolean(
                                        createProjectForm.formState.errors.description
                                    )}
                                    className="resize-y focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 dark:focus-visible:border-emerald-400 dark:focus-visible:ring-emerald-400/20"
                                    {...createProjectForm.register("description", {
                                        required: "Description is required",
                                    })}
                                />
                                {createProjectForm.formState.errors.description && (
                                    <p className="text-sm text-destructive" role="alert">
                                        {createProjectForm.formState.errors.description.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-2">
                            <DialogClose
                                render={
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isUpdating}
                                    />
                                }
                            >
                                Cancel
                            </DialogClose>

                            <Button
                                type="submit"
                                disabled={isCreatingProject}
                                className="w-full rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-300 sm:w-auto"
                            >
                                {isCreatingProject && (
                                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                                )}
                                {isCreatingProject ? "Saving..." : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Project dialog */}
            <Dialog
                open={selectedProject !== null}
                onOpenChange={(open) => {
                    if (!open) handleCancelProjectEdit();
                }}
            >
                <DialogContent className="w-[calc(100%-2rem)] rounded-2xl border-border/80 p-5 sm:max-w-lg sm:p-6">
                    <form
                        onSubmit={editProjectForm.handleSubmit(handleUpdateProject)}
                        className="space-y-5"
                    >
                        <DialogHeader className="space-y-2">
                            <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <Pencil className="size-5" />
                            </div>

                            <DialogTitle className="text-xl tracking-tight">
                                Edit project
                            </DialogTitle>
                            <DialogDescription className="leading-6">
                                Update your project details and save your changes.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-project-title">Title</Label>
                                <Input
                                    id="edit-project-title"
                                    aria-invalid={Boolean(editProjectForm.formState.errors.title)}
                                    className="h-11 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 dark:focus-visible:border-emerald-400 dark:focus-visible:ring-emerald-400/20"
                                    {...editProjectForm.register("title", {
                                        required: "Title is required",
                                        minLength: {
                                            value: 3,
                                            message: "Title must be at least 3 characters long",
                                        },
                                    })}
                                />
                                {editProjectForm.formState.errors.title && (
                                    <p className="text-sm text-destructive" role="alert">
                                        {editProjectForm.formState.errors.title.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-project-description">Description</Label>
                                <Textarea
                                    id="edit-project-description"
                                    rows={3}
                                    aria-invalid={Boolean(editProjectForm.formState.errors.description)}
                                    className="resize-y focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 dark:focus-visible:border-emerald-400 dark:focus-visible:ring-emerald-400/20"
                                    {...editProjectForm.register("description", {
                                        required: "Description is required",
                                    })}
                                />
                                {editProjectForm.formState.errors.description && (
                                    <p className="text-sm text-destructive" role="alert">
                                        {editProjectForm.formState.errors.description.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isUpdatingProject}
                                onClick={handleCancelProjectEdit}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={isUpdatingProject}
                                className="w-full rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-300 sm:w-auto"
                            >
                                {isUpdatingProject && (
                                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                                )}
                                {isUpdatingProject ? "Saving..." : "Save changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </main>
    );
};

export default TasksPage;