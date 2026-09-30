<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppNavbar from './layout/AppNavbar.svelte';
	import AppSidebar from './layout/AppSidebar.svelte';

	let { children } = $props();
</script>

<Sidebar.Provider>
	<!-- sidebar root  -->
	<AppSidebar />
	<!-- beside content  -->
	<Sidebar.Inset>
		<div class="px-11.5">
			<AppNavbar />
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
