<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Field from '$lib/components/ui/field/index.js';

	import { Input } from '$lib/components/ui/input/index.js';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { taskPriority, type TaskStatus } from '$lib/db/schemas/task.schema';
	import type { CreateTaskRequest, TaskCard } from '$lib/shared-types/task';
	import Button from '$lib/components/ui/button/button.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { resolve } from '$app/paths';
	import type { ClientResult } from '$lib/shared-types/result';
	import { goto } from '$app/navigation';
	import AlertMessage from '$lib/components/shared/AlertMessage.svelte';

	type Mode =
		| {
				type: 'Create';
		  }
		| {
				type: 'Edit';
				status: TaskStatus;
				data: TaskCard;
		  };
	type InboxData = Pick<
		TaskCard,
		'id' | 'title' | 'description' | 'priority' | 'durationMinutes' | 'status'
	>;

	interface Props {
		mode: Mode;
	}

	const props: Props = $props();

	const isCreateMode = $derived(props.mode.type === 'Create');

	const isEditInboxMode = $derived(
		props.mode.type === 'Edit' && props.mode.data.status === 'INBOX'
	);

	const isEditInProgressMode = $derived(
		props.mode.type === 'Edit' && props.mode.data.status === 'IN_PROGRESS'
	);

	const isEditDoneMode = $derived(props.mode.type === 'Edit' && props.mode.data.status === 'DONE');

	const ModeContent = $derived({
		eyebrow: (isCreateMode ? 'New' : 'Edit') + ' Task',
		title: isCreateMode ? 'What will move you forward?' : ''
	});

	const priorityList = taskPriority.enumValues;
	// const targetUpdatedData = $derived(props.mode.type === 'Edit' ? props.mode.data : undefined);
	let error = $state<string>('');
	let isLoading = $state<boolean>(false);
	let createRequest = $state<CreateTaskRequest>({
		title: '',
		description: '',
		estimatedMinutes: 0,
		priority: 'LOW'
	});
	const handleCreate = async (e: SubmitEvent) => {
		e.preventDefault();

		const payload = {
			...createRequest,
			title: createRequest.title?.trim() ?? '',
			description: createRequest.description?.trim() ?? ''
		};
		if (!payload.title) {
			error = 'Task title is required';
			return;
		}
		isLoading = true;
		try {
			const req = await fetch(resolve('/api/tasks'), {
				method: 'POST',
				body: JSON.stringify(createRequest)
			});
			if (req.status === 401) {
				error = 'Unauthorized, redirecting to login...';
				await new Promise((resolve) => setTimeout(resolve, 500));
				await goto(resolve('/(auth)/login'));
				return;
			}
			const result: ClientResult = await req.json();
			if (!result.isSuccess) {
				error = result.errorMsg ?? 'Error';
			}
			error = '';
		} catch {
			error = 'Network error, check your connection and try again.';
		} finally {
			isLoading = false;
		}
	};
</script>

