import { useState, useEffect, useRef } from "react";
import kazamLogo from "./assets/kazam-logo.png";

// ─── TOKENS ───────────────────────────────────────────────────────
const T = {
  bg: '#0A0A0A', surface: '#141414', elevated: '#1C1C1C',
  border: 'rgba(255,255,255,0.08)', borderHi: 'rgba(255,255,255,0.26)',
  green: '#22C55E', greenDim: 'rgba(34,197,94,0.12)',
  blue: '#3B82F6', blueDim: 'rgba(59,130,246,0.15)',
  amber: '#F59E0B', amberDim: 'rgba(245,158,11,0.12)',
  red: '#EF4444',
  text: '#F2F2F2', muted: '#636363', dim: '#3A3A3A',
  purple: '#8B5CF6', purpleDim: 'rgba(139,92,246,0.18)',
};

// ─── ANIMATIONS ───────────────────────────────────────────────────
// React inline styles can't hold @keyframes / :active, so we inject a
// single <style> tag and reference the names from inline `animation:`.
const ANIM = `
@keyframes kzSlideIn   { from { opacity: 0; transform: translateX(18px) }  to { opacity: 1; transform: translateX(0) } }
@keyframes kzSlideBack { from { opacity: 0; transform: translateX(-18px) } to { opacity: 1; transform: translateX(0) } }
@keyframes kzFadeUp    { from { opacity: 0; transform: translateY(10px) }  to { opacity: 1; transform: translateY(0) } }
@keyframes kzPop       { 0% { opacity: 0; transform: scale(.5) } 60% { transform: scale(1.06) } 100% { opacity: 1; transform: scale(1) } }
@keyframes kzBlink     { 0%, 100% { opacity: 1 } 50% { opacity: .25 } }
@keyframes kzGlow      { 0%, 100% { box-shadow: 0 0 0 rgba(239,68,68,0) } 50% { box-shadow: 0 0 22px rgba(239,68,68,0.22) } }
@keyframes kzPulse     { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5) } 70% { box-shadow: 0 0 0 8px rgba(34,197,94,0) } 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0) } }
.kz-press  { transition: transform .12s ease, opacity .15s ease }
.kz-press:active { transform: scale(.97); opacity: .9 }
.kz-scroll { scrollbar-width: none }
.kz-scroll::-webkit-scrollbar { display: none }
`;

// ─── DATA ─────────────────────────────────────────────────────────
const CHARGER = {
  id: 'e1sdhk', name: 'Smile Stone 1', loc: 'Nagar, Pune',
  addr: 'Nagar, Pune – Ahilyanagar Highway, Nashik Division, Maharashtra, 414005',
};
const USER = { name: 'Harsh', email: 'harshtimes112@gmail.com', phone: '+91 7007916033', initial: 'H' };
const USERNAME = USER.name;

const CATS = [
  { id: 'offline',   icon: '⚫', label: 'Charger offline',  fix: { title: 'Check MCB & emergency stop', steps: ['Check if the MCB at the bottom is in the OFF position', 'If so, flip it back ON', 'Check if the red emergency button is pressed', 'Rotate the red button clockwise to release it'] } },
  { id: 'charging',  icon: '🔋', label: 'Not charging',     fix: { title: 'Restart the session', steps: ['Unplug the cable from your vehicle', 'Wait 30 seconds', 'Re-insert the cable firmly until it clicks', 'Check if the charging indicator lights up'] } },
  { id: 'burnt',     icon: '🔥', label: 'Burnt / Damaged',  fix: null },
  { id: 'rccb',      icon: '⚡', label: 'RCCB tripping',    fix: { title: 'How to reset the RCCB', steps: ['Unplug your vehicle from the charger first', 'Find the RCCB on the left side of the box (blue glow)', 'Push the lever firmly upward until it clicks', 'Wait 10 seconds, reconnect and try charging'] } },
  { id: 'heat',      icon: '🌡️', label: 'Overheating',      fix: { title: 'Cool down and retry', steps: ['Stop the current charging session', 'Ensure the charger is not in direct sunlight', 'Wait 15 minutes for it to cool down', 'Retry and monitor for recurrence'] } },
  { id: 'other',     icon: '❓', label: 'Other issue',       fix: null },
];

const QUICK_FIXES = [
  'RCCB tripped? Push the switch on the left side upward and retry',
  'No power? Check if the MCB at the bottom is in the OFF position',
  'Emergency button pressed? Rotate the red button clockwise',
];

const TICKETS = [
  {
    id: 'IN-661721', catId: 'rccb', label: 'RCCB tripping repeatedly',
    status: 'in-progress', age: '2 days ago',
    timeline: [
      { label: 'Ticket received',    sub: '14 Apr, 2:30 PM', done: true  },
      { label: 'Assigned to team',   sub: '14 Apr, 3:15 PM', done: true  },
      { label: 'Engineer on the way',sub: 'Today',           active: true, note: 'Rahul will arrive by 2 PM today. Contact: 9876543210' },
      { label: 'Issue resolved',     sub: '' },
    ],
    messages: [
      { from: 'team', text: "Hi! We've noted the RCCB issue. Engineer will visit today.", time: 'Today, 10:05 AM' },
      { from: 'me',   text: 'What time will he come?', time: '10:18 AM' },
      { from: 'team', text: 'By 2 PM. His number: 9876543210', time: '10:22 AM' },
    ],
  },
  {
    id: 'IN-596637', catId: 'burnt', label: 'Socket burnt / damaged',
    status: 'resolved', age: '12 days ago',
    timeline: [
      { label: 'Ticket received',    sub: '12 Apr, 11:00 AM', done: true },
      { label: 'Assigned to team',   sub: '12 Apr, 11:45 AM', done: true },
      { label: 'Engineer on the way',sub: '13 Apr',           done: true },
      { label: 'Issue resolved',     sub: '13 Apr, 5:00 PM',  done: true },
    ],
    messages: [
      { from: 'team', text: 'Socket has been replaced. Please test charging.', time: '13 Apr, 5:00 PM' },
      { from: 'me',   text: 'Working now, thanks!', time: '13 Apr, 5:15 PM' },
    ],
  },
];

