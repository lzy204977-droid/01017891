'use strict';
(() => {
 const track=typeof Audio==='undefined'?null:new Audio('bgm.mp3?v=5');let active=false,muted=false;
 if(track){track.loop=true;track.preload='auto';track.volume=.42;}
 function play(restart=false){active=true;if(!track)return;if(restart)track.currentTime=0;track.muted=muted;if(muted)return;const pending=track.play();pending?.catch?.(()=>{const hint=document.getElementById('musicHint');if(hint){hint.hidden=false;hint.textContent='轻点「声音」开启背景音乐';}});}
 function pause(){active=false;track?.pause();}
 function stop(){pause();if(track)track.currentTime=0;}
 function mute(value){muted=value;if(track)track.muted=value;if(!value&&active)play();}
 window.GameMusic={play,pause,stop,mute};
 if(typeof module!=='undefined'&&module.exports)module.exports={play,pause,stop,mute,getState:()=>({active,muted,track})};
})();
