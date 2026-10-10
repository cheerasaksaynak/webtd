"use strict";
/* Monster sprites.
   Monsters are cartoon characters built from a few reusable "art" archetypes (blob, flyer, crawler,
   beast, golem, shell, ...). Each map theme picks one look per role (swarm/flyer/tank/brute) in THEME_MONSTERS.
   Roles keep the stats from ENEMY_TYPES: slime = swarm, bat = flyer, tank, brute, boss. */

let MFLASH = false; // true while the monster is flashing white after a hit
const mcol = c => MFLASH ? '#ffffff' : c;
const NO_LINE = 'rgba(0,0,0,0)';

function mDone(fill, stroke){
  ctx.fillStyle = mcol(fill); ctx.fill();
  ctx.strokeStyle = MFLASH ? '#ffffff' : stroke; ctx.stroke();
}
function mEllipse(x,y,rx,ry,fill,stroke,rot){ ctx.beginPath(); ctx.ellipse(x,y,rx,ry,rot||0,0,TAU); mDone(fill,stroke); }
function mCircle(x,y,r,fill,stroke){ ctx.beginPath(); ctx.arc(x,y,r,0,TAU); mDone(fill,stroke); }
function mPoly(pts,fill,stroke){ polygon(pts); mDone(fill,stroke); }
function mRect(x,y,w,h,rad,fill,stroke){ rrect(x,y,w,h,rad); mDone(fill,stroke); }
function mStroke(color,w){ ctx.strokeStyle = mcol(color); ctx.lineWidth = w; ctx.stroke(); }

function mFace(x,y,r,o){
  o = o || {};
  const lw = Math.max(1,r*0.07);
  ctx.strokeStyle='#2b2b2b'; ctx.lineWidth=lw;
  for(const s of [-1,1]){
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.ellipse(x+s*r*0.36,y,r*0.23,r*0.28,0,0,TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#2b2b2b'; ctx.beginPath(); ctx.arc(x+s*r*0.34,y+r*0.05,r*0.12,0,TAU); ctx.fill();
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x+s*r*0.34+r*0.04,y+r*0.01,r*0.04,0,TAU); ctx.fill();
    if(o.brow){
      ctx.beginPath(); ctx.moveTo(x+s*r*0.72,y-r*0.42); ctx.lineTo(x+s*r*0.1,y-r*0.22);
      ctx.lineWidth=r*0.13; ctx.stroke(); ctx.lineWidth=lw;
    }
  }
  if(!o.nomouth){
    if(o.fang){
      ctx.fillStyle='#8a2323'; ctx.beginPath(); ctx.moveTo(x-r*0.3,y+r*0.36); ctx.quadraticCurveTo(x,y+r*0.78,x+r*0.3,y+r*0.36); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#fff';
      polygon([[x-r*0.22,y+r*0.38],[x-r*0.09,y+r*0.38],[x-r*0.16,y+r*0.54]]); ctx.fill();
      polygon([[x+r*0.09,y+r*0.38],[x+r*0.22,y+r*0.38],[x+r*0.16,y+r*0.54]]); ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(x,y+r*0.3,r*0.22,0.15*Math.PI,0.85*Math.PI); ctx.stroke();
    }
  }
  if(o.blush){
    ctx.fillStyle='rgba(255,120,140,0.45)';
    ctx.beginPath(); ctx.ellipse(x-r*0.68,y+r*0.3,r*0.15,r*0.09,0,0,TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+r*0.68,y+r*0.3,r*0.15,r*0.09,0,0,TAU); ctx.fill();
  }
}

/* ---------- Archetypes: each draws around (0,0) and fits roughly inside radius r ---------- */

// Squishy slime. o.acc = sprout | flame | ice | crystal | cap (with o.cap colour)
function artBlob(r,t,P,o){
  const sq = 1+Math.sin(t)*0.07, top = -r*0.95*sq;
  if(o.acc==='sprout'){
    mLine(0,top+r*0.2,0,top-r*0.4,r*0.12,'#3f9a2c');
    mEllipse(-r*0.28,top-r*0.4,r*0.3,r*0.15,'#5fd16a','#2f7a2a',-0.5);
    mEllipse(r*0.28,top-r*0.4,r*0.3,r*0.15,'#5fd16a','#2f7a2a',0.5);
  } else if(o.acc==='flame'){
    const f = Math.sin(t*2)*r*0.12;
    mPoly([[-r*0.5,top+r*0.4],[-r*0.3,top-r*0.4+f],[-r*0.05,top+r*0.4]],'#ff9a3d','#c8300f');
    mPoly([[-r*0.1,top+r*0.4],[r*0.15,top-r*0.7-f],[r*0.5,top+r*0.4]],'#ffd23f','#c8300f');
  } else if(o.acc==='ice'){
    for(const s of [-1,0,1]) mPoly([[s*r*0.4-r*0.18,top+r*0.5],[s*r*0.4,top-r*(0.35+(s?0:0.25))],[s*r*0.4+r*0.18,top+r*0.5]],'#e6f6ff','#5aa0cc');
  } else if(o.acc==='crystal'){
    for(const s of [-1,1]) mPoly([[s*r*0.35,top-r*0.55],[s*r*0.52,top-r*0.1],[s*r*0.35,top+r*0.35],[s*r*0.18,top-r*0.1]],'#ff9ae8','#9a3fc0');
  }
  ctx.beginPath(); ctx.moveTo(-r*1.1,r*0.7);
  ctx.bezierCurveTo(-r*1.25,top*1.05,r*1.25,top*1.05,r*1.1,r*0.7);
  ctx.quadraticCurveTo(0,r*1.05,-r*1.1,r*0.7); ctx.closePath(); mDone(P[0],P[1]);
  mEllipse(-r*0.5,top*0.55,r*0.28,r*0.15,'rgba(255,255,255,0.4)',NO_LINE,-0.5);
  if(o.acc==='cap'){
    ctx.beginPath(); ctx.ellipse(0,-r*0.2,r*1.2,r*0.9,0,Math.PI,TAU); ctx.closePath(); mDone(o.cap,'#7a2a1a');
    ctx.fillStyle = MFLASH?'#fff':'rgba(255,255,255,0.85)';
    for(const [x,y,s] of [[-0.6,-0.65,0.18],[0.1,-0.95,0.22],[0.65,-0.55,0.16]]){ ctx.beginPath(); ctx.arc(x*r,y*r,s*r,0,TAU); ctx.fill(); }
  }
  mFace(0,r*0.14,r*(o.acc==='cap'?0.66:0.85),{blush:true});
}

