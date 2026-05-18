<script lang="ts">
	// Generic skeleton that mimics a dashboard-like layout
</script>

<div class="py-2 space-y-5 animate-pulse">
	<!-- Topbar skeleton -->
	<div class="flex items-center justify-between">
		<div class="space-y-2">
			<div class="skeleton h-7 w-48 rounded-xl"></div>
			<div class="skeleton h-4 w-64 rounded-lg"></div>
		</div>
		<div class="flex gap-3">
			<div class="skeleton h-10 w-44 rounded-full"></div>
			<div class="skeleton h-10 w-10 rounded-full"></div>
			<div class="skeleton h-10 w-10 rounded-full"></div>
		</div>
	</div>

	<!-- Summary cards -->
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
		{#each [1,2,3,4] as _}
			<div class="neu-card p-5 space-y-3">
				<div class="skeleton h-11 w-11 rounded-2xl"></div>
				<div class="skeleton h-3 w-20 rounded-lg"></div>
				<div class="skeleton h-6 w-28 rounded-xl"></div>
			</div>
		{/each}
	</div>

	<!-- Chart + side card -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
		<div class="lg:col-span-2 neu-card p-6 space-y-4">
			<div class="skeleton h-5 w-40 rounded-lg"></div>
			<div class="skeleton h-36 w-full rounded-2xl"></div>
			<div class="flex justify-between">
				{#each [1,2,3,4,5,6] as _}
					<div class="skeleton h-3 w-10 rounded-lg"></div>
				{/each}
			</div>
		</div>
		<div class="neu-card p-6 space-y-3">
			<div class="skeleton h-5 w-28 rounded-lg"></div>
			<div class="grid grid-cols-2 gap-3">
				{#each [1,2,3,4,5,6] as _}
					<div class="skeleton h-16 rounded-2xl"></div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Bottom row -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
		{#each [1,2,3] as _}
			<div class="neu-card p-6 space-y-3">
				<div class="skeleton h-5 w-32 rounded-lg"></div>
				{#each [1,2,3,4] as _}
					<div class="flex items-center gap-3">
						<div class="skeleton h-9 w-9 rounded-2xl shrink-0"></div>
						<div class="flex-1 space-y-1.5">
							<div class="skeleton h-3 w-full rounded-lg"></div>
							<div class="skeleton h-2.5 w-2/3 rounded-lg"></div>
						</div>
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>
