'use strict';
(() => {
const TILE=64,TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const cache=new Map();const cake=new Image();cake.src='cake-ghost.png?v=5';const mouse=new Image();mouse.src='mouse-ghost.png?v=5';
function castRay(map,px,py,angle,max=1100){
 const dx=Math.cos(angle),dy=Math.sin(angle);let x=Math.floor(px/TILE),y=Math.floor(py/TILE),side=0;
 const ddx=Math.abs(TILE/(dx||1e-10)),ddy=Math.abs(TILE/(dy||1e-10)),sx=dx<0?-1:1,sy=dy<0?-1:1;
 let ax=(dx<0?px-x*TILE:(x+1)*TILE-px)/Math.abs(dx||1e-10),ay=(dy<0?py-y*TILE:(y+1)*TILE-py)/Math.abs(dy||1e-10);
 for(let i=0;i<90;i++){let distance;if(ax<ay){distance=ax;ax+=ddx;x+=sx;side=0;}else{distance=ay;ay+=ddy;y+=sy;side=1;}
 if(distance>max)return{distance:max,side,u:0,x,y,far:true};
 if(!map[y]||map[y][x]!==0){const hit=side===0?py+dy*distance:px+dx*distance;return{distance:Math.max(.001,distance),side,u:((hit%TILE)+TILE)%TILE/TILE,x,y,far:false};}}
 return{distance:max,side,u:0,x,y,far:true};
}
function texture(type){return window.HorrorWalls.get(type);}
function sprite(type){if(cache.has(type))return cache.get(type);const c=document.createElement('canvas');c.width=96;c.height=128;const g=c.getContext('2d');
 if(type.startsWith('ghost')){const art=type==='ghostMouse'?mouse:cake;if(art.complete&&art.naturalWidth)return art;return c;}
 else{g.translate(48,69);g.shadowBlur=18;g.shadowColor=type==='fuse'?'#adf0d5':type==='battery'?'#87c9e5':'#ffb1cd';g.fillStyle=g.shadowColor;if(type==='fuse'){g.fillRect(-15,-38,30,70);g.fillStyle='#e4dcc2';g.fillRect(-19,-43,38,10);g.fillRect(-19,26,38,10);g.fillStyle='#30574e';g.fillRect(-7,-26,14,45);}else if(type==='battery'){g.fillRect(-17,-35,34,66);g.fillRect(-8,-43,16,8);g.fillStyle='#264858';g.fillRect(-11,-25,22,45);g.fillStyle='#aadbee';g.fillRect(-4,-15,8,27);g.fillRect(-10,-6,20,8);}else if(type==='candy'){g.beginPath();g.ellipse(0,0,21,16,0,0,TAU);g.fill();g.beginPath();g.moveTo(-18,0);g.lineTo(-38,-16);g.lineTo(-38,16);g.moveTo(18,0);g.lineTo(38,-16);g.lineTo(38,16);g.fill();}else{g.font='68px serif';g.fillText('♥',-30,20);}}
 cache.set(type,c);return c;
}
function render(c,w,h,world,time,pitch=0,flash=0){
 const p=world.player,dirX=Math.cos(p.angle),dirY=Math.sin(p.angle),rightX=-dirY,rightY=dirX,plane=w/(2*Math.tan(Math.PI*.19));
 const bob=Math.sin(p.walk)*2.3,horizon=h*.48+pitch*h+bob,eye=30,step=w<700?3:2,z=new Float32Array(Math.ceil(w/step));
 const sky=c.createLinearGradient(0,0,0,horizon);sky.addColorStop(0,'#030918');sky.addColorStop(1,'#26383d');c.fillStyle=sky;c.fillRect(0,0,w,h);
 c.fillStyle='#a7bcc057';for(let i=0;i<65;i++){const sx=((i*173-p.angle*110)%w+w)%w,sy=18+(i*71)%Math.max(25,horizon*.63);c.fillRect(sx,sy,i%7===0?2:1,1);}
 c.fillStyle='#132a3060';c.beginPath();c.moveTo(0,horizon);for(let x=0;x<=w;x+=16)c.lineTo(x,horizon-12-Math.sin(x*.009+p.angle)*20);c.lineTo(w,horizon);c.fill();
 // World-space floor projection: checker slabs and mortar recede into the fog.
 for(let sy=Math.max(0,Math.ceil(horizon));sy<h;sy+=7){const depth=eye*plane/Math.max(1,sy-horizon),fog=clamp(1-depth/950,.11,.8);for(let sx=0;sx<w;sx+=10){const offset=(sx-w/2)/plane,wx=p.x+depth*(dirX+rightX*offset),wy=p.y+depth*(dirY+rightY*offset),tx=Math.floor(wx/TILE),ty=Math.floor(wy/TILE),edge=((wx%64+64)%64)<2||((wy%64+64)%64)<2;const n=((tx+ty)%2?1:.84)*(edge?.53:1);c.fillStyle=`rgb(${Math.floor(36*fog*n)},${Math.floor(57*fog*n)},${Math.floor(62*fog*n)})`;c.fillRect(sx,sy,10,7);}}
 for(let sx=0,idx=0;sx<w;sx+=step,idx++){const cameraX=(sx+step/2-w/2)/plane,angle=p.angle+Math.atan(cameraX),hit=castRay(world.map,p.x,p.y,angle),depth=hit.distance*Math.cos(angle-p.angle);z[idx]=depth;if(hit.far)continue;const wallHeight=78*plane/depth,top=horizon-(78-eye)*plane/depth,tex=texture((Math.abs(hit.x*7+hit.y*3))%3);let u=hit.u;if((hit.side===0&&Math.cos(angle)>0)||(hit.side===1&&Math.sin(angle)<0))u=1-u;c.drawImage(tex,Math.floor(u*(tex.width-1)),0,1,tex.height,sx,top,step+1,wallHeight);
 const beam=Math.max(0,1-Math.abs(sx-w/2)/(w*.46)),ambient=p.light?.78:.38,lit=clamp(ambient*(.38+beam*.62)*(1-depth/1050),.035,.89)*(hit.side?.76:1);c.fillStyle=`rgba(2,8,17,${1-lit})`;c.fillRect(sx,top,step+1,wallHeight);if(hit.side===1){c.fillStyle='#0a202518';c.fillRect(sx,top,step+1,wallHeight);}}
 const objects=[];for(const item of world.items)if(!item.taken)objects.push({x:item.x,y:item.y,kind:item.type,image:sprite(item.type),height:22});for(const e of world.enemies)objects.push({...e,image:sprite(e.kind==='mouse'?'ghostMouse':'ghost'),height:e.kind==='mouse'?65:61,stunned:e.stun>0});for(const b of world.decoys)objects.push({...b,image:sprite('candy'),height:12});
 // Gate marker shares exactly the same world coordinate as the top-down exit.
 objects.push({x:world.exit.x,y:world.exit.y,image:sprite(p.fuses===5?'fuse':'battery'),height:26,gate:true});
 objects.forEach(o=>{const dx=o.x-p.x,dy=o.y-p.y;o.depth=dx*dirX+dy*dirY;o.lateral=dx*rightX+dy*rightY;});objects.sort((a,b)=>b.depth-a.depth);
 for(const o of objects){if(o.depth<7||o.depth>950)continue;const sh=o.height*plane/o.depth,sw=sh*(o.image.width/o.image.height),sx=w/2+o.lateral*plane/o.depth,ground=horizon+eye*plane/o.depth,sy=ground-sh;if(sx+sw/2<0||sx-sw/2>w)continue;let visible=false;c.save();if(o.stunned)c.globalAlpha=.52;for(let x=Math.max(0,Math.floor((sx-sw/2)/step)*step);x<Math.min(w,sx+sw/2);x+=step){if(o.depth>z[Math.floor(x/step)]+1)continue;const u=clamp((x-sx+sw/2)/sw,0,.999);c.drawImage(o.image,u*o.image.width,0,Math.max(1,step/sw*o.image.width),o.image.height,x,sy,step+1,sh);visible=true;}c.restore();
 if(o.gate&&visible){c.fillStyle=p.fuses===5?'#b3ecd9':'#a6c1c8';c.textAlign='center';c.font=Math.max(10,Math.min(18,14*plane/o.depth))+'px system-ui';c.fillText(p.fuses===5?'出口 · 通电':'入口 · 需要 5 枚保险丝',sx,sy-10);c.textAlign='left';}}
 const vign=c.createRadialGradient(w/2,h*.52,w*.12,w/2,h*.5,Math.max(w,h)*.7);vign.addColorStop(0,'transparent');vign.addColorStop(1,'#01050bbb');c.fillStyle=vign;c.fillRect(0,0,w,h);
 if(flash>0){c.fillStyle=`rgba(218,247,224,${Math.min(.35,flash*.5)})`;c.fillRect(0,0,w,h);}c.strokeStyle='#d8e7e58a';c.lineWidth=1;c.beginPath();c.moveTo(w/2-5,h/2);c.lineTo(w/2+5,h/2);c.moveTo(w/2,h/2-5);c.lineTo(w/2,h/2+5);c.stroke();
 // A handheld torch is equipment; the protagonist is always the original image.
 const tx=w*.69,ty=h-(h<500?35:80);c.save();c.translate(tx+Math.sin(p.walk)*2,ty+Math.cos(p.walk)*2);c.rotate(-.2);const metal=c.createLinearGradient(-25,0,25,0);metal.addColorStop(0,'#162229');metal.addColorStop(.5,'#516b70');metal.addColorStop(1,'#101b25');c.fillStyle=metal;c.fillRect(-17,5,34,95);c.fillStyle='#608287';c.fillRect(-23,-9,46,18);c.fillStyle=p.light?'#c3e8c0':'#25383d';c.fillRect(-19,-13,38,5);c.restore();
 return {zbuffer:z,horizon,projection:plane};
}
window.ParkView={castRay,render};
if(typeof module!=='undefined'&&module.exports)module.exports={castRay,render};
})();
