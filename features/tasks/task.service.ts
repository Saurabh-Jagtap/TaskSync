
import { and, eq, desc, count, inArray, sql } from "drizzle-orm";
import { commentsTable, tasksTable } from "@/db/schema";
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

export async function getTasksWithCommentSummary(userId: string) {
  const tasks = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.userId, userId));

  // Avoid running comment aggregation queries when there are no tasks.
  if (tasks.length === 0) {
    return [];
  }

  const taskIds = tasks.map((task) => task.id);

  const commentCounts = await db
    .select({
      taskId: commentsTable.taskId,
      count: count(),
    })
    .from(commentsTable)
    .where(inArray(commentsTable.taskId, taskIds))
    .groupBy(commentsTable.taskId);

  const rankedCommentsCte = db
  .$with("ranked_comments")
  .as(
    db
      .select({
        id: commentsTable.id,
        taskId: commentsTable.taskId,
        content: commentsTable.content,
        createdAt: commentsTable.createdAt,
        rn: sql<number>`
          ROW_NUMBER() OVER (
            PARTITION BY ${commentsTable.taskId}
            ORDER BY ${desc(commentsTable.createdAt)}, ${desc(commentsTable.id)}
          )
        `.as("rn"),
      })
      .from(commentsTable)
      .where(inArray(commentsTable.taskId, taskIds))
  );

  const latestComments = await db
    .with(rankedCommentsCte)
    .select({
      id: rankedCommentsCte.id,
      taskId: rankedCommentsCte.taskId,
      content: rankedCommentsCte.content,
      createdAt: rankedCommentsCte.createdAt,
    })
    .from(rankedCommentsCte)
    .where(eq(rankedCommentsCte.rn, 1));

  const countMap = new Map<string, number>();
  for (const row of commentCounts) {
    if (row.taskId === null) continue;
    countMap.set(row.taskId, Number(row.count));
  }

  const latestMap = new Map<string, { id: string; content: string; createdAt: Date }>();
  for (const comment of latestComments) {
    if (comment.taskId === null) continue;
    latestMap.set(comment.taskId, {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
    });
  }

  return tasks.map((task) => ({
    ...task,
    commentCount: countMap.get(task.id) ?? 0,
    latestComment: latestMap.get(task.id) ?? null,
  }));
}
