"use strict";
/* Game state, wave spawning, enemy movement, tower firing and the main update tick */
/* ============================================================
   GAME STATE
============================================================ */
const state = {
  cfg:null, level:1,
  gold:0, lives:0, startLives:20,
  towers:[], enemies:[], projectiles:[], particles:[],
  waveIndex:-1, waveQueue:[], waveClockMs:0, waveActive:false,
  betweenWaveTimer:0, BETWEEN_WAVE_MS:9000, time:0, modalPaused:false,
  selectedBuildType:null, selectedTower:null, hoverPos:null,
  paused:false, speedMult:1, soundOn:true,
  gameOver:false, levelWon:false, lastTime:0,
  shotId:0,
};

function resetStateForLevel(level){
  state.cfg = levelConfig(level);
  state.theme = THEMES[(level-1)%THEMES.length];
  state.level = level;
  state.gold = state.cfg.startGold;
  state.lives = state.cfg.startLives;
  state.startLives = state.cfg.startLives;
  state.towers = [];
  state.enemies = [];
  state.projectiles = [];
  state.particles = [];
  state.waveIndex = -1;
  state.waveQueue = [];
  state.waveClockMs = 0;
  state.waveActive = false;
  state.betweenWaveTimer = 2500;
  state.time = 0;
  state.selectedBuildType = null;
  state.selectedTower = null;
  state.paused = false;
  state.speedMult = 1;
  state.gameOver = false;
  state.levelWon = false;
}

function startNextWave(){
  state.waveIndex++;
  if(state.waveIndex >= state.cfg.waves.length){ return false; }
  const groups = state.cfg.waves[state.waveIndex];
  const events = [];
  groups.forEach(g=>{
    for(let i=0;i<g.count;i++) events.push({ type:g.type, t:i*g.interval + Math.random()*80 });
  });
  events.sort((a,b)=>a.t-b.t);
  state.waveQueue = events;
  state.waveClockMs = 0;
  state.waveActive = true;
  playSfx('wave');
  return true;
}

function spawnEnemy(typeKey){
  const base = ENEMY_TYPES[typeKey];
  const cfg = state.cfg;
  const waveScale = 1 + Math.max(0,state.waveIndex)*cfg.waveHpStep;
  // the boss has a huge base HP, so it only gets part of the per-level growth
  const levelScale = typeKey==='boss' ? 1 + (cfg.hpScale-1)*0.45 : cfg.hpScale;
  const hp = Math.round(base.hp*levelScale*waveScale);
  const look = monsterLook(typeKey);
  const enemy = {
    type: typeKey, hp, maxHp:hp, look,
    speed: base.speed*cfg.speedScale,
    radius: base.radius, color: look.pal[0],
    reward: Math.round(base.reward*cfg.rewardScale), dmgToBase: base.dmgToBase,
    segIndex:0, segProgress:0, traveled:0,
    x: cfg.path[0].x, y: cfg.path[0].y,
    slowUntil:0, slowFactor:1, stunUntil:0,
    burnUntil:0, burnTickAt:0, burnDmg:0,
    hitFlash:0, bob: Math.random()*Math.PI*2,
    alive:true,
  };
  state.enemies.push(enemy);
}

/* ============================================================
   ENTITIES: path movement helper
============================================================ */
function moveEnemyAlongPath(enemy, deltaDist){
  const path = state.cfg.path;
  let remaining = deltaDist;
  if(remaining>0){
    while(remaining>0){
      if(enemy.segIndex >= path.length-1){ enemy.traveled += remaining; remaining=0; reachBase(enemy); return; }
      const a = path[enemy.segIndex], b = path[enemy.segIndex+1];
      const segLen = dist(a.x,a.y,b.x,b.y);
      const left = segLen - enemy.segProgress;
      if(remaining <= left){
        enemy.segProgress += remaining;
        remaining = 0;
      } else {
        remaining -= left;
        enemy.segIndex++;
        enemy.segProgress = 0;
      }
    }
  } else if(remaining<0){
    let back = -remaining;
    while(back>0){
      if(enemy.segIndex<=0 && enemy.segProgress<=0){ break; }
      if(back <= enemy.segProgress){
        enemy.segProgress -= back; back=0;
      } else {
        back -= enemy.segProgress;
        if(enemy.segIndex>0){
          enemy.segIndex--;
          const a = path[enemy.segIndex], b = path[enemy.segIndex+1];
          enemy.segProgress = dist(a.x,a.y,b.x,b.y);
        } else { enemy.segProgress = 0; back = 0; }
      }
    }
  }
  if(enemy.segIndex < path.length-1){
    const a = path[enemy.segIndex], b = path[enemy.segIndex+1];
    const segLen = dist(a.x,a.y,b.x,b.y) || 1;
    const t = clamp(enemy.segProgress/segLen,0,1);
    enemy.x = lerp(a.x,b.x,t);
    enemy.y = lerp(a.y,b.y,t);
  }
}