// Fluffy cloud (white puff or dark storm cloud with lightning)
function artCloud(r,t,P,o){
  const puffs = [[-0.7,0.15,0.5],[-0.2,-0.3,0.72],[0.5,-0.1,0.62],[0.95,0.3,0.42],[-1.0,0.4,0.36]];
  const draw = fill => {
    for(const [x,y,s] of puffs){ ctx.beginPath(); ctx.arc(x*r,y*r,s*r,0,TAU); fill(); }
    ctx.beginPath(); ctx.rect(-1.1*r,0.2*r,2.3*r,0.55*r); fill();
  };
  ctx.lineWidth = Math.max(4,r*0.2); ctx.strokeStyle = MFLASH ? '#fff' : P[1];
  draw(()=>ctx.stroke());
  ctx.fillStyle = mcol(P[0]); draw(()=>ctx.fill());
  if(o.storm){
    mPoly([[0.05*r,0.35*r],[0.4*r,0.35*r],[0.2*r,0.62*r],[0.38*r,0.62*r],[-0.1*r,1.1*r],[0,0.75*r],[-0.2*r,0.75*r]],'#ffe066','#b8860b');
    ctx.strokeStyle = MFLASH ? '#fff' : '#8fd0ff'; ctx.lineWidth=2;
    for(let i=0;i<3;i++){ const y=((t*8+i*7)%14)/14; ctx.beginPath(); ctx.moveTo(-0.9*r+i*0.7*r,0.8*r+y*0.3*r); ctx.lineTo(-0.95*r+i*0.7*r,0.95*r+y*0.3*r); ctx.stroke(); }
  }
  mFace(-0.1*r,0.05*r,r*0.62,{blush:!o.storm,brow:o.storm});
}

// Winged flyer. o.wing = bat | feather | insect, plus ears, beak, stripes, antenna, flame
function artFlyer(r,t,P,o){
  const fl = Math.sin(t*3.5), wc = o.wingColor||P[1];
  for(const s of [-1,1]){
    ctx.save(); ctx.scale(s,1); ctx.translate(r*0.4,-r*0.15); ctx.rotate(-(0.25+fl*0.55));
    if(o.wing==='bat') mPoly([[0,0],[r*0.9,-r*0.8],[r*0.85,-r*0.15],[r*1.3,r*0.25],[r*0.65,r*0.2],[r*0.35,r*0.6]],wc,P[1]);
    else if(o.wing==='feather') mEllipse(r*0.7,-r*0.2,r*0.8,r*0.3,wc,P[1],-0.35);
    else mEllipse(r*0.55,-r*0.45,r*0.65,r*0.27,'rgba(225,246,255,0.9)','#7fb8d6',-0.6);
    ctx.restore();
  }
  if(o.flame){
    const f = Math.sin(t*5)*r*0.15;
    mPoly([[-r*0.35,r*0.5],[0,r*1.2+f],[r*0.35,r*0.5]],'#ffb347','#d9402a');
  }
  if(o.ears){
    for(const s of [-1,1]) mPoly([[s*r*0.55,-r*0.45],[s*r*0.5,-r*1.05],[s*r*0.15,-r*0.7]],P[0],P[1]);
  }
  if(o.antenna){
    for(const s of [-1,1]){ mLine(s*r*0.25,-r*0.7,s*r*0.5,-r*1.15,r*0.07,P[1]); mCircle(s*r*0.5,-r*1.17,r*0.1,P[1],P[1]); }
  }
  mCircle(0,0,r*0.8,P[0],P[1]);
  if(o.stripes){
    ctx.save(); ctx.beginPath(); ctx.arc(0,0,r*0.8,0,TAU); ctx.clip();
    ctx.fillStyle = mcol('#3a2a00'); ctx.fillRect(-r,-r*0.38,2*r,r*0.26); ctx.fillRect(-r,r*0.2,2*r,r*0.26);
    ctx.restore();
  }
  mEllipse(0,r*0.35,r*0.5,r*0.32,'rgba(255,255,255,0.45)',NO_LINE);
  if(o.beak) mPoly([[-r*0.16,r*0.2],[r*0.16,r*0.2],[0,r*0.5]],'#ff9a2f','#b8601a');
  mFace(0,-r*0.05,r*0.7,{nomouth:o.beak,blush:true,brow:o.brow});
}

