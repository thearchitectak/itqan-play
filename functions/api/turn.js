// يصدر بيانات خادم TURN مؤقتة من Cloudflare Realtime حتى يصل الصوت والصورة حين يتعذر الاتصال المباشر.
// يحتاج متغيري البيئة: TURN_KEY_ID و TURN_KEY_API_TOKEN (من لوحة Cloudflare > Realtime > TURN).
// إن لم يُضبطا يعيد خوادم STUN فقط، فيعمل الموقع كما كان.
const STUN = [{ urls: ['stun:stun.cloudflare.com:3478', 'stun:stun.l.google.com:19302'] }];
const json = (b, cache) => new Response(JSON.stringify(b), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cache || 'no-store' } });
export async function onRequestGet({ env }) {
  if (!env.TURN_KEY_ID || !env.TURN_KEY_API_TOKEN) return json({ iceServers: STUN, turn: false }, 'public, max-age=300');
  try {
    const r = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`, {
      method: 'POST', headers: { Authorization: `Bearer ${env.TURN_KEY_API_TOKEN}`, 'content-type': 'application/json' }, body: JSON.stringify({ ttl: 21600 }),
    });
    if (!r.ok) throw new Error('status ' + r.status);
    const data = await r.json();
    let servers = Array.isArray(data.iceServers) ? data.iceServers : [data.iceServers];
    // المنفذ 53 تحجبه المتصفحات فيبطئ الاتصال؛ نحذفه
    servers = servers.filter(Boolean).map(s => ({ ...s, urls: [].concat(s.urls).filter(u => !/:53(\?|$)/.test(u)) })).filter(s => s.urls.length);
    return json({ iceServers: servers, turn: true });
  } catch {
    return json({ iceServers: STUN, turn: false });
  }
}
