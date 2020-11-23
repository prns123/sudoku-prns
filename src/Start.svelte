<div class="center">
	
		<div class="fill">
			<Slider thumb><b>Difficulty</b></Slider>
	  </div>
		<Button class={settings.accentColour.toLowerCase() + " white-text"} on:click = {onClick}>Start</Button>	
		
</div>


<script>
	import {Button, Slider} from "svelte-materialify";
	export let settings;
	export let onClick;
</script>

<style>
	.center {
		display: flex;
  align-items: center;
  justify-content: center;
		flex-direction: column;
	}
	 
	.fill {
		width : 100%;
	}
	
	* {
		padding : 10px;
	}
</style>