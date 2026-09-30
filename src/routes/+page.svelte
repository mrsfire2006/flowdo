<script>
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';
	import Button from '$lib/components/ui/button/button.svelte';
</script>

<svelte:head>
	<title>Flowdo</title>
</svelte:head>

<div>
	<Button href={resolve('/(auth)/login')}>Login</Button>
	<Button href={resolve('/(auth)/register')}>Register</Button>
	<Button
		onclick={async () => {
			await authClient.signOut();
		}}>logout</Button
	>
</div>