function crawlerLegs(r,t,P,n,gap,len){
  ctx.lineCap='round'; ctx.lineJoin='round';
  for(const s of [-1,1]) for(let i=0;i<n;i++){
    const w = Math.sin(t*1.4+i*1.3*s)*0.25, y0 = -r*0.1+i*r*gap;
    ctx.beginPath(); ctx.moveTo(s*r*0.5,y0);
    ctx.lineTo(s*r*(0.5+len*0.5),y0-r*0.3+w*r);
    ctx.lineTo(s*r*(0.5+len),y0+r*0.45+w*r*0.3);
    mStroke(P[1],Math.max(2,r*0.13));
  }
}

// Crawling creatures: o.kind = crab | scorpion | spider
function artCrawler(r,t,P,o){
  if(o.kind==='crab'){
    crawlerLegs(r,t,P,3,0.28,0.55);
    for(const s of [-1,1]){
      mLine(s*r*0.7,-r*0.05,s*r*1.0,-r*0.55,r*0.14,P[1]);
      mCircle(s*r*1.0,-r*0.75,r*0.33,P[0],P[1]);
      mCircle(s*r*1.3,-r*0.95,r*0.24,P[0],P[1]);
    }
    mEllipse(0,r*0.12,r*0.95,r*0.7,P[0],P[1]);
    mFace(0,r*0.12,r*0.72,{blush:true});
  } else if(o.kind==='scorpion'){
    crawlerLegs(r,t,P,3,0.28,0.5);
    const w = Math.sin(t*1.5)*r*0.12;
    ctx.beginPath(); ctx.moveTo(r*0.2,r*0.4); ctx.bezierCurveTo(r*1.3,r*0.6,r*1.4+w,-r*0.7,r*0.55,-r*1.0);
    mStroke(P[1],r*0.4); ctx.beginPath(); ctx.moveTo(r*0.2,r*0.4); ctx.bezierCurveTo(r*1.3,r*0.6,r*1.4+w,-r*0.7,r*0.55,-r*1.0); mStroke(P[0],r*0.27);
    mPoly([[r*0.3,-r*0.95],[r*0.75,-r*1.1],[r*0.5,-r*0.65]],'#ffd23f','#8a4a1a');
    for(const s of [-1,1]){ mLine(s*r*0.7,-r*0.1,s*r*0.95,-r*0.4,r*0.12,P[1]); mCircle(s*r*1.0,-r*0.5,r*0.28,P[0],P[1]); }
    mEllipse(0,r*0.2,r*0.95,r*0.65,P[0],P[1]);
    mFace(0,r*0.18,r*0.7,{brow:true,blush:true});
  } else {
    crawlerLegs(r,t,P,4,0.2,0.75);
    mCircle(0,-r*0.35,r*0.7,P[0],P[1]);
    mPoly([[0,-r*0.9],[r*0.2,-r*0.4],[0,-r*0.05],[-r*0.2,-r*0.4]],'#c9a6ff','#fff');
    mCircle(0,r*0.2,r*0.6,P[0],P[1]);
    mFace(0,r*0.2,r*0.56,{brow:true,fang:true});
  }
}

// Bulky biped. o.ears = round | pointy | horns | tusks | none, plus muzzle, bandage, club, wings, face patch
function artBeast(r,t,P,o){
  const step = Math.sin(t*1.6)*r*0.12;
  if(o.wings){
    const fl = Math.sin(t*2.5);
    for(const s of [-1,1]){
      ctx.save(); ctx.scale(s,1); ctx.translate(r*0.4,0); ctx.rotate(-0.3-fl*0.2);
      mPoly([[0,0],[r*0.95,-r*0.8],[r*0.85,-r*0.1],[r*1.15,r*0.3],[r*0.4,r*0.3]],o.wingColor||P[1],P[1]);
      ctx.restore();
    }
  }
  mEllipse(-r*0.35,r*0.95+step,r*0.3,r*0.18,P[1],P[1]);
  mEllipse(r*0.35,r*0.95-step,r*0.3,r*0.18,P[1],P[1]);
  for(const s of [-1,1]) mEllipse(s*r*0.85,r*0.35+s*step,r*0.22,r*0.4,P[0],P[1],-s*0.3);
  if(o.club){
    ctx.beginPath(); ctx.moveTo(r*0.95,r*0.55); ctx.lineTo(r*1.2,-r*0.45); mStroke('#6b4226',r*0.22);
    mEllipse(r*1.22,-r*0.6,r*0.3,r*0.4,'#8a5a30','#4a2f18',0.2);
  }
  mEllipse(0,r*0.35,r*0.8,r*0.65,P[0],P[1]);
  mEllipse(0,r*0.45,r*0.5,r*0.4,'rgba(255,255,255,0.35)',NO_LINE);
  if(o.bandage){
    ctx.save(); ctx.beginPath(); ctx.ellipse(0,r*0.35,r*0.8,r*0.65,0,0,TAU); ctx.clip();
    for(let i=0;i<4;i++) mLine(-r,r*(0.0+i*0.28),r,r*(0.2+i*0.28),r*0.1,'#fff7e0');
    ctx.restore();
  }
  for(const s of [-1,1]){
    if(o.ears==='round' || o.ears==='tusks') mCircle(s*r*0.58,-r*0.85,r*0.28,P[0],P[1]);
    else if(o.ears==='pointy') mPoly([[s*r*0.65,-r*0.6],[s*r*0.55,-r*1.2],[s*r*0.15,-r*0.85]],P[0],P[1]);
    else if(o.ears==='horns') mPoly([[s*r*0.5,-r*0.8],[s*r*0.95,-r*1.35],[s*r*0.2,-r*1.0]],'#ffd23f',P[1]);
  }
  mCircle(0,-r*0.3,r*0.72,P[0],P[1]);
  if(o.bandage){
    ctx.save(); ctx.beginPath(); ctx.arc(0,-r*0.3,r*0.72,0,TAU); ctx.clip();
    mLine(-r,-r*0.78,r,-r*0.62,r*0.1,'#fff7e0'); mLine(-r,-r*0.55,r,-r*0.4,r*0.1,'#fff7e0');
    ctx.restore();
  }
  if(o.face) mEllipse(0,-r*0.25,r*0.5,r*0.42,o.face,NO_LINE);
  if(o.muzzle){
    mEllipse(0,-r*0.1,r*0.3,r*0.22,'#f3dcc0',P[1]);
    mEllipse(0,-r*0.17,r*0.09,r*0.06,'#3a2a1c',NO_LINE);
  }
  mFace(0,-r*0.33,r*0.62,{brow:o.brow,fang:o.fang&&!o.muzzle,nomouth:o.muzzle,blush:!o.brow});
  if(o.ears==='tusks') for(const s of [-1,1]) mPoly([[s*r*0.34,-r*0.0],[s*r*0.2,-r*0.02],[s*r*0.3,-r*0.3]],'#fffbe8',P[1]);
  if(o.muzzle&&o.fang) for(const s of [-1,1]) mPoly([[s*r*0.2,-r*0.0],[s*r*0.08,-r*0.0],[s*r*0.14,r*0.14]],'#ffffff',P[1]);
}

