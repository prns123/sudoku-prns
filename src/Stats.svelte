<div style={"color : " + settings.accentColour.toLowerCase() + ";"} class = "fill">
	
<div class = "stat">
	<h4><b>Lvl1 Solved</b></h4>
	<p>
		<b>
			20
		</b>
	</p>
</div>

<div class = "stat">
	<h4><b>Lvl2 Solved</b></h4>
	<p>
		<b>
			5
		</b>
	</p>
</div>

<div class = "stat">
	<h4><b>Lvl3 Solved</b></h4>
	<p>
		<b>
			15
		</b>
	</p>
</div>
	
</div>


<script>
	import { Divider } from 'svelte-materialify';
	export let settings;
</script>


<style>
	.stat {
		width : 100%;
		border-style : solid;
		border-width : 1px;
		border-radius : 5px;
		margin-top : 10px;
		padding : 20px;
		display: flex;
		align-items: center;
		flex-direction : column;
		justify-content : center;
		flex : 1;
	}
	
	p {
		font-size : 20px;
	}
	
	.fill {
		display: flex;
		flex: 1;
		flex-direction: column;
	}
	
	h4 {
		color : black;
	}
</style>

