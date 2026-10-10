"use client";

import { Task } from "@/db/schema";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { CheckCircle2Icon } from "lucide-react";

import {
    Alert,
    AlertTitle,
} from "@/components/ui/alert";

import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Label } from "@/components/ui/label"

interface IFormInput {
    title: string;
    description: string;
}

const TasksPage = () => {
    const createForm = useForm<IFormInput>();
    const editForm = useForm<IFormInput>();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskCreated, setTaskCreated] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)


    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })

            if (response.ok) {
                createForm.reset()
                setTaskCreated(true)
            }
            const result = await response.json()
            setTasks(prev => [...prev, result.newTask])

        } catch (error) {
            console.error("Failed to create task: ", error)
        }
    };

    const handleFetchTasks = async () => {
        try {
            const response = await fetch("/api/tasks");

            const data = await response.json();

            setTasks(data.result);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        }
    };

    useEffect(() => {
        handleFetchTasks();
    }, []);

    const handleDeleteTask = async (id: string) => {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setTasks((prev) => prev.filter((task) => task.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete task:", error);
        }
    };

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);

        editForm.reset({
            title: task.title,
            description: task.description,
        });
    };

    const handleUpdateTask: SubmitHandler<IFormInput> = async (data) => {
        if (!selectedTask) return;

        try {
            const response = await fetch(`/api/tasks/${selectedTask.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                let updatedTask = await response.json();
                setSelectedTask(null);
                alert(updatedTask.message)
            }


        } catch (error) {
            console.error("Failed to edit task:", error);
        }
    };

    const handleCancelEdit = () => {
        setSelectedTask(null);
        editForm.reset();
    };

    return (
        <div>
            {/* Create/Edit form */}
            <form onSubmit={createForm.handleSubmit(onSubmit)}>
                <label>Enter Title</label>

                <Input
                    {...createForm.register("title", {
                        required: "Title is required",
                        minLength: {
                            value: 3,
                            message: "Title must be at least 3 characters long",
                        },
                    })}
                />

                {createForm.formState.errors.title && <p>{createForm.formState.errors.title.message}</p>}

                <label>Enter Description</label>

                <Textarea
                    {...createForm.register("description", {
                        required: "Description is required",
                    })}
                />

                {createForm.formState.errors.description && (
                    <p>{createForm.formState.errors.description.message}</p>
                )}

                <Button type="submit">
                    Create Task
                </Button>
            </form>

            {taskCreated && (
                <div className="grid w-full max-w-md items-start gap-4">
                    <Alert className="max-w-md">
                        <CheckCircle2Icon />
                        <AlertTitle>
                            Task Created Successfully
                        </AlertTitle>
                    </Alert>
                </div>
            )}

            {/* Task cards */}
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-4">
                {tasks.map((task) => {
                    return (
                        <Card
                            className="relative w-full pt-0"
                            key={task.id}
                        >
                            <CardHeader>
                                <CardAction>
                                    <Button
                                        onClick={() => handleEditTask(task)}
                                    >
                                        Edit
                                    </Button>

                                    <Button
                                        onClick={() => handleDeleteTask(task.id)}
                                    >
                                        Delete
                                    </Button>

                                </CardAction>

                                <CardTitle>{task.title}</CardTitle>

                                <CardDescription>
                                    {task.description}
                                </CardDescription>

                            </CardHeader>

                            <CardFooter>
                                <Button className="w-full">
                                    View Task
                                </Button>

                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {selectedTask &&
                <Dialog open={selectedTask !== null} onOpenChange={(open) => {
                    if (!open) setSelectedTask(null)
                }}>
                    <DialogContent className="sm:max-w-sm">
                        <form onSubmit={editForm.handleSubmit(handleUpdateTask)}>
                            <DialogHeader>
                                <DialogTitle>Edit Task</DialogTitle>
                                <DialogDescription>
                                    Make changes to your task here. Click save when you&apos;re
                                    done.
                                </DialogDescription>
                            </DialogHeader>
                            <FieldGroup>
                                <Field>
                                    <Label>Enter Title</Label>
                                    <Input
                                        {...editForm.register("title", {
                                            required: "Title is required",
                                            minLength: {
                                                value: 3,
                                                message: "Title must be at least 3 characters long",
                                            },
                                        })}
                                    />
                                </Field>
                                <Field>
                                    <Label>Enter Description</Label>
                                    <Input
                                        {...editForm.register("description", {
                                            required: "Description is required",
                                        })}
                                    />
                                </Field>
                            </FieldGroup>
                            <DialogFooter>
                                <DialogClose render={<Button variant="outline">Cancel</Button>} />
                                <Button type="submit">Save changes</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            }
        </div>
    );
};

export default TasksPage;