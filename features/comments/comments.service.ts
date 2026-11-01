import { commentsTable, tasksTable } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function createComment(taskId: string, content: string) {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const [task] = await db
        .select()
        .from(tasksTable)
        .where(
            and(
                eq(tasksTable.userId, user.id),
                eq(tasksTable.id, taskId)
            )
        )

    if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const [newComment] = await db
        .insert(commentsTable)
        .values({
            userId: user.id,
            content,
            taskId: task.id,
        })
        .returning();

    if (!newComment) {
        return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }
    return newComment;
}

export async function getCommentsByTaskId(taskId: string, userId: string) {
    console.log("Fetching comments for taskId:", taskId, "for user:", userId);
    const [task] = await db
        .select()
        .from(tasksTable)
        .where(
            and(
                eq(tasksTable.userId, userId),
                eq(tasksTable.id, taskId)
            )
        )

    if (!task) {
        return null;
    }

    const comments = await db
        .select()
        .from(commentsTable)
        .where(eq(commentsTable.taskId, task.id));

    return comments ?? null;
}

export async function deleteComment(commentId: string, userId: string) {
    
    const [deletedComment] = await db
        .delete(commentsTable)
        .where(
            and(
                eq(commentsTable.userId, userId),
                eq(commentsTable.id, commentId)
            )
        )
        .returning()

    if (!deletedComment) {
        return null;
    }

    return deletedComment ?? null;
}

export async function updateComment(commentId: string, userId: string, content: string) {
    const [updatedComment] = await db
        .update(commentsTable)
        .set({
            content,
        })
        .where(
            and(
                eq(commentsTable.id, commentId),
                eq(commentsTable.userId, userId)
            )
        )
        .returning();

    return updatedComment ?? null;
}