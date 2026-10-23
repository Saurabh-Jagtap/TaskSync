
"use client";

import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
    CheckCircle2,
    ClipboardList,
    Leaf,
    LoaderCircle,
    Moon,
    Plus,
    Sun,
} from "lucide-react";

import type { Project, Task } from "@/db/schema";

import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

import ProjectCard from "../components/tasks/ProjectCard";
import TaskRow from "../components/tasks/TaskRow";
import TaskCreateForm, { type IFormInput } from "../components/tasks/TaskCreateForm";
import ProjectCreateDialog from "../components/tasks/ProjectCreateDialog";
import TaskEditDialog from "../components/tasks/TaskEditDialog";
import ProjectEditDialog from "../components/tasks/ProjectEditDialog";

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

    const handleFetch = async (type: "tasks" | "projects") => {
        const response = await fetch(`/api/${type}`);

        if (!response.ok) {
            throw new Error(`Unable to load ${type}.`);
        }

        const data = await response.json();

        if (type === "tasks") {
            setTasks(data.result);
        } else {
            setProjects(data.result);
        }
    };

    useEffect(() => {
        Promise.all([handleFetch("tasks"), handleFetch("projects")])
            .then(() => {
                setPageError("");
            })
            .catch((error) => {
                console.error("Failed to load workspace data:", error);

                setPageError(
                    error instanceof Error
                        ? error.message
                        : "We couldn't load your workspace. Please try again."
                );
            });
    }, []);

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

                {/* Create Task Form */}
                <TaskCreateForm
                    form={createForm}
                    onSubmit={onSubmit}
                    isCreating={isCreating}
                />


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
                            <ProjectCard
                                key={project.id}
                                project={project}
                                isDeleting={deletingProjectId === project.id}
                                onEdit={handleEditProject}
                                onDelete={handleProjectDelete}
                            />
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
                                <TaskRow
                                    key={task.id}
                                    task={task}
                                    isDeleting={deletingTaskId === task.id}
                                    showSeparator={index < tasks.length - 1}
                                    onEdit={handleEditTask}
                                    onDelete={handleDeleteTask}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/50 px-5 py-10 text-center">
                            <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <ClipboardList className="size-6" />
                            </span>

                            <h3 className="text-base font-semibold">
                                Nothing on your list yet
                            </h3>

                            <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                                Start small. Create your first task and give your next step a place to live.
                            </p>
                        </div>
                    )}

                </section>
            </div>

            {/* Edit Task dialog */}

            <TaskEditDialog
                open={selectedTask !== null}
                onOpenChange={(open) => {
                    if (!open) handleCancelEdit();
                }}
                form={editForm}
                onSubmit={handleUpdateTask}
                isUpdating={isUpdating}
            />


            {/* Create Project dialog */}
            <ProjectCreateDialog
                open={isCreateProjectOpen}
                onOpenChange={setIsCreateProjectOpen}
                form={createProjectForm}
                onSubmit={onProjectSubmit}
                isCreating={isCreatingProject}
            />


            {/* Edit Project dialog */}

            <ProjectEditDialog
                open={selectedProject !== null}
                onOpenChange={(open) => {
                    if (!open) handleCancelProjectEdit();
                }}
                form={editProjectForm}
                onSubmit={handleUpdateProject}
                isUpdating={isUpdatingProject}
            />

        </main>
    );
};

export default TasksPage;