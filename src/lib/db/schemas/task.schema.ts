import { integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const taskStatus = pgEnum('task_status', ['INBOX', 'IN_PROGRESS', 'DONE']);
export const taskPriority = pgEnum('task_priority', ['LOW', 'MEDIUM', 'HIGH']);

export const task = pgTable(
	'task',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		title: text('title'),
		description: text('description'),
		status: taskStatus('status').default('INBOX'),
		priority: taskPriority('priority').default('MEDIUM'),
		estimatedMinutes: integer('estimated_minutes'),
		// dependsOnId: text('depends_on_id'),

		completedAt: timestamp('completed_at'),

		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	}
	// ,
	// (table) => [
	// 	foreignKey({
	// 		columns: [table.dependsOnId],
	// 		foreignColumns: [table.id]
	// 	}).onDelete('set null')
	// ]
);

export type TaskStatus = (typeof taskStatus.enumValues)[number];
export type TaskPriority = (typeof taskPriority.enumValues)[number];

export type TaskSelect = typeof task.$inferSelect;
export type TaskInsert = typeof task.$inferSelect;
