"use strict";
/* Tower placement, input, HUD, modals, screens, audio, main loop */
/* ============================================================
   TOWER PLACEMENT / SELECTION LOGIC
============================================================ */
const TOWER_RADIUS = 20;
function canPlaceTowerAt(x,y){
  if(x<TOWER_RADIUS || x>CANVAS_W-TOWER_RADIUS || y<TOWER_RADIUS || y>CANVAS_H-TOWER_RADIUS) return false;
  if(distToPath(x,y,state.cfg.path) < PATH_WIDTH/2+TOWER_RADIUS-2) return false;
  for(const tw of state.towers){ if(dist(tw.x,tw.y,x,y) < TOWER_RADIUS*2) return false; }
  return true;
}

function placeTower(type, x, y){
  const cost = TOWER_TYPES[type].cost;
  if(state.gold < cost) return false;
  if(!canPlaceTowerAt(x,y)) return false;
  state.gold -= cost;
  state.towers.push({ type, x, y, level:1, cooldown:0, target:null, angle:0 });
  playSfx('place');
  return true;
}

function sellTower(tower){
  const refund = Math.round(towerTotalSpent(tower)*0.7);
  state.gold += refund;
  state.towers = state.towers.filter(t=>t!==tower);
  state.selectedTower = null;
  playSfx('place');
}

function upgradeTower(tower){
  if(tower.level>=MAX_TOWER_LEVEL) return;
  const cost = upgradeCost(tower);
  if(state.gold < cost) return;
  state.gold -= cost;
  tower.level++;
  playSfx('place');
}

/* ============================================================
   INPUT HANDLING
============================================================ */
function canvasPos(evt){
  const rect = canvas.getBoundingClientRect();
  const scaleX = CANVAS_W/rect.width, scaleY = CANVAS_H/rect.height;
  return { x:(evt.clientX-rect.left)*scaleX, y:(evt.clientY-rect.top)*scaleY };
}

canvas.addEventListener('mousemove', (evt)=>{
  state.hoverPos = canvasPos(evt);
  state.hoverTower = state.towers.find(t=> dist(t.x,t.y,state.hoverPos.x,state.hoverPos.y) < TOWER_RADIUS) || null;
});
canvas.addEventListener('mouseleave', ()=>{ state.hoverPos=null; state.hoverTower=null; });

canvas.addEventListener('click', (evt)=>{
  const {x,y} = canvasPos(evt);
  const clickedTower = state.towers.find(t=> dist(t.x,t.y,x,y) < TOWER_RADIUS);
  if(state.selectedBuildType){
    if(!clickedTower){
      const ok = placeTower(state.selectedBuildType, x, y);
      if(ok){ state.selectedBuildType=null; refreshTowerButtons(); }
    }
    return;
  }
  if(clickedTower){ state.selectedTower = clickedTower; renderTowerModal(); }
  else { closeTowerModal(); }
});

/* ============================================================
   SIDEBAR: tower buttons + upgrade panel
============================================================ */
const towerButtonsEl = document.getElementById('tower-buttons');
function buildTowerButtons(){
  towerButtonsEl.innerHTML = '';
  TOWER_ORDER.forEach(key=>{
    const type = TOWER_TYPES[key];
    const btn = document.createElement('button');
    btn.className = 'tower-btn ghost';
    btn.innerHTML = `<span class="ic"><canvas></canvas></span><span class="info"><b>${type.name}</b><small>🪙${type.cost} · ${type.desc}</small></span>`;
    renderWarriorIcon(btn.querySelector('canvas'), key);
    btn.dataset.key = key;
    btn.addEventListener('click', ()=>{
      state.selectedBuildType = (state.selectedBuildType===key) ? null : key;
      state.selectedTower = null;
      refreshTowerButtons();
    });
    towerButtonsEl.appendChild(btn);
  });
  refreshTowerButtons();
}
function refreshTowerButtons(){
  [...towerButtonsEl.children].forEach(btn=>{
    const key = btn.dataset.key;
    btn.classList.toggle('selected', state.selectedBuildType===key);
    btn.disabled = state.gold < TOWER_TYPES[key].cost;
  });
}

