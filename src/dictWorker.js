'use strict';
let _hDict = null, gDict = [];
let hDictSymbol = Symbol('');
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

onmessage = function(e){
 

  if(e.data.command=='init'){

    (async ()=>{

      const response = await fetch('./dict.txt');
      sleep(10);
      const responseText = await response.text();
      sleep(10);
      const dict = responseText.split('\n');
      sleep(10);

      //let maxLen=0;
      let hDict = {};
      for(let i=0, l=dict.length; i<l; i++){
    
        let w = dict[i]
        let p = w[0]
    
        if(!(p in hDict)) hDict[p]=[];
        hDict[p].push(w);
    
        //if(dict[i].length>maxLen) maxLen=dict[i].length

        if((i%3000)===0) sleep(1);


      }
      _hDict= hDict;

      postMessage({
        message:'completeInit',
        result: hDict
      })


    })();


    
  }else if(e.data.command=='analysis'){

    let text = e.data.text;
     

		let hDict = _hDict;
			if(!hDict) return;
			let res = [];
			for(let i =0, l = text.length; i<l;i++){
				let c = text[i];
				if(c<'~') continue;
				let q = hDict[c];
				if(q){
					if(!q[hDictSymbol]){
						q.sort((a,b)=>b.length-a.length);
						q[hDictSymbol]=true;
            sleep(30);
					}
					let testStr = text.substr(i,q[0].length)
					let re = new RegExp(q.join('|'));
					let m = testStr.match(re)
					if(m){
						res.push(m[0]);
						i+=m[0].length-1;
					}
				}
			}
			gDict=res;

      postMessage({
        message:'completeAnalysis',
        result: res
      })


  }
}