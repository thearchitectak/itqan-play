// لوحة التواصل في غرف اللعب عبر الإنترنت: محادثة كتابية مع وجوه تعبيرية وملصقات متحركة،
// وميكروفون وكاميرا اختياريان (مغلقان عند الدخول). الصوت والصورة يُرسلان مباشرة بين الأجهزة عبر PeerJS.
import { h, ico, t, addDict, toast, sound, settings } from './core.js';

addDict({
  ar: {
    cm_chat: 'المحادثة', cm_send: 'إرسال', cm_placeholder: 'اكتب رسالة…', cm_mic: 'الميكروفون', cm_cam: 'الكاميرا',
    cm_micOn: 'شغّل الميكروفون', cm_micOff: 'أوقف الميكروفون', cm_camOn: 'شغّل الكاميرا', cm_camOff: 'أوقف الكاميرا',
    cm_denied: 'لم يُسمح بالوصول إلى {what}. تحقق من إذن المتصفح.', cm_noDevice: 'لم يُعثر على {what} في هذا الجهاز.', cm_you: 'أنت',
    cm_empty: 'لا رسائل بعد. الميكروفون والكاميرا مغلقان، ويمكنك تشغيلهما متى شئت.', cm_tapSound: 'اضغط لتشغيل الصوت',
    cm_emoji: 'الوجوه التعبيرية', cm_stickers: 'الملصقات',
    cm_noRoute: 'لا يصل صوتك حاليًّا إلى: {names}. نعيد المحاولة تلقائيًّا…',
  },
  en: {
    cm_chat: 'Chat', cm_send: 'Send', cm_placeholder: 'Type a message…', cm_mic: 'microphone', cm_cam: 'camera',
    cm_micOn: 'Turn microphone on', cm_micOff: 'Turn microphone off', cm_camOn: 'Turn camera on', cm_camOff: 'Turn camera off',
    cm_denied: 'Access to the {what} was not allowed. Check your browser permission.', cm_noDevice: 'No {what} was found on this device.', cm_you: 'You',
    cm_empty: 'No messages yet. Your microphone and camera are off; turn them on whenever you like.', cm_tapSound: 'Tap to enable sound',
    cm_emoji: 'Emoji', cm_stickers: 'Stickers',
    cm_noRoute: 'Your audio is not reaching: {names}. Retrying automatically…',
  },
});

if (!document.getElementById('comms-css')) document.head.append(h('link', { id: 'comms-css', rel: 'stylesheet', href: new URL('../css/comms.css', import.meta.url).href }));

const EMOJIS = '😀 😂 🤣 😊 😍 😎 🤩 😉 🤔 😅 😮 😢 😡 🥳 😴 🤯 👍 👎 👏 🙌 🙏 💪 🤝 👋 ✌️ 👌 ❤️ 💙 💚 💛 🔥 ⭐ 🎉 🏆 🥇 🎲 ♟️ 🧠 💡 ✅ ❌ ⏳ 🍀 🚀 🎯 😜 🙈 🤗'.split(' ');
// ملصقات متحركة مدمجة (لا تحتاج أي خدمة خارجية)
const STICKERS = [
  { id: 'bravo', e: '👏', anim: 'pulse', ar: 'أحسنت!', en: 'Well done!' },
  { id: 'luck', e: '🍀', anim: 'spin', ar: 'حظًّا موفقًا!', en: 'Good luck!' },
  { id: 'wow', e: '🤩', anim: 'bounce', ar: 'رائع!', en: 'Wow!' },
  { id: 'fire', e: '🔥', anim: 'flicker', ar: 'نقلة نارية!', en: 'On fire!' },
  { id: 'laugh', e: '😂', anim: 'shake', ar: 'ضحكتني!', en: 'LOL!' },
  { id: 'ohno', e: '😱', anim: 'shake', ar: 'أوه لا!', en: 'Oh no!' },
  { id: 'dice', e: '🎲', anim: 'roll', ar: 'هيا يا نرد!', en: 'Come on, dice!' },
  { id: 'think', e: '🤔', anim: 'tilt', ar: 'دعني أفكر…', en: 'Let me think…' },
  { id: 'win', e: '🏆', anim: 'bounce', ar: 'سأفوز!', en: "I'll win!" },
  { id: 'thanks', e: '🙏', anim: 'pulse', ar: 'شكرًا لك!', en: 'Thank you!' },
  { id: 'hi', e: '👋', anim: 'wave', ar: 'مرحبًا!', en: 'Hello!' },
  { id: 'gg', e: '🤝', anim: 'pulse', ar: 'مباراة جميلة!', en: 'Good game!' },
  { id: 'fast', e: '⏳', anim: 'tilt', ar: 'أسرع قليلًا!', en: 'Hurry up!' },
  { id: 'cool', e: '😎', anim: 'bounce', ar: 'سهلة!', en: 'Easy!' },
  { id: 'love', e: '❤️', anim: 'pulse', ar: 'أحببت هذا!', en: 'Love it!' },
  { id: 'sleep', e: '😴', anim: 'tilt', ar: 'نمت من الانتظار', en: 'Zzz…' },
];
const STICKER_RE = /^::st:([a-z]+)::$/;