function mLine(x1,y1,x2,y2,w,color){
  ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); mStroke(color,w);
}

// Blocky golem. o.top = spikes | crystals | leaves | flower | plume | lava | moss, o.visor for armor
function artGolem(r,t,P,o){
  const step = Math.sin(t*1.4)*r*0.1;
  mRect(-r*0.6,r*0.5+step,r*0.42,r*0.5,r*0.12,P[1],P[1]);
  mRect(r*0.18,r*0.5-step,r*0.42,r*0.5,r*0.12,P[1],P[1]);
  mRect(-r*1.12,-r*0.2-step,r*0.4,r*0.85,r*0.18,P[0],P[1]);
  mRect(r*0.72,-r*0.2+step,r*0.4,r*0.85,r*0.18,P[0],P[1]);
  if(o.top==='spikes') for(const s of [-1,1]) mPoly([[s*r*0.95-r*0.15,-r*0.15],[s*r*0.92,-r*0.8],[s*r*0.95+r*0.15,-r*0.15]],'#e6f6ff',P[1]);
  if(o.top==='crystals') for(const [x,h] of [[-0.9,0.7],[0.9,0.6],[0,0.95]]) mPoly([[x*r-r*0.16,-r*0.6],[x*r,-r*(0.6+h)],[x*r+r*0.16,-r*0.6]],'#c9a6ff','#6a4fc0');
  if(o.top==='leaves'){
    mLine(-r*0.7,-r*0.4,-r*1.3,-r*0.9,r*0.12,'#6b4226'); mLine(r*0.7,-r*0.4,r*1.3,-r*0.9,r*0.12,'#6b4226');
    for(const [x,y] of [[-1.3,-0.95],[1.3,-0.95],[-0.4,-0.95],[0.4,-0.95],[0,-1.1]]) mEllipse(x*r,y*r,r*0.28,r*0.16,'#5fd16a','#2f7a2a',x*0.4);
  }
  mRect(-r*0.75,-r*0.75,r*1.5,r*1.45,r*0.3,P[0],P[1]);
  ctx.fillStyle = MFLASH?'#fff':'rgba(255,255,255,0.25)'; ctx.fillRect(-r*0.6,-r*0.65,r*0.28,r*0.1);
  if(o.top==='lava'){
    ctx.beginPath(); ctx.moveTo(-r*0.6,-r*0.4); ctx.lineTo(-r*0.2,-r*0.1); ctx.lineTo(-r*0.4,r*0.3); ctx.moveTo(r*0.5,r*0.2); ctx.lineTo(r*0.2,r*0.45);
    mStroke('#ff9a2f',Math.max(2,r*0.09));
  } else {
    ctx.beginPath(); ctx.moveTo(r*0.4,-r*0.7); ctx.lineTo(r*0.2,-r*0.45); ctx.lineTo(r*0.35,-r*0.25);
    mStroke(P[1],Math.max(1.5,r*0.06));
  }
  if(o.top==='moss') for(const s of [-1,1]) mEllipse(s*r*0.5,-r*0.72,r*0.28,r*0.12,'#5a8a3a',NO_LINE);
  if(o.top==='flower'){
    ctx.fillStyle = MFLASH?'#fff':'#e8f7d8';
    for(let i=0;i<5;i++){ ctx.fillRect(-r*0.6+i*r*0.3,r*0.5,r*0.05,r*0.1); ctx.fillRect(-r*0.6+i*r*0.3,-r*0.5,r*0.05,r*0.1); }
    mCircle(0,-r*0.9,r*0.2,'#ff8fb7','#c04a7a');
    mCircle(0,-r*0.9,r*0.08,'#ffd23f',NO_LINE);
  }
  if(o.top==='plume'){
    mRect(-r*0.75,-r*0.75,r*1.5,r*0.5,r*0.25,'#a9afc2',P[1]);
    ctx.beginPath(); ctx.moveTo(0,-r*0.75); ctx.bezierCurveTo(-r*0.2,-r*1.3,r*0.5,-r*1.5,r*0.8,-r*1.1);
    ctx.bezierCurveTo(r*0.5,-r*1.1,r*0.2,-r*0.95,r*0.1,-r*0.75); ctx.closePath(); mDone('#e8453a','#8a1a1a');
  }
  if(o.visor){
    mRect(-r*0.55,-r*0.5,r*1.1,r*0.34,r*0.1,'#1b1b26',NO_LINE);
    ctx.fillStyle = MFLASH?'#fff':'#ffe066';
    for(const s of [-1,1]){ ctx.beginPath(); ctx.arc(s*r*0.27,-r*0.33,r*0.08,0,TAU); ctx.fill(); }
    ctx.fillStyle = MFLASH?'#fff':P[1]; ctx.fillRect(-r*0.75,r*0.1,r*1.5,r*0.1);
    mCircle(0,r*0.15,r*0.1,'#ffd23f',P[1]);
    mLine(-r*0.3,r*0.35,r*0.3,r*0.35,r*0.06,P[1]);
  } else {
    mFace(0,-r*0.15,r*0.75,{brow:true});
  }
}