const upgradePanelEl = document.getElementById('upgrade-panel');
const towerModalEl = document.getElementById('tower-modal');

function closeTowerModal(){
  state.selectedTower = null;
  renderTowerModal();
}

// Upgrade / sell dialog. The game is paused while it is open.
function renderTowerModal(){
  const tower = state.selectedTower;
  if(!tower){
    towerModalEl.classList.add('hidden');
    upgradePanelEl.innerHTML = '';
    if(state.modalPaused){ state.paused = false; state.modalPaused = false; }
    return;
  }
  if(towerModalEl.classList.contains('hidden')){
    towerModalEl.classList.remove('hidden');
    state.modalPaused = !state.paused;
    state.paused = true;
  }
  const type = TOWER_TYPES[tower.type];
  const maxed = tower.level>=MAX_TOWER_LEVEL;
  const cost = upgradeCost(tower);
  const refund = Math.round(towerTotalSpent(tower)*0.7);
  const next = { type:tower.type, level:tower.level+1 };
  const stat = (label, key, fmt) => {
    const now = fmt(towerStat(tower,key));
    const nxt = maxed ? '' : fmt(towerStat(next,key));
    return `<div class="row"><span>${label}</span><span>${now}${nxt && nxt!==now ? ` <i>→ ${nxt}</i>` : ''}</span></div>`;
  };
  upgradePanelEl.innerHTML = `
    <button class="tm-close" id="tm-close" title="ปิด">✕</button>
    <div class="tm-head">
      <span class="tm-icon"><canvas></canvas></span>
      <div>
        <div class="tm-name">${type.name}</div>
        <div class="tm-level">เลเวล ${tower.level}/${MAX_TOWER_LEVEL} ${'⭐'.repeat(tower.level)}</div>
      </div>
    </div>
    <div class="tm-desc">${type.desc}</div>
    ${stat('⚔️ ดาเมจ','dmg',v=>v.toFixed(0))}
    ${stat('🎯 ระยะ','range',v=>v.toFixed(0))}
    ${stat('⏱️ อัตรายิง','rate',v=>(v/1000).toFixed(2)+'s')}
    <div class="btn-row">
      <button id="btn-upgrade" ${maxed||state.gold<cost?'disabled':''}>${maxed?'⭐ สูงสุด':'⬆️ อัพเกรด 🪙'+cost}</button>
      <button class="danger" id="btn-sell">💰 ขาย 🪙${refund}</button>
    </div>
  `;
  renderWarriorIcon(upgradePanelEl.querySelector('canvas'), tower.type);
  document.getElementById('tm-close').addEventListener('click', closeTowerModal);
  document.getElementById('btn-upgrade').addEventListener('click', ()=>{ upgradeTower(tower); renderTowerModal(); });
  document.getElementById('btn-sell').addEventListener('click', ()=>{ sellTower(tower); renderTowerModal(); });
}

towerModalEl.addEventListener('click', (evt)=>{ if(evt.target===towerModalEl) closeTowerModal(); });
document.addEventListener('keydown', (evt)=>{ if(evt.key==='Escape' && state.selectedTower) closeTowerModal(); });

/* ============================================================
   HUD
============================================================ */
const hudGold = document.getElementById('hud-gold');
const hudLives = document.getElementById('hud-lives');
const hudWave = document.getElementById('hud-wave');
const hudLevel = document.getElementById('hud-level');
const waveTextEl = document.getElementById('wave-text');
const btnNextWave = document.getElementById('btn-next-wave');

