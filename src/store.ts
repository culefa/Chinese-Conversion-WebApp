

import {Writable, writable} from "svelte/store";
	export let lastText: Writable<string>;
			
	if(typeof window !== "undefined") {
		lastText = writable(localStorage.getItem("lastText") || "");
		lastText.subscribe((value) => {
			window.localStorage.setItem('lastText', value);
		});
	} else {
		lastText = writable(null);
	}

  