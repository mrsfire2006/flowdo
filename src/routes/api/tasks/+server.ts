import { task } from '$lib/db/schemas/task.schema';
import { requireAuth } from '$lib/server/auth-helper/require-auth';
import { db } from '$lib/server/db/index.js';
 
import { ServerResult } from '$lib/shared-types/result';
import type { CreateTaskRequest, TaskCard } from '$lib/shared-types/task.js';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const GET = requireAuth(async ({ locals }) => {
	const user = locals.user!;

	const tasks: TaskCard[] = await db
		.select({
			id: task.id,
			title: task.title,
			description: task.description,
			status: task.status,
			priority: task.priority,
			durationMinutes: task.estimatedMinutes
		})
		.from(task)
		.where(eq(task.userId, user.id));

	// const result = tasks
	// 	.filter((task) => task.dependsOnId === null)
	// 	.map((parent) => ({
	// 		...parent,
	// 		children: tasks
	// 			.filter((child) => child.dependsOnId === parent.id)
	// 			.sort((a, b) => {
	// 				const priority = {
	// 					HIGH: 3,
	// 					MEDIUM: 2,
	// 					LOW: 1
	// 				};
	// 				return priority[b.priority!] - priority[a.priority!];
	// 			})
	// 	}));
 

	return json(ServerResult.Success<TaskCard[]>(tasks).GetClientResult());
});

export const POST = requireAuth(async ({ locals, request }) => {
	const user = locals.user!;

	const command = (await request.json()) as CreateTaskRequest;

	const result = await db
		.insert(task)
		.values({
			id: crypto.randomUUID(),
			userId: user.id,
			priority: command.priority,
			title: command.title,
			description: command.description,
			estimatedMinutes: command.estimatedMinutes
		})
		.returning();

	if (result && result.length > 0) {
		const result = ServerResult.Success().GetClientResult();

		return json(result, { status: 200 });
	}

	return json(ServerResult.Failure('failed to insert task', 500));
});