function updateHUD(){
  hudGold.textContent = '🪙 ' + state.gold;
  hudLives.textContent = '❤️ ' + state.lives;
  hudLevel.textContent = `ด่าน ${state.level} · ${state.theme.emoji} ${state.theme.name}`;
  const waveNum = Math.min(state.waveIndex+1, state.cfg.waves.length);
  hudWave.textContent = `🌊 คลื่น ${Math.max(waveNum,0)}/${state.cfg.waves.length}`;
  if(state.waveActive){
    waveTextEl.textContent = `⚔️ กำลังต่อสู้... (เหลือ ${state.enemies.filter(e=>e.alive).length + state.waveQueue.length})`;
    btnNextWave.disabled = true;
  } else if(state.waveIndex >= state.cfg.waves.length-1 && !state.levelWon){
    waveTextEl.textContent = `🏁 คลื่นสุดท้ายกำลังจะมา...`;
    btnNextWave.disabled = false;
  } else {
    waveTextEl.textContent = `⏳ คลื่นถัดไปใน ${Math.ceil(state.betweenWaveTimer/1000)} วิ`;
    btnNextWave.disabled = false;
  }
  refreshTowerButtons();
}

/* ============================================================
   MODAL / OVERLAY
============================================================ */
const overlayEl = document.getElementById('overlay');
const modalEl = document.getElementById('modal-content');
function showModal({title, emoji, body, stars, buttons}){
  let starsHtml = '';
  if(stars!==undefined){
    starsHtml = `<div class="stars-big">${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)}</div>`;
  }
  modalEl.innerHTML = `
    <div style="font-size:50px;">${emoji||''}</div>
    <h2>${title}</h2>
    <p>${body||''}</p>
    ${starsHtml}
    <div class="modal-btns">${buttons.map((b,i)=>`<button data-i="${i}">${b.label}</button>`).join('')}</div>
  `;
  [...modalEl.querySelectorAll('button[data-i]')].forEach((btn,i)=>{
    btn.addEventListener('click', buttons[i].action);
  });
  overlayEl.classList.remove('hidden');
}
function hideModal(){ overlayEl.classList.add('hidden'); }

/* ============================================================
   SCREEN MANAGEMENT
============================================================ */
const screenMenu = document.getElementById('screen-menu');
const screenLevels = document.getElementById('screen-levels');
const screenGame = document.getElementById('screen-game');
function showScreen(el){
  [screenMenu, screenLevels, screenGame].forEach(s=>s.classList.add('hidden'));
  el.classList.remove('hidden');
}
function applyPageTheme(th){
  document.body.style.background = th ? th.bodyBg : '';
  document.body.classList.toggle('dark', !!(th && th.dark));
}
function showMenu(){ applyPageTheme(null); showScreen(screenMenu); }
function showLevels(){ applyPageTheme(null); buildLevelGrid(); showScreen(screenLevels); }

const lvlGrid = document.getElementById('lvl-grid');
function buildLevelGrid(){
  lvlGrid.innerHTML = '';
  for(let i=1;i<=TOTAL_LEVELS;i++){
    const locked = i>progress.unlocked;
    const stars = progress.stars[i]||0;
    const th = THEMES[i-1];
    const btn = document.createElement('button');
    btn.className = 'lvl-btn' + (locked?' locked':'');
    btn.disabled = locked;
    btn.innerHTML = `<div class="num">${locked?'🔒':i}</div><div class="stars">${locked?'':('⭐'.repeat(stars)+'☆'.repeat(3-stars))}</div><div class="tname">${th.emoji} ${th.name}</div>`;
    if(!locked) btn.addEventListener('click', ()=> openLevel(i));
    lvlGrid.appendChild(btn);
  }
}

function openLevel(level){
  resetStateForLevel(level);
  buildDecor(level);
  buildTowerButtons();
  closeTowerModal();
  applyPageTheme(state.theme);
  showScreen(screenGame);
  updateHUD();
}

