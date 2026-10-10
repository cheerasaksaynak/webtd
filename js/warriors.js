"use strict";
/* Elemental warrior sprites (map towers, build preview, menu icons) */
/* ---------- Elemental warriors (used on the map, build preview and menu icons) ---------- */
const WARRIOR_SKIN = '#ffd9b8';
const WARRIOR_OUTLINE = '#3a2a1c';
const WARRIOR_SWING = { fire:1.4, water:0.8, earth:1.7, wind:0.35, thunder:1.0 };
const TAU = Math.PI*2;

function rrect(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}
function fillStroke(fill){ ctx.fillStyle=fill; ctx.fill(); ctx.stroke(); }

function drawWarriorWeapon(type, t){
  // weapon is drawn pointing up (-y) from the hand at the origin
  if(type==='fire'){
    const f = Math.sin(t*10)*1.5;
    ctx.fillStyle='#5b3d27'; ctx.fillRect(-1.5,-2,3,7);
    ctx.fillStyle='#ffd23f'; ctx.fillRect(-5,-4,10,2.5);
    ctx.beginPath(); ctx.moveTo(-3,-4); ctx.lineTo(-2.5,-25); ctx.lineTo(0,-30); ctx.lineTo(2.5,-25); ctx.lineTo(3,-4); ctx.closePath();
    fillStroke('#ffb347');
    ctx.fillStyle='#fff3c4'; ctx.fillRect(-0.8,-24,1.6,19);
    ctx.fillStyle='rgba(255,110,50,0.85)';
    ctx.beginPath(); ctx.moveTo(-3,-14); ctx.lineTo(-7,-20+f); ctx.lineTo(-3,-22); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(3,-18); ctx.lineTo(7,-26-f); ctx.lineTo(3,-27); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-2,-28); ctx.lineTo(0,-37-f); ctx.lineTo(2,-28); ctx.closePath(); ctx.fill();
  } else if(type==='water'){
    ctx.fillStyle='#6fb3e0'; ctx.fillRect(-1.3,-27,2.6,33);
    ctx.strokeStyle='#d6f1ff'; ctx.lineWidth=2.2;
    ctx.beginPath(); ctx.moveTo(-6,-33); ctx.lineTo(-6,-25); ctx.quadraticCurveTo(0,-20,6,-25); ctx.lineTo(6,-33); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,-25); ctx.lineTo(0,-37); ctx.stroke();
    ctx.fillStyle='rgba(190,232,255,0.9)';
    for(let i=0;i<3;i++){
      const a = t*2.5 + i*2.1;
      ctx.beginPath(); ctx.arc(Math.cos(a)*9, -28+Math.sin(a)*3.5, 1.8, 0, TAU); ctx.fill();
    }
  } else if(type==='earth'){
    ctx.fillStyle='#7a5230'; ctx.fillRect(-1.6,-24,3.2,30);
    rrect(-9,-34,18,12,3); ctx.lineWidth=1.4;
    fillStroke('#9c9a94');
    ctx.fillStyle='#c9c7c0'; ctx.fillRect(-7,-32,6,3);
    ctx.fillStyle='#6e4b28'; ctx.fillRect(-9,-30,18,2.2);
  } else if(type==='wind'){
    ctx.strokeStyle='#2f8f6f'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(0,-30); ctx.quadraticCurveTo(11,-14,0,2); ctx.stroke();
    ctx.strokeStyle='#ffffff'; ctx.lineWidth=0.9;
    ctx.beginPath(); ctx.moveTo(0,-30); ctx.lineTo(-2,-14); ctx.lineTo(0,2); ctx.stroke();
    ctx.strokeStyle='#8a6a3c'; ctx.lineWidth=1.8;
    ctx.beginPath(); ctx.moveTo(-2,-14); ctx.lineTo(12,-14); ctx.stroke();
    ctx.fillStyle='#e8f7f1';
    ctx.beginPath(); ctx.moveTo(12,-17); ctx.lineTo(17,-14); ctx.lineTo(12,-11); ctx.closePath(); ctx.fill();
  } else if(type==='thunder'){
    ctx.fillStyle='#8a6a3c'; ctx.fillRect(-1.3,-30,2.6,36);
    ctx.beginPath(); ctx.moveTo(2,-40); ctx.lineTo(-4,-29); ctx.lineTo(-0.5,-29); ctx.lineTo(-3,-20); ctx.lineTo(4,-32); ctx.lineTo(0.5,-32); ctx.closePath();
    ctx.lineWidth=1.2; fillStroke('#fff07a');
    if(Math.sin(t*18)>0.2){
      ctx.strokeStyle='rgba(255,240,122,0.9)'; ctx.lineWidth=1.3;
      ctx.beginPath(); ctx.moveTo(4,-34); ctx.lineTo(8,-37); ctx.lineTo(7,-31); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-4,-28); ctx.lineTo(-8,-31); ctx.lineTo(-7,-25); ctx.stroke();
    }
  }
}

