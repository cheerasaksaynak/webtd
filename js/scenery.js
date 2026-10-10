"use strict";
/* Map scenery: decor, background, ambient particles and path drawing */
// deterministic decorative props and ambient particles per level, placed off-path
let decorProps = [];
let ambientProps = [];
function buildDecor(level){
  const th = state.theme;
  const rnd = mulberry32(level*31+99);
  const total = th.decor.reduce((s,d)=>s+d[1],0);
  const props = [];
  let tries=0;
  while(props.length<34 && tries<800){
    tries++;
    const x = 20+rnd()*(CANVAS_W-40), y = 20+rnd()*(CANVAS_H-40);
    if(distToPath(x,y,state.cfg.path) < PATH_WIDTH/2+26) continue;
    let pick = rnd()*total, kind = th.decor[0][0];
    for(const [k,w] of th.decor){ if(pick<w){ kind=k; break; } pick-=w; }
    props.push({ x,y, kind, hue: Math.floor(rnd()*6), scale:0.8+rnd()*0.5 });
  }
  props.sort((a,b)=>a.y-b.y);
  decorProps = props;
  ambientProps = [];
  if(th.ambient!=='none'){
    for(let i=0;i<34;i++){
      ambientProps.push({ x:rnd()*CANVAS_W, y:rnd()*CANVAS_H, sp:0.6+rnd()*1.2, s:1.2+rnd()*2.6, ph:rnd()*6.28 });
    }
  }
}

function polygon(pts){
  ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i][0],pts[i][1]);
  ctx.closePath();
}

