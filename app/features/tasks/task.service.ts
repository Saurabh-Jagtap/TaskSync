
import { and, eq } from "drizzle-orm";
import { tasksTable } from "@/db/schema";
import { db } from "@/lib/db";

type TaskInput = {
  title: string;
  description: string;
};

type TaskUpdateInput = {
  title?: string;
  description?: string;
};

export async function getTasksByUserId(userId: string) {
  return db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.userId, userId));
}

export async function createTask(
  userId: string,
  input: TaskInput
) {
  const [newTask] = await db
    .insert(tasksTable)
    .values({
      userId,
      title: input.title,
      description: input.description,
    })
    .returning();

  return newTask ?? null;
}

export async function getTaskById(
  taskId: string,
  userId: string
) {
  const [task] = await db
    .select()
    .from(tasksTable)
    .where(
      and(
        eq(tasksTable.id, taskId),
        eq(tasksTable.userId, userId)
      )
    );

  return task ?? null;
}

export async function updateTask(
  taskId: string,
  userId: string,
  input: TaskUpdateInput
) {
  const [updatedTask] = await db
    .update(tasksTable)
    .set(input)
    .where(
      and(
        eq(tasksTable.id, taskId),
        eq(tasksTable.userId, userId)
      )
    )
    .returning();

  return updatedTask ?? null;
}

export async function deleteTask(
  taskId: string,
  userId: string
) {
  const [deletedTask] = await db
    .delete(tasksTable)
    .where(
      and(
        eq(tasksTable.id, taskId),
        eq(tasksTable.userId, userId)
      )
    )
    .returning();

  return deletedTask ?? null;
}