function drawWarriorHelmet(type, t){
  // head centre is (0,-14); helmets cover only the area above y=-16 so the face stays visible
  const dome = (fill)=>{
    ctx.beginPath(); ctx.arc(0,-16,11,Math.PI,0); ctx.closePath(); fillStroke(fill);
    ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-4,-22,3,1.8,-0.5,0,TAU); ctx.fill();
  };
  ctx.lineWidth=1.4; ctx.strokeStyle=WARRIOR_OUTLINE;
  if(type==='fire'){
    const f = Math.sin(t*9)*2;
    ctx.fillStyle='#ffce54';
    ctx.beginPath(); ctx.moveTo(-6,-25); ctx.lineTo(-4,-34+f); ctx.lineTo(0,-27); ctx.lineTo(3,-37-f); ctx.lineTo(6,-25); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#ff7a3d';
    ctx.beginPath(); ctx.moveTo(-3,-26); ctx.lineTo(0,-32+f*0.5); ctx.lineTo(3,-26); ctx.closePath(); ctx.fill();
    dome('#d9402a');
  } else if(type==='water'){
    dome('#4ea8de');
    ctx.beginPath(); ctx.moveTo(-4,-26); ctx.quadraticCurveTo(0,-38,9,-33); ctx.quadraticCurveTo(3,-31,3,-26); ctx.closePath();
    fillStroke('#bfe8ff');
    ctx.fillStyle='#ffffff'; ctx.beginPath(); ctx.arc(0,-19.5,2,0,TAU); ctx.fill();
  } else if(type==='earth'){
    ctx.fillStyle='#f4ead2';
    ctx.beginPath(); ctx.moveTo(-9,-22); ctx.quadraticCurveTo(-18,-23,-14,-34); ctx.quadraticCurveTo(-12,-27,-6,-25); ctx.closePath(); fillStroke('#f4ead2');
    ctx.beginPath(); ctx.moveTo(9,-22); ctx.quadraticCurveTo(18,-23,14,-34); ctx.quadraticCurveTo(12,-27,6,-25); ctx.closePath(); fillStroke('#f4ead2');
    dome('#8a6a45');
    ctx.fillStyle='#5a4228'; ctx.fillRect(-1.2,-27,2.4,10);
  } else if(type==='wind'){
    ctx.save(); ctx.translate(6,-25); ctx.rotate(0.55+Math.sin(t*3)*0.15);
    ctx.beginPath(); ctx.ellipse(0,-7,3.2,8,0,0,TAU); fillStroke('#ffffff');
    ctx.restore();
    ctx.save(); ctx.translate(3,-26); ctx.rotate(0.15+Math.sin(t*3+1)*0.15);
    ctx.beginPath(); ctx.ellipse(0,-6,2.6,6.5,0,0,TAU); fillStroke('#ffe066');
    ctx.restore();
    dome('#59c9a5');
    ctx.fillStyle='#ffffff'; ctx.fillRect(-11,-19,22,3);
  } else if(type==='thunder'){
    ctx.beginPath();
    ctx.moveTo(-11,-16); ctx.lineTo(-12,-28); ctx.lineTo(-6,-23); ctx.lineTo(-4,-34); ctx.lineTo(0,-25);
    ctx.lineTo(4,-35); ctx.lineTo(6,-23); ctx.lineTo(12,-28); ctx.lineTo(11,-16); ctx.closePath();
    fillStroke('#f4d35e');
    ctx.fillStyle='#3a3a5c'; ctx.fillRect(-11,-19,22,3);
    ctx.fillStyle='#fff07a'; ctx.fillRect(-1.5,-19,3,3);
  }
}

// x,y = body centre, s = scale, facing = 1 (right) or -1 (left), atk = 0..1 weapon swing
function drawWarrior(type, x, y, s, t, facing, atk){
  const T = TOWER_TYPES[type];
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(s*facing, s);
  ctx.lineJoin='round'; ctx.lineCap='round';
  ctx.strokeStyle=WARRIOR_OUTLINE; ctx.lineWidth=1.4;
  const sway = Math.sin(t*3)*1.5;

  // cape
  ctx.beginPath(); ctx.moveTo(-8,-3); ctx.quadraticCurveTo(-15+sway,8,-12+sway*1.5,19); ctx.lineTo(8,18); ctx.lineTo(8,-3); ctx.closePath();
  fillStroke(T.dark);
  // legs / boots
  rrect(-7,11,6,9,2); fillStroke('#5b3d27');
  rrect(1,11,6,9,2); fillStroke('#5b3d27');
  // torso
  const g = ctx.createLinearGradient(0,-4,0,13);
  g.addColorStop(0,T.color); g.addColorStop(1,T.dark);
  rrect(-9,-4,18,17,5); fillStroke(g);
  ctx.fillStyle=WARRIOR_OUTLINE; ctx.fillRect(-9,7,18,3);
  ctx.fillStyle='#ffd23f'; ctx.fillRect(-2,6.5,4,4);
  ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(0,1,2.6,0,TAU); ctx.fill();
  // shoulder pads
  ctx.beginPath(); ctx.arc(-9,-2,4.5,0,TAU); fillStroke(T.dark);
  ctx.beginPath(); ctx.arc(9,-2,4.5,0,TAU); fillStroke(T.dark);

  if(type==='earth'){
    rrect(-18,-3,9,15,4); fillStroke('#8a8780');
    ctx.fillStyle='#6e4b28'; ctx.fillRect(-15,0,3,9);
  }

  // head, face, helmet
  ctx.beginPath(); ctx.arc(0,-14,10,0,TAU); fillStroke(WARRIOR_SKIN);
  drawCuteFace(0,-12,9);
  drawWarriorHelmet(type, t);

  // weapon arm
  ctx.save();
  ctx.translate(10,3);
  ctx.rotate(0.45 + atk*WARRIOR_SWING[type]);
  ctx.lineWidth=1.2;
  drawWarriorWeapon(type, t);
  ctx.beginPath(); ctx.arc(0,0,3.2,0,TAU); fillStroke(WARRIOR_SKIN);
  ctx.restore();

  ctx.restore();
}

function renderWarriorIcon(canvasEl, type){
  const dpr = 2;
  canvasEl.width = 48*dpr; canvasEl.height = 58*dpr;
  const saved = ctx;
  ctx = canvasEl.getContext('2d');
  ctx.scale(dpr,dpr);
  drawWarrior(type, 24, 39, 0.85, 0, 1, 0);
  ctx = saved;
}

