<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';
	import FlowdoIcon from '$lib/components/shared/FlowdoIcon.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { ChevronsUpDown, LoaderCircle, LogOut } from '@lucide/svelte';
	let isLoggingOut = $state(false);

	const handleLogout = async () => {
		isLoggingOut = true;
		try {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: async () => {
						await goto(resolve('/(auth)/login'));
					}
				}
			});
		} finally {
			isLoggingOut = false;
		}
	};
</script>

<Sidebar.Root class="justify-between border-line bg-[#0c0b0a] px-4.5 py-7.5">
	<Sidebar.Header>
		<div class="mx-auto flex min-w-[90%] flex-col items-start justify-center gap-10">
			<div>
				<FlowdoIcon />
			</div>
			<div
				class="flex w-full items-center gap-3 rounded-xl border border-transparent p-2 transition-all duration-200 hover:border-line hover:bg-[#1b1815]"
			>
				<!-- Avatar -->
				<span
					class="grid size-9 shrink-0 place-items-center rounded-full bg-[#d4e7f2] text-[11px] font-extrabold text-[#397087]"
				>
					JR
				</span>

	 
				<span class="grid min-w-0 flex-1 gap-0.5">
					<strong class="truncate text-[13px] font-bold text-navy">Jordan's space</strong>
					<small class="truncate text-[11px] text-[#a99b8c]">Personal workspace</small>
				</span>

				<ChevronsUpDown class="size-4 shrink-0 text-[#9aa7c0]" />
			</div>
		</div>
		<Sidebar.Separator class="mx-0 w-full bg-line" />
	</Sidebar.Header>
	<Sidebar.Content></Sidebar.Content>
	<Sidebar.Footer class="p-0 pt-4">
		<Button
			type="button"
			variant="ghost"
			disabled={isLoggingOut}
			onclick={handleLogout}
			class="group relative h-11.25 w-full cursor-pointer justify-center gap-2.5 overflow-hidden rounded-[10px] border border-line bg-linear-to-b from-[#1d1a17] to-[#171512] px-4 text-xs font-bold tracking-wide text-[#c7b9a8] shadow-[inset_0_1px_0_#ffffff08] transition-all duration-300 hover:border-[#6b3a30] hover:from-[#2a1b17] hover:to-[#231713] hover:text-[#ffad91] hover:shadow-[inset_0_1px_0_#ffad9114,0_8px_20px_#e9786214] focus-visible:ring-[3px] focus-visible:ring-coral/20 active:scale-[0.98] disabled:opacity-70"
		>
			{#if isLoggingOut}
				<LoaderCircle class="size-4 animate-spin" />
				<span>Signing out...</span>
			{:else}
				<LogOut
					class="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
					strokeWidth={1.9}
				/>
				<span>Log out</span>
			{/if}
		</Button>
	</Sidebar.Footer>
</Sidebar.Root>