export class Comms {
  // peer: كائن PeerJS لهذا اللاعب، me: { id, name }، sendChat(text): إرسال رسالة عبر قناة اللعبة
  constructor({ peer, me, sendChat }) {
    this.peer = peer; this.me = me; this.sendChat = sendChat;
    this.roster = []; this.out = new Map(); this.inCalls = new Map(); this.remote = new Map();
    this.mic = false; this.cam = false; this.stream = null; this.open = false; this.unread = 0;
    this.docked = false; this.dockVisible = false; this.onToggle = null; this.bars = []; this.listeners = new Set();
    this.bad = new Set(); this.tries = new Map();
    this._onCall = (call) => this._answer(call);
    // مراقبة دورية: أي مشارك لا يصله بثّنا نعيد الاتصال به
    this._watch = setInterval(() => this._heal(), 6000);
    peer?.on('call', this._onCall);
    this._build();
  }

  // ---------- الواجهة ----------
  _build() {
    this.badge = h('span', { class: 'cm-badge hidden' });
    this.fab = h('button', { class: 'cm-fab', type: 'button', title: t('cm_chat'), onclick: () => this.toggle() }, ico('message-circle', 24), this.badge);
    this.micBtn = h('button', { class: 'cm-tg', type: 'button', onclick: () => this.setMic(!this.mic) });
    this.camBtn = h('button', { class: 'cm-tg', type: 'button', onclick: () => this.setCam(!this.cam) });
    this.videos = h('div', { class: 'cm-videos hidden' });
    this.warn = h('div', { class: 'cm-warn hidden' });
    this.list = h('div', { class: 'cm-list' }, h('p', { class: 'cm-empty' }, t('cm_empty')));
    this.top = h('div', { class: 'cm-top' }, this.videos, this.warn, this.list);
    // منتقي الوجوه والملصقات
    this.pickEmoji = h('div', { class: 'cm-grid emoji' }, EMOJIS.map(e => h('button', { type: 'button', onclick: () => this._insert(e) }, e)));
    this.pickSticker = h('div', { class: 'cm-grid stickers' }, STICKERS.map(s => h('button', { type: 'button', title: s[settings.lang] || s.ar, onclick: () => this._sendSticker(s.id) }, this._stickerEl(s, true))));
    this.picker = h('div', { class: 'cm-picker hidden' },
      h('div', { class: 'cm-ptabs' },
        h('button', { type: 'button', class: 'on', 'data-k': 'emoji', onclick: () => this._tab('emoji') }, '😀 ', t('cm_emoji')),
        h('button', { type: 'button', 'data-k': 'stickers', onclick: () => this._tab('stickers') }, '✨ ', t('cm_stickers'))),
      this.pickEmoji, this.pickSticker);
    this.pickSticker.classList.add('hidden');
    this.input = h('input', { class: 'input', maxlength: 300, placeholder: t('cm_placeholder'), enterkeyhint: 'send', onkeydown: (e) => { if (e.key === 'Enter') this._send(); }, onfocus: () => this.picker.classList.add('hidden') });
    this.composer = h('div', { class: 'cm-composer' }, this.picker,
      h('div', { class: 'cm-input' },
        h('button', { type: 'button', class: 'cm-ebtn', title: t('cm_emoji'), onclick: () => this._togglePicker('emoji') }, '😊'),
        h('button', { type: 'button', class: 'cm-ebtn', title: t('cm_stickers'), onclick: () => this._togglePicker('stickers') }, '✨'),
        this.input,
        h('button', { class: 'btn sm cm-send', type: 'button', onclick: () => this._send(), title: t('cm_send') }, ico('send', 16))));
    this.head = h('div', { class: 'cm-head' }, h('b', { class: 'grow' }, t('cm_chat')), this.micBtn, this.camBtn, h('button', { class: 'icon-btn', type: 'button', onclick: () => this.toggle(false), 'aria-label': t('close') }, ico('x', 18)));
    this.panel = h('div', { class: 'cm-panel hidden', role: 'dialog' }, this.head, this.top, this.composer);
    this.root = h('div', { class: 'cm-root' }, this.panel, this.fab);
    document.body.append(this.root);
    this._refreshButtons();
  }
  _tab(k) {
    this.picker.querySelectorAll('.cm-ptabs button').forEach(b => b.classList.toggle('on', b.dataset.k === k));
    this.pickEmoji.classList.toggle('hidden', k !== 'emoji'); this.pickSticker.classList.toggle('hidden', k !== 'stickers');
  }
  _togglePicker(k) {
    const hidden = this.picker.classList.contains('hidden');
    const cur = this.pickEmoji.classList.contains('hidden') ? 'stickers' : 'emoji';
    if (!hidden && cur === k) { this.picker.classList.add('hidden'); return; }
    this._tab(k); this.picker.classList.remove('hidden');
  }
  _insert(e) {
    const i = this.input, s = i.selectionStart ?? i.value.length;
    i.value = i.value.slice(0, s) + e + i.value.slice(i.selectionEnd ?? s);
    i.selectionStart = i.selectionEnd = s + e.length;
  }
  _stickerEl(s, small = false) {
    return h('span', { class: 'cm-sticker a-' + s.anim + (small ? ' sm' : '') }, h('span', { class: 'e' }, s.e), h('span', { class: 'l' }, s[settings.lang] || s.ar));
  }
  _sendSticker(id) { this.picker.classList.add('hidden'); const text = `::st:${id}::`; this.sendChat(text); this.addChat({ name: this.me.name, text, mine: true }); }

