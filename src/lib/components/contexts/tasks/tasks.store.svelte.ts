import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
import type { ClientResult } from '$lib/shared-types/result';
import type { CreateTaskRequest, TaskCard, UpdateTaskRequest } from '$lib/shared-types/task';
import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
const byLastUpdated = (a: TaskCard, b: TaskCard) =>
	new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
export class TaskStore {
	private queryTasks = createQuery(() => ({
		queryKey: ['tasks'],
		enabled: false,
		staleTime: 1000 * 60 * 5,
		queryFn: async (): Promise<ClientResult<TaskCard[]>> => {
			const response = await fetch('/api/tasks');

			if (response.status === 401) {
				await goto(resolve('/(auth)/login'));
				return { isSuccess: false, statusCode: 401, errorMsg: 'redirected', value: undefined };
			}

			const result = (await response.json()) as ClientResult<TaskCard[]>;

			return result;
		}
	}));
	tasks = $derived([...(this.queryTasks.data?.value ?? [])].sort(byLastUpdated));
	inboxTasks = $derived(this.tasks.filter((x) => x.status === 'INBOX'));
	inProgressTasks = $derived(this.tasks.filter((x) => x.status === 'IN_PROGRESS'));
	doneTasks = $derived(this.tasks.filter((x) => x.status === 'DONE'));
	private queryClient = useQueryClient();
	errorGetTasks = $state<string>('');
	isLoadingTasks = $state<boolean>(false);

	deleteTask = createMutation(() => ({
		mutationFn: async (req: { id: string }) => {
			const url = resolve('/api/tasks/[id]', { id: req.id });

			const res = await fetch(url, {
				method: 'DELETE'
			});

			const result = (await res.json()) as ClientResult;

			if (result.isSuccess) {
				this.queryClient.setQueryData<ClientResult<TaskCard[]>>(['tasks'], (oldData) => {
					if (!oldData?.isSuccess || !oldData.value) {
						return oldData;
					}
					return {
						...oldData,
						value: oldData.value.filter((task) => task.id !== req.id)
					};
				});
			}
			return result;
		}
	}));

	updateTask = createMutation(() => ({
		mutationFn: async (req: { id: string; task: UpdateTaskRequest }) => {
			const url = resolve('/api/tasks/[id]', { id: req.id });

			const res = await fetch(url, {
				method: 'PATCH',
				body: JSON.stringify(req.task)
			});

			const result = (await res.json()) as ClientResult<TaskCard>;
			if (result.isSuccess) {
				this.queryClient.setQueryData<ClientResult<TaskCard[]>>(['tasks'], (oldData) => {
					if (!oldData?.isSuccess || !oldData.value) {
						return oldData;
					}
					return {
						...oldData,
						value: oldData.value.map((task) =>
							task.id === result.value?.id ? result.value! : task
						)
					};
				});
			}
			return result;
		}
	}));

	async loadTasks() {
		this.isLoadingTasks = true;
		try {
			const result = await this.queryTasks.refetch();
			const data = result.data;

			if (!data) {
				this.errorGetTasks = 'Failed to load tasks';
				return;
			}

			if (data.isSuccess) {
				this.errorGetTasks = '';
				return;
			}

			this.errorGetTasks = data.errorMsg ?? 'Failed to load tasks';
		} finally {
			this.isLoadingTasks = false;
		}
	}
	removeTasks() {
		this.queryClient.setQueryData<ClientResult<TaskCard[]>>(['tasks'], (oldData) => {
			if (!oldData) {
				return oldData;
			}

			return { ...oldData, statusCode: 400, isSuccess: false, value: [] };
		});
	}

	createTask = createMutation(() => ({
		mutationFn: async (req: { task: CreateTaskRequest }) => {
			const res = await fetch(resolve('/api/tasks'), {
				method: 'POST',
				body: JSON.stringify(req.task)
			});

			const result = (await res.json()) as ClientResult<TaskCard>;

			if (result.isSuccess) {
				this.queryClient.setQueryData<ClientResult<TaskCard[]>>(['tasks'], (oldData) => {
					if (!oldData?.isSuccess || !oldData.value) {
						return oldData;
					}
					return {
						...oldData,
						value: [result.value!, ...oldData.value]
					};
				});
			}

			return result;
		}
	}));
}