function reachBase(enemy){
  if(!enemy.alive) return;
  enemy.alive = false;
  state.lives -= enemy.dmgToBase;
  spawnTextParticle(CANVAS_W-18, state.cfg.path[state.cfg.path.length-1].y, '-'+enemy.dmgToBase, '#ff4d4d');
  playSfx('hurt');
  if(state.lives<=0){ state.lives=0; triggerGameOver(); }
}

function killEnemy(enemy){
  if(!enemy.alive) return;
  enemy.alive = false;
  state.gold += enemy.reward;
  spawnPoof(enemy.x, enemy.y, enemy.color);
  spawnTextParticle(enemy.x, enemy.y-10, '+'+enemy.reward, '#ffb000');
  playSfx('kill');
}

/* ============================================================
   PARTICLES
============================================================ */
function spawnPoof(x,y,color){
  for(let i=0;i<8;i++){
    const ang = Math.random()*Math.PI*2;
    const spd = 40+Math.random()*80;
    state.particles.push({
      kind:'poof', x,y, vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd,
      life:0, maxLife:400+Math.random()*200, color, size:4+Math.random()*4,
    });
  }
}
function spawnTextParticle(x,y,text,color){
  state.particles.push({ kind:'text', x,y, vx:0, vy:-34, life:0, maxLife:800, color, text });
}
function spawnSpark(x,y,color){
  for(let i=0;i<5;i++){
    const ang = Math.random()*Math.PI*2;
    const spd = 60+Math.random()*60;
    state.particles.push({ kind:'poof', x,y, vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd, life:0, maxLife:250, color, size:2+Math.random()*3 });
  }
}

/* ============================================================
   TOWER FIRING / PROJECTILES
============================================================ */
function findTarget(tower){
  const range = towerStat(tower,'range');
  let best=null, bestProgress=-1;
  for(const e of state.enemies){
    if(!e.alive) continue;
    if(dist(tower.x,tower.y,e.x,e.y) <= range){
      const prog = e.segIndex*10000 + e.segProgress;
      if(prog>bestProgress){ bestProgress=prog; best=e; }
    }
  }
  return best;
}

function fireTower(tower, target){
  const type = TOWER_TYPES[tower.type];
  state.projectiles.push({
    x: tower.x, y: tower.y-18, target, towerType: tower.type,
    dmg: towerStat(tower,'dmg'), splash: towerStat(tower,'splash'),
    speed: 480, color: type.color, alive:true, trail:[],
  });
  tower.attackT = 1;
  playSfx('shoot', 0.25);
}

function applyHit(proj, enemy){
  const type = TOWER_TYPES[proj.towerType];
  dealDamage(enemy, proj.dmg);
  spawnSpark(enemy.x, enemy.y, proj.color);
  if(proj.splash>0){
    for(const e2 of state.enemies){
      if(e2===enemy || !e2.alive) continue;
      if(dist(e2.x,e2.y,enemy.x,enemy.y) <= proj.splash){
        dealDamage(e2, proj.dmg*0.6);
      }
    }
  }
  if(type.slow){ enemy.slowUntil = state.time+type.slow.ms; enemy.slowFactor = type.slow.factor; }
  if(type.burn){
    enemy.burnUntil = state.time + type.burn.ticks*type.burn.tickMs;
    enemy.burnTickAt = state.time + type.burn.tickMs;
    enemy.burnDmg = type.burn.dmg;
  }
  if(type.stun && Math.random()<type.stun.chance){ enemy.stunUntil = state.time+type.stun.ms; }
  if(type.knockback){ moveEnemyAlongPath(enemy, -type.knockback); }
  if(type.chain){
    const hit = new Set([enemy]);
    let current = enemy;
    for(let c=0;c<type.chain-1;c++){
      let next=null, bestD=type.chainRange;
      for(const e2 of state.enemies){
        if(!e2.alive || hit.has(e2)) continue;
        const d = dist(current.x,current.y,e2.x,e2.y);
        if(d<=bestD){ bestD=d; next=e2; }
      }
      if(!next) break;
      state.particles.push({ kind:'bolt', x1:current.x,y1:current.y, x2:next.x,y2:next.y, life:0, maxLife:160, color:'#fff07a' });
      dealDamage(next, proj.dmg*0.7);
      spawnSpark(next.x, next.y, '#fff07a');
      hit.add(next);
      current = next;
    }
  }
}

function dealDamage(enemy, dmg){
  if(!enemy.alive) return;
  enemy.hp -= dmg;
  enemy.hitFlash = 1;
  if(enemy.hp<=0) killEnemy(enemy);
}