function drawDecorItem(d, th, t){
  ctx.save();
  ctx.translate(d.x,d.y);
  ctx.scale(d.scale,d.scale);
  ctx.lineJoin='round'; ctx.lineCap='round';
  const shadow = (w)=>{ ctx.fillStyle='rgba(0,0,0,0.16)'; ctx.beginPath(); ctx.ellipse(0,11,w,4,0,0,TAU); ctx.fill(); };
  switch(d.kind){
    case 'flower': {
      const colors = ['#ff8fb7','#fff07a','#ffffff','#a6e3ff','#ffb067','#d9a6ff'];
      ctx.fillStyle = colors[d.hue];
      for(let i=0;i<5;i++){
        const ang = i/5*TAU;
        ctx.beginPath(); ctx.ellipse(Math.cos(ang)*6, Math.sin(ang)*6, 4.5,3.2, ang, 0, TAU); ctx.fill();
      }
      ctx.fillStyle='#ffd23f'; ctx.beginPath(); ctx.arc(0,0,3.4,0,TAU); ctx.fill();
      break;
    }
    case 'bush':
      ctx.fillStyle = th.leaf||'#6fbf5a'; ctx.beginPath(); ctx.ellipse(0,2,11,7,0,0,TAU); ctx.fill();
      ctx.fillStyle = th.leaf2||'#7fd968'; ctx.beginPath(); ctx.ellipse(-3,-2,7,5,0,0,TAU); ctx.fill();
      break;
    case 'pine': {
      shadow(11);
      ctx.fillStyle='#7a5230'; ctx.fillRect(-2,3,4,9);
      for(let i=0;i<3;i++){
        const top=-24+i*9, hw=8+i*3;
        polygon([[0,top],[-hw,top+15],[hw,top+15]]);
        ctx.fillStyle = i%2 ? th.leaf : th.leaf2||th.leaf; ctx.fill();
        if(th.snowy){ polygon([[0,top],[-hw*0.55,top+8],[hw*0.55,top+8]]); ctx.fillStyle='#ffffff'; ctx.fill(); }
      }
      break;
    }
    case 'tree':
      shadow(12);
      ctx.fillStyle='#7a5230'; ctx.fillRect(-2.5,-2,5,14);
      ctx.fillStyle=th.leaf; ctx.beginPath(); ctx.arc(-6,-8,8,0,TAU); ctx.arc(6,-8,8,0,TAU); ctx.fill();
      ctx.fillStyle=th.leaf2||th.leaf; ctx.beginPath(); ctx.arc(0,-14,9,0,TAU); ctx.fill();
      break;
    case 'cactus':
      shadow(9);
      ctx.fillStyle='#5fae5a'; ctx.strokeStyle='#3d7d3f'; ctx.lineWidth=1.3;
      rrect(-4,-18,8,30,4); ctx.fill(); ctx.stroke();
      rrect(-11,-9,5,4,2); ctx.fill(); ctx.stroke(); rrect(-11,-15,4,9,2); ctx.fill(); ctx.stroke();
      rrect(6,-6,5,4,2); ctx.fill(); ctx.stroke(); rrect(7,-12,4,9,2); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#ff8fb7'; ctx.beginPath(); ctx.arc(0,-19,3,0,TAU); ctx.fill();
      break;
    case 'rock':
      shadow(11);
      polygon([[-11,8],[-8,-3],[-2,-8],[6,-6],[11,2],[10,9]]);
      ctx.fillStyle=th.rock||'#a8a8a8'; ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.25)'; polygon([[-8,-3],[-2,-8],[4,-6],[-2,-1]]); ctx.fill();
      if(th.snowy){ ctx.fillStyle='#fff'; polygon([[-8,-3],[-2,-8],[6,-6],[8,-2],[0,-3]]); ctx.fill(); }
      break;
    case 'mushroom': {
      shadow(8);
      ctx.fillStyle='#f6ead2'; rrect(-3,-2,6,12,3); ctx.fill();
      ctx.fillStyle=(th.mush||['#e8543d'])[d.hue%(th.mush||[0]).length];
      ctx.beginPath(); ctx.ellipse(0,-3,11,8,0,Math.PI,TAU); ctx.closePath(); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.85)';
      ctx.beginPath(); ctx.arc(-4,-6,1.8,0,TAU); ctx.arc(3,-8,1.5,0,TAU); ctx.arc(5,-4,1.3,0,TAU); ctx.fill();
      break;
    }
    case 'crystal': {
      const cols=[['#ff7ad9','#ffc2f0'],['#5fd8ff','#c4f1ff'],['#a98bff','#ddd0ff']];
      const [c1,c2]=cols[d.hue%3];
      const glow = 0.5+0.5*Math.sin(t*2+d.x);
      ctx.fillStyle=c1; ctx.globalAlpha=0.18+glow*0.15; ctx.beginPath(); ctx.arc(0,0,16,0,TAU); ctx.fill(); ctx.globalAlpha=1;
      polygon([[-9,10],[-6,-6],[-2,-12],[2,-6],[3,10]]); ctx.fillStyle=c1; ctx.fill();
      polygon([[2,10],[5,-2],[8,-6],[12,0],[11,10]]); ctx.fillStyle=c2; ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.55)'; polygon([[-6,-6],[-2,-12],[-3,0],[-6,2]]); ctx.fill();
      break;
    }
    case 'pool': {
      const glow = th.lava ? 0.7+0.3*Math.sin(t*2+d.x) : 1;
      ctx.fillStyle = th.lava ? '#1b1215' : 'rgba(0,0,0,0.18)';
      ctx.beginPath(); ctx.ellipse(0,1,24,14,0,0,TAU); ctx.fill();
      ctx.fillStyle=th.pool; ctx.globalAlpha=glow; ctx.beginPath(); ctx.ellipse(0,0,21,11.5,0,0,TAU); ctx.fill();
      ctx.fillStyle = th.lava ? '#ffd23f' : 'rgba(255,255,255,0.35)';
      ctx.globalAlpha=0.6*glow; ctx.beginPath(); ctx.ellipse(-3,-1,11,5,0,0,TAU); ctx.fill();
      ctx.globalAlpha=1;
      break;
    }
    case 'skull':
      shadow(8);
      ctx.fillStyle='#efe6d2'; ctx.strokeStyle='#8a7a66'; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.arc(0,-2,8,0,TAU); ctx.fill(); ctx.stroke();
      rrect(-4,3,8,6,2); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#3a2a1c'; ctx.beginPath(); ctx.arc(-3,-2,2,0,TAU); ctx.arc(3,-2,2,0,TAU); ctx.fill();
      break;
    case 'cloud':
      ctx.fillStyle='rgba(255,255,255,0.95)';
      ctx.beginPath(); ctx.arc(-12,2,8,0,TAU); ctx.arc(-3,-4,11,0,TAU); ctx.arc(9,-1,9,0,TAU); ctx.arc(16,4,6,0,TAU); ctx.fill();
      ctx.fillRect(-12,2,28,8);
      ctx.fillStyle='rgba(150,190,230,0.25)'; ctx.fillRect(-12,7,28,3);
      break;
    case 'star': {
      const tw = 1+0.15*Math.sin(t*3+d.x);
      ctx.scale(tw,tw); ctx.fillStyle='#ffd23f'; ctx.strokeStyle='#e0a010'; ctx.lineWidth=1;
      ctx.beginPath();
      for(let i=0;i<10;i++){ const r=i%2?4:9, a=-Math.PI/2+i*Math.PI/5; ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      break;
    }
    case 'palm': {
      shadow(10);
      ctx.strokeStyle='#8a5a2b'; ctx.lineWidth=4;
      ctx.beginPath(); ctx.moveTo(0,11); ctx.quadraticCurveTo(5,-4,2,-16); ctx.stroke();
      ctx.fillStyle='#3fae5a';
      for(let i=0;i<5;i++){
        ctx.save(); ctx.translate(2,-16); ctx.rotate(-Math.PI/2 + (i-2)*0.75 + Math.sin(t*2+i)*0.05);
        ctx.beginPath(); ctx.ellipse(10,0,11,3.6,0,0,TAU); ctx.fill(); ctx.restore();
      }
      ctx.fillStyle='#7a4a22'; ctx.beginPath(); ctx.arc(0,-14,2.2,0,TAU); ctx.arc(4,-14,2.2,0,TAU); ctx.fill();
      break;
    }
    case 'shell':
      ctx.fillStyle=['#ffb3c7','#ffe0b0','#d9c2ff'][d.hue%3]; ctx.strokeStyle='rgba(120,70,70,0.5)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(0,6); ctx.quadraticCurveTo(-11,-2,-6,-8); ctx.quadraticCurveTo(0,-11,6,-8); ctx.quadraticCurveTo(11,-2,0,6); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,6); ctx.lineTo(0,-9); ctx.moveTo(0,6); ctx.lineTo(-5,-7); ctx.moveTo(0,6); ctx.lineTo(5,-7); ctx.stroke();
      break;
    case 'snowman':
      shadow(10);
      ctx.fillStyle='#ffffff'; ctx.strokeStyle='#a9c4da'; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.arc(0,3,9,0,TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0,-9,6.5,0,TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#2b2b2b'; ctx.beginPath(); ctx.arc(-2.3,-10.5,1,0,TAU); ctx.arc(2.3,-10.5,1,0,TAU); ctx.fill();
      ctx.fillStyle='#ff8a3d'; polygon([[0,-8.5],[7,-7.5],[0,-6.5]]); ctx.fill();
      ctx.fillStyle='#e8543d'; ctx.fillRect(-6.5,-4,13,3);
      break;
    case 'ice': {
      ctx.fillStyle='rgba(180,225,250,0.9)'; ctx.strokeStyle='#8fc3e3'; ctx.lineWidth=1.2;
      polygon([[-9,9],[-5,-8],[0,9]]); ctx.fill(); ctx.stroke();
      polygon([[-2,9],[4,-14],[10,9]]); ctx.fill(); ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,0.7)'; polygon([[3,-10],[4,-14],[5,-4]]); ctx.fill();
      break;
    }
    case 'torch': {
      shadow(8);
      ctx.fillStyle='#4a3a30'; rrect(-2.5,-4,5,16,2); ctx.fill();
      ctx.fillStyle='#2a2025'; rrect(-5,-8,10,5,2); ctx.fill();
      const f = Math.sin(t*10+d.x)*2;
      ctx.fillStyle='rgba(255,140,50,0.25)'; ctx.beginPath(); ctx.arc(0,-14,13,0,TAU); ctx.fill();
      ctx.fillStyle='#ff7a3d'; polygon([[-5,-8],[0,-22+f],[5,-8]]); ctx.fill();
      ctx.fillStyle='#ffd23f'; polygon([[-2.5,-8],[0,-16+f*0.6],[2.5,-8]]); ctx.fill();
      break;
    }
  }
  ctx.restore();
}

