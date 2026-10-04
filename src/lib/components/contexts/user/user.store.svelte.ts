import { resolve } from '$app/paths';
import type { ClientResult } from '$lib/shared-types/result';
import type { UserBio } from '$lib/shared-types/user';
import { createQuery, useQueryClient } from '@tanstack/svelte-query';

export class UserStore {
	private queryClient = useQueryClient();
	private query = createQuery(() => ({
		queryKey: ['user'],
		queryFn: async () => {
			const res = await fetch(resolve('/api/user'), {
				method: 'GET'
			});
			const result = (await res.json()) as ClientResult<UserBio>;
			return result;
		},

		staleTime: 1000 * 60 * 5
	}));

	userBio = $derived(this.query.data?.value);
	isLoadingUser = $state(false);
	errorUser = $state('');

	removeUser() {
		this.queryClient.setQueryData<ClientResult<UserBio>>(['user'], (oldData) => {
			if (!oldData) {
				return oldData;
			}

			return {
				...oldData,
				statusCode: 400,
				isSuccess: false,
				value: undefined
			};
		});
	}

	async loadUser() {
		this.isLoadingUser = true;
		try {
			const result = await this.query.refetch();

			const data = result.data;

			if (!data) {
				this.errorUser = 'Failed to load user';
				return;
			}

			if (data.isSuccess) {
				this.errorUser = '';
				return;
			}

			this.errorUser = data.errorMsg ?? 'Failed to load user';
		} finally {
			this.isLoadingUser = false;
		}
	}
}