/* ============================================================
   MAIN UPDATE TICK
============================================================ */
function updateGame(dtMs){
  if(state.paused || state.gameOver || state.levelWon) return;
  const dt = dtMs/1000;
  state.time += dtMs;
  const now = state.time;

  // wave spawn queue
  if(state.waveActive){
    state.waveClockMs += dtMs;
    while(state.waveQueue.length && state.waveQueue[0].t <= state.waveClockMs){
      spawnEnemy(state.waveQueue.shift().type);
    }
    if(state.waveQueue.length===0 && state.enemies.every(e=>!e.alive)){
      state.waveActive = false;
      state.enemies = state.enemies.filter(e=>e.alive);
      if(state.waveIndex >= state.cfg.waves.length-1){
        triggerLevelComplete();
        return;
      } else {
        state.gold += 15 + state.level*3;
        state.betweenWaveTimer = state.BETWEEN_WAVE_MS;
      }
    }
  } else if(!state.gameOver && !state.levelWon){
    state.betweenWaveTimer -= dtMs;
    if(state.betweenWaveTimer<=0){ startNextWave(); }
  }

  // enemies
  for(const e of state.enemies){
    if(!e.alive) continue;
    e.bob += dt*6;
    if(e.hitFlash>0) e.hitFlash = Math.max(0, e.hitFlash-dt*3);
    let spd = e.speed;
    if(now < e.stunUntil){ spd = 0; }
    else if(now < e.slowUntil){ spd *= e.slowFactor; }
    if(now < e.burnUntil && now >= e.burnTickAt){
      dealDamage(e, e.burnDmg);
      e.burnTickAt = now + 400;
      spawnSpark(e.x,e.y,'#ff8a3d');
    }
    if(e.alive) moveEnemyAlongPath(e, spd*dt);
  }
  state.enemies = state.enemies.filter(e=>e.alive);

  // towers
  for(const t of state.towers){
    t.cooldown -= dtMs;
    t.attackT = Math.max(0, (t.attackT||0) - dtMs/280);
    t.angle = t.angle||0;
    if(t.target && (!t.target.alive || dist(t.x,t.y,t.target.x,t.target.y)>towerStat(t,'range'))) t.target=null;
    if(!t.target) t.target = findTarget(t);
    if(t.target){
      t.angle = Math.atan2(t.target.y-t.y, t.target.x-t.x);
      t.facing = t.target.x < t.x ? -1 : 1;
      if(t.cooldown<=0){
        fireTower(t, t.target);
        t.cooldown = towerStat(t,'rate');
      }
    }
  }

  // projectiles
  for(const p of state.projectiles){
    if(!p.alive) continue;
    if(!p.target || !p.target.alive){ p.alive=false; continue; }
    const d = dist(p.x,p.y,p.target.x,p.target.y);
    const step = p.speed*dt;
    if(d <= step+p.target.radius){
      applyHit(p, p.target);
      p.alive = false;
    } else {
      p.x += (p.target.x-p.x)/d*step;
      p.y += (p.target.y-p.y)/d*step;
    }
  }
  state.projectiles = state.projectiles.filter(p=>p.alive);

  // particles
  for(const pa of state.particles){
    pa.life += dtMs;
    if(pa.x!==undefined){ pa.x += (pa.vx||0)*dt; pa.y += (pa.vy||0)*dt; }
  }
  state.particles = state.particles.filter(pa=>pa.life < pa.maxLife);
}

function triggerGameOver(){
  state.gameOver = true;
  playSfx('lose');
  showModal({
    title:'😵 แพ้แล้ว!', emoji:'💔',
    body:`ด่าน ${state.level} — ป้อมปราการถูกทำลาย!`,
    buttons:[
      {label:'🔁 ลองใหม่', action:()=>{ hideModal(); openLevel(state.level); }},
      {label:'🗺️ เลือกด่าน', action:()=>{ hideModal(); showLevels(); }},
    ]
  });
}

function triggerLevelComplete(){
  state.levelWon = true;
  const ratio = state.lives/state.startLives;
  let stars = 1;
  if(ratio>=0.8) stars=3; else if(ratio>=0.4) stars=2;
  progress.stars[state.level] = Math.max(progress.stars[state.level]||0, stars);
  progress.unlocked = Math.max(progress.unlocked, Math.min(TOTAL_LEVELS, state.level+1));
  saveProgress(progress);
  playSfx('win');
  const nextAvail = state.level < TOTAL_LEVELS;
  showModal({
    title:'🎉 ผ่านด่าน!', emoji:'🏆',
    body:`ด่าน ${state.level} สำเร็จ! เหลือชีวิต ${state.lives}/${state.startLives}`,
    stars,
    buttons:[
      ...(nextAvail ? [{label:'➡️ ด่านถัดไป', action:()=>{ hideModal(); openLevel(state.level+1); }}]:[]),
      {label:'🗺️ เลือกด่าน', action:()=>{ hideModal(); showLevels(); }},
      {label:'🔁 เล่นซ้ำ', action:()=>{ hideModal(); openLevel(state.level); }},
    ]
  });
}