// Turtle or snail (o.snail): tanky shell monsters
function artShell(r,t,P,o){
  const sh = o.shell||'#8a6a3c';
  if(o.snail){
    const w = Math.sin(t*1.2)*r*0.06;
    mEllipse(0,r*0.58,r*1.15,r*0.38,P[0],P[1]);
    mCircle(-r*0.8,r*0.15,r*0.45,P[0],P[1]);
    for(const s of [-1,1]){ mLine(-r*0.8+s*r*0.18,-r*0.15,-r*0.8+s*r*0.28,-r*0.6+w*s,r*0.08,P[1]); mCircle(-r*0.8+s*r*0.28,-r*0.62+w*s,r*0.09,P[1],P[1]); }
    mCircle(r*0.25,-r*0.2,r*0.8,sh,P[1]);
    ctx.beginPath(); ctx.arc(r*0.25,-r*0.2,r*0.5,0.3,Math.PI*1.7); ctx.arc(r*0.25,-r*0.2,r*0.25,Math.PI*1.7,Math.PI*0.7,true);
    mStroke('rgba(255,255,255,0.7)',Math.max(2,r*0.1));
    mFace(-r*0.8,r*0.2,r*0.4,{blush:true});
    return;
  }
  for(const s of [-1,1]) mEllipse(s*r*0.8,r*0.62+Math.sin(t*1.4+s)*r*0.04,r*0.26,r*0.2,P[1],P[1]);
  mCircle(0,r*0.62,r*0.45,P[0],P[1]);
  mEllipse(0,-r*0.2,r*1.05,r*0.72,sh,P[1]);
  ctx.save(); ctx.beginPath(); ctx.ellipse(0,-r*0.2,r*1.05,r*0.72,0,0,TAU); ctx.clip();
  ctx.strokeStyle = MFLASH?'#fff':'rgba(0,0,0,0.28)'; ctx.lineWidth=Math.max(1.5,r*0.07);
  ctx.beginPath(); ctx.moveTo(-r*0.55,-r*0.9); ctx.lineTo(-r*0.3,-r*0.2); ctx.lineTo(-r*0.6,r*0.4); ctx.moveTo(r*0.55,-r*0.9); ctx.lineTo(r*0.3,-r*0.2); ctx.lineTo(r*0.6,r*0.4);
  ctx.moveTo(-r*0.3,-r*0.2); ctx.lineTo(r*0.3,-r*0.2); ctx.moveTo(0,-r*0.9); ctx.lineTo(0,-r*0.2); ctx.stroke();
  ctx.restore();
  if(o.moss) for(const [x,y,s] of [[-0.5,-0.7,0.28],[0.4,-0.8,0.22],[0.1,-0.45,0.16]]) mEllipse(x*r,y*r,s*r*1.3,s*r*0.7,'#5a8a3a',NO_LINE);
  mEllipse(-r*0.35,-r*0.6,r*0.25,r*0.12,'rgba(255,255,255,0.4)',NO_LINE,-0.4);
  mFace(0,r*0.68,r*0.4,{blush:true});
}

