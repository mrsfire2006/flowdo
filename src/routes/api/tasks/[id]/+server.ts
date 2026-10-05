import { task } from '$lib/db/schemas/task.schema';
import { requireAuth } from '$lib/server/auth-helper/require-auth';
import { db } from '$lib/server/db';

import { ServerResult } from '$lib/shared-types/result';
import type { TaskCard, UpdateTaskRequest } from '$lib/shared-types/task';
import { json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

export const GET = requireAuth(async ({ locals, params }) => {
	const user = locals.user!;
	const taskId = params.id;
	if (!taskId) {
		return json(ServerResult.Failure('Task ID is required', 400).GetClientResult(), {
			status: 400
		});
	}
	const [result] = await db
		.select()
		.from(task)
		.where(and(eq(task.id, taskId), eq(task.userId, user.id)));

	if (!result) {
		return json(ServerResult.Failure('Task not found', 404).GetClientResult(), { status: 404 });
	}
	return json(ServerResult.Success(result).GetClientResult(), { status: 200 });
});

export const DELETE = requireAuth(async ({ locals, params }) => {
	const user = locals.user!;
	const taskId = params.id;

	if (!taskId) {
		return json(ServerResult.Failure('Task ID is required', 400).GetClientResult(), {
			status: 400
		});
	}

	const deleted = await db
		.delete(task)
		.where(and(eq(task.id, taskId), eq(task.userId, user.id)))
		.returning();

	if (deleted.length === 0) {
		return json(ServerResult.Failure('Task not found', 404).GetClientResult(), { status: 404 });
	}
	return json(ServerResult.Success().GetClientResult());
});

export const PATCH = requireAuth(async ({ locals, params, request }) => {
	const user = locals.user!;
	const taskId = params.id;
	if (!taskId) {
		return json(ServerResult.Failure('Task ID is required', 400).GetClientResult(), {
			status: 400
		});
	}
	const req = (await request.json()) as UpdateTaskRequest;

	const updates = {
		title: req.title,
		description: req.description,
		status: req.status,
		priority: req.priority,
		estimatedMinutes: req.estimatedMinutes,
		completedAt: req.status === 'DONE' ? new Date() : null,
		focusElapsedSeconds: req.focusElapsedSeconds,
		focusStartedAt:
			req.focusStartedAt === undefined
				? undefined
				: req.focusStartedAt === null
					? null
					: new Date(req.focusStartedAt)
	};
	// if (taskId === updates.dependsOnId) {
	// 	return json(ServerResult.Failure('Task cannot depends on iteself', 409).GetClientResult(), {
	// 		status: 400
	// 	});
	// }

	const [result] = await db
		.update(task)
		.set({
			...updates
		})
		.where(and(eq(task.id, taskId), eq(task.userId, user.id)))
		.returning();

	if (!result) {
		return json(ServerResult.Failure('Task not found', 404).GetClientResult(), { status: 404 });
	}

	return json(
		ServerResult.Success<TaskCard>({
			id: result.id,
			title: result.title,
			description: result.description,
			durationMinutes: result.estimatedMinutes,
			priority: result.priority,
			status: result.status,
			updatedAt: result.updatedAt.toISOString(),
			focusElapsedSeconds: result.focusElapsedSeconds,
			focusStartedAt: result.focusStartedAt
		}).GetClientResult()
	);
});
