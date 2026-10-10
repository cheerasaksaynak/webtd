"use strict";
/* Constants, utilities, tower & enemy definitions, path and wave generation, save/load */
const CANVAS_W = 800, CANVAS_H = 500;
const PATH_WIDTH = 42;
const MAX_TOWER_LEVEL = 5;
const TOTAL_LEVELS = 10;

function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function lerp(a,b,t){ return a+(b-a)*t; }
function dist(x1,y1,x2,y2){ return Math.hypot(x2-x1,y2-y1); }
function choice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

// seeded PRNG (mulberry32) for deterministic level layouts
function mulberry32(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pointToSegmentDist(px,py,x1,y1,x2,y2){
  const dx=x2-x1, dy=y2-y1;
  const len2 = dx*dx+dy*dy;
  let t = len2===0 ? 0 : ((px-x1)*dx+(py-y1)*dy)/len2;
  t = clamp(t,0,1);
  const cx = x1+dx*t, cy = y1+dy*t;
  return dist(px,py,cx,cy);
}

function distToPath(px,py,path){
  let min = Infinity;
  for(let i=0;i<path.length-1;i++){
    const d = pointToSegmentDist(px,py,path[i].x,path[i].y,path[i+1].x,path[i+1].y);
    if(d<min) min=d;
  }
  return min;
}

/* ============================================================
   TOWER TYPES (ธาตุทั้ง 5)
============================================================ */
const TOWER_TYPES = {
  fire:    { key:'fire',    name:'นักรบเพลิง',   emoji:'🔥', color:'#ff6b4a', dark:'#c6431f', cost:50,
             dmg:16, range:108, rate:700,  splash:42, desc:'ดาเมจเป็นวงกว้าง + เผาไหม้ต่อเนื่อง',
             burn:{ dmg:4, ticks:5, tickMs:400 } },
  water:   { key:'water',   name:'นักรบสายชล',   emoji:'💧', color:'#4ea8de', dark:'#1f6fa8', cost:45,
             dmg:9,  range:120, rate:550,  splash:0,  desc:'ทำให้ศัตรูช้าลง',
             slow:{ factor:0.45, ms:1500 } },
  earth:   { key:'earth',   name:'นักรบศิลา',    emoji:'🪨', color:'#a9774a', dark:'#6e4b28', cost:70,
             dmg:34, range:95,  rate:1300, splash:55, desc:'ดาเมจสูงมาก + มีโอกาสทำให้มึนงง',
             stun:{ chance:0.22, ms:650 } },
  wind:    { key:'wind',    name:'นักรบวายุ',    emoji:'🌪️', color:'#8de5c7', dark:'#3f9c80', cost:55,
             dmg:7,  range:100, rate:260,  splash:0,  desc:'ยิงไวมาก + ผลักศัตรูถอยหลัง',
             knockback:16 },
  thunder: { key:'thunder', name:'นักรบสายฟ้า',  emoji:'⚡', color:'#f4d35e', dark:'#b89324', cost:90,
             dmg:13, range:130, rate:650,  splash:0,  desc:'ฟ้าผ่ากระโดดโจมตีหลายเป้าหมาย',
             chain:3, chainRange:95 },
};
const TOWER_ORDER = ['fire','water','earth','wind','thunder'];

function towerStat(tower, key){
  const base = TOWER_TYPES[tower.type];
  const mult = 1 + (tower.level-1)*0.22;
  if(key==='dmg') return base.dmg*mult;
  if(key==='range') return base.range*(1+(tower.level-1)*0.08);
  if(key==='rate') return base.rate*(1-(tower.level-1)*0.08);
  if(key==='splash') return base.splash*(1+(tower.level-1)*0.08);
  return base[key];
}
function upgradeCost(tower){
  const base = TOWER_TYPES[tower.type].cost;
  return Math.round(base*0.65*tower.level);
}
function towerTotalSpent(tower){
  let total = TOWER_TYPES[tower.type].cost;
  for(let l=1;l<tower.level;l++) total += Math.round(TOWER_TYPES[tower.type].cost*0.65*l);
  return total;
}

/* ============================================================
   ENEMY ROLES (the look of each role depends on the map theme, see monsters.js)
   slime = swarm, bat = flyer, tank, brute, boss
============================================================ */
const ENEMY_TYPES = {
  slime:  { key:'slime',  hp:38,  speed:58,  radius:15, reward:4,  dmgToBase:1 },
  bat:    { key:'bat',    hp:20,  speed:96,  radius:12, reward:3,  dmgToBase:1 },
  tank:   { key:'tank',   hp:150, speed:33,  radius:21, reward:9,  dmgToBase:2 },
  brute:  { key:'brute',  hp:260, speed:40,  radius:24, reward:14, dmgToBase:3 },
  boss:   { key:'boss',   hp:2200,speed:26,  radius:36, reward:150,dmgToBase:10 },
};

/* ============================================================
   PATH GENERATION (deterministic per level, orthogonal "snake")
============================================================ */
const COL_X = [100, 224, 348, 472, 596, 710];
const ROW_Y = [70, 160, 250, 340, 430];

function buildPath(level){
  const rnd = mulberry32(level*7919 + 13);
  const rows = [];
  rows.push(Math.floor(rnd()*ROW_Y.length));
  for(let i=1;i<COL_X.length;i++){
    let next;
    let guard=0;
    do{ next = Math.floor(rnd()*ROW_Y.length); guard++; }while(next===rows[i-1] && guard<20);
    rows.push(next);
  }
  const pts = [];
  pts.push({x:-24, y:ROW_Y[rows[0]]});
  pts.push({x:COL_X[0], y:ROW_Y[rows[0]]});
  for(let i=1;i<COL_X.length;i++){
    pts.push({x:COL_X[i-1], y:ROW_Y[rows[i]]});
    pts.push({x:COL_X[i], y:ROW_Y[rows[i]]});
  }
  pts.push({x:CANVAS_W+24, y:ROW_Y[rows[rows.length-1]]});
  // remove zero-length duplicate points
  const clean=[pts[0]];
  for(let i=1;i<pts.length;i++){
    const p = pts[i], q = clean[clean.length-1];
    if(Math.abs(p.x-q.x)>0.01 || Math.abs(p.y-q.y)>0.01) clean.push(p);
  }
  return clean;
}

function pathTotalLength(path){
  let total=0;
  for(let i=0;i<path.length-1;i++) total += dist(path[i].x,path[i].y,path[i+1].x,path[i+1].y);
  return total;
}

/* ============================================================
   WAVE GENERATION
============================================================ */
function buildWaveDefs(level){
  const waveCount = 5 + Math.ceil(level/2); // 6..10
  const defs = [];
  for(let w=0; w<waveCount; w++){
    const groups = [];
    const p = w/(waveCount-1||1);
    const lvlFactor = level + p*1.4;
    groups.push({type:'slime', count:Math.round(4+lvlFactor*1.1), interval:520});
    if(level>=2 || w>=2) groups.push({type:'bat', count:Math.round(2+lvlFactor*0.7), interval:360});
    if(level>=4 && w>=1) groups.push({type:'tank', count:Math.round(1+lvlFactor*0.3), interval:1000});
    if(level>=7 && w>=2) groups.push({type:'brute', count:Math.round(1+(level-6)*0.4+p*2), interval:1150});
    if(level>=TOTAL_LEVELS && w===waveCount-1){
      groups.push({type:'boss', count:1, interval:0});
      groups.push({type:'brute', count:4, interval:900});
    }
    defs.push(groups);
  }
  return defs;
}

function levelConfig(level){
  const n = level-1;
  return {
    level,
    path: buildPath(level),
    waves: buildWaveDefs(level),
    startGold: 170 + level*30,
    startLives: 20,
    // monster HP grows faster than linearly per level, and again from wave to wave inside a level
    hpScale: 1 + n*0.45 + n*n*0.04,
    waveHpStep: 0.07,
    speedScale: 1 + n*0.025,
    rewardScale: 1 + n*0.35,
  };
}

/* ============================================================
   SAVE / LOAD PROGRESS
============================================================ */
const SAVE_KEY = 'etd_progress_v1';
function loadProgress(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return { unlocked:1, stars:{} };
    const data = JSON.parse(raw);
    if(!data.unlocked) data.unlocked=1;
    if(!data.stars) data.stars={};
    return data;
  }catch(e){ return { unlocked:1, stars:{} }; }
}
function saveProgress(p){
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify(p)); }catch(e){}
}
let progress = loadProgress();