function artFrog(r,t,P,o){
  const sq = 1+Math.sin(t*1.5)*0.08;
  for(const s of [-1,1]) mEllipse(s*r*0.8,r*0.92,r*0.35,r*0.16,P[1],P[1]);
  mEllipse(0,r*0.25,r*1.05,r*0.75*sq,P[0],P[1]);
  mEllipse(0,r*0.5,r*0.65,r*0.4,'#e2f4b0',NO_LINE);
  for(const [x,y] of [[-0.55,0.1],[0.6,0.2],[0.2,-0.2]]) mCircle(x*r,y*r,r*0.1,P[1],NO_LINE);
  for(const s of [-1,1]){
    mCircle(s*r*0.5,-r*0.45,r*0.38,P[0],P[1]);
    mCircle(s*r*0.5,-r*0.45,r*0.26,'#ffffff','#2b2b2b');
    ctx.fillStyle='#2b2b2b'; ctx.beginPath(); ctx.arc(s*r*0.5,-r*0.42,r*0.12,0,TAU); ctx.fill();
  }
  ctx.strokeStyle='#2b2b2b'; ctx.lineWidth=Math.max(1.5,r*0.08);
  ctx.beginPath(); ctx.arc(0,r*0.12,r*0.55,0.1*Math.PI,0.9*Math.PI); ctx.stroke();
  ctx.fillStyle='rgba(255,120,140,0.5)';
  for(const s of [-1,1]){ ctx.beginPath(); ctx.ellipse(s*r*0.7,r*0.3,r*0.15,r*0.09,0,0,TAU); ctx.fill(); }
}

// Floating ghost / wisp
function artGhost(r,t,P,o){
  if(o.glow){ ctx.fillStyle = MFLASH?'#fff':'rgba(190,255,220,0.25)'; ctx.beginPath(); ctx.arc(0,0,r*1.3,0,TAU); ctx.fill(); }
  const w = Math.sin(t*2)*r*0.12;
  ctx.beginPath(); ctx.moveTo(-r*0.85,r*0.8); ctx.lineTo(-r*0.85,-r*0.1); ctx.arc(0,-r*0.1,r*0.85,Math.PI,0);
  ctx.lineTo(r*0.85,r*0.8);
  for(let i=0;i<4;i++){ const x1=r*0.85-(i+0.5)*r*0.425, x2=r*0.85-(i+1)*r*0.425; ctx.quadraticCurveTo(x1,r*(i%2?1.1:0.55)+w*(i%2?1:-1),x2,r*0.8); }
  ctx.closePath(); mDone(P[0],P[1]);
  for(const s of [-1,1]) mEllipse(s*r*0.95,r*0.2+Math.sin(t*2+s)*r*0.1,r*0.2,r*0.3,P[0],P[1],-s*0.4);
  mFace(0,-r*0.05,r*0.78,{blush:true});
}

function artSkeleton(r,t,P,o){
  const step = Math.sin(t*1.8)*r*0.12, bone = '#f3ecd8', bd = '#8a7a66';
  mLine(-r*0.2,r*0.55,-r*0.3,r*0.95+step,r*0.14,bone); mLine(r*0.2,r*0.55,r*0.3,r*0.95-step,r*0.14,bone);
  mLine(-r*0.5,r*0.35,-r*0.9,r*0.6+step,r*0.12,bone); mLine(r*0.5,r*0.35,r*0.9,r*0.6-step,r*0.12,bone);
  mRect(-r*0.42,r*0.28,r*0.84,r*0.45,r*0.16,bone,bd);
  ctx.fillStyle = MFLASH?'#fff':bd;
  for(let i=0;i<3;i++) ctx.fillRect(-r*0.3,r*0.38+i*r*0.12,r*0.6,r*0.04);
  mCircle(0,-r*0.28,r*0.78,bone,bd);
  for(const s of [-1,1]){
    mEllipse(s*r*0.3,-r*0.3,r*0.21,r*0.27,'#2b2b2b',NO_LINE);
    ctx.fillStyle = MFLASH?'#fff':(o.glow||'#7fe8ff'); ctx.beginPath(); ctx.arc(s*r*0.3,-r*0.28,r*0.07,0,TAU); ctx.fill();
  }
  mPoly([[0,-r*0.1],[-r*0.08,r*0.05],[r*0.08,r*0.05]],'#2b2b2b',NO_LINE);
  ctx.strokeStyle='#2b2b2b'; ctx.lineWidth=Math.max(1.2,r*0.06);
  ctx.beginPath(); ctx.moveTo(-r*0.3,r*0.2); ctx.lineTo(r*0.3,r*0.2); for(let i=-2;i<=2;i++){ ctx.moveTo(i*r*0.12,r*0.14); ctx.lineTo(i*r*0.12,r*0.26); } ctx.stroke();
  mPoly([[-r*0.78,-r*0.4],[r*0.78,-r*0.4],[r*0.6,-r*0.58],[-r*0.6,-r*0.58]],'#e8453a','#8a1a1a');
}

function artOctopus(r,t,P,o){
  ctx.lineCap='round';
  for(const [col,w] of [[P[1],r*0.32],[P[0],r*0.2]]) for(let i=0;i<6;i++){
    const x0 = -r*0.7+i*r*0.28, sw = Math.sin(t*1.5+i)*r*0.25;
    ctx.beginPath(); ctx.moveTo(x0,r*0.3); ctx.quadraticCurveTo(x0+sw,r*0.7,x0+sw*1.3,r*1.0); mStroke(col,w);
  }
  mEllipse(0,-r*0.15,r*0.95,r*0.9,P[0],P[1]);
  for(const [x,y,s] of [[-0.5,-0.7,0.12],[0.55,-0.6,0.1],[0.2,-0.85,0.08]]) mCircle(x*r,y*r,s*r,'rgba(255,255,255,0.4)',NO_LINE);
  mFace(0,-r*0.05,r*0.78,{brow:true});
}

