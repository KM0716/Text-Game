// ============================================================
//  audio.js - 音效系统 / BGM 系统 / Toast 队列 / 通用对话框工具
//  暴露全局: ensureAudio / playTone / playSfx / playToneSfx / SE_FILES
//           bgm* / BGM / toggleSfx / launchTutorial
//           tst / sketchConfirm / sketchPrompt / scb / esc / escAttr
//           $ (getElementById 别名)
// ============================================================
(function() {

// ---------- 基础工具 ----------
window.$ = window.$ || function(id) { return document.getElementById(id); };
const $ = window.$;

function scb() { const ca = $('chatArea'); if (ca) ca.scrollTop = ca.scrollHeight; }
function esc(s) { const d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
function escAttr(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// ---------- Sound System (Web Audio + WAV SE) ----------
window.audioCtx = window.audioCtx || null;
let sfxEnabled = localStorage.getItem('vn_sfx') !== '0';
let sfxVolume = parseFloat(localStorage.getItem('vn_sfx_vol') || '0.5');

function ensureAudio() {
    if (!window.audioCtx) {
        try { window.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch(e) { window.audioCtx = null; }
    }
    if (window.audioCtx && window.audioCtx.state === 'suspended') window.audioCtx.resume();
    return window.audioCtx;
}

function playTone(freq, dur, type, vol) {
    let enabled = localStorage.getItem('vn_sfx');
    if (enabled === null) enabled = '1';
    if (enabled === '0') return;
    const ctx = ensureAudio(); if (!ctx) return;
    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime((vol || sfxVolume) * 0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + dur);
    } catch(e) {}
}

const SE_FILES = {
    'drop': 'SE/丢弃.wav', 'clue-write': 'SE/写线索.wav', 'clue-add': 'SE/写线索.wav',
    'drink': 'SE/喝水.wav', 'use-water': 'SE/喝水.wav', 'death': 'SE/突发事件.wav',
    'open-profile': 'SE/打开个人.wav', 'char-open': 'SE/打开个人.wav',
    'open-clue': 'SE/打开线索.wav', 'clue-open': 'SE/打开线索.wav',
    'open-equip': 'SE/打开装备.wav', 'equip-open': 'SE/打开装备.wav',
    'search': 'SE/搜索物资.wav', 'loot': 'SE/搜索物资.wav',
    'random-event': 'SE/突发事件.wav', 'event': 'SE/突发事件.wav',
    'equip-weapon': 'SE/装备武器.wav', 'equip': 'SE/装备武器.wav',
    'pickup': 'SE/捡起/捡起小东西－xh20070419.wav',
    'pickup-small': 'SE/捡起/捡起小东西－xh20070419.wav',
    'pickup-big': 'SE/捡起/捡起大东西－xh20070419.wav',
    'pickup-book': 'SE/捡起/捡起书－xh20070419.wav',
    'pickup-bag': 'SE/捡起/捡起包－xh20070419.wav',
    'pickup-food': 'SE/捡起/捡起吃的－xh20070419.wav',
    'pickup-eat': 'SE/捡起/捡起吃的－xh20070419.wav',
    'pickup-wood-big': 'SE/捡起/捡起大木头－xh20070419.wav',
    'pickup-metal-big': 'SE/捡起/捡起大的金属－xh20070419.wav',
    'pickup-gem': 'SE/捡起/捡起宝石－xh20070419.wav',
    'pickup-wood-small': 'SE/捡起/捡起小木头－xh20070419.wav',
    'pickup-metal-small': 'SE/捡起/捡起小的金属－xh20070419.wav',
    'pickup-stick': 'SE/捡起/捡起棒－xh20070419.wav',
    'pickup-water': 'SE/捡起/捡起水－xh20070419.wav',
    'pickup-ore': 'SE/捡起/捡起矿石－xh20070419.wav',
    'pickup-paper': 'SE/捡起/捡起羊皮纸－xh20070419.wav',
    'pickup-meat': 'SE/捡起/捡起肉－xh20070419.wav',
    'pickup-herb': 'SE/捡起/捡起药草－xh20070419.wav',
    'pickup-clothes': 'SE/捡起/捡起衣服－xh20070419.wav',
    'pickup-bell': 'SE/捡起/捡起铃铛－xh20070419.wav',
    'store': 'SE/放好/把小的东西放在背包里－xh20070419.wav',
    'store-small': 'SE/放好/把小的东西放在背包里－xh20070419.wav',
    'store-big': 'SE/放好/把大的东西放在背包里－xh20070419.wav',
    'store-book': 'SE/放好/把书放在背包里－xh20070419.wav',
    'store-bag': 'SE/放好/把包放在背包里－xh20070419.wav',
    'store-wood-big': 'SE/放好/把大木头放在背包里－xh20070419.wav',
    'store-metal-big': 'SE/放好/把大金属放在背包里－xh20070419.wav',
    'store-gem': 'SE/放好/把宝石放在背包里－xh20070419.wav',
    'store-wood-small': 'SE/放好/把小木头放在背包里－xh20070419.wav',
    'store-meat-small': 'SE/放好/把小肉放在背包里－xh20070419.wav',
    'store-stick': 'SE/放好/把棒放在背包里－xh20070419.wav',
    'store-water': 'SE/放好/把水背包里－xh20070419.wav',
    'store-ore': 'SE/放好/把矿石放在背包里－xh20070419.wav',
    'store-paper': 'SE/放好/把羊皮纸放在背包里－xh20070419.wav',
    'store-meat': 'SE/放好/把肉放在背包里－xh20070419.wav',
    'store-herb': 'SE/放好/把草药放在背包里－xh20070419.wav',
    'store-clothes': 'SE/放好/把衣服放在背包里－xh20070419.wav',
    'store-bell': 'SE/放好/把铃铛放在背包里－xh20070419.wav'
};

function playSfx(type) {
    let enabled = localStorage.getItem('vn_sfx');
    if (enabled === null) enabled = '1';
    if (enabled === '0') return;
    const sePath = SE_FILES[type];
    if (sePath) {
        try {
            const audio = new Audio(sePath);
            audio.preload = 'auto';
            audio.volume = parseFloat(localStorage.getItem('vn_sfx_vol') || '0.6');
            audio.playbackRate = 1;
            const p = audio.play();
            if (p && p.catch) p.catch(() => { playToneSfx(type); });
            setTimeout(() => { try { audio.pause(); audio.src = ''; } catch(e) {} }, 3000);
            return;
        } catch(e) {}
    }
    playToneSfx(type);
}

function playToneSfx(type) {
    let enabled = localStorage.getItem('vn_sfx');
    if (enabled === null) enabled = '1';
    if (enabled === '0') return;
    switch(type) {
        case 'click': playTone(800, 0.05, 'sine', 0.4); break;
        case 'send': playTone(600, 0.08, 'triangle', 0.4); setTimeout(() => playTone(800, 0.06, 'triangle', 0.3), 40); break;
        case 'notify': playTone(1200, 0.1, 'sine', 0.35); break;
        case 'warn': playTone(300, 0.15, 'sawtooth', 0.4); break;
        case 'danger': playTone(200, 0.25, 'sawtooth', 0.5); setTimeout(() => playTone(150, 0.2, 'sawtooth', 0.4), 100); break;
        case 'victory': playTone(523, 0.12, 'sine', 0.4); setTimeout(() => playTone(659, 0.12, 'sine', 0.4), 100); setTimeout(() => playTone(784, 0.2, 'sine', 0.4), 200); break;
        case 'levelup': playTone(440, 0.1, 'sine', 0.4); setTimeout(() => playTone(554, 0.1, 'sine', 0.4), 80); setTimeout(() => playTone(659, 0.15, 'sine', 0.4), 160); setTimeout(() => playTone(880, 0.25, 'sine', 0.4), 240); break;
        case 'pickup': playTone(1000, 0.06, 'sine', 0.35); setTimeout(() => playTone(1300, 0.08, 'sine', 0.3), 50); break;
        case 'drop': playTone(300, 0.15, 'triangle', 0.35); break;
        case 'heal': playTone(500, 0.2, 'sine', 0.3); setTimeout(() => playTone(700, 0.25, 'sine', 0.3), 100); break;
        case 'equip': playTone(700, 0.08, 'square', 0.25); setTimeout(() => playTone(500, 0.12, 'square', 0.2), 60); break;
        case 'fail': playTone(300, 0.15, 'sawtooth', 0.35); setTimeout(() => playTone(200, 0.25, 'sawtooth', 0.3), 100); break;
        case 'tab': playTone(1000, 0.03, 'sine', 0.2); break;
        case 'open': playTone(400, 0.06, 'sine', 0.3); break;
        case 'close': playTone(300, 0.05, 'sine', 0.25); break;
        case 'craft': playTone(600, 0.08, 'triangle', 0.3); setTimeout(() => playTone(800, 0.1, 'triangle', 0.3), 60); setTimeout(() => playTone(1000, 0.12, 'sine', 0.25), 120); break;
        case 'success': playTone(523, 0.1, 'sine', 0.35); setTimeout(() => playTone(659, 0.1, 'sine', 0.35), 80); setTimeout(() => playTone(784, 0.15, 'sine', 0.35), 160); break;
        case 'hurt': playTone(250, 0.15, 'sawtooth', 0.4); setTimeout(() => playTone(180, 0.1, 'sawtooth', 0.3), 80); break;
        case 'counter': playTone(900, 0.06, 'square', 0.3); setTimeout(() => playTone(1200, 0.08, 'square', 0.25), 50); break;
        case 'status': playTone(700, 0.08, 'sine', 0.25); break;
        case 'danger_alarm': playTone(180, 0.3, 'sawtooth', 0.5); setTimeout(() => playTone(220, 0.2, 'sawtooth', 0.4), 150); setTimeout(() => playTone(180, 0.3, 'sawtooth', 0.5), 350); break;
        case 'ending': playTone(400, 0.3, 'sine', 0.4); setTimeout(() => playTone(300, 0.4, 'sine', 0.35), 200); setTimeout(() => playTone(200, 0.6, 'sine', 0.3), 500); break;
        case 'death': playTone(220, 0.4, 'sawtooth', 0.5); setTimeout(() => playTone(160, 0.5, 'sawtooth', 0.4), 200); setTimeout(() => playTone(110, 0.8, 'sawtooth', 0.45), 500); break;
    }
}

// ---------- BGM System ----------
const BGM = {
    enabled: localStorage.getItem('vn_bgm') !== '0',
    volume: parseFloat(localStorage.getItem('vn_bgm_vol') || '0.45'),
    current: null,
    audio: null,
    tracks: {
        title:   ['bgm_title1.mp3', 'bgm_intro1.mp3'],
        explore: ['bgm_explore1.mp3', 'bgm_journey1.mp3', 'bgm_mystery1.mp3'],
        camp:    ['bgm_camp1.mp3', 'bgm_healing1.mp3', 'bgm_calm1.mp3'],
        combat:  ['bgm_combat1.mp3', 'bgm_combat2.mp3', 'bgm_action1.mp3', 'bgm_action2.mp3', 'bgm_action3.mp3'],
        boss:    ['bgm_boss1.mp3', 'bgm_boss2.mp3', 'bgm_boss3.mp3'],
        danger:  ['bgm_danger1.mp3', 'bgm_danger2.mp3', 'bgm_ambush1.mp3', 'bgm_tense1.mp3', 'bgm_tense2.mp3', 'bgm_tense3.mp3'],
        sad:     ['bgm_sad1.mp3', 'bgm_sad2.mp3', 'bgm_memorial1.mp3', 'bgm_memory1.mp3'],
        hope:    ['bgm_hope1.mp3', 'bgm_camp1.mp3'],
        horror:  ['bgm_horror1.mp3', 'bgm_chaos1.mp3', 'bgm_despair1.mp3'],
        story:   ['bgm_story1.mp3', 'bgm_negotiate1.mp3', 'bgm_cultural1.mp3', 'bgm_guard1.mp3'],
        rain:    ['bgm_rain1.mp3'],
        survival:['bgm_survival1.mp3']
    },
    _currentCategory: 'title',
    _lastLocation: '',
    _preloadCache: {},   // 预加载缓存: {filename: Audio element}
    _preloadLimit: 12    // 预加载缓存上限
};

// 预加载指定曲目（非阻塞，后台静默加载）
function _bgmPreload(file) {
    if (!file || BGM._preloadCache[file]) return;
    try {
        const keys = Object.keys(BGM._preloadCache);
        if (keys.length >= BGM._preloadLimit) {
            const oldest = keys[0];
            try { if (BGM._preloadCache[oldest]) { BGM._preloadCache[oldest].pause(); BGM._preloadCache[oldest].src = ''; } } catch {}
            delete BGM._preloadCache[oldest];
        }
        const a = new Audio();
        a.preload = 'auto';
        a.src = 'BGM/' + encodeURIComponent(file);
        a.volume = 0;
        try { a.load(); } catch(e) {}
        BGM._preloadCache[file] = a;
    } catch(e) {}
}

function bgmInit() {
    if (BGM.audio) return;
    BGM.audio = new Audio();
    BGM.audio.preload = 'auto';
    BGM.audio.loop = false;
    BGM.audio.volume = BGM.volume;
    BGM.audio.crossOrigin = 'anonymous';
    BGM.audio.addEventListener('ended', () => {
        if (BGM.enabled) bgmPlayCategory(BGM._currentCategory, true);
    });
    BGM.audio.addEventListener('error', () => {
        console.warn('[BGM] 音频加载失败:', BGM.audio && BGM.audio.src);
        if (BGM.enabled) {
            const list = BGM.tracks[BGM._currentCategory] || [];
            if (list.length > 1) {
                const idx = list.indexOf(BGM.current);
                const next = list[(idx + 1) % list.length];
                BGM.current = next;
                _bgmPreload(next);
                BGM.audio.src = 'BGM/' + encodeURIComponent(next);
            }
        }
    });
    BGM.audio.addEventListener('canplaythrough', () => {
        if (BGM.audio) BGM.audio.volume = BGM.volume;
    });
    // 启动时预加载所有分类的第一首（非阻塞，后台进行）
    setTimeout(() => {
        Object.values(BGM.tracks).forEach(list => {
            if (list && list[0]) _bgmPreload(list[0]);
        });
    }, 800);
}

function bgmPlay(file) {
    if (!BGM.enabled || !file) return;
    bgmInit();
    if (BGM.current === file && BGM.audio && !BGM.audio.paused) return;
    BGM.current = file;
    const cached = BGM._preloadCache[file];
    if (cached) {
        try { BGM.audio.srcObject = null; } catch {}
        BGM.audio.src = cached.src;
    } else {
        BGM.audio.src = 'BGM/' + encodeURIComponent(file);
    }
    // 启动前先将音量设为 0，再平滑淡入（防止爆音/突兀）
    BGM.audio.volume = 0;
    try {
        const p = BGM.audio.play();
        if (p && typeof p.catch === 'function') {
            p.then(() => {
                const fadeStart = Date.now();
                const fadeDur = 260;
                const fadeTimer = setInterval(() => {
                    const t = Math.min(1, (Date.now() - fadeStart) / fadeDur);
                    if (BGM.audio) {
                        BGM.audio.volume = Math.max(0, Math.min(BGM.volume, t * BGM.volume));
                    }
                    if (t >= 1 || !BGM.audio) clearInterval(fadeTimer);
                }, 28);
            }).catch(() => {
                if (BGM.audio) BGM.audio.volume = BGM.volume;
                _bgmPreload(file);
            });
        } else {
            setTimeout(() => { if (BGM.audio) BGM.audio.volume = BGM.volume; }, 120);
        }
    } catch(e) {
        try { if (BGM.audio) BGM.audio.volume = BGM.volume; } catch {}
    }
}

function bgmPlayCategory(cat, random) {
    if (!BGM.enabled) return;
    bgmInit();
    const list = BGM.tracks[cat] || BGM.tracks.title;
    if (!list.length) return;
    BGM._currentCategory = cat;
    let file;
    if (random && list.length > 1) {
        file = list[Math.floor(Math.random() * list.length)];
    } else {
        file = BGM._currentFile && list.includes(BGM._currentFile)
            ? BGM._currentFile
            : list[0];
    }
    BGM._currentFile = file;
    // 预加载该分类下其他曲目（后台进行，不阻塞当前播放）
    setTimeout(() => {
        list.forEach(f => { if (f !== file) _bgmPreload(f); });
    }, 400);
    bgmPlay(file);
}

function bgmStop() {
    if (!BGM.audio) return;
    try {
        const startVol = BGM.audio.volume || 0;
        const fadeStart = Date.now();
        const fadeDur = 220;
        const fadeTimer = setInterval(() => {
            const t = Math.min(1, (Date.now() - fadeStart) / fadeDur);
            if (BGM.audio) {
                BGM.audio.volume = Math.max(0, startVol * (1 - t));
            } else {
                clearInterval(fadeTimer);
                return;
            }
            if (t >= 1) {
                clearInterval(fadeTimer);
                try { BGM.audio.pause(); BGM.audio.currentTime = 0; } catch(e) {}
                if (BGM.audio) BGM.audio.volume = BGM.volume;
            }
        }, 26);
    } catch(e) {
        try { BGM.audio.pause(); BGM.audio.currentTime = 0; } catch(e2) {}
    }
}

function _safeSnotify(level, tag, msg) {
    if (typeof window.snotify === 'function') { try { window.snotify(level, tag, msg); } catch(e){} }
    else if (typeof window.tst === 'function') { try { window.tst(tag + '：' + msg); } catch(e){} }
}

function bgmToggle() {
    BGM.enabled = !BGM.enabled;
    localStorage.setItem('vn_bgm', BGM.enabled ? '1' : '0');
    if (!BGM.enabled) {
        bgmStop();
        const btn = $('btnBgm');
        if (btn) { btn.textContent = '🔇 音乐'; btn.title = '背景音乐（已关闭）'; }
    } else {
        const btn = $('btnBgm');
        if (btn) { btn.textContent = '🎵 音乐'; btn.title = '背景音乐（开启）'; }
        bgmPlayCategory(BGM._currentCategory || 'title');
    }
    _safeSnotify('info', 'BGM', BGM.enabled ? '背景音乐已开启' : '背景音乐已关闭');
}

function bgmSetVol(v) {
    BGM.volume = Math.max(0, Math.min(1, v));
    localStorage.setItem('vn_bgm_vol', BGM.volume);
    if (BGM.audio) {
        const start = BGM.audio.volume;
        const end = BGM.volume;
        const fadeStart = Date.now();
        const fadeDur = 150;
        const ft = setInterval(() => {
            const t = Math.min(1, (Date.now() - fadeStart) / fadeDur);
            if (BGM.audio) BGM.audio.volume = start + (end - start) * t;
            else clearInterval(ft);
            if (t >= 1) clearInterval(ft);
        }, 20);
    }
}

function initAutoBGM() {
    if (!BGM.enabled) return;
    const unlockAudio = () => {
        if (window.audioCtx && window.audioCtx.state === 'suspended') window.audioCtx.resume();
        bgmPlayCategory('title', true);
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
}

function bgmAutoSwitch(context) {
    if (!BGM.enabled) return;
    const loc = (context && context.location) || '';
    const season = (context && context.season) || '';
    const weather = (context && context.weather) || '';
    const _s = (typeof window.gst === 'function') ? window.gst() : { hp: 100, fatigue: 0 };
    const _c = (typeof window.gch === 'function') ? window.gch() : { mental: '稳定' };
    const mentality = _c.mental || '';
    const hp = (_s && _s.hp != null) ? _s.hp : 100;
    const fatigue = (_s && _s.fatigue != null) ? _s.fatigue : 0;

    if (/公寓|营地|小屋|避难所|地下室|仓库|据点|屋|室|居|家|卧室/.test(loc)) {
        if (fatigue > 60 || mentality === '焦虑' || mentality === '悲痛') bgmPlayCategory('sad');
        else bgmPlayCategory('camp');
        return;
    }
    if (hp < 50) { bgmPlayCategory('danger'); return; }
    if (mentality === '创伤' || mentality === '焦虑') { bgmPlayCategory('horror'); return; }
    if (/雨/.test(weather)) { bgmPlayCategory('rain'); return; }
    if (/雪/.test(weather)) { bgmPlayCategory('survival'); return; }
    if (/医院|警局|学校|商场|超市|工厂|车站|地铁|隧道|下水道/.test(loc)) { bgmPlayCategory('explore'); return; }
    if (/森林|树林|山|野外|公路|桥|街区|废墟|城市|街道|商业区/.test(loc)) { bgmPlayCategory('survival'); return; }
    if (season === '春' || season === '夏') { bgmPlayCategory('hope'); return; }
    if (season === '秋') { bgmPlayCategory('explore'); return; }
    if (season === '冬') { bgmPlayCategory('horror'); return; }
    bgmPlayCategory('explore');
}

function bgmQuickPick(cat) {
    if (!BGM.enabled) { _safeSnotify('warn', 'BGM', '请先开启背景音乐'); return; }
    bgmPlayCategory(cat);
    const label = { title: '主菜单', explore: '探索', camp: '营地', combat: '战斗', boss: 'Boss', danger: '危机', sad: '悲伤', hope: '希望', horror: '恐怖', story: '剧情', rain: '雨声', survival: '生存' }[cat] || cat;
    _safeSnotify('info', 'BGM', '播放：' + label);
}

function bgmOpenPicker() {
    if ($('bgmPicker')) { $('bgmPicker').remove(); return; }
    const cats = [
        { key: 'title',    name: '主菜单', icon: '🎬' },
        { key: 'explore',  name: '探索',   icon: '🧭' },
        { key: 'camp',     name: '营地',   icon: '🏕' },
        { key: 'combat',   name: '战斗',   icon: '⚔' },
        { key: 'boss',     name: 'Boss',   icon: '☠' },
        { key: 'danger',   name: '危机',   icon: '⚠' },
        { key: 'sad',      name: '悲伤',   icon: '😢' },
        { key: 'hope',     name: '希望',   icon: '🌤' },
        { key: 'horror',   name: '恐怖',   icon: '👁' },
        { key: 'story',    name: '剧情',   icon: '📖' },
        { key: 'rain',     name: '雨声',   icon: '🌧' },
        { key: 'survival', name: '生存',   icon: '🩹' }
    ];
    const style = document.createElement('style');
    style.textContent = '#bgmPicker{position:fixed;z-index:10001;top:54px;right:12px;background:var(--modal-bg);border:1.5px solid var(--ink);border-radius:10px;padding:10px 12px;min-width:220px;max-width:260px;box-shadow:4px 6px 0 rgba(30,25,18,.18);font-size:.78rem;}#bgmPicker h5{margin:0 0 6px;font-size:.8rem;color:var(--accent);display:flex;align-items:center;justify-content:space-between;}#bgmPicker .bgm-row{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;}#bgmPicker .bgm-cat{flex:1;min-width:90px;border:1px solid var(--border-light);border-radius:6px;padding:4px 6px;background:var(--button-bg);cursor:pointer;font-size:.7rem;color:var(--ink);transition:all .15s;}#bgmPicker .bgm-cat:hover{background:var(--button-hover);transform:translateY(-1px);}#bgmPicker .bgm-cat.active{background:var(--accent);color:#fff;border-color:var(--accent);}#bgmPicker .bgm-vol{display:flex;align-items:center;gap:6px;margin-top:4px;font-size:.7rem;color:var(--text-muted);}#bgmPicker input[type=range]{flex:1;accent-color:var(--accent);}';
    document.head.appendChild(style);
    const el = document.createElement('div');
    el.id = 'bgmPicker';
    const catsHtml = cats.map(c => '<div class="bgm-cat' + (BGM._currentCategory === c.key ? ' active' : '') + '" data-cat="' + c.key + '">' + c.icon + ' ' + c.name + '</div>').join('');
    el.innerHTML = '<h5>🎵 背景音乐 <span id="bgmPickerClose" style="cursor:pointer;color:var(--text-muted);">×</span></h5>' +
        '<div class="bgm-row">' + catsHtml + '</div>' +
        '<div class="bgm-vol"><span>音量</span><input type="range" id="bgmVolRange" min="0" max="1" step="0.05" value="' + BGM.volume + '"><span id="bgmVolLabel">' + Math.round(BGM.volume * 100) + '%</span></div>';
    document.body.appendChild(el);
    el.querySelectorAll('.bgm-cat').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.dataset.cat;
            if (!BGM.enabled) bgmToggle();
            bgmPlayCategory(cat);
            el.querySelectorAll('.bgm-cat').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
        });
    });
    const closeBtn = $('bgmPickerClose');
    if (closeBtn) closeBtn.addEventListener('click', () => el.remove());
    const vr = $('bgmVolRange');
    if (vr) {
        vr.addEventListener('input', e => { bgmSetVol(parseFloat(e.target.value)); const l = $('bgmVolLabel'); if (l) l.textContent = Math.round(BGM.volume * 100) + '%'; });
    }
    setTimeout(() => {
        document.addEventListener('click', function closePicker(ev) {
            if (!el.contains(ev.target)) { el.remove(); document.removeEventListener('click', closePicker); }
        });
    }, 10);
}

// ---------- 新手教程 ----------
function showTutorialStep(steps, idx, onComplete) {
    if (idx >= steps.length) { onComplete && onComplete(); return; }
    const step = steps[idx];
    const d = document.createElement('div');
    d.className = 'modal-overlay';
    d.style.zIndex = '10000';
    d.innerHTML = '<div class="modal-panel" style="max-width:320px;text-align:center;">' +
        '<div style="font-size:2rem;margin-bottom:8px;">' + step.icon + '</div>' +
        '<h3 style="color:var(--accent);margin-bottom:8px;">' + esc(step.title) + '</h3>' +
        '<p style="font-size:0.8rem;color:var(--ink-soft);line-height:1.6;margin-bottom:12px;">' + esc(step.content) + '</p>' +
        '<div style="font-size:0.7rem;color:var(--text-muted);margin-bottom:8px;">第 ' + (idx + 1) + ' / ' + steps.length + ' 步</div>' +
        '<div style="display:flex;gap:8px;justify-content:center;">' +
        (idx > 0 ? '<button class="btn-header" id="tutPrev">上一步</button>' : '') +
        '<button class="btn-header" id="tutNext">' + (idx === steps.length - 1 ? '开始游戏' : '下一步') + '</button>' +
        '<button class="btn-header" id="tutSkip">跳过</button>' +
        '</div></div>';
    document.body.appendChild(d);
    const next = d.querySelector('#tutNext'), skip = d.querySelector('#tutSkip'), prev = d.querySelector('#tutPrev');
    if (next) next.onclick = () => { d.remove(); showTutorialStep(steps, idx + 1, onComplete); };
    if (skip) skip.onclick = () => { d.remove(); onComplete && onComplete(); };
    if (prev) prev.onclick = () => { d.remove(); showTutorialStep(steps, idx - 1, onComplete); };
}

function launchTutorial(onComplete) {
    const steps = [
        { icon: '🎮', title: '欢迎来到末日世界', content: '这是一个文字模拟生存游戏。你将扮演幸存者，在末日废墟中求生、探索、战斗。' },
        { icon: '🔑', title: '配置 AI 服务', content: '接下来你需要配置一个 AI 服务商（OpenAI / DeepSeek / Ollama 等）。填入 API 密钥后，所有叙事将由 AI 实时驱动。密钥仅保存在你的浏览器本地，不会上传。' },
        { icon: '👤', title: '创建角色', content: '配置完成后，请填写角色与世界设定：姓名、职业、特质、背景故事、出生地点等。特质分正面和负面，会直接影响你的生存能力与剧情走向。' },
        { icon: '⌨️', title: '基本操作', content: '在底部输入框输入行动，如「前往医院搜索药品」「与幸存者交谈」「使用绷带包扎伤口」等。' },
        { icon: '🎒', title: '背包与物品', content: '点击顶部「背包」查看物品。点击物品可以使用、丢弃、装备或加入收藏。物品会根据AI叙事自动增减。' },
        { icon: '⚔️', title: '战斗与状态', content: '战斗中血量会同步显示。武器会损耗耐久，消耗弹药。注意伤势和精神状态，过低时会影响行动。' },
        { icon: '🗺️', title: '探索与地图', content: '随着探索，新地点会在地图上解锁。面板视图可以看到小地图和已发现的区域。' },
        { icon: '💾', title: '存档与设置', content: '随时可以存档（最多10个槽位）。设置中可调整沙盒参数、字体大小等。API 配置会自动保存到本地，刷新不丢失。' },
        { icon: '🤖', title: '开始你的旅程', content: '所有叙事由 AI 驱动，你的选择影响故事走向。尽量描述具体行动，获得更真实的体验。祝好运，幸存者！' }
    ];
    showTutorialStep(steps, 0, () => {
        localStorage.setItem('vn_tutorial', 'done');
        if (typeof onComplete === 'function') try { onComplete(); } catch {}
    });
}

function toggleSfx() {
    sfxEnabled = !sfxEnabled;
    localStorage.setItem('vn_sfx', sfxEnabled ? '1' : '0');
    tst(sfxEnabled ? '音效已开启' : '音效已关闭');
    if (sfxEnabled) playSfx('click');
}

// ---------- Toast Queue ----------
const _toastQueue = [];
let _toastShowing = false;
let _lastToastMsg = '';
let _lastToastTime = 0;

function tst(m) {
    const now = Date.now();
    if (m === _lastToastMsg && now - _lastToastTime < 1500) return;
    _lastToastMsg = m;
    _lastToastTime = now;
    _toastQueue.push(m);
    _tryShowToast();
}
function _tryShowToast() {
    if (_toastShowing || _toastQueue.length === 0) return;
    _toastShowing = true;
    const m = _toastQueue.shift();
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = m;
    document.body.appendChild(t);
    setTimeout(() => {
        t.remove();
        _toastShowing = false;
        if (_toastQueue.length > 0) _tryShowToast();
    }, 2200);
}

// ---------- 通用对话框 ----------
function sketchConfirm(msg, title) {
    return new Promise((resolve) => {
        const d = $('customConfirm'); if (!d) { resolve(false); return; }
        $('confirmMsg').textContent = msg;
        $('confirmTitle').textContent = title || '确认';
        d.style.display = 'flex';
        const ok = $('confirmOk'), cancel = $('confirmCancel');
        const cleanup = () => {
            d.style.display = 'none';
            ok.removeEventListener('click', onOk);
            cancel.removeEventListener('click', onCancel);
            d.removeEventListener('click', onOverlay);
            document.removeEventListener('keydown', onKey);
        };
        const onOk = () => { cleanup(); resolve(true); };
        const onCancel = () => { cleanup(); resolve(false); };
        const onOverlay = (e) => { if (e.target === d) { cleanup(); resolve(false); } };
        const onKey = (e) => { if (e.key === 'Enter') onOk(); else if (e.key === 'Escape') onCancel(); };
        ok.addEventListener('click', onOk);
        cancel.addEventListener('click', onCancel);
        d.addEventListener('click', onOverlay);
        document.addEventListener('keydown', onKey);
    });
}

function sketchPrompt(msg, def, title) {
    return new Promise((resolve) => {
        const d = $('customPrompt'); if (!d) { resolve(def != null ? String(def) : ''); return; }
        const input = $('promptInput');
        $('promptMsg').textContent = msg;
        $('promptTitle').textContent = title || '输入';
        input.value = def != null ? def : '';
        d.style.display = 'flex';
        setTimeout(() => { input.focus(); input.select(); }, 50);
        const ok = $('promptOk'), cancel = $('promptCancel');
        const cleanup = () => {
            d.style.display = 'none';
            ok.removeEventListener('click', onOk);
            cancel.removeEventListener('click', onCancel);
            d.removeEventListener('click', onOverlay);
            input.removeEventListener('keydown', onInpKey);
        };
        const onOk = () => { const v = input.value; cleanup(); resolve(v == null ? '' : v); };
        const onCancel = () => { cleanup(); resolve(def != null ? String(def) : ''); };
        const onOverlay = (e) => { if (e.target === d) { cleanup(); resolve(def != null ? String(def) : ''); } };
        const onInpKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); onOk(); } else if (e.key === 'Escape') onCancel(); };
        ok.addEventListener('click', onOk);
        cancel.addEventListener('click', onCancel);
        d.addEventListener('click', onOverlay);
        input.addEventListener('keydown', onInpKey);
    });
}

// ---------- 暴露到 window ----------
// 注意：BGM 以函数形式暴露，调用方式：const bgm = BGM(); 返回内部 BGM 对象
const getBGM = () => BGM;
Object.assign(window, {
    $, scb, esc, escAttr,
    ensureAudio, playTone, playSfx, playToneSfx, SE_FILES,
    bgmInit, bgmPlay, bgmPlayCategory, bgmStop, bgmToggle, bgmSetVol,
    initAutoBGM, bgmAutoSwitch, bgmQuickPick, bgmOpenPicker,
    BGM: getBGM,
    toggleSfx, launchTutorial,
    tst, sketchConfirm, sketchPrompt
});
// 额外暴露：sfxEnabled 状态（main.js 初始化 btnSfx 按钮时需要读）
window.sfxEnabled = sfxEnabled;
// toggleSfx 被调用后同步更新 window.sfxEnabled（保持与 toggleSfx 内部变量一致）
const _origToggleSfx = toggleSfx;
window.toggleSfx = function(){ const ret = _origToggleSfx(); window.sfxEnabled = sfxEnabled; return ret; };

})();
