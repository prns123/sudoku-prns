



	<Card style = "margin-top : 10px; border-radius : 5px">
		<div>
    <Switch on:change = {(val) => {onHelperChange(val)}} checked = {settings.helper} color = {settings.accentColour.toLowerCase()}><b>Helper</b></Switch>
			</div>
    <Divider />
		<div on:click = {onClick}>
   <Select solo items = {colourOptions} placeholder = "Accent Colour"  bind:value = {settings.accentColour} /> 
			</div>
</Card>
	
	
	

<script>
		import {Switch, Select, Divider, Card} from "svelte-materialify";
		export let onHelperChange;
		export let settings;
		export let onClick
	
		const colourOptions = [
				{name: "Blue", value: "Blue"}, 
				{name: "Green", value: "Green"},
				{name: "Orange", value: "Orange"},
				{name: "Red", value: "Red"},
		]
	
function check() {
	console.log("yeay")
}
</script>

<style>
	* {
		padding : 10px;
	}
	
</style>