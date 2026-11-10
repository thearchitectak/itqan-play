// إطار مشترك لألعاب الطاولة متعددة اللاعبين: الإعداد، واللعب على الجهاز نفسه، وضد الكمبيوتر، وعبر الإنترنت
// بغرف برقم سري، مع المحادثة والصوت والصورة، وشاشة لعب تملأ الشاشة.
// كل لعبة تقدّم «تعريفًا» (def) يحتوي منطقها الخالص ودالة رسمها، والإطار يتولى الباقي.
//
// def = {
//   id, name: {ar,en}, counts: [2,3,4], defaultCount, levels: [['easy',..],['hard',..]] (اختياري),
//   hidden: true إن كانت للاعبين معلومات مخفية (أوراق في اليد) — يظهر ستار عند تبادل الجهاز،
//   options(): [{ key, label, choices: [[value,label]], def }],
//   init(players, opts) → state ،  view(state, seat) → ما يراه هذا المقعد،
//   needs(state) → مصفوفة المقاعد المطلوب منها فعل الآن ،  apply(state, seat, action) → رسالة خطأ أو null،
//   bot(state, seat, level) → فعل ،  over(state) → bool ،  result(state, seat) → { title, lines, win },
//   status(view, ui) → نص الحالة ،  render(el, view, ui) ،  rules: html ،  botDelay
// }
import { h, ico, t, addDict, settings, store, toast, modal, sound, num, displayName, copyText, viewToggle } from './core.js';
import { HostRoom, GuestRoom, netError } from './netroom.js';
import { Comms } from './comms.js';

addDict({
  ar: {
    gk_local: 'على هذا الجهاز', gk_localD: 'العب مع أصدقائك على الجهاز نفسه أو ضد الكمبيوتر', gk_online: 'عبر الإنترنت', gk_onlineD: 'غرفة برقم وكلمة سر مع محادثة وصوت',
    gk_players: 'اللاعبون', gk_count: 'عدد اللاعبين', gk_human: 'إنسان', gk_easy: 'سهل', gk_hard: 'صعب', gk_mid: 'متوسط', gk_options: 'خيارات اللعب', gk_start: 'ابدأ اللعب', gk_rules: 'طريقة اللعب',
    gk_you: 'أنت', gk_create: 'أنشئ غرفة', gk_join: 'ادخل غرفة', gk_pass: 'كلمة السر', gk_code: 'رقم الغرفة', gk_createBtn: 'أنشئ الغرفة', gk_joinBtn: 'ادخل الغرفة', gk_connecting: 'جارٍ الاتصال…',
    gk_needPass: 'اكتب كلمة سر للغرفة.', gk_needCode: 'اكتب رقم الغرفة المكوّن من 6 أرقام.', gk_lobby: 'غرفة الانتظار', gk_leave: 'غادر الغرفة', gk_back: 'تغيير الإعداد',
    gk_waitPlayers: 'بانتظار انضمام اللاعبين…', gk_waitHost: 'بانتظار أن يبدأ صاحب الغرفة اللعب…', gk_invite: 'رابط الدعوة', gk_copyInvite: 'انسخ الدعوة', gk_addBot: 'أضف الكمبيوتر',
    gk_inviteText: 'انضم إليّ في لعبة «{game}» على العب وتعلّم: {link}\nرقم الغرفة: {code}\nكلمة السر: {pass}', gk_joined: 'انضم {name} إلى الغرفة.', gk_left: 'غادر {name}، وسيكمل الكمبيوتر مكانه.',
    gk_hostLeft: 'أغلق صاحب الغرفة الغرفة.', gk_badCount: 'هذه اللعبة تحتاج {n} لاعبين.', gk_netNote: 'الاتصال مباشر بين الأجهزة. يكفي أن يرسل صاحب الغرفة الرقم وكلمة السر أو رابط الدعوة.',
    gk_turnOf: 'دور {name}', gk_yourTurn: 'دورك', gk_pass2: 'سلّم الجهاز إلى', gk_ready: 'أنا جاهز', gk_passHint: 'لا تنظر إلى أوراق غيرك 😉', gk_again: 'العب مرة أخرى', gk_home: 'تغيير الإعداد',
    gk_youWin: 'فزت! 🎉', gk_winner: 'الفائز: {name}', gk_gameOver: 'انتهت اللعبة', gk_waitAgain: 'بانتظار صاحب الغرفة لبدء جولة جديدة…', gk_team: 'الفريق', gk_full: 'ملء الشاشة',
    gk_err: 'فعل غير مسموح', gk_seat: 'المقعد',
  },
  en: {
    gk_local: 'On this device', gk_localD: 'Play friends on one device or the computer', gk_online: 'Online', gk_onlineD: 'Private room with chat and voice',
    gk_players: 'Players', gk_count: 'Players', gk_human: 'Human', gk_easy: 'Easy', gk_hard: 'Hard', gk_mid: 'Medium', gk_options: 'Options', gk_start: 'Start', gk_rules: 'How to play',
    gk_you: 'You', gk_create: 'Create room', gk_join: 'Join room', gk_pass: 'Password', gk_code: 'Room number', gk_createBtn: 'Create room', gk_joinBtn: 'Join', gk_connecting: 'Connecting…',
    gk_needPass: 'Enter a room password.', gk_needCode: 'Enter the 6-digit room number.', gk_lobby: 'Lobby', gk_leave: 'Leave room', gk_back: 'Change setup',
    gk_waitPlayers: 'Waiting for players…', gk_waitHost: 'Waiting for the host to start…', gk_invite: 'Invite link', gk_copyInvite: 'Copy invite', gk_addBot: 'Add computer',
    gk_inviteText: 'Join me in "{game}" on Play & Learn: {link}\nRoom: {code}\nPassword: {pass}', gk_joined: '{name} joined.', gk_left: '{name} left; the computer takes over.',
    gk_hostLeft: 'The host closed the room.', gk_badCount: 'This game needs {n} players.', gk_netNote: 'Devices connect directly. Share the room number and password, or the invite link.',
    gk_turnOf: "{name}'s turn", gk_yourTurn: 'Your turn', gk_pass2: 'Pass the device to', gk_ready: "I'm ready", gk_passHint: "Don't peek at the others' tiles 😉", gk_again: 'Play again', gk_home: 'Change setup',
    gk_youWin: 'You win! 🎉', gk_winner: 'Winner: {name}', gk_gameOver: 'Game over', gk_waitAgain: 'Waiting for the host to start a new game…', gk_team: 'Team', gk_full: 'Fullscreen',
    gk_err: 'Not allowed', gk_seat: 'Seat',
  },
});

