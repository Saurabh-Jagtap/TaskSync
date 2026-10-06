"use client"
import { Task } from "@/db/schema"
import { useEffect, useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { CheckCircle2Icon, InfoIcon } from "lucide-react"
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

interface IFormInput {
    title: string
    description: string
}
const TasksPage = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<IFormInput>()
    const [tasks, setTasks] = useState<Task[]>([])
    const [taskCreated, setTaskCreated] = useState(false)

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
                reset()
                setTaskCreated(true)
            }
            const result = await response.json()
            setTasks(prev => [...prev, result.newTask])

        } catch (error) {
            console.error("Failed to create task: ", error)
        }
    }

    const handleFetchTasks = async () => {
        const response = await fetch('/api/tasks', {
            method: "GET",
            headers: {
                "Content-Type": 'application/json'
            },
        })

        const data = await response.json()
        setTasks(data.result)
        console.log(data.result)
    }

    useEffect(() => {
        handleFetchTasks()
    }, [])

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <label>Enter Title </label>
                <input {...register("title", {
                    required: "Title is required",
                    minLength: {
                        value: 3,
                        message: "Title must be at least 3 characters long"
                    },
                })} />
                {errors.title && <p>{errors.title.message}</p>}
                <label>Enter Description </label>
                <textarea {...register("description", {
                    required: "Description is required",
                })} />
                {errors.description && <p>{errors.description.message}</p>}
                <input type="submit" />
            </form>

            {taskCreated && <div className="grid w-full max-w-md items-start gap-4">
                <Alert className="max-w-md">
                    <CheckCircle2Icon />
                    <AlertTitle>Task Created Successfully</AlertTitle>
                </Alert>
            </div>}

            <div>
                <div className="grid grid-cols-4 gap-4 p-6 m-6">
                {tasks.map((task, index) => (
                    <Card className="relative mx-auto w-full max-w-sm pt-0" key={task.id}>

                        <CardHeader>
                            <CardAction>
                                <Badge variant="secondary">Featured</Badge>
                            </CardAction>
                            <CardTitle>{task.title}</CardTitle>
                            <CardDescription>
                                {task.description}
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button className="w-full">View Event</Button>
                        </CardFooter>

                    </Card>
                ))}
                </div>
            </div>

        </div>
    )
}

export default TasksPage
