<script lang="ts">
	import 'codemirror/mode/javascript/javascript'
	import CodeMirror from './index'
	import {onMount} from 'svelte'
	
	import ChineseConversionAPI from './ChineseConversionAPI'

	import {lastText} from './store';


	let myDictWorker = null;

	let _hDict = null;
	let gDict = [];
	const code = $lastText || ``
	const options = {
		mode: "javascript",
		lineNumbers: true,
		value: code
	}
	let editor 
	$:text_tc = ChineseConversionAPI.sc2tc($lastText)
	$:text_sc = ChineseConversionAPI.tc2sc($lastText)
	$:isSCText = (text_sc===$lastText && text_tc!==text_sc)
	$:isTCText = (text_tc===$lastText && text_tc!==text_sc)
	//let cursor_activity = false
	/*onMount(()=>{
		console.log("Editor: ", editor)
	})*/
	
	function cursorMoved(event) {
		//cursor_activity = true
		//console.log('cursor activity')
		// console.log(event.detail)
		
	}

	 
	
	function changed(event) {
		//console.log('changed')
		lastText.set(editor.getValue())
		//console.log($lastText)
		// console.log(event.detail)

		if(myDictWorker!==null)
		myDictWorker.postMessage({command:'analysis', text: text_tc})
 

	}
		
	function jumpToLine(i, offset) {
		var t = editor.charCoords({ line: i, ch: 0 }, "local").top;
		// var middleHeight = editor.getScrollerElement().offsetHeight / 2; 
		// editor.scrollTo(null, t - middleHeight - 5); 

		// editor.scrollTo(null, t);


		editor.display.scroller.scrollTop = t + offset;

	}

	function changeTextTo(new_text) {
		if (typeof new_text == 'function') new_text = new_text();
		if (typeof new_text !== 'string') return;
		let lastCurSel = editor.listSelections();

		let rect = editor.display.scroller.getBoundingClientRect();
		let left = editor.display.scroller.scrollLeft;
		let cc = editor.coordsChar({ left: rect.left, top: rect.top }, "page");
		let i = cc.line;
		let offset = 0;
		if(i>=0){
		 offset = editor.display.scroller.scrollTop - editor.charCoords({ line: i, ch: 0 }, 'local').top;
	}

		editor.setValue(new_text);
		editor.focus()
		editor.setSelections(lastCurSel)
		if (i >= 0) {

			// jumpToLine(i, offset);

			Promise.resolve(0).then(()=>{

				jumpToLine(i, offset);
			});


			requestAnimationFrame(() => {

				jumpToLine(i, offset);

				requestAnimationFrame(()=>{


		 

		editor.display.scroller.scrollLeft = left;


				})



			});
		}
	}


	function handleKeydown(event: KeyboardEvent) {

		if (event.key == 'ArrowDown' && (event.ctrlKey || event.metaKey)) {
			event.preventDefault();
			event.stopImmediatePropagation();
			event.stopPropagation();
			changeTextTo(text_tc)

		} else if (event.key == 'ArrowUp' && (event.ctrlKey || event.metaKey)) {
			event.preventDefault();
			event.stopImmediatePropagation();
			event.stopPropagation();
			changeTextTo(text_sc)
		} else if (event.key == 'ArrowLeft' && (event.ctrlKey || event.metaKey) && editor.getSelection() === "") {
			event.preventDefault();
			event.stopImmediatePropagation();
			event.stopPropagation();
			let cursor = editor.getCursor();
			let curLine = editor.getLine(cursor.line)
			let offset = 1;
			for (const d of gDict) {
				let s = curLine.substring(cursor.ch - d.length, cursor.ch);
				if (s === d) {
					offset = d.length;
					break;
				}
			}
			for (let i = 0; i < offset; i++) {
				editor.execCommand('goCharLeft')
			}

		} else if (event.key == 'ArrowRight' && (event.ctrlKey || event.metaKey) && editor.getSelection() === "") {
			event.preventDefault();
			event.stopImmediatePropagation();
			event.stopPropagation();
			let cursor = editor.getCursor();
			let curLine = editor.getLine(cursor.line)
			let offset = 1;
			for (const d of gDict) {
				let s = curLine.substring(cursor.ch, cursor.ch + d.length);
				if (s === d) {
					offset = d.length;
					break;
				}
			}
			for (let i = 0; i < offset; i++) {
				editor.execCommand('goCharRight')
			}
		}




	}

	//let cs= createStore;

	//cs.init();


	(async ()=>{


		myDictWorker= new Worker(new URL('./dictWorker.js', import.meta.url))

		if(myDictWorker!==null){


			myDictWorker.onmessage=e=>{
				let data = e.data;
				if(data.message=='completeInit'){
					_hDict = data.result
					setTimeout(()=>{
						if(myDictWorker!==null)
						myDictWorker.postMessage({command:'analysis', text: text_tc})
					},30)
				}else if(data.message =='completeAnalysis'){
					gDict = data.result.concat(ChineseConversionAPI.tc2sc(data.result.join('|')).split('|'))
				}
			}



			myDictWorker.postMessage({command:'init'});

		}
	
 


  
	})();


	



</script>


<svelte:window on:keydown|capture|nonpassive|trusted={handleKeydown}/>

<div class="container" class:red="{isSCText}" class:blue="{isTCText}">
	<div class="container-main">
<CodeMirror on:activity={cursorMoved} on:change={changed} bind:editor {options} class="editor"/>
</div>

<div class="container-footer">
<!--<p>
	Cursor Activity: {cursor_activity}
</p>-->
<div>
	<button on:click={() => [editor.execCommand('selectAll'), editor.focus()]}>
		Select All
	</button>	
	
	<button on:click={() => [editor.setCursor(0), editor.focus()]}>
		Cursor at Start
	</button>	

	<button on:click={() => [editor.setCursor(editor.getValue().length), editor.focus()]}>
		Cursor at End
	</button>	
 
	

</div>
<div> 
	<span>Translator:<button class="non-visible">.</button></span>

	{#if text_tc!==$lastText }
	<button on:click={() =>changeTextTo(text_tc)} >
		SC-to-TC
	</button>	
	{/if}
	
	{#if text_sc!==$lastText }
	<button on:click={() => changeTextTo(text_sc)}>
		TC-to-SC
	</button>	
	{/if}

	

</div>
</div>
</div>


<style>
	:global(.editor) {
		font-size: 1.25rem;
	}
	div.container{
		height:100%;
		display:flex;
		flex-direction: column;
		flex-grow: 1;
	} 
	div.container-main{
		flex-grow:1;
		display:flex;
		flex-direction: column;
		overflow:auto;
		padding:8px;
		background-color:#c8dfe7;
		
	}
	div.container-footer{
		background-color:#F6FAFD;
		border:1px solid rgba(185, 169, 169, 0.5);
		padding-left:8px;
	}

	.red div.container-main{
		background-color:#e7c8c8;
	}
	.red div.container-footer{
		background-color:#fdf6f6;
	}
	.blue div.container-main{
		background-color:#cac8e7;
	}
	.blue div.container-footer{
		background-color:#f6f6fd;
	}


</style>