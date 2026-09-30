import { ServerResult } from '$lib/shared-types/result';
import { json, type RequestHandler } from '@sveltejs/kit';

export function requireAuth(handler: RequestHandler): RequestHandler {
	return async (event) => {
		const user = event.locals.user;
		if (!user) {
			const result = ServerResult.Failure('Unauthorized', 401).GetClientResult();
			return json(result, { status: 401 });
		}
		return handler(event);
	};
}