const getCat = id => CATS.find(c => c.id === id);

// ─── PRIMITIVES ───────────────────────────────────────────────────
const Card = ({ children, style: s }) => (
  <div style={{ background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 14, ...s }}>
    {children}
  </div>
);

const StatusBar = () => {
  const h = new Date().getHours(), m = new Date().getMinutes();
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 24px 2px', color: T.text, fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
      <span>{`${h % 12 || 12}:${String(m).padStart(2, '0')}`}</span>
      <span style={{ letterSpacing: 3, fontSize: 11 }}>●●●</span>
    </div>
  );
};

const NavHeader = ({ title, onBack }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px 2px', flexShrink: 0 }}>
    {onBack && (
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.muted, fontSize: 26, cursor: 'pointer', padding: '0 6px 0 0', lineHeight: 1 }}>‹</button>
    )}
    <span style={{ color: T.text, fontSize: 17, fontWeight: 600 }}>{title}</span>
  </div>
);

const ProgressBar = ({ step }) => (
  <div style={{ display: 'flex', gap: 5, padding: '8px 20px 0', flexShrink: 0 }}>
    {[1, 2, 3].map(i => (
      <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= step ? T.green : T.border, transition: 'background 0.3s' }} />
    ))}
  </div>
);

const Scroller = ({ children, pb = 24 }) => (
  <div className="kz-scroll" style={{ flex: 1, overflowY: 'auto', padding: `20px 20px ${pb}px` }}>{children}</div>
);

const Footer = ({ children }) => (
  <div style={{ padding: '10px 20px 32px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, background: T.bg }}>
    {children}
  </div>
);

const PrimaryBtn = ({ label, onClick, disabled }) => (
  <button onClick={disabled ? undefined : onClick} className={disabled ? undefined : 'kz-press'} style={{
    width: '100%', border: 'none', borderRadius: 14, padding: '16px',
    fontSize: 16, fontWeight: 600, fontFamily: 'inherit', cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? T.elevated : T.text, color: disabled ? T.dim : T.bg, transition: 'opacity 0.15s',
  }}>{label}</button>
);

const GhostBtn = ({ label, onClick }) => (
  <button onClick={onClick} className="kz-press" style={{
    width: '100%', border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px',
    fontSize: 16, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', background: 'none', color: T.text,
  }}>{label}</button>
);

const LinkBtn = ({ label, onClick }) => (
  <button onClick={onClick} style={{
    width: '100%', border: 'none', padding: '8px', fontSize: 14,
    fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer', background: 'none', color: T.muted,
  }}>{label}</button>
);

// ─── HELP & SUPPORT (reached via charger detail) ──────────────────
function HelpScreen({ onBack, onReport, onTicket }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <NavHeader title="Help & Support" onBack={onBack} />
      <Scroller>
        <h1 style={{ color: T.text, fontSize: 22, fontWeight: 700, margin: '6px 0 4px', lineHeight: 1.25 }}>How can we help?</h1>
        <p style={{ color: T.muted, fontSize: 14, margin: '0 0 18px' }}>For {CHARGER.name} · {CHARGER.id}</p>

        {/* Charger pill */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 99, padding: '6px 14px', marginBottom: 22 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.green, animation: 'kzPulse 2s ease-out infinite' }} />
          <span style={{ color: T.muted, fontSize: 13 }}>Charger</span>
          <span style={{ color: T.text, fontSize: 13, fontWeight: 600 }}>{CHARGER.id}</span>
          <span style={{ color: T.muted, fontSize: 13 }}>· Online</span>
        </div>

        {/* Report CTA */}
        <button onClick={onReport} className="kz-press" style={{ width: '100%', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', marginBottom: 28, textAlign: 'left', boxSizing: 'border-box' }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: T.amberDim, border: `1px solid rgba(245,158,11,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>⚠️</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: T.text, fontSize: 16, fontWeight: 600, marginBottom: 2 }}>Report an Issue</div>
            <div style={{ color: T.muted, fontSize: 13 }}>Tell us what's wrong with your charger</div>
          </div>
          <span style={{ color: T.muted, fontSize: 22 }}>›</span>
        </button>

        {/* Past tickets */}
        <p style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>Past Tickets</p>
        {TICKETS.map(ticket => {
          const cat = getCat(ticket.catId);
          const isIP = ticket.status === 'in-progress';
          return (
            <button key={ticket.id} onClick={() => onTicket(ticket)} className="kz-press" style={{ width: '100%', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left', marginBottom: 8, boxSizing: 'border-box' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{cat?.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: T.text, fontSize: 15, fontWeight: 500, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.label}</div>
                <div style={{ color: T.muted, fontSize: 12 }}>{ticket.id} · {ticket.age}</div>
              </div>
              <span style={{ background: isIP ? T.blueDim : T.greenDim, color: isIP ? T.blue : T.green, fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, whiteSpace: 'nowrap', flexShrink: 0 }}>
                {isIP ? 'In Progress' : '✓ Resolved'}
              </span>
            </button>
          );
        })}

        {/* Quick fixes */}
        <Card style={{ padding: '16px 18px', marginTop: 8 }}>
          <p style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>Quick Fixes</p>
          {QUICK_FIXES.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: i < QUICK_FIXES.length - 1 ? 9 : 0 }}>
              <span style={{ color: T.muted, fontSize: 13, marginTop: 2, flexShrink: 0 }}>·</span>
              <span style={{ color: T.muted, fontSize: 13, lineHeight: 1.55 }}>{tip}</span>
            </div>
          ))}
        </Card>
      </Scroller>
    </div>
  );
}

