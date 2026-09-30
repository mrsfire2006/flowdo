import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { resolve } from '$app/paths';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (user) {
		redirect(303, resolve('/dashboard/overview'));
	}
};