/* ============================================================
   TOP-LEVEL BUTTONS
============================================================ */
document.getElementById('btn-play').addEventListener('click', showLevels);
document.getElementById('btn-back-menu').addEventListener('click', showMenu);
document.getElementById('btn-quit').addEventListener('click', ()=>{ showLevels(); });
document.getElementById('btn-howto').addEventListener('click', ()=>{
  showModal({
    title:'วิธีเล่น', emoji:'📖',
    body:`สร้างหอคอยธาตุ 🔥💧🪨🌪️⚡ ริมเส้นทาง เพื่อสกัดศัตรูไม่ให้ถึงปราสาท 🏰<br><br>
          • เลือกหอคอยจากแถบด้านข้าง แล้วคลิกบนพื้นที่ว่างเพื่อสร้าง<br>
          • คลิกหอคอยที่สร้างแล้วเพื่ออัพเกรดหรือขาย<br>
          • ผ่าน 10 ด่าน เพื่อปลดล็อกทั้งหมด!`,
    buttons:[{label:'เข้าใจแล้ว!', action:hideModal}]
  });
});
document.getElementById('btn-reset').addEventListener('click', ()=>{
  showModal({
    title:'ล้างความคืบหน้า?', emoji:'⚠️', body:'การกระทำนี้ไม่สามารถย้อนกลับได้',
    buttons:[
      {label:'ยืนยัน', action:()=>{ progress={unlocked:1,stars:{}}; saveProgress(progress); hideModal(); }},
      {label:'ยกเลิก', action:hideModal},
    ]
  });
});
document.getElementById('btn-pause').addEventListener('click', (e)=>{
  state.paused = !state.paused;
  e.target.textContent = state.paused? '▶️' : '⏸️';
});
document.getElementById('btn-speed').addEventListener('click', (e)=>{
  state.speedMult = state.speedMult===1 ? 2 : 1;
  e.target.textContent = '⏩ x'+state.speedMult;
});
document.getElementById('btn-sound').addEventListener('click', (e)=>{
  state.soundOn = !state.soundOn;
  e.target.textContent = state.soundOn? '🔊' : '🔇';
});
btnNextWave.addEventListener('click', ()=>{
  if(!state.waveActive && !state.gameOver && !state.levelWon) startNextWave();
});

/* ============================================================
   AUDIO (synthesized, no external files)
============================================================ */
let audioCtx = null;
function getAudioCtx(){
  if(!audioCtx){
    try{ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ audioCtx=null; }
  }
  return audioCtx;
}
function playSfx(kind, vol=0.35){
  if(!state.soundOn) return;
  const ac = getAudioCtx();
  if(!ac) return;
  const t0 = ac.currentTime;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  let freq=440, type='sine', dur=0.12;
  if(kind==='shoot'){ freq=680; type='triangle'; dur=0.06; }
  else if(kind==='kill'){ freq=880; type='square'; dur=0.08; }
  else if(kind==='hurt'){ freq=160; type='sawtooth'; dur=0.18; }
  else if(kind==='place'){ freq=520; type='sine'; dur=0.1; }
  else if(kind==='wave'){ freq=300; type='triangle'; dur=0.3; }
  else if(kind==='win'){ freq=660; type='sine'; dur=0.5; }
  else if(kind==='lose'){ freq=120; type='sawtooth'; dur=0.6; }
  o.type=type; o.frequency.setValueAtTime(freq,t0);
  if(kind==='win'){ o.frequency.exponentialRampToValueAtTime(freq*2,t0+dur); }
  if(kind==='lose'){ o.frequency.exponentialRampToValueAtTime(freq*0.5,t0+dur); }
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0+dur);
  o.start(t0); o.stop(t0+dur+0.02);
}

/* ============================================================
   MAIN LOOP
============================================================ */
function loop(ts){
  if(!state.lastTime) state.lastTime = ts;
  let dt = ts - state.lastTime;
  state.lastTime = ts;
  dt = Math.min(dt, 80); // avoid huge jumps on tab switch
  if(!screenGame.classList.contains('hidden')){
    updateGame(dt*state.speedMult);
    render(ts);
    updateHUD();
  }
  requestAnimationFrame(loop);
}

/* ============================================================
   INIT
============================================================ */
showMenu();
requestAnimationFrame(loop);