function drawBackground(t){
  const th = state.theme;
  ctx.fillStyle = th.ground;
  ctx.fillRect(0,0,CANVAS_W,CANVAS_H);
  ctx.fillStyle = th.stripe;
  for(let y=0;y<CANVAS_H;y+=28){
    if((y/28)%2===0) ctx.fillRect(0,y,CANVAS_W,14);
  }
  for(const d of decorProps) drawDecorItem(d, th, t);
}

function drawAmbient(t){
  const th = state.theme;
  if(th.ambient==='none') return;
  ctx.save();
  for(const p of ambientProps){
    if(th.ambient==='snow'){
      const y = (p.y + t*p.sp*24) % CANVAS_H, x = p.x + Math.sin(t*0.8+p.ph)*12;
      ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(x,y,p.s*0.8,0,TAU); ctx.fill();
    } else if(th.ambient==='ember'){
      const y = CANVAS_H - ((p.y + t*p.sp*30) % CANVAS_H), x = p.x + Math.sin(t*2+p.ph)*8;
      ctx.fillStyle=`rgba(255,${120+Math.floor(80*p.sp/1.8)},50,${0.35+0.5*(y/CANVAS_H)})`;
      ctx.beginPath(); ctx.arc(x,y,p.s*0.7,0,TAU); ctx.fill();
    } else if(th.ambient==='leaf'){
      const x = (p.x + t*p.sp*10) % CANVAS_W, y = (p.y + t*p.sp*18) % CANVAS_H;
      ctx.fillStyle=th.ambientColor; ctx.globalAlpha=0.8;
      ctx.save(); ctx.translate(x,y); ctx.rotate(t*p.sp+p.ph);
      ctx.beginPath(); ctx.ellipse(0,0,p.s*1.8,p.s*0.9,0,0,TAU); ctx.fill(); ctx.restore();
      ctx.globalAlpha=1;
    } else if(th.ambient==='dust'){
      const x = (p.x + t*p.sp*45) % CANVAS_W, y = p.y + Math.sin(t+p.ph)*6;
      ctx.fillStyle=`rgba(${th.ambientColor},0.45)`; ctx.beginPath(); ctx.ellipse(x,y,p.s*3,p.s*0.7,0,0,TAU); ctx.fill();
    } else if(th.ambient==='bubble'){
      const y = CANVAS_H - ((p.y + t*p.sp*12) % CANVAS_H), x = p.x + Math.sin(t+p.ph)*6;
      ctx.strokeStyle=`rgba(${th.ambientColor},0.6)`; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.arc(x,y,p.s*1.6,0,TAU); ctx.stroke();
    } else if(th.ambient==='sparkle'){
      const a = Math.max(0, Math.sin(t*2+p.ph));
      if(a>0.05){
        ctx.strokeStyle=th.ambientColor; ctx.globalAlpha=a*0.9; ctx.lineWidth=1.5;
        const r = p.s*2*a+1;
        ctx.beginPath(); ctx.moveTo(p.x-r,p.y); ctx.lineTo(p.x+r,p.y); ctx.moveTo(p.x,p.y-r); ctx.lineTo(p.x,p.y+r); ctx.stroke();
        ctx.globalAlpha=1;
      }
    } else if(th.ambient==='cloud'){
      const x = ((p.x + t*p.sp*6) % (CANVAS_W+240)) - 120, y = p.y;
      ctx.fillStyle='rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.ellipse(x,y,p.s*14,p.s*4.5,0,0,TAU); ctx.fill();
    }
  }
  ctx.restore();
}

