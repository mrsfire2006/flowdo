<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import UserProvider from '$lib/components/contexts/user/UserProvider.svelte';

	let { children } = $props();
	const queryClient = new QueryClient();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<QueryClientProvider client={queryClient}>
	<UserProvider>
		{@render children()}
		<SvelteQueryDevtools />
	</UserProvider>
</QueryClientProvider>
