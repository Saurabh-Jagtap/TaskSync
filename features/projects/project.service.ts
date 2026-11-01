
import { and, eq } from "drizzle-orm";
import { projectsTable } from "@/db/schema";
import { db } from "@/lib/db";

type ProjectInput = {
  title: string;
  description: string;
};

type ProjectUpdateInput = {
  title?: string;
  description?: string;
};

export async function getProjectsByUserId(userId: string) {
  return db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.userId, userId));
}

export async function createProject(
  userId: string,
  input: ProjectInput
) {
  const [newProject] = await db
    .insert(projectsTable)
    .values({
      userId,
      title: input.title,
      description: input.description,
    })
    .returning();

  return newProject ?? null;
}

export async function getProjectById(
  projectId: string,
  userId: string
) {
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(
      and(
        eq(projectsTable.id, projectId),
        eq(projectsTable.userId, userId)
      )
    );

  return project ?? null;
}

export async function updateProject(
  projectId: string,
  userId: string,
  input: ProjectUpdateInput
) {
  const [updatedProject] = await db
    .update(projectsTable)
    .set(input)
    .where(
      and(
        eq(projectsTable.id, projectId),
        eq(projectsTable.userId, userId)
      )
    )
    .returning();

  return updatedProject ?? null;
}

export async function deleteProject(
  projectId: string,
  userId: string
) {
  const [deletedProject] = await db
    .delete(projectsTable)
    .where(
      and(
        eq(projectsTable.id, projectId),
        eq(projectsTable.userId, userId)
      )
    )
    .returning();

  return deletedProject ?? null;
}