<Dialog.Root>
	<Dialog.Trigger>Open</Dialog.Trigger>

	<Dialog.Content class="bg-[#1b1815] p-[clamp(20px,2vw,25px)]  ring-line md:max-w-125">
		<Dialog.Header>
			<Dialog.Title>
				<div class="modal flex flex-col gap-5">
					<span class="eyebrow">{ModeContent.eyebrow}</span>
					<h2>{ModeContent.title}</h2>
				</div>
			</Dialog.Title>
		</Dialog.Header>

		<form onsubmit={handleCreate}>
			<Field.Group>
				<Field.Field>
					<Field.Label for="fieldgroup-title">Task title</Field.Label>
					<Input
						class="h-11.25! rounded-[9px] border-line bg-[#131110]! px-3.25 text-xs text-navy shadow-[inset_0_1px_3px_#00000050] transition-[border-color,box-shadow] duration-200 placeholder:text-[#777067] hover:border-[#514538] focus-visible:border-coral focus-visible:shadow-none focus-visible:ring-[3px] focus-visible:ring-coral/10"
						id="fieldgroup-title"
						placeholder="Learn Python basics"
						bind:value={createRequest.title}
					/>
				</Field.Field>
				<Field.Field>
					<Field.Label for="fieldgroup-description">Description</Field.Label>
					<Textarea
						class="min-h-24 rounded-[9px] border-line bg-[#131110]! px-3.25 py-3 text-xs text-navy shadow-[inset_0_1px_3px_#00000050] transition-[border-color,box-shadow] duration-200 placeholder:text-[#777067] hover:border-[#514538] focus-visible:border-coral focus-visible:shadow-none focus-visible:ring-[3px] focus-visible:ring-coral/10"
						id="fieldgroup-description"
						placeholder="Study and practice"
						bind:value={createRequest.description}
					/>
				</Field.Field>
			</Field.Group>
			<div class="mt-4.25 grid grid-cols-[1fr_1fr] gap-3.5">
				<!-- Priority -->
				{#if isCreateMode}
					<Field.Field>
						<Field.Label>Priority</Field.Label>
						<Select.Root
							type="single"
							bind:value={
								() => createRequest.priority ?? undefined,
								(v) => (createRequest.priority = v as 'LOW' | 'MEDIUM' | 'HIGH')
							}
						>
							<Select.Trigger
								class="h-11.25! w-full rounded-[9px] border-line bg-[#131110]! px-3.25 text-xs text-navy capitalize shadow-[inset_0_1px_3px_#00000050] transition-[border-color,box-shadow] duration-200 hover:border-[#514538] focus:border-coral focus:ring-[3px] focus:ring-coral/10 data-placeholder:text-[#777067] data-[state=open]:border-coral data-[state=open]:ring-[3px] data-[state=open]:ring-coral/10"
							>
								<Select.Value placeholder="Select a priority" />
							</Select.Trigger>

							<Select.Content
								class="rounded-xl border-line bg-[#1d1a17] p-1.5 text-navy shadow-[0_20px_50px_#08060480]"
							>
								{#each priorityList as priority (priority)}
									<Select.Item
										value={priority}
										class="cursor-pointer rounded-lg px-3 py-2.5 text-xs font-semibold text-[#c7b9a8] capitalize transition-colors data-highlighted:bg-[#28221d] data-highlighted:text-navy data-selected:text-coral"
									>
										{priority.toLowerCase()}
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</Field.Field>
					<!-- Estimate Time -->
					<Field.Field class="col-span-2">
						<Field.Label for="fieldgroup-estimate">Estimate</Field.Label>

						<div class="relative">
							<Input
								id="fieldgroup-estimate"
								type="number"
								min="0"
								step="5"
								bind:value={
									() => createRequest.estimatedMinutes,
									(v) => (createRequest.estimatedMinutes = v ?? 0)
								}
								class="h-11.25! [appearance:textfield] rounded-[9px] border-line bg-[#131110]! pr-14 pl-3.25 text-xs text-navy shadow-[inset_0_1px_3px_#00000050] transition-[border-color,box-shadow] duration-200 placeholder:text-[#777067] hover:border-[#514538] focus-visible:border-coral focus-visible:shadow-none focus-visible:ring-[3px] focus-visible:ring-coral/10 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
							/>
							<span
								class="pointer-events-none absolute top-1/2 right-3.25 -translate-y-1/2 rounded-md bg-[#28221d] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#d2a878] uppercase"
							>
								min
							</span>
						</div>

						<div class="flex flex-wrap gap-2">
							{#each [15, 25, 45, 60, 90] as m (m)}
								<button
									type="button"
									onclick={() => {
										createRequest.estimatedMinutes = m;
									}}
									class="rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all duration-200
				{createRequest.estimatedMinutes === m
										? 'border-coral bg-coral/15 text-coral'
										: 'border-line bg-[#1b1917] text-[#a99b8c] hover:border-[#514538] hover:text-navy'}"
								>
									{m < 60 ? `${m}m` : m === 60 ? '1h' : '1h 30m'}
								</button>
							{/each}
						</div>
					</Field.Field>
				{/if}
			</div>
			{#if error}
				<AlertMessage message={error} type="error" />
			{/if}

			<Separator orientation="horizontal" class="my-5 bg-line" />

			<Dialog.Footer class="gap-2.5 border-0 bg-transparent! sm:items-center">
				<Dialog.Close
					type="button"
					class="inline-flex h-11.25 cursor-pointer items-center justify-center rounded-[9px] border border-line bg-transparent px-5 text-xs font-bold text-[#c7b9a8] transition-all duration-200 hover:border-[#514538] hover:bg-[#28221d] hover:text-navy focus-visible:ring-[3px] focus-visible:ring-coral/20 focus-visible:outline-none"
				>
					Cancel
				</Dialog.Close>

				<Button
					type="submit"
					disabled={isLoading}
					class="h-11.25 cursor-pointer rounded-[9px] border border-coral bg-coral px-6 text-xs font-extrabold text-white shadow-[0_7px_20px_#e9786226] transition-all duration-200 hover:-translate-y-px hover:border-[#f18a74] hover:bg-[#f18a74] focus-visible:ring-[3px] focus-visible:ring-coral/30 active:translate-y-0"
				>
					{isLoading ? 'Creating...' : 'Save changes'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<style>
	.eyebrow {
		color: #d2a878;
	}

	.modal h2 {
		letter-spacing: -0.7px;
		margin: 8px 0 7px;
		font-size: 22px;
	}
</style>
