<script lang="ts">
	import TasksProvider from '$lib/components/contexts/tasks/TasksProvider.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppNavbar from './layout/AppNavbar.svelte';
	import AppSidebar from './layout/AppSidebar.svelte';

	let { children, data } = $props();
</script>

<Sidebar.Provider>
	<TasksProvider>
		<!-- sidebar root  -->
		<AppSidebar username={data.user.name} />
		<!-- beside content  -->
		<Sidebar.Inset>
			<div class="px-5 md:px-11.5">
				<AppNavbar username={data.user.name} />
				{@render children()}
			</div>
		</Sidebar.Inset>
	</TasksProvider>
</Sidebar.Provider>
