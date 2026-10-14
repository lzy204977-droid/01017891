'use strict';
(() => {
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
// Skin pixels remain the extracted photograph. Only joint positions are animated.
function deform(u,v,phase,gait){
 const beat=Math.sin(phase),other=-beat;
 const left=smooth(.68,.94,v)*(1-smooth(.30,.46,u));
 const right=smooth(.67,.94,v)*smooth(.51,.67,u);
 let x=u,y=v;
 x+=gait*(left*beat*.039+right*other*.039);
 y-=gait*(left*Math.max(0,beat)*.047+right*Math.max(0,other)*.047);
 // Shoulder weights isolate the arms; eyes and face receive no local distortion.
 const la=(1-smooth(.17,.26,u))*smooth(.24,.37,v)*(1-smooth(.54,.63,v));
 const ra=smooth(.62,.77,u)*smooth(.12,.22,v)*(1-smooth(.42,.51,v));
 const rot=(px,py,a,w)=>{const dx=u-px,dy=v-py;x+=w*((Math.cos(a)-1)*dx-Math.sin(a)*dy);y+=w*(Math.sin(a)*dx+(Math.cos(a)-1)*dy);};
 rot(.21,.37,beat*.17*gait,la);rot(.67,.34,-beat*.105*gait,ra);
 x+=Math.sin(phase*2)*.0035*gait;y-=Math.abs(beat)*.009*gait;
 return {x,y};
}
function triangle(c,image,a,b,d,A,B,D){
 const det=(b.x-a.x)*(d.y-a.y)-(d.x-a.x)*(b.y-a.y);if(Math.abs(det)<1e-7)return;
 const m11=((B.x-A.x)*(d.y-a.y)-(D.x-A.x)*(b.y-a.y))/det;
 const m12=((B.y-A.y)*(d.y-a.y)-(D.y-A.y)*(b.y-a.y))/det;
 const m21=((D.x-A.x)*(b.x-a.x)-(B.x-A.x)*(d.x-a.x))/det;
 const m22=((D.y-A.y)*(b.x-a.x)-(B.y-A.y)*(d.x-a.x))/det;
 const cx=(A.x+B.x+D.x)/3,cy=(A.y+B.y+D.y)/3;
 const expand=p=>{const dx=p.x-cx,dy=p.y-cy,l=Math.hypot(dx,dy)||1;return {x:p.x+dx/l*1.05,y:p.y+dy/l*1.05};};
 const aa=expand(A),bb=expand(B),dd=expand(D);
 c.save();c.beginPath();c.moveTo(aa.x,aa.y);c.lineTo(bb.x,bb.y);c.lineTo(dd.x,dd.y);c.closePath();c.clip();c.transform(m11,m12,m21,m22,A.x-m11*a.x-m21*a.y,A.y-m12*a.x-m22*a.y);c.drawImage(image,0,0);c.restore();
}
function prepare(image){
 const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0);const data=g.getImageData(0,0,c.width,c.height).data;
 let left=c.width,top=c.height,right=0,bottom=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(data[(y*c.width+x)*4+3]>16){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 if(right<=left||bottom<=top)throw Error('Character cutout contains no visible pixels.');
 const bounds={x:Math.max(0,left-2),y:Math.max(0,top-2),w:Math.min(c.width,right+3)-Math.max(0,left-2),h:Math.min(c.height,bottom+3)-Math.max(0,top-2)};
 // Keep an intact texture, and a joint mesh referring to source pixels.
 const nx=10,ny=15,vertices=[];for(let y=0;y<=ny;y++)for(let x=0;x<=nx;x++)vertices.push({u:x/nx,v:y/ny,sx:bounds.x+x/nx*bounds.w,sy:bounds.y+y/ny*bounds.h});
 const triangles=[];for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const a=y*(nx+1)+x,b=a+1,d=a+nx+1,e=d+1;triangles.push([a,b,e],[a,e,d]);}
 return {image,bounds,vertices,triangles};
}
function draw(c,rig,x,y,width,phase=0,gait=0,facing=1,ground=false){
 if(!rig)return;const height=width*rig.bounds.h/rig.bounds.w;
 if(ground){c.save();c.fillStyle='#03081577';c.beginPath();c.ellipse(x,y+height*.43,width*(.29+gait*.015*Math.cos(phase*2)),width*.09,0,0,Math.PI*2);c.fill();c.restore();}
 c.save();c.translate(x,y);c.scale(facing,1);
 if(gait<.015){c.drawImage(rig.image,rig.bounds.x,rig.bounds.y,rig.bounds.w,rig.bounds.h,-width/2,-height/2,width,height);c.restore();return;}
 const posed=rig.vertices.map(v=>{const p=deform(v.u,v.v,phase,gait);return {x:(p.x-.5)*width,y:(p.y-.5)*height};});
 for(const [a,b,d] of rig.triangles){triangle(c,rig.image,{x:rig.vertices[a].sx,y:rig.vertices[a].sy},{x:rig.vertices[b].sx,y:rig.vertices[b].sy},{x:rig.vertices[d].sx,y:rig.vertices[d].sy},posed[a],posed[b],posed[d]);}
 c.restore();
}
window.CharacterRig={prepare,draw,deform};
if(typeof module!=='undefined'&&module.exports)module.exports={prepare,draw,deform};
})();
