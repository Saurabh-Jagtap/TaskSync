import { uuid, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import { defineRelations } from "drizzle-orm";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  firstName: varchar({ length: 255 }).notNull(),
  lastName: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar({ length: 255 }).notNull(),
});

export const projectsTable = pgTable("projects", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid().references(() => usersTable.id, { onDelete: 'cascade' }),
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

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type Task = typeof tasksTable.$inferSelect;
export type NewTask = typeof tasksTable.$inferInsert;

export type Project = typeof projectsTable.$inferSelect;
export type NewProject = typeof projectsTable.$inferInsert;


export const relations = defineRelations(
  { usersTable, projectsTable, tasksTable },
  (r) => ({
    usersTable: {
      tasks: r.many.tasksTable(),
      projects: r.many.projectsTable(),
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
  })
);
