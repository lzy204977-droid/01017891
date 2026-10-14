'use strict';
(() => {
const cache=new Map();
function get(type){if(cache.has(type))return cache.get(type);const c=document.createElement('canvas');c.width=c.height=192;const g=c.getContext('2d');
const colors=[['#333532','#58534a'],['#292b2b','#49463d'],['#283031','#48504a']][type%3];g.fillStyle=colors[0];g.fillRect(0,0,192,192);
for(let y=0;y<192;y+=24)for(let x=-24;x<192;x+=48){const xx=x+(y/24%2?24:0);g.fillStyle=(x+y)%5?colors[1]:'#3d403b';g.fillRect(xx+1,y+1,46,22);g.fillStyle='#98937a23';g.fillRect(xx+3,y+2,42,2);}
// Deterministic mould, rust, cracks and dragged hand marks.
for(let i=0;i<120;i++){const x=(i*67+type*31)%192,y=(i*97+type*17)%192;g.fillStyle=i%3?'#08141437':'#4c271d42';g.beginPath();g.ellipse(x,y,2+i%9,5+i%17,0,0,Math.PI*2);g.fill();}
g.strokeStyle='#070d13bb';g.lineWidth=1.5;for(let k=0;k<5;k++){let x=(k*43+19+type*7)%192,y=0;g.beginPath();g.moveTo(x,y);for(let j=0;j<7;j++){x+=(j%2?11:-8);y+=27;g.lineTo(x,y);if(j===3){g.lineTo(x+17,y-9);g.moveTo(x,y);}}g.stroke();}
if(type===0){g.fillStyle='#251519a8';g.beginPath();g.ellipse(131,80,10,14,-.2,0,Math.PI*2);g.fill();g.strokeStyle='#4f2627';g.lineWidth=4;for(let i=0;i<5;i++){g.beginPath();g.moveTo(122+i*4,80);g.lineTo(118+i*5,48-i%2*7);g.stroke();}g.strokeStyle='#4b262680';g.lineWidth=2;g.beginPath();g.moveTo(133,94);g.lineTo(127,143);g.stroke();g.fillStyle='#b1a58b';g.font='bold 11px sans-serif';g.fillText("DON'T TURN",13,153);g.fillStyle='#a4675b';g.font='8px sans-serif';g.fillText('IT CAN HEAR YOU',14,168);}
if(type===1){g.fillStyle='#090c10';g.fillRect(24,27,142,114);g.fillStyle='#211f24';g.beginPath();g.ellipse(102,94,25,36,0,0,Math.PI*2);g.fill();g.fillStyle='#bc544b';g.shadowColor='#b8352c';g.shadowBlur=6;g.fillRect(91,88,3,3);g.fillRect(110,88,3,3);g.shadowBlur=0;g.strokeStyle='#6d6857';g.lineWidth=5;g.strokeRect(22,25,146,118);g.strokeStyle='#1c282b';g.lineWidth=5;for(let x=43;x<165;x+=28){g.beginPath();g.moveTo(x,29);g.lineTo(x,140);g.stroke();}g.fillStyle='#999b82';g.font='10px sans-serif';g.fillText('NO ONE IS INSIDE',38,167);}
if(type===2){g.fillStyle='#1a1f21';g.fillRect(14,6,164,180);for(let x=18;x<175;x+=18){g.fillStyle=x%36?'#3e4140':'#293030';g.fillRect(x,7,15,178);g.fillStyle='#070e1655';g.fillRect(x+12,7,3,178);}g.fillStyle='#0b1119e8';g.fillRect(42,36,105,55);g.strokeStyle='#867a5f';g.lineWidth=2;g.strokeRect(42,36,105,55);g.fillStyle='#bb8e7d';g.font='bold 12px sans-serif';g.fillText('KEEP QUIET',55,59);g.fillStyle='#8e8571';g.font='8px sans-serif';g.fillText('ROOM 013',71,78);g.strokeStyle='#8a756050';g.lineWidth=2;for(let i=0;i<5;i++){g.beginPath();g.moveTo(79+i*8,113);g.lineTo(59+i*8,162);g.stroke();}}
const shade=g.createRadialGradient(85,73,25,96,96,140);shade.addColorStop(0,'transparent');shade.addColorStop(1,'#02091599');g.fillStyle=shade;g.fillRect(0,0,192,192);cache.set(type,c);return c;}
window.HorrorWalls={get};if(typeof module!=='undefined'&&module.exports)module.exports={get};
})();
