import { writable, get } from 'svelte/store';
import fs from 'fs';
import yaml from 'js-yaml';

function createStore() {

    let initialValue = {}
    // destructure the store on creation to have 'direct access' to methods
    const {subscribe, update, set} = writable(initialValue);

    return {
        subscribe,

        async init() {


          fs.readFile('src/assets/rime-dict-master/Moba游戏用词/luna_pinyin.moba.dict.yaml',function(err, data){
            
            console.log(yaml.load(data.toString()))
          })

          /*
            const savedSettings = JSON.parse(await fs.readTextFile('./settings.json'))
            set(savedSettings);
            */
        },

        changeSetting(key, value) {
            if(!key) return;
/*
            const storeValue = get(this)

            storeValue[key] = value

            update(_ => storeValue)
            
            fs.writeFile({
                contents: JSON.stringify(storeValue, null, 2),
                path: './settings.json'
            })
            */
        }
    }
}

export default createStore();