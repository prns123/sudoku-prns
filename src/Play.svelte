<script>
  import {
    Button,
    Dialog,
    Card,
    CardText,
    CardActions,
		Footer,
		AppBar
  } from 'svelte-materialify';

  export let active;
	export let onClose;
	
	  let boards = [
	 [8,"",5,4,1,6,9,2,7],
	 [2,9,"",8,5,7,"",3,""],
	 [4,1,7,2,9,3,6,5,8],
	 [5,6,9,"",3,4,7,8,2],
	 [1,2,"",6,7,8,5,4,9],
	 [7,4,8,5,"",9,1,6,3],
	 [6,5,2,7,8,1,3,9,4],
	 [9,8,1,"",4,5,2,"",6],
	 ["",7,4,9,6,2,8,1,5]
  ]
		
		let notEditable = [];
	set()
	
		function set() {
		notEditable = [];
		for (var i = 0; i < boards.length; i++) {
			var holder = [];
				for (var t = 0; t < boards[i].length; t++) {
					if (boards[i][t] == "") {
						holder.push(false)
					} else {
						holder.push(true)
					}
			}
		notEditable.push(holder)
		}
	}
	
	
</script>

<style>
		input {
		width: 35px;
		height : 35px;
		border-style : solid;
		border-width : 2px;
		border-color : black;
		margin : 0px;
		font-weight: bold;
	}
	
	input[type="text"][disabled] {
   background-color: red;
	}
	
	.container {
		margin : 20px;
		display : flex;
		justify-content: center;
		flex-direction : column;
	}
	
	.footer {
		position: absolute;
		bottom : 0;
	}
	
	.board, .buttons, .timer {
		margin: 0 auto;
	} 
	
	.hints {
		margin-left : 10px;
		font-size : 20px;
	}
	
	
	
	@media screen and (min-width: 550px) {
		input {
		width: 50px;
		height : 50px;
		border-style : solid;
		border-width : 2px;
		border-color : black;
		margin : 0px;
		font-weight: bold;
	}
}
</style>


	

<Dialog fullscreen bind:active>

	<AppBar>
			<span slot="title">Play</span>
	</AppBar>
	
<div class="container">
	
	<h3 class="timer">
		<b>
		00:00
		</b>
	</h3>
	
	<br />
	
		<div class="board">
				{#each boards as board, y}
				<div class = "row">
					{#each board as cell, x}
					<input type="text" bind:value = {boards[y][x]} disabled = {notEditable[y][x]} />
					{/each}
				</div>
				{/each}
		</div>
	
	<br />
	
	<div class="buttons">
		<Button>
			Undo
		</Button>
		<Button>
			Hint
		</Button>
		<b class="hints">3</b>
	</div>
			<div class="footer">

				<Button class="red-text" on:click={onClose} text>Exit</Button>

				</div>

	</div>
</Dialog>