export const AVATARS = ['🦁', '🐯', '🐼', '🦊', '🐸', '🐵', '🐧', '🦄', '🐨', '🐙', '🦉', '🐬'];
export const SEAT_COLORS = ['#e53935', '#1e78d6', '#2e9d43', '#f2b705', '#8e24aa', '#00897b', '#f4511e', '#5e35b1'];
export const rnd = (n) => Math.floor(Math.random() * n);
export const pick = (a) => a[rnd(a.length)];
export function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const clone = (o) => JSON.parse(JSON.stringify(o));

if (!document.getElementById('gamekit-css')) document.head.append(h('link', { id: 'gamekit-css', rel: 'stylesheet', href: new URL('../css/gamekit.css', import.meta.url).href }));

export function tableGame(root, ctx, def) {
  const levels = def.noBots ? [['gone', '—']] : (def.levels || [['easy', t('gk_easy')], ['hard', t('gk_hard')]]);
  const counts = def.counts || [2];
  const saved = store.get(def.id + '-setup', {});
  const optDefaults = Object.fromEntries((def.options?.() || []).map(o => [o.key, o.def]));
  const setup = {
    mode: 'local', count: def.defaultCount || counts[0], tab: 'create',
    opts: { ...optDefaults, ...(saved.opts || {}) },
    players: Array.from({ length: 8 }, (_, i) => ({ type: i === 0 ? 'human' : levels[levels.length - 1][0], name: '', avatar: AVATARS[i], ...(saved.players?.[i] || {}) })),
    ...(saved.mode ? { mode: saved.mode } : {}), ...(counts.includes(saved.count) ? { count: saved.count } : {}),
  };
  for (const k of Object.keys(setup.opts)) if (!(k in optDefaults)) delete setup.opts[k];
  let S = null, V = null, P = null, net = null, alive = true, botTimer = null, viewSeat = 0, cover = null, F = null, chatOpen = false, overShown = false;
  const view = h('div', { class: 'gk' }); root.append(view);
  // نبضة دورية للألعاب ذات المؤقت (على جهاز المضيف فقط)
  const ticker = def.tick ? setInterval(() => { if (!alive || !S || (net && net.role !== 'host') || def.over(S)) return; let ch = false; try { ch = def.tick(S, Date.now()); } catch (e) { console.error(e); } if (ch) commit(); else if (def.liveRender) renderGame(); }, def.tickMs || 500) : null;
  const isBot = (p) => p && p.type !== 'human' && p.type !== 'remote' && p.type !== 'gone';
  const levelName = (lv) => (levels.find(l => l[0] === lv) || [lv, lv])[1];

  // ================= الإعداد =================
  function save() { store.set(def.id + '-setup', { mode: setup.mode, count: setup.count, opts: setup.opts, players: setup.players.map(p => ({ type: p.type, name: p.name, avatar: p.avatar })) }); }
  function defName(p, i) { if (p.type !== 'human') return `${t('computer')} ${num(i + 1)}`; return i === 0 ? displayName(1) : `${t('player')} ${num(i + 1)}`; }
  function optionsBox() {
    const os = def.options?.() || [];
    if (!os.length) return null;
    return h('div', {}, h('h3', { class: 'gk-h3' }, ico('settings', 18), t('gk_options')), h('div', { class: 'opts' },
      os.filter(o => !o.when || o.when(setup)).map(o => h('div', { class: 'field' + (o.wide ? ' wide' : '') }, h('span', {}, o.label), ctx.seg(o.choices.map(([v, l]) => [String(v), l]), String(setup.opts[o.key]), v => { const c = o.choices.find(x => String(x[0]) === v); setup.opts[o.key] = c ? c[0] : v; if (o.rerender) showSetup(); }), o.hint ? h('small', {}, o.hint) : null))));
  }
  function avatarBtn(p) { return h('button', { type: 'button', class: 'gk-av', onclick: (e) => { p.avatar = AVATARS[(AVATARS.indexOf(p.avatar) + 1) % AVATARS.length]; e.currentTarget.textContent = p.avatar; } }, p.avatar); }
  function showSetup() {
    stopAll(); view.innerHTML = '';
    const modes = h('div', { class: 'gk-modes' }, [['local', '🎲'], ['online', '🌐']].map(([m, ic]) => h('button', { type: 'button', class: 'gk-mode' + (setup.mode === m ? ' on' : ''), onclick: () => { setup.mode = m; showSetup(); } },
      h('span', { class: 'gk-mode-ic' }, ic), h('b', {}, t('gk_' + m)), h('small', {}, t('gk_' + m + 'D')))));
    let body;
    if (setup.mode === 'local') {
      const rows = h('div', { class: 'gk-players' }, setup.players.slice(0, setup.count).map((p, i) => h('div', { class: 'gk-prow', style: { '--pc': (def.colors || SEAT_COLORS)[i] } },
        avatarBtn(p), def.teams?.(setup.count, setup.opts) ? h('span', { class: 'gk-teamtag' }, t('gk_team'), ' ', num(def.teams(setup.count, setup.opts)[i] + 1)) : null,
        h('input', { class: 'input', maxlength: 18, value: p.name, placeholder: defName(p, i), oninput: e => p.name = e.target.value }),
        def.noBots ? null : ctx.seg([['human', t('gk_human')], ...levels], p.type, v => { p.type = v; }))));
      body = h('div', {},
        counts.length > 1 ? h('div', { class: 'field', style: { marginBottom: '10px' } }, h('span', {}, t('gk_count')), ctx.seg(counts.map(c => [String(c), num(c)]), String(setup.count), v => { setup.count = +v; showSetup(); })) : null,
        h('h3', { class: 'gk-h3' }, ico('users', 18), t('gk_players')), rows, optionsBox(),
        h('div', { class: 'row', style: { marginTop: '18px' } }, h('button', { class: 'btn gk-go', type: 'button', onclick: startLocal }, ico('play', 18), t('gk_start')), h('button', { class: 'btn ghost', type: 'button', onclick: showRules }, ico('info', 18), t('gk_rules'))));
    } else body = onlineBox();
    view.append(h('div', { class: 'gk-setup-grid' }, h('div', { class: 'panel gk-setup' }, def.setupExtra ? def.setupExtra() : null, modes, body), def.preview ? h('div', { class: 'gk-preview' }, def.preview()) : null));
  }
  function showRules() { modal(t('gk_rules'), h('div', { class: 'gk-rules', html: typeof def.rules === 'function' ? def.rules() : def.rules }), [], { icon: 'info', wide: true }); }

  // ================= منطق التشغيل (على جهاز المضيف أو الجهاز المحلي) =================
  function startLocal() {
    save();
    const players = setup.players.slice(0, setup.count).map((p, i) => ({ name: p.name.trim() || defName(def.noBots ? { type: 'human' } : p, i), avatar: p.avatar, type: def.noBots ? 'human' : p.type }));
    P = players; S = def.init(clone(players), { ...setup.opts });
    viewSeat = players.findIndex(p => p.type === 'human'); if (viewSeat < 0) viewSeat = 0;
    overShown = false; commit(true);
  }
  function act(seat, a) {
    if (!S || def.over(S)) return t('gk_err');
    if (!def.needs(S).includes(seat)) return t('gk_err');
    let err;
    try { err = def.apply(S, seat, a); } catch (e) { console.error(e); err = t('gk_err'); }
    if (err) return err;
    commit();
    return null;
  }
  function commit(first) {
    broadcastState();
    renderGame(first);
    scheduleBots();
    if (def.over(S)) setTimeout(showResult, def.resultDelay ?? 700);
  }
  function scheduleBots() {
    clearTimeout(botTimer);
    if (!S || def.over(S)) return;
    const seats = def.needs(S).filter(s => isBot(P[s]));
    if (!seats.length) return;
    const delay = typeof def.botDelay === 'function' ? def.botDelay(S) : (def.botDelay ?? 900);
    botTimer = setTimeout(() => {
      if (!alive || !S) return;
      const s = seats[0];
      if (!def.needs(S).includes(s)) return scheduleBots();
      let a; try { a = def.bot(S, s, P[s].type); } catch (e) { console.error(e); }
      const err = a ? act(s, a) : 'none';
      if (err) { console.warn('bot action rejected', def.id, err, a); }
    }, delay);
  }
  function localSeat() {
    const humans = P.map((p, i) => p.type === 'human' ? i : -1).filter(i => i >= 0);
    if (!humans.length) return 0;
    const need = def.needs(S).filter(s => humans.includes(s));
    if (need.length) return need.includes(viewSeat) ? viewSeat : need[0];
    return humans.includes(viewSeat) ? viewSeat : humans[0];
  }

  // ================= الشاشة =================
  function ensureFrame() {
    if (F && F.root.isConnected) return F;
    view.innerHTML = '';
    document.body.classList.add('gk-lock');
    const comms = net?.comms || null;
    const bar = h('div', { class: 'gk-fbar' });
    const board = h('div', { class: 'gk-fboard' });
    const msgs = h('div', { class: 'gk-cmsgs' });
    const head = comms ? h('div', { class: 'gk-chead' }, ico('message-circle', 18), h('b', { class: 'grow' }, t('cm_chat')),
      h('button', { type: 'button', class: 'icon-btn', 'aria-label': t('close'), onclick: () => setChat(false) }, ico('x', 18))) : null;
    const top = h('div', { class: 'gk-ctop' }, head, msgs);
    const input = h('div', { class: 'gk-cinput' });
    const fr = h('div', { class: 'gk-full gk-' + def.id + (comms ? ' has-chat' : '') }, bar, top, board, input);
    view.append(fr);
    F = { root: fr, bar, board, top, msgs, input, comms };
    if (comms) {
      comms.dock(msgs, input);
      comms.onToggle = (force) => setChat(force ?? !chatOpen);
      F.unsub = comms.subscribe(() => { if (F) renderBar(); });
      setChat(chatOpen);
    }
    return F;
  }
  function setChat(v) {
    chatOpen = !!v; if (!F) return;
    F.root.classList.toggle('chat-open', chatOpen);
    F.comms?.setDockVisible(chatOpen);
    renderBar();
  }
  function exitFull() {
    document.body.classList.remove('gk-lock');
    if (F) { try { F.unsub?.(); F.comms?.undock(); } catch { } F = null; }
    chatOpen = false;
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch { }
  }
  function uiFor(seat) {
    const needs = net?.role === 'guest' ? (V?.__needs || []) : def.needs(S);
    return {
      seat, players: P, needs, myTurn: needs.includes(seat), online: !!net, host: !net || net.role === 'host',
      colors: def.colors || SEAT_COLORS,
      name: (s) => P[s]?.name ?? '', avatar: (s) => P[s]?.avatar ?? '',
      act: (a) => send(seat, a),
      plate: (s, extra) => plate(s, needs, extra, seat),
      rel: (s) => (s - seat + P.length) % P.length,
    };
  }
  function plate(s, needs, extra, me) {
    const p = P[s]; if (!p) return h('span');
    return h('div', { class: 'gk-plate' + (needs.includes(s) ? ' active' : '') + (s === me ? ' me' : ''), style: { '--pc': (def.colors || SEAT_COLORS)[s] } },
      h('span', { class: 'gk-pav' }, p.avatar), h('b', { class: 'gk-pname' }, p.name),
      p.type === 'remote' && s !== me ? ico('globe', 13) : isBot(p) ? ico('bot', 13) : null, extra ?? null);
  }
  function send(seat, a) {
    if (net?.role === 'guest') { net.room.send({ type: 'act', a }); return; }
    const err = act(seat, a);
    if (err) { toast(err, true); sound('error'); }
    return err;
  }
  function renderBar() {
    if (!F) return;
    const comms = F.comms;
    const ui = uiFor(currentSeat());
    const statusText = def.status ? def.status(currentView(), ui) : (ui.myTurn ? t('gk_yourTurn') : '');
    const turnSeat = ui.needs.length === 1 ? ui.needs[0] : null;
    F.bar.innerHTML = '';
    F.bar.append(...[
      net ? h('button', { class: 'btn ghost sm', type: 'button', onclick: () => { closeNet(); showSetup(); } }, ico('log-out', 16), h('span', { class: 'gk-hide-sm' }, t('gk_leave')))
        : h('button', { class: 'btn ghost sm', type: 'button', onclick: () => showSetup() }, ico('chevron-right', 16), h('span', { class: 'gk-hide-sm' }, t('gk_back'))),
      h('div', { class: 'gk-fstatus', style: { '--pc': turnSeat != null ? (def.colors || SEAT_COLORS)[turnSeat] : '#94a3b8' } }, turnSeat != null ? h('span', {}, P[turnSeat]?.avatar) : null, h('b', {}, statusText)),
      comms ? h('span', { class: 'gk-tools' },
        h('button', { type: 'button', class: 'gk-tool' + (chatOpen ? ' on' : ''), title: t('cm_chat'), onclick: () => setChat(!chatOpen) }, ico('message-circle', 18), comms.unread && !chatOpen ? h('i', { class: 'gk-unread' }, num(comms.unread)) : null),
        h('button', { type: 'button', class: 'gk-tool' + (comms.mic ? ' on' : ''), title: t(comms.mic ? 'cm_micOff' : 'cm_micOn'), onclick: () => comms.setMic(!comms.mic) }, ico(comms.mic ? 'mic' : 'mic-off', 18)),
        h('button', { type: 'button', class: 'gk-tool' + (comms.cam ? ' on' : ''), title: t(comms.cam ? 'cm_camOff' : 'cm_camOn'), onclick: async () => { await comms.setCam(!comms.cam); if (comms.cam) setChat(true); } }, ico(comms.cam ? 'video' : 'video-off', 18))) : null,
      viewToggle(),
      h('button', { class: 'btn ghost sm', type: 'button', onclick: showRules }, ico('info', 16)),
      h('button', { class: 'btn ghost sm gk-hide-sm', type: 'button', title: t('gk_full'), onclick: () => { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch { } } }, '⛶')].filter(Boolean));
  }
  const currentSeat = () => net?.role === 'guest' ? net.seat : net ? 0 : viewSeat;
  const currentView = () => net?.role === 'guest' ? V : def.view(S, currentSeat());
  function renderGame(first) {
    if (!alive) return;
    if (!net) {
      const prev = viewSeat; viewSeat = localSeat();
      const humans = P.filter(p => p.type === 'human').length;
      if (def.hidden && humans > 1 && (prev !== viewSeat || first) && !def.over(S)) { cover = viewSeat; }
    }
    const fr = ensureFrame();
    renderBar();
    if (cover == null && !first && def.patch && fr.board.firstChild) {
      const v0 = currentView();
      try { if (v0 && def.patch(fr.board, v0, uiFor(currentSeat()))) return; } catch (e) { console.error(e); }
    }
    fr.board.innerHTML = '';
    if (cover != null && !net) {
      const s = cover;
      fr.board.append(h('div', { class: 'gk-cover', style: { '--pc': (def.colors || SEAT_COLORS)[s] } },
        h('div', { class: 'gk-cover-av' }, P[s].avatar), h('p', {}, t('gk_pass2')), h('h2', {}, P[s].name), h('small', { class: 'muted' }, t('gk_passHint')),
        h('button', { class: 'btn gk-go', type: 'button', onclick: () => { cover = null; renderGame(); } }, ico('eye', 18), t('gk_ready'))));
      return;
    }
    const seat = currentSeat();
    const v = currentView();
    if (!v) return;
    try { def.render(fr.board, v, uiFor(seat)); } catch (e) { console.error(e); fr.board.append(h('pre', {}, String(e.stack || e))); }
  }
  function showResult() {
    if (!alive || overShown) return;
    const isOver = net?.role === 'guest' ? V?.__over : (S && def.over(S));
    if (!isOver) return;
    overShown = true;
    const seat = currentSeat();
    const r = net?.role === 'guest' ? V.__result : def.result(S, seat);
    if (!r) return;
    sound(r.win ? 'win' : r.win === false ? 'lose' : 'notify');
    if (r.win) confetti();
    const host = !net || net.role === 'host';
    const actions = host ? [{ label: t('gk_home'), kind: 'ghost', value: 'setup' }, { label: t('gk_again'), value: 'again', icon: 'refresh-cw' }] : [{ label: t('close'), value: 'close' }];
    modal(r.title || t('gk_gameOver'), h('div', { class: 'gk-result' }, r.big ? h('div', { class: 'gk-champ' }, r.big) : null, (r.lines || []).map(l => h('div', { class: 'gk-rrow', style: l.color ? { '--pc': l.color } : null }, l.avatar ? h('span', { class: 'gk-pav' }, l.avatar) : null, h('b', { class: 'grow' }, l.label), l.value != null ? h('span', {}, l.value) : null)),
      host ? null : h('p', { class: 'muted' }, t('gk_waitAgain'))), actions, { icon: 'trophy' }).then(v => {
      if (!alive) return;
      if (v === 'again') again();
      else if (v === 'setup') { if (net) showLobby(); else showSetup(); }
    });
  }
  function again() {
    if (!P) return;
    S = def.init(clone(P), net ? { ...net.opts } : { ...setup.opts });
    overShown = false; cover = null;
    if (net) net.room.broadcast({ type: 'again' });
    commit(true);
  }
  function confetti() {
    const box = h('div', { class: 'gk-confetti' }); document.body.append(box);
    for (let i = 0; i < 80; i++) box.append(h('i', { style: { left: Math.random() * 100 + 'vw', background: pick(SEAT_COLORS), animationDelay: Math.random() * 0.6 + 's', animationDuration: 1.8 + Math.random() * 1.4 + 's' } }));
    setTimeout(() => box.remove(), 4000);
  }
  function stopAll() { clearTimeout(botTimer); S = null; V = null; P = null; cover = null; overShown = false; exitFull(); }

  // ================= عبر الإنترنت =================
  const myInfo = () => ({ name: (setup.players[0].name || '').trim() || (settings.playerName || '').trim() || displayName(1), avatar: setup.players[0].avatar });
  function onlineBox() {
    const me = setup.players[0];
    const tab = setup.tab || 'create';
    const nameIn = h('input', { class: 'input', maxlength: 18, value: me.name || settings.playerName || '', placeholder: displayName(1), oninput: e => me.name = e.target.value });
    const passIn = h('input', { class: 'input', maxlength: 24, placeholder: '••••', value: store.get('room-pass', '') });
    const codeIn = h('input', { class: 'input gk-code', inputmode: 'numeric', maxlength: 6, dir: 'ltr', placeholder: '123456', value: setup.joinCode || '' });
    const jPass = h('input', { class: 'input', maxlength: 24, placeholder: '••••' });
    const createBox = h('div', { class: tab === 'create' ? '' : 'hidden' }, h('div', { class: 'opts' }, h('label', { class: 'field' }, h('span', {}, t('gk_pass')), passIn)), optionsBox(),
      h('button', { class: 'btn gk-go', type: 'button', style: { marginTop: '14px' }, onclick: (e) => createRoom(passIn.value.trim(), e.currentTarget) }, ico('plus', 18), t('gk_createBtn')));
    const joinBox = h('div', { class: tab === 'join' ? '' : 'hidden' }, h('div', { class: 'opts' }, h('label', { class: 'field' }, h('span', {}, t('gk_code')), codeIn), h('label', { class: 'field' }, h('span', {}, t('gk_pass')), jPass)),
      h('button', { class: 'btn gk-go', type: 'button', style: { marginTop: '14px' }, onclick: (e) => joinRoom(codeIn.value.trim(), jPass.value.trim(), e.currentTarget) }, ico('log-out', 18), t('gk_joinBtn')));
    return h('div', {},
      h('h3', { class: 'gk-h3' }, ico('user', 18), t('gk_you')),
      h('div', { class: 'gk-prow' }, avatarBtn(me), nameIn),
      h('div', { style: { margin: '14px 0' } }, ctx.seg([['create', t('gk_create')], ['join', t('gk_join')]], tab, v => { setup.tab = v; createBox.classList.toggle('hidden', v !== 'create'); joinBox.classList.toggle('hidden', v !== 'join'); })),
      createBox, joinBox, h('p', { class: 'muted', style: { fontSize: '13px', marginTop: '14px' } }, ico('info', 14), ' ', t('gk_netNote')));
  }
  const maxCount = Math.max(...counts);
  async function createRoom(pass, btn) {
    if (!pass) { toast(t('gk_needPass'), true); return; }
    store.set('room-pass', pass); save();
    btn.disabled = true; btn.textContent = t('gk_connecting');
    closeNet();
    const room = new HostRoom(def.id, { password: pass, max: maxCount - 1 }, {
      onJoin: (id, info) => {
        if (!net) return;
        if (net.players.length >= maxCount) { const bi = net.players.findIndex(isBot); if (bi < 0) return; net.players.splice(bi, 1); }
        const used = net.players.map(p => p.avatar);
        const name = String(info.name || '').slice(0, 18) || `${t('player')} ${num(net.players.length + 1)}`;
        net.players.push({ id, name, avatar: AVATARS.includes(info.avatar) && !used.includes(info.avatar) ? info.avatar : AVATARS.find(a => !used.includes(a)), type: 'remote' });
        sound('notify'); toast(t('gk_joined', { name }), 'ok'); showLobby();
      },
      onLeave: (id) => guestLeft(id),
      onMessage: (id, msg) => fromGuest(id, msg),
    });
    try {
      const code = await room.open();
      net = { role: 'host', room, code, pass, opts: { ...setup.opts }, players: [{ id: 'host', ...myInfo(), type: 'human' }] };
      net.comms = new Comms({ peer: room.peer, me: { id: room.peer.id, name: myInfo().name }, sendChat: (text) => room.broadcast({ type: 'chat', name: myInfo().name, text }) });
      showLobby();
    } catch (e) { toast(t(netError(e)), true); btn.disabled = false; btn.textContent = t('gk_createBtn'); room.close(); }
  }
  async function joinRoom(code, pass, btn) {
    if (!/^\d{6}$/.test(code)) { toast(t('gk_needCode'), true); return; }
    btn.disabled = true; btn.textContent = t('gk_connecting');
    closeNet();
    const room = new GuestRoom(def.id, { onMessage: fromHost, onLeave: () => { toast(t('gk_hostLeft'), true); closeNet(); modal.current?.close?.(null); showSetup(); } });
    try {
      await room.join(code, pass, myInfo());
      net = { role: 'guest', room, code, pass, players: [], seat: -1 };
      net.comms = new Comms({ peer: room.peer, me: { id: room.peer.id, name: myInfo().name }, sendChat: (text) => room.send({ type: 'chat', text }) });
      showLobby();
    } catch (e) { toast(t(netError(e)), true); btn.disabled = false; btn.textContent = t('gk_joinBtn'); room.close(); }
  }
  function closeNet() { clearTimeout(botTimer); try { net?.comms?.destroy(); } catch { } try { net?.room?.close(); } catch { } net = null; exitFull(); S = null; V = null; P = null; }
  function updateRoster() {
    if (!net || net.role !== 'host') return;
    const src = P || net.players;
    const list = src.filter(p => p.type === 'human' || p.type === 'remote').map(p => ({ id: p.type === 'human' ? net.room.peer.id : p.id, name: p.name }));
    net.comms?.setRoster(list); net.room.broadcast({ type: 'roster', list });
  }
  const inviteLink = () => `${location.origin}${location.pathname}#${def.id}-join-${net.code}`;
  function showLobby() {
    if (!net) return;
    stopAll(); view.innerHTML = '';
    const n = net.players.length;
    if (net.role === 'host') { net.room.broadcast({ type: 'lobby', players: net.players.map(p => ({ name: p.name, avatar: p.avatar, type: p.type })) }); updateRoster(); }
    const okCount = counts.includes(n);
    view.append(h('div', { class: 'panel gk-lobby' },
      h('div', { class: 'row' }, h('h2', { class: 'grow', style: { margin: 0 } }, ico('globe', 20), ' ', t('gk_lobby')), h('button', { class: 'btn ghost sm', type: 'button', onclick: () => { closeNet(); showSetup(); } }, t('gk_leave'))),
      net.comms ? net.comms.bar() : null,
      h('div', { class: 'gk-codes' }, h('div', {}, h('small', { class: 'muted' }, t('gk_code')), h('b', { dir: 'ltr' }, net.code)), h('div', {}, h('small', { class: 'muted' }, t('gk_pass')), h('b', { dir: 'ltr' }, net.pass))),
      h('div', { class: 'gk-players' }, net.players.map((p, i) => h('div', { class: 'gk-prow', style: { '--pc': (def.colors || SEAT_COLORS)[i] } }, h('span', { class: 'gk-av' }, p.avatar), h('b', { class: 'grow' }, p.name),
        def.teams?.(Math.max(n, counts[0]), net.opts || {}) ? h('span', { class: 'gk-teamtag' }, t('gk_team'), ' ', num((def.teams(Math.max(n, counts[0]), net.opts || {})[i] ?? 0) + 1)) : null,
        p.type === 'remote' ? ico('globe', 16) : p.type === 'human' ? ico('user', 16) : h('span', { class: 'muted' }, ico('bot', 16), ' ', levelName(p.type)),
        net.role === 'host' && isBot(p) ? h('button', { type: 'button', class: 'icon-btn', onclick: () => { net.players.splice(i, 1); showLobby(); } }, ico('x', 16)) : null))),
      h('p', { class: 'muted gk-wait' }, h('span', { class: 'gk-spin' }), net.role === 'host' ? t('gk_waitPlayers') : t('gk_waitHost')),
      net.role === 'host' ? h('div', {},
        h('div', { class: 'field' }, h('span', {}, t('gk_invite')), h('div', { class: 'row' }, h('input', { class: 'input grow', readonly: true, dir: 'ltr', value: inviteLink() }), h('button', { class: 'btn sm', type: 'button', onclick: () => copyText(t('gk_inviteText', { game: def.name[settings.lang] || def.name.ar, link: inviteLink(), code: net.code, pass: net.pass })) }, ico('copy', 15), t('gk_copyInvite')))),
        h('div', { class: 'row', style: { marginTop: '14px' } },
          n < maxCount && !def.noBots ? h('button', { class: 'btn ghost', type: 'button', onclick: () => { net.players.push({ id: 'bot' + Date.now(), name: `${t('computer')} ${num(n + 1)}`, avatar: AVATARS.find(a => !net.players.some(p => p.avatar === a)), type: levels[levels.length - 1][0] }); showLobby(); } }, ico('bot', 17), t('gk_addBot')) : null,
          h('button', { class: 'btn gk-go', type: 'button', disabled: !okCount, onclick: startOnline }, ico('play', 18), t('gk_start'))),
        okCount ? null : h('p', { class: 'muted' }, t('gk_badCount', { n: counts.map(num).join(' / ') }))) : null));
  }
  function startOnline() {
    P = net.players.map(p => ({ ...p }));
    net.seats = Object.fromEntries(P.map((p, i) => [p.id, i]));
    S = def.init(clone(P.map(p => ({ name: p.name, avatar: p.avatar, type: p.type }))), { ...net.opts });
    overShown = false;
    updateRoster();
    commit(true);
  }
  function viewFor(seat) {
    const v = def.view(S, seat);
    v.__needs = def.needs(S); v.__over = def.over(S);
    if (v.__over) v.__result = def.result(S, seat);
    return v;
  }
  function broadcastState() {
    if (!net || net.role !== 'host' || !S) return;
    const pub = P.map(p => ({ name: p.name, avatar: p.avatar, type: p.type }));
    P.forEach((p, i) => { if (p.type === 'remote') net.room.send(p.id, { type: 'state', seat: i, players: pub, v: viewFor(i) }); });
  }
  function guestLeft(id) {
    if (!net) return;
    if (!P) { const i = net.players.findIndex(p => p.id === id); if (i >= 0) { toast(t('gk_left', { name: net.players[i].name })); net.players.splice(i, 1); showLobby(); } return; }
    const i = P.findIndex(p => p.id === id); if (i < 0) return;
    toast(t('gk_left', { name: P[i].name }));
    P[i].type = levels[levels.length - 1][0];
    const np = net.players.findIndex(p => p.id === id); if (np >= 0) net.players.splice(np, 1);
    updateRoster(); commit();
  }
  function fromGuest(id, msg) {
    if (!net) return;
    if (msg.type === 'chat') { const p = (P || net.players).find(x => x.id === id); const text = String(msg.text || '').slice(0, 300); net.comms?.addChat({ name: p?.name || '…', text }); net.room.broadcast({ type: 'chat', name: p?.name || '…', text, from: id }); return; }
    if (msg.type === 'act' && S && net.seats && id in net.seats) {
      const err = act(net.seats[id], msg.a);
      if (err) net.room.send(id, { type: 'err', text: err });
    }
  }
  function fromHost(msg) {
    if (!net) return;
    if (msg.type === 'chat') { if (msg.from === net.room.id) return; net.comms?.addChat({ name: msg.name, text: msg.text }); return; }
    if (msg.type === 'roster') { net.comms?.setRoster(msg.list); return; }
    if (msg.type === 'lobby') { net.players = msg.players; if (!V) showLobby(); return; }
    if (msg.type === 'err') { toast(msg.text, true); sound('error'); return; }
    if (msg.type === 'again') { overShown = false; modal.current?.close?.(null); return; }
    if (msg.type === 'state') {
      const first = !V;
      P = msg.players; net.seat = msg.seat; V = msg.v;
      if (def.onView) try { def.onView(V, msg.seat); } catch { }
      renderGame(first);
      if (V.__over) setTimeout(showResult, def.resultDelay ?? 700); else overShown = false;
    }
  }

  // ================= البدء =================
  function handleHash(hash) {
    const m = /-join-(\d{6})$/.exec(hash || '');
    if (m) { setup.mode = 'online'; setup.tab = 'join'; setup.joinCode = m[1]; closeNet(); showSetup(); return true; }
    return false;
  }
  if (!handleHash(location.hash)) showSetup();
  const onKey = (e) => { if (e.key === 'Escape' && F && document.fullscreenElement) document.exitFullscreen?.(); };
  window.addEventListener('keydown', onKey);
  return {
    unmount() { alive = false; clearTimeout(botTimer); clearInterval(ticker); closeNet(); exitFull(); window.removeEventListener('keydown', onKey); },
    onLang() { if (S || V) renderGame(); else if (net) showLobby(); else showSetup(); },
    onHash(hash) { handleHash(hash); },
    // للألعاب التي تحتاج إعادة رسم بعد حدث داخلي (مثل الحركة المتحركة)
    rerender() { if (S || V) renderGame(); },
  };
}

// ============ أدوات رسم مشتركة ============
// نرد بنقاط
export function dieFace(n, cls = '') {
  const pos = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] }[n] || [];
  return h('span', { class: 'gk-die ' + cls }, Array.from({ length: 9 }, (_, i) => h('i', { class: pos.includes(i) ? 'on' : '' })));
}
// مخزن تفضيلات صغير خاص بكل لعبة فردية
export function soloStore(id) { return { get: (k, d) => store.get(id + ':' + k, d), set: (k, v) => store.set(id + ':' + k, v) }; }