// ─── SCREEN 2: CATEGORY ───────────────────────────────────────────
function CategoryScreen({ onBack, onNext }) {
  const [sel, setSel] = useState(null);
  const [fixedIt, setFixedIt] = useState(false);
  const cat = getCat(sel);
  const hasFix = !!cat?.fix;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <NavHeader title="Report Issue" onBack={onBack} />
      <ProgressBar step={1} />
      <Scroller>
        <h2 style={{ color: T.text, fontSize: 24, fontWeight: 700, margin: '4px 0 4px' }}>What's the problem?</h2>
        <p style={{ color: T.muted, fontSize: 14, margin: '0 0 20px' }}>Select the issue that best describes what you're seeing</p>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {CATS.map(c => (
            <button key={c.id} onClick={() => { setSel(c.id); setFixedIt(false); }} className="kz-press" style={{
              background: sel === c.id ? 'rgba(255,255,255,0.05)' : T.elevated,
              border: `1.5px solid ${sel === c.id ? T.borderHi : T.border}`,
              borderRadius: 12, padding: '18px 16px 14px', display: 'flex', flexDirection: 'column',
              alignItems: 'flex-start', gap: 10, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 26 }}>{c.icon}</span>
              <span style={{ color: T.text, fontSize: 13, fontWeight: 500, lineHeight: 1.35 }}>{c.label}</span>
            </button>
          ))}
        </div>

        {/* Try First panel */}
        {sel && hasFix && !fixedIt && (
          <Card key={sel} style={{ padding: '16px 18px', marginBottom: 14, animation: 'kzFadeUp .28s ease both' }}>
            <p style={{ color: T.amber, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', margin: '0 0 4px' }}>TRY FIRST</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <p style={{ color: T.text, fontSize: 15, fontWeight: 600, margin: 0 }}>{cat.fix.title}</p>
              <span style={{ color: T.muted, fontSize: 16 }}>↓</span>
            </div>
            {cat.fix.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < cat.fix.steps.length - 1 ? 9 : 14 }}>
                <span style={{ color: T.muted, fontSize: 13, fontWeight: 600, minWidth: 14, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ color: T.muted, fontSize: 13, lineHeight: 1.55 }}>{step}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setFixedIt(true)} className="kz-press" style={{ flex: 1, background: T.greenDim, border: `1px solid rgba(34,197,94,0.3)`, color: T.green, borderRadius: 9, padding: '11px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>✓ That fixed it!</button>
              <button onClick={() => onNext(sel)} className="kz-press" style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 9, padding: '11px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Still broken →</button>
            </div>
          </Card>
        )}

        {/* Fixed it confirmation */}
        {fixedIt && (
          <div style={{ background: T.greenDim, border: `1px solid rgba(34,197,94,0.25)`, borderRadius: 14, padding: '22px', textAlign: 'center', marginBottom: 14, animation: 'kzPop .4s cubic-bezier(.34,1.56,.64,1) both' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
            <p style={{ color: T.green, fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Great, glad it's working!</p>
            <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>No ticket needed. Head back to home.</p>
          </div>
        )}
      </Scroller>

      {!fixedIt && (
        <Footer>
          <PrimaryBtn label="Continue" onClick={() => sel && onNext(sel)} disabled={!sel || hasFix} />
        </Footer>
      )}
    </div>
  );
}

// ─── SCREEN 3: ADD DETAILS ────────────────────────────────────────
function AddDetailsScreen({ onBack, onNext }) {
  const [voice, setVoice] = useState('idle'); // idle | rec | done
  const [secs, setSecs] = useState(0);
  const [photo, setPhoto] = useState(false);
  const [note, setNote] = useState('');
  const timer = useRef(null);
  const tick = useRef(null);
  const fmt = s => `0:${String(s).padStart(2, '0')}`;

  const handleVoice = () => {
    if (voice === 'rec') { clearTimeout(timer.current); clearInterval(tick.current); setVoice('done'); return; }
    if (voice === 'done') { setVoice('idle'); setSecs(0); return; }
    setSecs(0); setVoice('rec');
    tick.current = setInterval(() => setSecs(s => s + 1), 1000);
    timer.current = setTimeout(() => { clearInterval(tick.current); setVoice('done'); }, 4000);
  };
  useEffect(() => () => { clearTimeout(timer.current); clearInterval(tick.current); }, []);

  const proofLabel = voice === 'done' ? 'Voice note recorded' : photo ? 'Photo added' : note.trim() ? 'Description added' : null;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <NavHeader title="Add Details" onBack={onBack} />
      <ProgressBar step={2} />
      <Scroller>
        <h2 style={{ color: T.text, fontSize: 24, fontWeight: 700, margin: '4px 0 4px' }}>Show us what happened</h2>
        <p style={{ color: T.muted, fontSize: 14, margin: '0 0 22px' }}>A voice note or photo helps us fix it faster</p>

        {/* Voice */}
        <button onClick={handleVoice} className="kz-press" style={{ width: '100%', background: voice === 'done' ? T.greenDim : voice === 'rec' ? 'rgba(239,68,68,0.08)' : T.elevated, border: `1px solid ${voice === 'done' ? 'rgba(34,197,94,0.3)' : voice === 'rec' ? 'rgba(239,68,68,0.3)' : T.border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', textAlign: 'left', boxSizing: 'border-box', marginBottom: 10, fontFamily: 'inherit', animation: voice === 'rec' ? 'kzGlow 1.5s ease infinite' : 'none' }}>
          <div style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0, background: voice === 'done' ? T.greenDim : 'rgba(239,68,68,0.14)', border: `2px solid ${voice === 'done' ? T.green : T.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, transition: 'transform 0.2s ease', transform: voice === 'rec' ? 'scale(1.08)' : 'scale(1)' }}>
            {voice === 'done' ? '✓' : voice === 'rec' ? '⏹' : '🎤'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: voice === 'done' ? T.green : T.text, fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
              {voice === 'done' ? 'Voice note recorded' : voice === 'rec' ? 'Recording… tap to stop' : 'Record a voice note'}
            </div>
            <div style={{ color: T.muted, fontSize: 13 }}>
              {voice === 'done' ? `${fmt(secs)} · tap to re-record` : 'Tap and speak about the issue'}
            </div>
          </div>
          {voice === 'rec' && (
            <span style={{ color: T.red, fontSize: 18, fontWeight: 700, fontVariantNumeric: 'tabular-nums', animation: 'kzBlink 1.2s ease infinite' }}>{fmt(secs)}</span>
          )}
        </button>

        <p style={{ color: T.muted, fontSize: 12, textAlign: 'center', margin: '10px 0' }}>or</p>

        {/* Photo */}
        <button onClick={() => setPhoto(p => !p)} style={{ width: '100%', background: photo ? T.greenDim : T.elevated, border: `1px solid ${photo ? 'rgba(34,197,94,0.3)' : T.border}`, borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', boxSizing: 'border-box', marginBottom: 10, fontFamily: 'inherit' }}>
          <span style={{ fontSize: 26 }}>{photo ? '✅' : '📷'}</span>
          <div style={{ color: photo ? T.green : T.text, fontSize: 15, fontWeight: 600 }}>{photo ? 'Photo added' : 'Add a photo or video'}</div>
          <div style={{ color: T.muted, fontSize: 13 }}>Take a photo or choose from gallery</div>
        </button>

        <p style={{ color: T.muted, fontSize: 12, textAlign: 'center', margin: '10px 0' }}>or type</p>

        <textarea value={note} onChange={e => setNote(e.target.value)} maxLength={250} placeholder="Describe the issue (optional)" style={{ width: '100%', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 14, padding: '14px 16px', color: T.text, fontSize: 14, fontFamily: 'inherit', resize: 'none', height: 90, outline: 'none', boxSizing: 'border-box', lineHeight: 1.5 }} />
        <p style={{ color: T.muted, fontSize: 12, textAlign: 'right', margin: '4px 0 0' }}>{note.length} / 250</p>
      </Scroller>

      <Footer>
        <PrimaryBtn label="Continue" onClick={() => onNext(proofLabel)} />
        <LinkBtn label="Skip — continue without proof" onClick={() => onNext(null)} />
      </Footer>
    </div>
  );
}

// ─── SCREEN 4: REVIEW & SUBMIT ────────────────────────────────────
function ReviewScreen({ catId, proof, onBack, onSubmit, onEditCat, onEditProof }) {
  const cat = getCat(catId);
  const rows = [
    { icon: '📍', label: 'Charger', value: `${CHARGER.id} — ${CHARGER.loc}`, onEdit: null },
    { icon: cat?.icon || '⚠️', label: 'Issue type', value: cat?.label || '—', onEdit: onEditCat },
    { icon: '🔗', label: 'Proof added', value: proof || 'None', onEdit: onEditProof },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <NavHeader title="Review & Submit" onBack={onBack} />
      <ProgressBar step={3} />
      <Scroller>
        <h2 style={{ color: T.text, fontSize: 24, fontWeight: 700, margin: '4px 0 4px' }}>Looks good?</h2>
        <p style={{ color: T.muted, fontSize: 14, margin: '0 0 22px' }}>Check your details then submit</p>

        <Card style={{ overflow: 'hidden', marginBottom: 14 }}>
          {rows.map((r, i) => (
            <div key={i} style={{ padding: '15px 18px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: i < rows.length - 1 ? `1px solid ${T.border}` : 'none' }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{r.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: T.muted, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', margin: '0 0 2px' }}>{r.label}</p>
                <p style={{ color: T.text, fontSize: 14, fontWeight: 500, margin: 0 }}>{r.value}</p>
              </div>
              {r.onEdit && <button onClick={r.onEdit} style={{ background: 'none', border: 'none', color: T.muted, fontSize: 14, cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Edit</button>}
            </div>
          ))}
        </Card>

        <Card style={{ padding: '16px 18px' }}>
          <p style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>After you submit</p>
          {[['📱', 'Ticket number sent via SMS.'], ['📞', 'Our team calls within 2 hours.'], ['📍', 'Track progress and reply in-app.']].map(([icon, label], i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < 2 ? 9 : 0 }}>
              <span style={{ fontSize: 15 }}>{icon}</span>
              <span style={{ color: T.muted, fontSize: 13, lineHeight: 1.55 }}>{label}</span>
            </div>
          ))}
        </Card>
      </Scroller>

      <Footer>
        <PrimaryBtn label="Submit Complaint" onClick={onSubmit} />
      </Footer>
    </div>
  );
}

// ─── SCREEN 5: SUCCESS ────────────────────────────────────────────
function SuccessScreen({ onHome, onView }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <div style={{ textAlign: 'center', padding: '8px 20px 0', flexShrink: 0 }}>
        <p style={{ color: T.muted, fontSize: 14, margin: '0 0 1px' }}>Ticket</p>
        <p style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: 0 }}>Raised</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 28px' }}>
        {/* Checkmark */}
        <div style={{ width: 90, height: 90, borderRadius: '50%', border: `2.5px solid ${T.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, animation: 'kzPop .45s cubic-bezier(.34,1.56,.64,1) both' }}>
          <div style={{ width: 66, height: 66, borderRadius: '50%', background: T.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700, color: '#fff' }}>✓</div>
        </div>

        <h1 style={{ color: T.green, fontSize: 36, fontWeight: 800, margin: '0 0 8px', animation: 'kzFadeUp .4s ease .15s both' }}>Done!</h1>
        <p style={{ color: T.muted, fontSize: 14, textAlign: 'center', lineHeight: 1.65, margin: '0 0 20px', animation: 'kzFadeUp .4s ease .22s both' }}>Your complaint has been logged.<br />We'll be in touch shortly.</p>

        <div style={{ background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 99, padding: '10px 28px', marginBottom: 22, textAlign: 'center', animation: 'kzFadeUp .4s ease .3s both' }}>
          <p style={{ color: T.muted, fontSize: 11, margin: '0 0 2px' }}>Ticket</p>
          <p style={{ color: T.text, fontSize: 18, fontWeight: 800, margin: 0 }}>IN-880731</p>
        </div>

        <Card style={{ width: '100%', padding: '16px 18px' }}>
          <p style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>What happens next</p>
          {['Our team will call you within 2 hours', 'If needed, an engineer will visit your site', 'Track progress and reply in the app'].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 2 ? 10 : 0 }}>
              <span style={{ color: T.muted, fontSize: 13, fontWeight: 600 }}>{i + 1}</span>
              <span style={{ color: T.muted, fontSize: 13, lineHeight: 1.55 }}>{s}</span>
            </div>
          ))}
        </Card>
      </div>

      <Footer>
        <PrimaryBtn label="Back to Home" onClick={onHome} />
        <GhostBtn label="View Ticket" onClick={onView} />
      </Footer>
    </div>
  );
}

// ─── SCREEN 6: TICKET STATUS ──────────────────────────────────────
function TicketStatusScreen({ ticket, onBack }) {
  const [msgs, setMsgs] = useState(ticket.messages);
  const [reply, setReply] = useState('');
  const isResolved = ticket.status === 'resolved';

  const send = () => {
    if (!reply.trim()) return;
    setMsgs(m => [...m, { from: 'me', text: reply, time: 'Just now' }]);
    setReply('');
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <NavHeader title="Ticket Status" onBack={onBack} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px 24px' }}>
        {/* Status pill */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ background: isResolved ? T.greenDim : T.blueDim, border: `1px solid ${isResolved ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.3)'}`, borderRadius: 99, padding: '6px 18px', display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: isResolved ? T.green : T.blue, animation: isResolved ? 'none' : 'kzBlink 1.3s ease infinite' }} />
            <span style={{ color: isResolved ? T.green : T.blue, fontSize: 13, fontWeight: 600 }}>{isResolved ? 'Resolved' : 'In Progress'}</span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <p style={{ color: T.muted, fontSize: 12, margin: '0 0 4px' }}>{ticket.id}</p>
          <h2 style={{ color: T.text, fontSize: 20, fontWeight: 700, margin: '0 0 4px', lineHeight: 1.3 }}>{ticket.label}</h2>
          <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>Raised {ticket.age}</p>
        </div>

        {/* Timeline */}
        <div style={{ paddingLeft: 28, marginBottom: 26, position: 'relative' }}>
          {ticket.timeline.map((step, i) => {
            const isActive = step.active;
            const isDone = step.done;
            const nextDone = ticket.timeline[i + 1]?.done;
            return (
              <div key={i} style={{ position: 'relative', paddingBottom: i < ticket.timeline.length - 1 ? 22 : 0 }}>
                {i < ticket.timeline.length - 1 && (
                  <div style={{ position: 'absolute', left: -22, top: 12, width: 2, height: '100%', background: isDone && nextDone ? T.green : T.border }} />
                )}
                <div style={{ position: 'absolute', left: -28, top: 1, width: 12, height: 12, borderRadius: '50%', background: isActive ? T.blue : isDone ? T.green : T.elevated, border: `2px solid ${isActive ? T.blue : isDone ? T.green : T.muted}`, boxShadow: isActive ? `0 0 10px ${T.blue}55` : 'none', animation: isActive ? 'kzBlink 1.6s ease infinite' : 'none' }} />
                <p style={{ color: isDone || isActive ? T.text : T.muted, fontSize: 15, fontWeight: isDone || isActive ? 600 : 400, margin: '0 0 2px' }}>{step.label}</p>
                {step.sub && <p style={{ color: T.muted, fontSize: 12, margin: '0 0 4px' }}>{step.sub}</p>}
                {step.note && <div style={{ background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 14px', marginTop: 6, color: T.muted, fontSize: 13, lineHeight: 1.55 }}>{step.note}</div>}
              </div>
            );
          })}
        </div>

        {/* Messages */}
        <p style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 14px' }}>Messages</p>
        {msgs.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start', marginBottom: 12, animation: 'kzFadeUp .25s ease both' }}>
            <div style={{ maxWidth: '80%' }}>
              <div style={{ background: msg.from === 'me' ? T.green : T.elevated, borderRadius: msg.from === 'me' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '10px 14px', color: msg.from === 'me' ? '#111' : T.text, fontSize: 14, lineHeight: 1.55 }}>{msg.text}</div>
              <p style={{ color: T.dim, fontSize: 11, margin: '4px 0 0', textAlign: msg.from === 'me' ? 'right' : 'left' }}>{msg.time}</p>
            </div>
          </div>
        ))}

        {/* Reply */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 99, padding: '7px 7px 7px 18px', marginTop: 4 }}>
          <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Reply…" style={{ flex: 1, background: 'none', border: 'none', color: T.text, fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
          <button onClick={send} className="kz-press" style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: reply.trim() ? T.green : T.surface, color: reply.trim() ? '#111' : T.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, transition: 'background 0.2s ease' }}>▶</button>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE PRIMITIVES ───────────────────────────────────────────
const Tile = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="kz-press" style={{ background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
    <span style={{ fontSize: 20 }}>{icon}</span>
    <span style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>{label}</span>
  </button>
);

const Row = ({ icon, label, badge, onClick, last }) => (
  <button onClick={onClick} className="kz-press" style={{ width: '100%', background: 'none', border: 'none', borderBottom: last ? 'none' : `1px solid ${T.border}`, padding: '15px 4px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
    <span style={{ fontSize: 16, width: 22, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
    <span style={{ flex: 1, color: T.text, fontSize: 15, fontWeight: 500 }}>{label}</span>
    {badge && <span style={{ background: T.purpleDim, color: T.purple, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99, whiteSpace: 'nowrap' }}>{badge}</span>}
    <span style={{ color: T.muted, fontSize: 18 }}>›</span>
  </button>
);

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 8px 4px' }}>
      <div style={{ width: 3, height: 14, background: T.purple, borderRadius: 99 }} />
      <span style={{ color: T.muted, fontSize: 13, fontWeight: 600 }}>{title}</span>
    </div>
    <Card style={{ padding: '2px 16px' }}>{children}</Card>
  </div>
);

// Kazam brand mark — the official logo PNG (src/assets/kazam-logo.png).
// `size` sets the height; width auto-scales to keep the aspect ratio.
const KazamLogo = ({ size = 20, style }) => (
  <img src={kazamLogo} alt="Kazam" style={{ height: size, width: 'auto', display: 'block', ...style }} />
);

// ─── SCREEN A: MAP HOME (app entry) ───────────────────────────────
function MapHomeScreen({ onProfile }) {
  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden', background: '#2A2A2A' }}>
      {/* faux map */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 36%, #343434 0%, #242424 58%, #1b1b1b 100%)' }}>
        <div style={{ position: 'absolute', top: '30%', left: '-10%', width: '120%', height: 14, background: '#3c3c3c', transform: 'rotate(-18deg)' }} />
        <div style={{ position: 'absolute', top: '46%', left: '-10%', width: '120%', height: 18, background: '#454545', transform: 'rotate(6deg)' }} />
        <div style={{ position: 'absolute', top: '8%', left: '12%', width: 9, height: '70%', background: '#383838', transform: 'rotate(12deg)' }} />
        <div style={{ position: 'absolute', top: '20%', right: '16%', width: 8, height: '60%', background: '#363636', transform: 'rotate(-10deg)' }} />
        <span style={{ position: 'absolute', top: '28%', left: '12%', color: '#777', fontSize: 11, transform: 'rotate(-18deg)' }}>1st A cross Rd</span>
        <span style={{ position: 'absolute', top: '48%', left: '30%', color: '#8a8a8a', fontSize: 12, transform: 'rotate(6deg)' }}>60 Feet Rd</span>
      </div>

      {/* center pin + user dot */}
      <div style={{ position: 'absolute', top: '33%', left: '50%', transform: 'translate(-50%,-50%)' }}>
        <div style={{ width: 38, height: 38, borderRadius: '50% 50% 50% 0', background: '#111', transform: 'rotate(45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px rgba(0,0,0,0.5)' }}>
          <KazamLogo size={16} style={{ transform: 'rotate(-45deg)' }} />
        </div>
      </div>
      <div style={{ position: 'absolute', top: '37%', left: '47%', width: 18, height: 18, borderRadius: '50%', background: T.blue, border: '3px solid #fff', boxShadow: '0 0 0 6px rgba(59,130,246,0.22)' }} />

      {/* top controls */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
        <StatusBar />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 16px 10px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(18,18,18,0.92)', border: `1px solid ${T.border}`, borderRadius: 99, padding: '12px 16px' }}>
            <span style={{ fontSize: 14 }}>🔍</span>
            <span style={{ color: T.muted, fontSize: 14 }}>Search chargers in 'Pune'</span>
          </div>
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(18,18,18,0.92)', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>🔔</div>
          <button onClick={onProfile} className="kz-press" style={{ width: 46, height: 46, borderRadius: '50%', background: '#eee', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>👤</button>
        </div>
        <div className="kz-scroll" style={{ display: 'flex', gap: 8, padding: '0 16px 4px', overflowX: 'auto' }}>
          {[['☰', 'Filters'], ['', 'Available'], ['◉', 'CCS'], ['◉', 'Type-7'], ['', '+10 more']].map(([ic, l], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(18,18,18,0.92)', border: `1px solid ${T.border}`, borderRadius: 99, padding: '9px 14px', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {ic && <span style={{ fontSize: 12, color: T.muted }}>{ic}</span>}
              <span style={{ color: T.text, fontSize: 13, fontWeight: 500 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* right floating buttons */}
      <div style={{ position: 'absolute', right: 16, top: '50%', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
        <div className="kz-press" style={{ width: 54, height: 54, borderRadius: '50%', background: '#111', border: `2px solid ${T.purple}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><KazamLogo size={24} /></div>
        <div className="kz-press" style={{ width: 48, height: 48, borderRadius: '50%', background: '#111', border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff' }}>◎</div>
      </div>

      {/* bottom group */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <div style={{ margin: '0 14px 10px', background: 'linear-gradient(90deg,#16A34A,#15803D)', borderRadius: 99, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🔌</span>
          <span style={{ flex: 1, color: '#fff', fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>Buy a Charger. Start Earning</span>
          <span style={{ background: '#fff', color: '#15803D', fontSize: 12, fontWeight: 700, padding: '8px 14px', borderRadius: 99, whiteSpace: 'nowrap' }}>Learn more</span>
        </div>

        <div style={{ background: T.surface, borderRadius: '20px 20px 0 0', padding: '10px 16px 6px', borderTop: `1px solid ${T.border}` }}>
          <div style={{ width: 40, height: 4, borderRadius: 99, background: T.dim, margin: '0 auto 12px' }} />
          <p style={{ color: T.text, fontSize: 18, fontWeight: 700, margin: '0 0 12px' }}>Nearby Chargers</p>
          <Card style={{ overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ background: T.greenDim, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.green }} />
              <span style={{ color: T.green, fontSize: 13, fontWeight: 600 }}>Available</span>
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><KazamLogo size={18} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: T.text, fontSize: 15, fontWeight: 600 }}>Test 4E</div>
                <div style={{ color: T.muted, fontSize: 12, margin: '2px 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>1st Cross Road, KHB Colony, Bangalore Division,…</div>
                <div style={{ color: T.muted, fontSize: 12 }}>↝ 0.0 km · ⭐ 5.0 · ₹ 1 Fixed/kWh</div>
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', background: T.surface, borderTop: `1px solid ${T.border}`, padding: '10px 8px 16px', position: 'relative' }}>
          {[['🏠', 'Home', true], ['🗺️', 'Trip Planner'], ['', 'Scan QR'], ['👛', 'Wallet'], ['⋯', 'More']].map(([ic, l, act], i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              {ic ? <span style={{ fontSize: 18, opacity: act ? 1 : 0.6 }}>{ic}</span> : <div style={{ height: 18 }} />}
              <span style={{ color: act ? T.text : T.muted, fontSize: 11, fontWeight: act ? 600 : 400 }}>{l}</span>
            </div>
          ))}
          <div className="kz-press" style={{ position: 'absolute', left: '50%', top: -26, transform: 'translateX(-50%)', width: 60, height: 60, borderRadius: '50%', background: T.purple, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(139,92,246,0.5)', cursor: 'pointer' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
              {[0, 1, 2, 3].map(n => <div key={n} style={{ width: 9, height: 9, borderRadius: 2, background: '#fff' }} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN B: PROFILE ────────────────────────────────────────────
function ProfileScreen({ onBack, onMyChargers }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '8px 16px 6px', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.text, fontSize: 24, cursor: 'pointer', padding: '0 8px 0 0', lineHeight: 1 }}>‹</button>
        <span style={{ color: T.text, fontSize: 17, fontWeight: 600 }}>Back</span>
      </div>
      <Scroller pb={28}>
        {/* profile card */}
        <Card style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.purpleDim, border: `1px solid ${T.purple}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.purple, fontSize: 22, fontWeight: 700, flexShrink: 0 }}>{USER.initial}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: T.text, fontSize: 18, fontWeight: 700 }}>{USER.name}</div>
            <div style={{ color: T.muted, fontSize: 13, marginTop: 2 }}>{USER.email}</div>
            <div style={{ color: T.muted, fontSize: 13 }}>{USER.phone}</div>
          </div>
        </Card>

        {/* refer & earn banner */}
        <Card style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, overflow: 'hidden' }}>
          <div style={{ flex: 1 }}>
            <div style={{ color: T.text, fontSize: 16, fontWeight: 700 }}>Refer & Earn</div>
            <div style={{ color: T.muted, fontSize: 12, margin: '4px 0 12px' }}>Refer your friends & Earn Rewards</div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.purple, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>→</div>
          </div>
          <div style={{ fontSize: 44 }}>🎁</div>
        </Card>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', margin: '0 0 18px' }}>
          <div style={{ width: 18, height: 5, borderRadius: 99, background: T.dim }} />
          <div style={{ width: 18, height: 5, borderRadius: 99, background: T.purple }} />
        </div>

        {/* 2x2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          <Tile icon="🛡️" label="My AMC" />
          <Tile icon="⚡" label="My Chargers" onClick={onMyChargers} />
          <Tile icon="💰" label="Earnings" />
          <Tile icon="🕘" label="Charging History" />
        </div>

        <Section title="Trip Planner">
          <Row icon="📍" label="Plan a trip" />
          <Row icon="🔖" label="My Trips" last />
        </Section>

        <Section title="Manage">
          <Row icon="🔌" label="Charger" onClick={onMyChargers} />
          <Row icon="❤️" label="Favourites" />
          <Row icon="🚗" label="Vehicles" />
          <Row icon="📅" label="Bookings" badge="Coming soon" />
          <Row icon="🔔" label="Notification and Alerts" />
          <Row icon="🌐" label="App Language" last />
        </Section>

        <Section title="Actions">
          <Row icon="👥" label="Refer & Earn" badge="✦ New" />
          <Row icon="⭐" label="Rate us on Play Store" />
          <Row icon="🔗" label="Share app" last />
        </Section>

        <Section title="Resources">
          <Row icon="🎧" label="Help and Support" />
          <Row icon="▶️" label="Tutorials" last />
        </Section>

        <Section title="Legal">
          <Row icon="🛡️" label="Privacy Policy" />
          <Row icon="🔁" label="Return policy" />
          <Row icon="📄" label="Terms of use" last />
        </Section>

        <GhostBtn label="Logout" />
        <p style={{ color: T.muted, fontSize: 12, textAlign: 'center', margin: '14px 0 2px' }}>Version: 6.10.0</p>
        <p style={{ color: T.red, fontSize: 12, textAlign: 'center', margin: 0 }}>Delete my account</p>
      </Scroller>
    </div>
  );
}

// ─── SCREEN C: MY CHARGERS ────────────────────────────────────────
function MyChargersScreen({ onBack, onCharger }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <StatusBar />
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px 6px', flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.text, fontSize: 24, cursor: 'pointer', padding: '0 10px 0 0', lineHeight: 1 }}>‹</button>
        <span style={{ flex: 1, color: T.text, fontSize: 18, fontWeight: 600 }}>My Chargers (1)</span>
        <span style={{ fontSize: 17 }}>🔍</span>
      </div>
      <Scroller>
        <button onClick={onCharger} className="kz-press" style={{ width: '100%', background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 16, padding: 10, display: 'flex', gap: 14, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', boxSizing: 'border-box' }}>
          <div style={{ width: 120, height: 120, borderRadius: 10, background: 'linear-gradient(135deg,#3a3327,#26211a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0 }}>🔌</div>
          <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
            <div style={{ color: T.muted, fontSize: 15 }}>{CHARGER.name}</div>
            <div style={{ color: T.text, fontSize: 18, fontWeight: 700, margin: '2px 0 8px' }}>ID - {CHARGER.id}</div>
            <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.5 }}>{CHARGER.addr}</div>
          </div>
        </button>
      </Scroller>
      <div className="kz-press" style={{ position: 'absolute', right: 22, bottom: 30, width: 60, height: 60, borderRadius: '50%', background: T.purple, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 30, cursor: 'pointer', boxShadow: '0 8px 24px rgba(139,92,246,0.4)' }}>+</div>
    </div>
  );
}

// ─── SCREEN D: CHARGER DETAIL (entry to Help & Support) ───────────
function ChargerDetailScreen({ onBack, onHelp }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <StatusBar />
      <NavHeader title="Charger Details" onBack={onBack} />
      <Scroller>
        <Card style={{ overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ height: 150, background: 'linear-gradient(135deg,#3a3327,#26211a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 54 }}>🔌</div>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.green, animation: 'kzPulse 2s ease-out infinite' }} />
              <span style={{ color: T.green, fontSize: 12, fontWeight: 600 }}>Online</span>
            </div>
            <div style={{ color: T.text, fontSize: 18, fontWeight: 700 }}>{CHARGER.name}</div>
            <div style={{ color: T.muted, fontSize: 13, margin: '2px 0 8px' }}>ID - {CHARGER.id}</div>
            <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.5 }}>{CHARGER.addr}</div>
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
          {[['⚡', 'Type-2', 'Connector'], ['🔋', '7.4 kW', 'Power'], ['⭐', '5.0', 'Rating']].map(([i, v, l], idx) => (
            <Card key={idx} style={{ padding: '14px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{i}</div>
              <div style={{ color: T.text, fontSize: 14, fontWeight: 700 }}>{v}</div>
              <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>{l}</div>
            </Card>
          ))}
        </div>

        <p style={{ color: T.muted, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '4px 4px 12px' }}>Manage Charger</p>
        <Card style={{ padding: '2px 16px', marginBottom: 16 }}>
          <Row icon="📊" label="Charging Sessions" />
          <Row icon="💰" label="Earnings" />
          <Row icon="⚙️" label="Charger Settings" last />
        </Card>

        {/* Help & Support — primary entry into the report flow */}
        <button onClick={onHelp} className="kz-press" style={{ width: '100%', background: T.amberDim, border: '1px solid rgba(245,158,11,0.25)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', textAlign: 'left', boxSizing: 'border-box', fontFamily: 'inherit' }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🎧</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: T.text, fontSize: 16, fontWeight: 600 }}>Help & Support</div>
            <div style={{ color: T.muted, fontSize: 13, marginTop: 2 }}>Facing an issue? Report it & get help</div>
          </div>
          <span style={{ color: T.muted, fontSize: 22 }}>›</span>
        </button>
      </Scroller>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('map');
  const [dir, setDir] = useState('fwd'); // drives slide direction
  const [catId, setCatId] = useState(null);
  const [proof, setProof] = useState(null);
  const [viewTicket, setViewTicket] = useState(null);

  // Inject Inter font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.cssText = 'margin:0;padding:0;background:#EDE4D3;min-height:100vh;display:flex;align-items:center;justify-content:center;';
  }, []);

  // Scale phone frame to fit viewport
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const calc = () => {
      const s = Math.min(1, (window.innerHeight - 20) / 844, (window.innerWidth - 20) / 390);
      setScale(Math.max(0.55, s));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const newTicket = {
    id: 'IN-880731', catId, label: getCat(catId)?.label || 'New issue',
    status: 'in-progress', age: 'just now',
    timeline: [
      { label: 'Ticket received',    sub: 'Just now', done: true },
      { label: 'Assigned to team',   sub: '' },
      { label: 'Engineer on the way',sub: '' },
      { label: 'Issue resolved',     sub: '' },
    ],
    messages: [
      { from: 'team', text: 'Your complaint has been received. Our team will call you within 2 hours.', time: 'Just now' },
    ],
  };

  // back = true → slide from the left, forward → slide from the right
  const go = (s, back = false) => { setDir(back ? 'back' : 'fwd'); setScreen(s); };

  return (
    <div style={{ width: '100vw', minHeight: '100vh', background: '#EDE4D3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <style>{ANIM}</style>
      <div style={{
        width: 390, height: 844,
        background: T.bg, borderRadius: 40,
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        boxShadow: '0 60px 140px rgba(0,0,0,0.95)',
        display: 'flex', flexDirection: 'column',
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}>
        {/* key={screen} remounts on every navigation so the slide animation replays */}
        <div key={screen} style={{ height: '100%', animation: `${dir === 'back' ? 'kzSlideBack' : 'kzSlideIn'} .26s ease both` }}>
          {screen === 'map' && <MapHomeScreen onProfile={() => go('profile')} />}
          {screen === 'profile' && <ProfileScreen onBack={() => go('map', true)} onMyChargers={() => go('mychargers')} />}
          {screen === 'mychargers' && <MyChargersScreen onBack={() => go('profile', true)} onCharger={() => go('chargerdetail')} />}
          {screen === 'chargerdetail' && <ChargerDetailScreen onBack={() => go('mychargers', true)} onHelp={() => go('help')} />}
          {screen === 'help' && <HelpScreen onBack={() => go('chargerdetail', true)} onReport={() => go('cat')} onTicket={t => { setViewTicket(t); go('status'); }} />}
          {screen === 'cat' && <CategoryScreen onBack={() => go('help', true)} onNext={id => { setCatId(id); go('details'); }} />}
          {screen === 'details' && <AddDetailsScreen onBack={() => go('cat', true)} onNext={p => { setProof(p); go('review'); }} />}
          {screen === 'review' && <ReviewScreen catId={catId} proof={proof} onBack={() => go('details', true)} onSubmit={() => go('success')} onEditCat={() => go('cat', true)} onEditProof={() => go('details', true)} />}
          {screen === 'success' && <SuccessScreen onHome={() => go('map', true)} onView={() => { setViewTicket(newTicket); go('status'); }} />}
          {screen === 'status' && viewTicket && <TicketStatusScreen ticket={viewTicket} onBack={() => go('help', true)} />}
        </div>
      </div>
    </div>
  );
}