// Boss: the dragon king
function artDragon(r,t,P,o){
  const fl = Math.sin(t*2), sw = Math.sin(t*1.5)*r*0.25;
  for(const s of [-1,1]){
    ctx.save(); ctx.scale(s*0.75,0.75); ctx.translate(r*0.5,-r*0.1); ctx.rotate(-0.35-fl*0.25);
    mPoly([[0,0],[r*0.9,-r*1.0],[r*1.25,-r*0.3],[r*1.5,r*0.25],[r*0.95,r*0.15],[r*0.7,r*0.6],[r*0.3,r*0.35]],o.wing,P[1]);
    mLine(0,0,r*0.9,-r*1.0,r*0.08,P[1]); mLine(0,0,r*1.5,r*0.25,r*0.08,P[1]);
    ctx.restore();
  }
  ctx.beginPath(); ctx.moveTo(r*0.6,r*0.7); ctx.quadraticCurveTo(r*1.4,r*0.9+sw,r*1.35,r*0.3+sw); mStroke(P[1],r*0.38);
  ctx.beginPath(); ctx.moveTo(r*0.6,r*0.7); ctx.quadraticCurveTo(r*1.4,r*0.9+sw,r*1.35,r*0.3+sw); mStroke(P[0],r*0.25);
  mPoly([[r*1.2,r*0.35+sw],[r*1.6,r*0.1+sw],[r*1.45,r*0.55+sw]],'#ffd23f',P[1]);
  mEllipse(-r*0.55,r*1.0,r*0.32,r*0.16,P[1],P[1]); mEllipse(r*0.55,r*1.0,r*0.32,r*0.16,P[1],P[1]);
  mEllipse(0,r*0.3,r*0.95,r*0.8,P[0],P[1]);
  mEllipse(0,r*0.42,r*0.6,r*0.55,'#ffe2a8',NO_LINE);
  mCircle(0,-r*0.35,r*0.75,P[0],P[1]);
  for(const s of [-1,1]) mPoly([[s*r*0.4,-r*0.8],[s*r*0.95,-r*1.45],[s*r*0.1,-r*1.05]],'#ffd23f',P[1]);
  for(const x of [-0.25,0,0.25]) mPoly([[x*r-r*0.1,-r*1.0],[x*r,-r*1.3],[x*r+r*0.1,-r*1.0]],'#ffd23f',P[1]);
  mEllipse(0,-r*0.05,r*0.42,r*0.3,'#ffb3c8',P[1]);
  for(const s of [-1,1]){ mCircle(s*r*0.15,-r*0.1,r*0.05,'#6a1f3a',NO_LINE); mPoly([[s*r*0.28,r*0.12],[s*r*0.15,r*0.12],[s*r*0.22,r*0.3]],'#fff',P[1]); }
  mFace(0,-r*0.5,r*0.66,{brow:true,nomouth:true});
}

/* ---------- Looks per theme (index = level - 1) ---------- */
const ART = { blob:artBlob, cloud:artCloud, flyer:artFlyer, crawler:artCrawler, beast:artBeast,
  golem:artGolem, shell:artShell, frog:artFrog, ghost:artGhost, skeleton:artSkeleton, octopus:artOctopus, dragon:artDragon };

const DRAGON_LOOK = { art:'dragon', pal:['#ff5c8a','#b8275a'], o:{ wing:'#ff9ab8' } };

