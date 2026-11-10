import { index, uuid, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { defineRelations, desc } from "drizzle-orm";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  firstName: varchar({ length: 255 }).notNull(),
  lastName: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar({ length: 255 }).notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().references(() => usersTable.id, { onDelete: 'cascade' }).notNull(),
  sessionHash: varchar({ length: 65 }).notNull().unique(),
  createdAt: timestamp().defaultNow().notNull(),
  expiresAt: timestamp().notNull(),
})

export const projectsTable = pgTable("projects", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().references(() => usersTable.id, { onDelete: 'cascade' }).notNull(),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
})

export const tasksTable = pgTable("tasks", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().references(() => usersTable.id, { onDelete: 'cascade' }),
  projectId: uuid().references(() => projectsTable.id, { onDelete: 'cascade' }),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  // status: varchar({ length: 50 }).notNull(),
  // priority: varchar({ length: 50 }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const commentsTable = pgTable("comments", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().references(() => usersTable.id, { onDelete: 'cascade' }),
  taskId: uuid().references(() => tasksTable.id, { onDelete: 'cascade' }),
  content: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
}, (table) => ({
  commentsTaskCreatedIdx: index("comments_task_created_idx")
    .on(table.taskId, desc(table.createdAt), desc(table.id)),
}))

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type Session = typeof sessionsTable.$inferSelect;
export type NewSession = typeof sessionsTable.$inferInsert;

export type Task = typeof tasksTable.$inferSelect;
export type NewTask = typeof tasksTable.$inferInsert;

export type Project = typeof projectsTable.$inferSelect;
export type NewProject = typeof projectsTable.$inferInsert;

export type Comment = typeof commentsTable.$inferSelect;
export type NewComment = typeof commentsTable.$inferInsert;

export const relations = defineRelations(
  { usersTable, projectsTable, tasksTable, sessionsTable, commentsTable },
  (r) => ({
    usersTable: {
      tasks: r.many.tasksTable(),
      projects: r.many.projectsTable(),
      sessions: r.many.sessionsTable(),
      comments: r.many.commentsTable(),
    },

    sessionsTable: {
      user: r.one.usersTable({
        from: r.sessionsTable.userId,
        to: r.usersTable.id,
      }),
    },

    projectsTable: {
      user: r.one.usersTable({
        from: r.projectsTable.userId,
        to: r.usersTable.id,
      }),
      tasks: r.many.tasksTable(),
    },

    tasksTable: {
      user: r.one.usersTable({
        from: r.tasksTable.userId,
        to: r.usersTable.id,
      }),
      project: r.one.projectsTable({
        from: r.tasksTable.projectId,
        to: r.projectsTable.id,
      }),
    },

    commentsTable: {
      user: r.one.usersTable({
        from: r.commentsTable.userId,
        to: r.usersTable.id,
      }),
      task: r.one.tasksTable({
        from: r.commentsTable.taskId,
        to: r.tasksTable.id,
      }),
    },

  })
);