function drawPath(){
  const path = state.cfg.path;
  ctx.save();
  ctx.lineJoin='round'; ctx.lineCap='round';
  ctx.strokeStyle = state.theme.pathOut;
  ctx.lineWidth = PATH_WIDTH+6;
  ctx.beginPath();
  path.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
  ctx.stroke();
  ctx.strokeStyle = state.theme.pathIn;
  ctx.lineWidth = PATH_WIDTH;
  ctx.beginPath();
  path.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
  ctx.stroke();
  ctx.setLineDash([14,14]);
  ctx.strokeStyle = state.theme.dash;
  ctx.lineWidth = 3;
  ctx.beginPath();
  path.forEach((p,i)=> i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // base flag at the end
  const last = path[path.length-1];
  const prev = path[path.length-2];
  const bx = clamp(last.x, 20, CANVAS_W-20), by = last.y;
  ctx.save();
  ctx.translate(bx,by);
  ctx.fillStyle='#8a6a3c'; ctx.fillRect(-3,-34,6,34);
  ctx.fillStyle='#ff5c5c';
  ctx.beginPath(); ctx.moveTo(3,-34); ctx.lineTo(26,-26); ctx.lineTo(3,-18); ctx.closePath(); ctx.fill();
  ctx.font='26px sans-serif'; ctx.textAlign='center'; ctx.fillText('🏰', -3, 14);
  ctx.restore();

  // spawn marker
  const first = path[0];
  ctx.save();
  ctx.font='22px sans-serif'; ctx.textAlign='center';
  ctx.fillText('🚩', clamp(first.x,18,CANVAS_W-18), first.y+8);
  ctx.restore();
}

