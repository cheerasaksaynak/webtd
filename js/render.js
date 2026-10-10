"use strict";
/* Canvas rendering: towers, projectiles, particles, build preview, main render() */
/* ============================================================
   RENDERING
============================================================ */
const canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');


function drawCuteFace(x,y,r, blush=true){
  // eyes
  ctx.fillStyle='#fff';
  ctx.beginPath(); ctx.ellipse(x-r*0.32,y-r*0.08,r*0.22,r*0.26,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+r*0.32,y-r*0.08,r*0.22,r*0.26,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#2b2b2b';
  ctx.beginPath(); ctx.arc(x-r*0.28,y-r*0.02,r*0.1,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(x+r*0.36,y-r*0.02,r*0.1,0,Math.PI*2); ctx.fill();
  // mouth
  ctx.strokeStyle='#2b2b2b'; ctx.lineWidth=Math.max(1.2,r*0.07);
  ctx.beginPath(); ctx.arc(x,y+r*0.12,r*0.28,0.15*Math.PI,0.85*Math.PI); ctx.stroke();
  if(blush){
    ctx.fillStyle='rgba(255,120,140,0.45)';
    ctx.beginPath(); ctx.ellipse(x-r*0.55,y+r*0.2,r*0.16,r*0.1,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x+r*0.55,y+r*0.2,r*0.16,r*0.1,0,0,Math.PI*2); ctx.fill();
  }
}


function drawTower(tower, t){
  const {x,y} = tower;
  // pad
  ctx.save();
  ctx.fillStyle='rgba(0,0,0,0.18)';
  ctx.beginPath(); ctx.ellipse(x,y+20,22,8,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = state.theme.pathIn;
  ctx.beginPath(); ctx.ellipse(x,y+16,24,10,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=state.theme.pathOut; ctx.lineWidth=3; ctx.stroke();

  const bob = Math.sin(t*2 + x)*1.2;
  drawWarrior(tower.type, x, y-8+bob, 1.15+(tower.level-1)*0.05, t, tower.facing||1, tower.attackT||0);

  // level stars pips
  for(let i=0;i<tower.level;i++){
    ctx.fillStyle='#ffd23f';
    ctx.beginPath(); ctx.arc(x-14+i*7, y+24, 2.6,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();

  if(state.selectedTower===tower || state.hoverTower===tower){
    ctx.save();
    ctx.strokeStyle='rgba(255,255,255,0.85)'; ctx.setLineDash([6,6]); ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(x,y,towerStat(tower,'range'),0,Math.PI*2); ctx.stroke();
    ctx.restore();
  }
}


function drawProjectile(p){
  ctx.save();
  ctx.fillStyle = p.color;
  ctx.beginPath();
  if(p.towerType==='earth'){ ctx.rect(p.x-4,p.y-4,8,8); }
  else { ctx.arc(p.x,p.y,5,0,Math.PI*2); }
  ctx.fill();
  ctx.restore();
}

function drawParticle(pa){
  const alpha = clamp(1-pa.life/pa.maxLife,0,1);
  ctx.save();
  ctx.globalAlpha = alpha;
  if(pa.kind==='poof'){
    ctx.fillStyle = pa.color;
    ctx.beginPath(); ctx.arc(pa.x,pa.y,pa.size,0,Math.PI*2); ctx.fill();
  } else if(pa.kind==='text'){
    ctx.fillStyle = pa.color;
    ctx.font='bold 14px sans-serif'; ctx.textAlign='center';
    ctx.fillText(pa.text, pa.x, pa.y);
  } else if(pa.kind==='bolt'){
    ctx.strokeStyle = pa.color; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(pa.x1,pa.y1);
    const mx=(pa.x1+pa.x2)/2+(Math.random()-0.5)*14, my=(pa.y1+pa.y2)/2+(Math.random()-0.5)*14;
    ctx.lineTo(mx,my); ctx.lineTo(pa.x2,pa.y2); ctx.stroke();
  }
  ctx.restore();
}

function drawBuildPreview(){
  if(!state.selectedBuildType || !state.hoverPos) return;
  const type = TOWER_TYPES[state.selectedBuildType];
  const {x,y} = state.hoverPos;
  const valid = canPlaceTowerAt(x,y);
  ctx.save();
  ctx.globalAlpha=0.65;
  drawWarrior(state.selectedBuildType, x, y-8, 1.15, performance.now()/1000, 1, 0);
  if(!valid){
    ctx.globalAlpha=0.35; ctx.fillStyle='#ff3b3b';
    ctx.beginPath(); ctx.ellipse(x,y+16,24,10,0,0,Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha=0.25;
  ctx.strokeStyle = valid? '#2ecc71' : '#ff5c5c';
  ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(x,y,type.range,0,Math.PI*2); ctx.stroke();
  ctx.restore();
}

function render(t){
  ctx.clearRect(0,0,CANVAS_W,CANVAS_H);
  drawBackground(t/1000);
  drawPath();
  for(const tower of state.towers) drawTower(tower, t/1000);
  for(const e of state.enemies) drawEnemy(e);
  for(const p of state.projectiles) drawProjectile(p);
  for(const pa of state.particles) drawParticle(pa);
  drawAmbient(t/1000);
  drawBuildPreview();
}
