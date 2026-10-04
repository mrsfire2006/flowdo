import { requireAuth } from '$lib/server/auth-helper/require-auth';
import { ServerResult } from '$lib/shared-types/result';
import type { UserBio } from '$lib/shared-types/user';
import { json } from '@sveltejs/kit';

export const GET = requireAuth(({ locals }) => {
	const user = locals.user!;
    
    
	return json(ServerResult.Success<UserBio>({ id: user.id, email: user.email, name: user.name }));
});