// pal = [body colour, outline colour]
const THEME_MONSTERS = [
  { // 0 meadow
    slime:{ art:'blob',   pal:['#7ed957','#3f9a2c'], o:{ acc:'sprout' } },
    bat:  { art:'flyer',  pal:['#ffd93b','#8a6a00'], o:{ wing:'insect', stripes:true, antenna:true } },
    tank: { art:'shell',  pal:['#e8b27a','#a8703c'], o:{ snail:true, shell:'#ff9ecb' } },
    brute:{ art:'beast',  pal:['#b57a4a','#6b4226'], o:{ ears:'round', muzzle:true } } },
  { // 1 forest
    slime:{ art:'blob',   pal:['#f2e3c2','#a58a5a'], o:{ acc:'cap', cap:'#e8543d' } },
    bat:  { art:'flyer',  pal:['#9a6b3f','#5b3d1e'], o:{ wing:'feather', wingColor:'#7a5230', ears:true, beak:true } },
    tank: { art:'golem',  pal:['#8a5a30','#4a2f18'], o:{ top:'leaves' } },
    brute:{ art:'beast',  pal:['#8f98a3','#4c5560'], o:{ ears:'pointy', muzzle:true, fang:true, brow:true } } },
  { // 2 desert
    slime:{ art:'crawler',pal:['#d9863f','#8a4a1a'], o:{ kind:'scorpion' } },
    bat:  { art:'flyer',  pal:['#2f9a8a','#16534a'], o:{ wing:'insect', antenna:true } },
    tank: { art:'golem',  pal:['#5fae5a','#2f6f35'], o:{ top:'flower' } },
    brute:{ art:'beast',  pal:['#eadfc2','#9c8a62'], o:{ ears:'none', bandage:true, brow:true } } },
  { // 3 beach
    slime:{ art:'crawler',pal:['#ff6a5a','#b02f26'], o:{ kind:'crab' } },
    bat:  { art:'flyer',  pal:['#ffffff','#9aa6b2'], o:{ wing:'feather', wingColor:'#e6eef5', beak:true } },
    tank: { art:'shell',  pal:['#5fb87a','#2f7a4a'], o:{ shell:'#8a6a3c' } },
    brute:{ art:'octopus',pal:['#b36bd9','#6a2f8a'], o:{} } },
  { // 4 snow
    slime:{ art:'blob',   pal:['#bfe8ff','#5aa0cc'], o:{ acc:'ice' } },
    bat:  { art:'flyer',  pal:['#7fc4ff','#3a78b0'], o:{ wing:'feather', wingColor:'#e6f4ff', beak:true } },
    tank: { art:'golem',  pal:['#a8d8f0','#5c9ec4'], o:{ top:'spikes' } },
    brute:{ art:'beast',  pal:['#f2f6fa','#8aa0b4'], o:{ ears:'round', brow:true, fang:true, face:'#bfe0f5' } } },
  { // 5 lava
    slime:{ art:'blob',   pal:['#ff7a2f','#a8300f'], o:{ acc:'flame' } },
    bat:  { art:'flyer',  pal:['#c0392b','#701810'], o:{ wing:'bat', ears:true, flame:true } },
    tank: { art:'golem',  pal:['#6b5458','#2f2024'], o:{ top:'lava' } },
    brute:{ art:'beast',  pal:['#e8453a','#8a1a1a'], o:{ ears:'horns', brow:true, fang:true } } },
  { // 6 swamp
    slime:{ art:'frog',   pal:['#7bbf4f','#3d7a2a'], o:{} },
    bat:  { art:'ghost',  pal:['#b8ffd9','#4fbf8a'], o:{ glow:true } },
    tank: { art:'shell',  pal:['#6a8a4a','#3a4f26'], o:{ shell:'#4a6a3a', moss:true } },
    brute:{ art:'beast',  pal:['#8aa04a','#4a5a24'], o:{ ears:'tusks', brow:true, club:true } } },
  { // 7 crystal cave
    slime:{ art:'blob',   pal:['#e88bff','#9a3fc0'], o:{ acc:'crystal' } },
    bat:  { art:'flyer',  pal:['#8be8ff','#3a8fb0'], o:{ wing:'insect', antenna:true } },
    tank: { art:'golem',  pal:['#8a7ad8','#4a3f9a'], o:{ top:'crystals' } },
    brute:{ art:'crawler',pal:['#5a3f9a','#2a1a5a'], o:{ kind:'spider' } } },
  { // 8 sky city
    slime:{ art:'cloud',  pal:['#ffffff','#9ab8d8'], o:{} },
    bat:  { art:'flyer',  pal:['#ffd45a','#b8860b'], o:{ wing:'feather', wingColor:'#ffffff', beak:true } },
    tank: { art:'cloud',  pal:['#8a95b0','#454f6b'], o:{ storm:true } },
    brute:{ art:'beast',  pal:['#fff0c8','#c9a24a'], o:{ ears:'round', wings:true, wingColor:'#ffffff', muzzle:true, fang:true, brow:true } } },
  { // 9 dragon castle
    slime:{ art:'skeleton',pal:['#f3ecd8','#8a7a66'], o:{ glow:'#7fe8ff' } },
    bat:  { art:'ghost',  pal:['#d9d0ff','#7a6fb8'], o:{} },
    tank: { art:'golem',  pal:['#8a8fa0','#3f4352'], o:{ top:'plume', visor:true } },
    brute:{ art:'beast',  pal:['#8a2a4a','#3a0f20'], o:{ ears:'horns', wings:true, wingColor:'#5a1a3a', brow:true, fang:true } } },
];

function monsterLook(role){
  if(role==='boss') return DRAGON_LOOK;
  const set = THEME_MONSTERS[THEMES.indexOf(state.theme)] || THEME_MONSTERS[0];
  return set[role];
}

function drawEnemy(e){
  const look = e.look || monsterLook(e.type);
  const r = e.radius, flyer = e.type==='bat', boss = e.type==='boss';
  const lift = flyer ? 10 : 0;
  const bob = Math.sin(e.bob)*(flyer ? 3 : 1.8);
  ctx.fillStyle='rgba(0,0,0,0.2)';
  ctx.beginPath(); ctx.ellipse(e.x,e.y+r*0.85,r*(flyer?0.55:0.85),r*0.25,0,0,TAU); ctx.fill();

  MFLASH = e.hitFlash>0;
  ctx.save();
  ctx.translate(e.x, e.y - r*0.15 + bob - lift);
  ctx.lineJoin='round'; ctx.lineCap='round';
  ctx.lineWidth = Math.max(1.8, r*0.1);
  ART[look.art](r, e.bob, look.pal, look.o);
  ctx.restore();
  MFLASH = false;

  if(e.hp<e.maxHp){
    const w = Math.max(28, r*2), h = boss ? 7 : 5;
    ctx.save();
    ctx.translate(e.x-w/2, e.y-r*1.25-lift-10);
    ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(-1,-1,w+2,h+2);
    ctx.fillStyle = e.hp/e.maxHp>0.5? '#6fd66f' : (e.hp/e.maxHp>0.25? '#ffcc4d':'#ff5c5c');
    ctx.fillRect(0,0,w*clamp(e.hp/e.maxHp,0,1),h);
    ctx.restore();
  }
}