  // وضع الإرساء: تضع اللعبة أجزاء المحادثة داخل تخطيطها بدل النافذة العائمة
  dock(topSlot, composerSlot) { topSlot.append(this.top); composerSlot.append(this.composer); this.docked = true; this.panel.classList.add('hidden'); }
  undock() { this.panel.append(this.top, this.composer); this.docked = false; this.dockVisible = false; this.onToggle = null; }
  setDockVisible(v) { this.dockVisible = v; if (v) { this.unread = 0; this._refreshButtons(); this.list.scrollTop = this.list.scrollHeight; } }
  get visible() { return this.docked ? this.dockVisible : this.open; }
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }

  bar() {
    const chat = h('button', { class: 'btn ghost sm cm-bchat', type: 'button', onclick: () => this.toggle() }, ico('message-circle', 16), t('cm_chat'), h('span', { class: 'cm-bbadge hidden' }));
    const mic = h('button', { class: 'btn ghost sm', type: 'button', onclick: () => this.setMic(!this.mic) });
    const cam = h('button', { class: 'btn ghost sm', type: 'button', onclick: () => this.setCam(!this.cam) });
    const el = h('div', { class: 'cm-bar' }, chat, mic, cam);
    this.bars = this.bars.filter(b => b.el.isConnected);
    this.bars.push({ el, chat, mic, cam });
    this._refreshButtons();
    return el;
  }
  _refreshButtons() {
    for (const b of this.bars) {
      b.mic.innerHTML = ''; b.mic.append(ico(this.mic ? 'mic' : 'mic-off', 16), t(this.mic ? 'cm_micOff' : 'cm_micOn')); b.mic.classList.toggle('cm-live', this.mic);
      b.cam.innerHTML = ''; b.cam.append(ico(this.cam ? 'video' : 'video-off', 16), t(this.cam ? 'cm_camOff' : 'cm_camOn')); b.cam.classList.toggle('cm-live', this.cam);
      const bb = b.chat.querySelector('.cm-bbadge'); bb.textContent = this.unread; bb.classList.toggle('hidden', !this.unread);
    }
    this.micBtn.className = 'cm-tg' + (this.mic ? ' on' : ''); this.micBtn.title = t(this.mic ? 'cm_micOff' : 'cm_micOn');
    this.micBtn.innerHTML = ''; this.micBtn.append(ico(this.mic ? 'mic' : 'mic-off', 18));
    this.camBtn.className = 'cm-tg' + (this.cam ? ' on' : ''); this.camBtn.title = t(this.cam ? 'cm_camOff' : 'cm_camOn');
    this.camBtn.innerHTML = ''; this.camBtn.append(ico(this.cam ? 'video' : 'video-off', 18));
    this.fab.classList.toggle('live', this.mic || this.cam);
    this.badge.textContent = this.unread; this.badge.classList.toggle('hidden', !this.unread);
    this.listeners.forEach(f => { try { f(this); } catch { } });
  }
  toggle(force) {
    if (this.onToggle) { this.onToggle(force); return; }
    this.open = force ?? !this.open;
    this.panel.classList.toggle('hidden', !this.open);
    if (this.open) { this.unread = 0; this._refreshButtons(); this.list.scrollTop = this.list.scrollHeight; }
  }
  _send() {
    const text = this.input.value.trim(); if (!text) return;
    this.input.value = ''; this.picker.classList.add('hidden');
    this.sendChat(text);
    this.addChat({ name: this.me.name, text, mine: true });
  }
  addChat({ name, text, mine = false }) {
    this.list.querySelector('.cm-empty')?.remove();
    const m = STICKER_RE.exec(String(text)); const st = m && STICKERS.find(s => s.id === m[1]);
    this.list.append(h('div', { class: 'cm-msg' + (mine ? ' mine' : '') + (st ? ' sticker' : '') }, h('small', {}, mine ? t('cm_you') : name), st ? this._stickerEl(st) : h('span', { dir: 'auto' }, String(text).slice(0, 300))));
    while (this.list.children.length > 150) this.list.firstChild.remove();
    this.list.scrollTop = this.list.scrollHeight;
    if (!mine && !this.visible) { this.unread++; this._refreshButtons(); sound('notify'); }
  }

  // ---------- المشاركون ----------
  setRoster(list) {
    this.roster = (list || []).filter(x => x && x.id);
    const others = this.roster.filter(x => x.id !== this.me.id).map(x => x.id);
    if (this.stream) for (const id of others) if (!this.out.has(id)) this._call(id);
    for (const id of [...this.out.keys()]) if (!others.includes(id)) { try { this.out.get(id).close(); } catch { } this.out.delete(id); }
    for (const id of [...this.remote.keys()]) if (!others.includes(id)) this._removeRemote(id);
    this._renderVideos();
  }
  nameOf(id) { return this.roster.find(x => x.id === id)?.name || '…'; }

  // ---------- الصوت والصورة ----------
  async setMic(on) { if (on === this.mic) return; this.mic = on; if (!(await this._rebuild('mic'))) this.mic = false; this._refreshButtons(); }
  async setCam(on) { if (on === this.cam) return; this.cam = on; if (!(await this._rebuild('cam'))) this.cam = false; this._refreshButtons(); }
  async _rebuild(changed) {
    for (const c of this.out.values()) { try { c.close(); } catch { } }
    this.out.clear(); this.tries.clear(); this.bad.clear(); this._mark('', true);
    if (this.stream) { this.stream.getTracks().forEach(tr => tr.stop()); this.stream = null; }
    if (!this.mic && !this.cam) { this._renderVideos(); return true; }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: this.mic ? { echoCancellation: true, noiseSuppression: true } : false, video: this.cam ? { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' } : false });
    } catch (e) {
      const what = t(changed === 'cam' ? 'cm_cam' : 'cm_mic');
      toast(e?.name === 'NotFoundError' ? t('cm_noDevice', { what }) : t('cm_denied', { what }), true);
      if (changed === 'cam') this.cam = false; else this.mic = false;
      if (this.mic || this.cam) return this._rebuild(changed === 'cam' ? 'mic' : 'cam').then(() => false);
      this._renderVideos(); return false;
    }
    for (const r of this.roster) if (r.id !== this.me.id) this._call(r.id);
    this._renderVideos();
    return true;
  }
  _call(id) {
    if (!this.peer || !this.stream) return;
    try {
      const call = this.peer.call(id, this.stream, { metadata: { name: this.me.name } });
      if (!call) return;
      this.out.set(id, call);
      let timer = null;
      const fail = () => { if (this.out.get(id) !== call) return; this.out.delete(id); try { call.close(); } catch { } this._mark(id, false); };
      const drop = () => { clearTimeout(timer); if (this.out.get(id) === call) { this.out.delete(id); } };
      call.on('close', drop); call.on('error', fail);
      // إن لم يكتمل الاتصال خلال 12 ثانية أو فشل، نعدّه منقطعًا ونعيد المحاولة
      timer = setTimeout(() => { const st = call.peerConnection?.iceConnectionState; if (st !== 'connected' && st !== 'completed') fail(); }, 12000);
      const pc = call.peerConnection;
      if (pc) pc.addEventListener('iceconnectionstatechange', () => {
        const st = pc.iceConnectionState;
        if (st === 'connected' || st === 'completed') { clearTimeout(timer); this.tries.delete(id); this._mark(id, true); }
        else if (st === 'failed') fail();
        else if (st === 'disconnected') { clearTimeout(timer); timer = setTimeout(() => { if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') fail(); }, 6000); }
      });
    } catch { }
  }
  _mark(id, ok) {
    if (ok) this.bad.delete(id); else if (this.roster.some(r => r.id === id)) this.bad.add(id);
    const names = [...this.bad].map(x => this.nameOf(x));
    this.warn.textContent = names.length ? t('cm_noRoute', { names: names.join('، ') }) : '';
    this.warn.classList.toggle('hidden', !names.length);
  }
  _heal() {
    if (!this.stream) { if (this.bad.size) { this.bad.clear(); this._mark('', true); } return; }
    for (const r of this.roster) {
      if (r.id === this.me.id || this.out.has(r.id)) continue;
      const n = (this.tries.get(r.id) || 0) + 1;
      if (n > 20) continue;
      this.tries.set(r.id, n);
      this._call(r.id);
    }
  }
  _answer(call) {
    try { call.answer(); } catch { return; }
    const id = call.peer;
    const prev = this.inCalls.get(id); if (prev && prev !== call) { try { prev.close(); } catch { } }
    this.inCalls.set(id, call);
    call.on('stream', (s) => { this.remote.set(id, s); this._renderVideos(); });
    call.on('close', () => { if (this.inCalls.get(id) === call) { this.inCalls.delete(id); this._removeRemote(id); } });
  }
  _removeRemote(id) { this.remote.delete(id); this._renderVideos(); }
  _renderVideos() {
    this.videos.innerHTML = '';
    const tiles = [];
    if (this.stream && this.cam) tiles.push({ id: this.me.id, name: t('cm_you'), stream: this.stream, mine: true });
    for (const [id, s] of this.remote) tiles.push({ id, name: this.nameOf(id), stream: s });
    for (const tl of tiles) {
      const hasVideo = tl.stream.getVideoTracks().length > 0;
      const media = h(hasVideo ? 'video' : 'audio', { autoplay: true, playsinline: true });
      media.srcObject = tl.stream; if (tl.mine) media.muted = true;
      const tile = h('div', { class: 'cm-tile' + (hasVideo ? '' : ' audio') }, media, h('span', { class: 'cm-name' }, hasVideo ? '' : ico('mic', 14), tl.name));
      media.play?.().catch(() => { tile.append(h('button', { class: 'btn sm cm-unmute', type: 'button', onclick: (e) => { media.play().catch(() => { }); e.currentTarget.remove(); } }, t('cm_tapSound'))); });
      this.videos.append(tile);
    }
    this.videos.classList.toggle('hidden', !tiles.length);
    this.fab.classList.toggle('incoming', this.remote.size > 0);
    this.listeners.forEach(f => { try { f(this); } catch { } });
  }
  destroy() {
    clearInterval(this._watch);
    try { this.peer?.off('call', this._onCall); } catch { }
    for (const c of [...this.out.values(), ...this.inCalls.values()]) { try { c.close(); } catch { } }
    if (this.stream) this.stream.getTracks().forEach(tr => tr.stop());
    this.top.remove(); this.composer.remove();
    this.root.remove();
  }
}
