const STORAGE_KEY = "math-practice-history"

function loadHistory() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

import { useState, useEffect, useCallback, useRef } from "react";

const TOPICS = [
  { id: "addition", name: "Addition", icon: "➕", color: "#FF6B6B", desc: "Add numbers up to 10,000", levels: 5 },
  { id: "subtraction", name: "Subtraction", icon: "➖", color: "#4ECDC4", desc: "Subtract numbers up to 10,000", levels: 5 },
  { id: "multiplication", name: "Multiplication", icon: "✖️", color: "#FFE66D", desc: "Multiply up to 9×9 and beyond", levels: 5 },
  { id: "division", name: "Division", icon: "➗", color: "#A8E6CF", desc: "Divide with and without remainders", levels: 5 },
  { id: "fractions", name: "Fractions", icon: "🍕", color: "#DDA0DD", desc: "Understand and compare fractions", levels: 5 },
  { id: "money", name: "Money", icon: "💰", color: "#98D8C8", desc: "Add, subtract & make change", levels: 5 },
  { id: "measurement", name: "Length & Mass", icon: "📏", color: "#F7DC6F", desc: "Measure in m, cm, kg, g", levels: 5 },
  { id: "time", name: "Time", icon: "🕐", color: "#BB8FCE", desc: "Tell time & calculate duration", levels: 5 },
  { id: "geometry", name: "Geometry", icon: "📐", color: "#85C1E9", desc: "Angles, shapes & perimeter", levels: 5 },
  { id: "bar_models", name: "Bar Models", icon: "📊", color: "#F0B27A", desc: "Solve word problems visually", levels: 5 },
];

const CHEERS = [
  "Amazing job! 🌟", "You're a math star! ⭐", "Brilliant thinking! 🧠",
  "Keep it up, champion! 🏆", "You nailed it! 🎯", "Math wizard! 🪄",
  "Super brain power! 💪", "Fantastic work! 🎉", "You're getting stronger! 💫", "Awesome! 🚀",
];

const THINK_PROMPTS = [
  "Can you draw a picture to help?", "What do you already know?",
  "Break it into smaller parts!", "What would a bar model look like?",
  "Try working backwards!", "What's a simpler version?",
  "Estimate the answer first!", "What patterns do you notice?",
];

function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = rand(0, i); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function makeChoices(correct, lo, hi) {
  const s = new Set([correct]);
  let t = 0;
  while (s.size < 4 && t++ < 50) {
    const w = Math.random() < 0.4 ? correct + rand(-5, 5) : rand(Math.max(lo, correct - 20), Math.min(hi, correct + 20));
    if (w !== correct && w >= lo) s.add(w);
  }
  while (s.size < 4) s.add(correct + s.size * 7);
  return shuffle([...s]);
}

function genAdd(lv) {
  let a, b;
  if (lv <= 1) { a = rand(10, 99); b = rand(10, 99); }
  else if (lv <= 2) { a = rand(100, 999); b = rand(10, 99); }
  else if (lv <= 3) { a = rand(100, 999); b = rand(100, 999); }
  else if (lv <= 4) { a = rand(1000, 4999); b = rand(100, 999); }
  else { a = rand(1000, 9999); b = rand(1000, 9999); }
  const ans = a + b;
  const story = lv >= 3 ? `A school collected ${a.toLocaleString()} books in January and ${b.toLocaleString()} in February. How many books in total?` : null;
  return { q: story || `${a.toLocaleString()} + ${b.toLocaleString()} = ?`, ans, choices: makeChoices(ans, 0, 20000), hint: lv <= 2 ? `Break it up: ${a} + ${Math.floor(b/10)*10} + ${b%10}` : "Add thousands first, then hundreds, tens, ones.", think: "Can you add these a different way? Try a number line!", type: "num" };
}
function genSub(lv) {
  let a, b;
  if (lv <= 1) { a = rand(20, 99); b = rand(10, a-1); }
  else if (lv <= 2) { a = rand(100, 999); b = rand(10, 99); }
  else if (lv <= 3) { a = rand(200, 999); b = rand(100, a-1); }
  else if (lv <= 4) { a = rand(1000, 5000); b = rand(100, 999); }
  else { a = rand(2000, 10000); b = rand(1000, a-1); }
  const ans = a - b;
  const story = lv >= 3 ? `A shop had ${a.toLocaleString()} items. ${b.toLocaleString()} were sold. How many left?` : null;
  return { q: story || `${a.toLocaleString()} − ${b.toLocaleString()} = ?`, ans, choices: makeChoices(ans, 0, 10000), hint: `What do you add to ${b.toLocaleString()} to get ${a.toLocaleString()}?`, think: `Check: answer + ${b} should = ${a}!`, type: "num" };
}
function genMul(lv) {
  let a, b;
  if (lv <= 1) { a = rand(2, 5); b = rand(2, 5); }
  else if (lv <= 2) { a = rand(2, 9); b = rand(2, 9); }
  else if (lv <= 3) { a = rand(6, 9); b = rand(6, 9); }
  else if (lv <= 4) { a = rand(10, 20); b = rand(2, 9); }
  else { a = rand(11, 99); b = rand(2, 9); }
  const ans = a * b;
  const story = lv >= 2 ? `${a} bags with ${b} apples each. How many apples?` : null;
  return { q: story || `${a} × ${b} = ?`, ans, choices: makeChoices(ans, 0, 1000), hint: `${a} × ${b} = ${a} groups of ${b}. Skip count!`, think: `Does ${a}×${b} = ${b}×${a}? Why?`, type: "num" };
}
function genDiv(lv) {
  let d, qt;
  if (lv <= 1) { d = rand(2, 5); qt = rand(2, 5); }
  else if (lv <= 2) { d = rand(2, 9); qt = rand(2, 9); }
  else if (lv <= 3) { d = rand(3, 9); qt = rand(5, 12); }
  else if (lv <= 4) { d = rand(2, 9); qt = rand(10, 30); }
  else { d = rand(4, 9); qt = rand(10, 99); }
  const dv = d * qt + (lv >= 4 ? rand(0, d-1) : 0);
  const ans = Math.floor(dv / d);
  return { q: `${dv} ÷ ${d} = ?`, ans, choices: makeChoices(ans, 0, 500), hint: `${d} × ? is close to ${dv}`, think: "Write a multiplication fact for this!", type: "num" };
}
function genFrac(lv) {
  if (lv <= 2) {
    const den = [2,3,4,5,6,8][rand(0,5)], num = rand(1, den-1);
    return { q: `What fraction is shaded? (${num} of ${den} parts)`, ans: num, choices: makeChoices(num, 1, den+3), hint: "Count shaded parts. Bottom = total parts.", think: "Shade one more — what fraction now?", type: "num", fracVis: { num, den } };
  }
  if (lv <= 3) {
    const den = [3,4,5,6,8][rand(0,4)], n1 = rand(1, den-2), n2 = rand(1, den-n1), ans = n1+n2;
    return { q: `${n1}/${den} + ${n2}/${den} = ?/${den}`, ans, choices: makeChoices(ans, 1, den+3), hint: "Same denominator? Just add numerators!", think: "Can you simplify the answer?", type: "num" };
  }
  const pairs = [[2,4],[2,6],[3,6],[2,8],[4,8]];
  const [sm, bg] = pairs[rand(0, pairs.length-1)];
  const en = rand(1, Math.max(1, sm-1)), ans = en * (bg/sm);
  return { q: `${en}/${sm} = ?/${bg}`, ans, choices: makeChoices(ans, 1, bg), hint: "Multiply top and bottom by the same number!", think: "Find more equivalent fractions!", type: "num" };
}
function genMoney(lv) {
  if (lv <= 2) {
    const d1 = rand(1,9), c1 = rand(10,95), d2 = rand(1,5), c2 = rand(10,90);
    const tot = d1*100+c1+d2*100+c2, dol = Math.floor(tot/100), cen = tot%100;
    const a = `$${dol}.${String(cen).padStart(2,"0")}`;
    return { q: `$${d1}.${String(c1).padStart(2,"0")} + $${d2}.${String(c2).padStart(2,"0")} = ?`, ans: a,
      choices: shuffle([a, `$${dol+1}.${String((cen+10)%100).padStart(2,"0")}`, `$${Math.max(0,dol-1)}.${String(Math.abs(cen-15)%100).padStart(2,"0")}`, `$${dol}.${String((cen+25)%100).padStart(2,"0")}`]),
      hint: "Add dollars first, then cents. Regroup if cents > 99!", think: "How much change from a bigger note?", type: "txt" };
  }
  const price = rand(3,20), paid = price + rand(2,10), change = paid - price;
  return { q: `Buy for $${price}, pay $${paid}. Change?`, ans: `$${change}`,
    choices: shuffle([`$${change}`, `$${change+1}`, `$${Math.max(0,change-1)}`, `$${change+2}`]),
    hint: "Count up from the price!", think: "What coins make this change?", type: "txt" };
}
function genMeas(lv) {
  if (lv <= 2) {
    const m = rand(1,9), cm = rand(10,90), ans = m*100+cm;
    return { q: `${m} m ${cm} cm = ? cm`, ans, choices: makeChoices(ans, 100, 2000), hint: `1 m = 100 cm. So ${m} m = ${m*100} cm.`, think: `How many cm is ${m+1} m ${cm} cm?`, type: "num" };
  }
  if (lv <= 3) {
    const kg = rand(1,9), g = rand(100,900), ans = kg*1000+g;
    return { q: `${kg} kg ${g} g = ? g`, ans, choices: makeChoices(ans, 1000, 15000), hint: "1 kg = 1000 g. Convert then add!", think: `Which is heavier: this or ${ans+100} g?`, type: "num" };
  }
  const l1m = rand(2,8), l1c = rand(10,80), l2m = rand(1,5), l2c = rand(10,80), ans = (l1m*100+l1c)+(l2m*100+l2c);
  return { q: `${l1m} m ${l1c} cm + ${l2m} m ${l2c} cm = ? cm total`, ans, choices: makeChoices(ans, 100, 2000), hint: "Add m and cm separately. Regroup if cm ≥ 100!", think: "Convert everything to cm first!", type: "num" };
}
function genTime(lv) {
  if (lv <= 2) {
    const h = rand(1,12), m = [0,5,10,15,20,25,30,35,40,45,50,55][rand(0,11)];
    const a = `${h}:${String(m).padStart(2,"0")}`;
    return { q: `Hour hand near ${h}, minute hand at ${m===0?12:m/5}. Time?`, ans: a,
      choices: shuffle([a, `${(h%12)+1}:${String(m).padStart(2,"0")}`, `${h}:${String((m+15)%60).padStart(2,"0")}`, `${h}:${String((m+30)%60).padStart(2,"0")}`]),
      hint: "Short hand = hours, long hand = minutes!", think: "What time in 45 minutes?", type: "txt" };
  }
  const sH = rand(8,14), sM = rand(0,3)*15, dH = rand(0,3), dM = rand(1,3)*15;
  const tot = sH*60+sM+dH*60+dM, eH = Math.floor(tot/60), eM = tot%60;
  const disp = `${eH>12?eH-12:eH}:${String(eM).padStart(2,"0")} ${eH>=12?"PM":"AM"}`;
  return { q: `Start: ${sH>12?sH-12:sH}:${String(sM).padStart(2,"0")} ${sH>=12?"PM":"AM"}. +${dH}h ${dM}min. End?`, ans: disp,
    choices: shuffle([disp, `${eH>12?eH-12:eH}:${String((eM+15)%60).padStart(2,"0")} ${eH>=12?"PM":"AM"}`, `${(eH>12?eH-12:eH)+1}:${String(eM).padStart(2,"0")} ${eH>=12?"PM":"AM"}`, `${eH>12?eH-12:eH}:${String((eM+30)%60).padStart(2,"0")} ${eH>=12?"PM":"AM"}`]),
    hint: "Add hours first, then minutes!", think: "What if 30 min longer?", type: "txt" };
}
function genGeo(lv) {
  if (lv <= 2) {
    const sh = [{ n:"Triangle", a:3 },{ n:"Rectangle", a:4 },{ n:"Pentagon", a:5 },{ n:"Hexagon", a:6 }][rand(0,3)];
    return { q: `How many sides does a ${sh.n} have?`, ans: sh.a, choices: makeChoices(sh.a, 3, 8), hint: `Think about the prefix of "${sh.n}"!`, think: "Find this shape around your house!", type: "num" };
  }
  if (lv <= 4) {
    const n = rand(3,4), sides = Array.from({length:n}, ()=>rand(3,15));
    if (n===4 && Math.random()>0.5) { sides[2]=sides[0]; sides[3]=sides[1]; }
    const ans = sides.reduce((s,v)=>s+v,0);
    return { q: `Find the perimeter: ${sides.join(" cm, ")} cm`, ans, choices: makeChoices(ans, 5, 80), hint: "Perimeter = add all sides!", think: "If each side +1 cm, new perimeter?", type: "num" };
  }
  const types = ["right angle","acute angle","obtuse angle"];
  const idx = rand(0,2), deg = idx===0?90:idx===1?rand(20,80):rand(100,170);
  return { q: `${deg}° is called a ______ angle.`, ans: types[idx], choices: shuffle([...types, "straight angle"]), hint: "Right=90°, <90°=acute, >90°=obtuse", think: "Make this angle with your arms!", type: "txt" };
}
function genBar(lv) {
  const ns = ["Ali","Mei","Sam","Ravi","Siti"], ns2 = ["Ben","Lina","Tom","Priya","Wei"];
  if (lv <= 2) {
    const a = rand(20,80), b = rand(20,80), tot = a+b;
    const w = ns[rand(0,4)], w2 = ns2[rand(0,4)];
    return { q: `${w} has ${a} stickers. ${w2} has ${b}. How many altogether?`, ans: tot, choices: makeChoices(tot, 20, 300), hint: `Bar model: one bar for each person. Total = both bars!`, think: `If ${w} gives 10 to ${w2}, same total?`, type: "num", bar: { parts: [a,b], labels: [w, w2] } };
  }
  if (lv <= 3) {
    const tot = rand(100,500), diff = rand(20,80), sm = Math.floor((tot-diff)/2), bg = sm+diff;
    const w = ns[rand(0,4)], w2 = ns2[rand(0,4)];
    return { q: `${w} and ${w2} have ${tot} marbles. ${w} has ${diff} more. How many does ${w2} have?`, ans: sm, choices: makeChoices(sm, 20, 400), hint: `Remove ${diff}, then split evenly!`, think: "Write this as an equation!", type: "num", bar: { parts: [sm, bg], labels: [w2, w] } };
  }
  const mult = rand(2,5), sm = rand(15,50), bg = sm*mult, tot = sm+bg;
  return { q: `Shop A sold ${mult}× as many cakes as Shop B. Total: ${tot}. Shop B sold?`, ans: sm, choices: makeChoices(sm, 10, 200), hint: `Draw ${mult+1} equal parts. Total ÷ ${mult+1} = 1 part.`, think: `What if ${mult+1}× instead?`, type: "num" };
}

const GEN = { addition: genAdd, subtraction: genSub, multiplication: genMul, division: genDiv, fractions: genFrac, money: genMoney, measurement: genMeas, time: genTime, geometry: genGeo, bar_models: genBar };
function xpFor(lv) { return lv * 100 + (lv-1) * 50; }
function petStage(xp) {
  if (xp < 200) return { e: "🥚", n: "Egg", t: "Hatch me with XP!" };
  if (xp < 600) return { e: "🐣", n: "Chick", t: "I'm growing!" };
  if (xp < 1500) return { e: "🐥", n: "Bird", t: "Watch me fly!" };
  if (xp < 3000) return { e: "🦅", n: "Eagle", t: "Soaring high!" };
  if (xp < 6000) return { e: "🦉", n: "Wise Owl", t: "Knowledge is power!" };
  return { e: "🐉", n: "Math Dragon", t: "Legendary!" };
}

const INIT = { xp:0, level:1, streak:0, best:0, correct:0, answered:0, coins:0, tp:{}, rq:[], dl:{}, lastDay:null, days:0 };

export default function App() {
  const [D, setD] = useState(INIT);
  const [scr, setScr] = useState("home");
  const [topic, setTopic] = useState(null);
  const [lvl, setLvl] = useState(1);
  const [qs, setQs] = useState([]);
  const [ci, setCi] = useState(0);
  const [pick, setPick] = useState(null);
  const [done, setDone] = useState(false);
  const [hint, setHint] = useState(false);
  const [deep, setDeep] = useState(false);
  const [stats, setStats] = useState({ c: 0, t: 0, xp: 0 });
  const [combo, setCombo] = useState(0);
  const [celeb, setCeleb] = useState(false);
  const [timer, setTimer] = useState(0);
  const [rev, setRev] = useState(false);
  const [ak, setAk] = useState(0);
  const tr = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("sg-math-3b");
        if (r?.value) setD(JSON.parse(r.value));
      } catch(e) {}
    })();
  }, []);

  const save = useCallback(async (nd) => {
    setD(nd);
    try { await window.storage.set("sg-math-3b", JSON.stringify(nd)); } catch(e) {}
  }, []);

  useEffect(() => {
    if (scr === "quiz") { tr.current = setInterval(() => setTimer(t => t+1), 1000); return () => clearInterval(tr.current); }
    clearInterval(tr.current);
  }, [scr]);

  const today = new Date().toDateString();
  const todayMin = Math.floor((D.dl?.[today]||0)/60);
  const goal = 20;
  const totalXp = (D.xp||0) + ((D.level||1)-1)*150;
  const pet = petStage(totalXp);
  const revCt = (D.rq||[]).filter(r => new Date(r.rd) <= new Date()).length;

  function go(tp, lv, isRev=false) {
    setTopic(tp); setLvl(lv); setRev(isRev);
    let questions;
    if (isRev) {
      questions = (D.rq||[]).slice(0,8).map(r => ({ ...(GEN[r.tid]||genAdd)(r.lv), rid: r.id }));
      if (!questions.length) { setScr("home"); return; }
    } else {
      questions = Array.from({length:8}, () => (GEN[tp.id]||genAdd)(lv));
    }
    setQs(questions); setCi(0); setPick(null); setDone(false);
    setHint(false); setDeep(false); setStats({c:0,t:0,xp:0});
    setCombo(0); setTimer(0); setScr("quiz"); setAk(k=>k+1);
  }

  function answer(val) {
    if (done) return;
    setPick(val); setDone(true);
    const q = qs[ci];
    const ok = val === q.ans;
    const nc = ok ? combo+1 : 0;
    setCombo(nc);
    let xg = ok ? 15 : 2;
    if (nc >= 3) xg += 5;
    if (nc >= 5) xg += 10;
    if (!hint && ok) xg += 5;
    if (ok && nc >= 5) { setCeleb(true); setTimeout(() => setCeleb(false), 2000); }
    setStats(s => ({ c: s.c+(ok?1:0), t: s.t+1, xp: s.xp+xg }));
    const n = { ...D };
    n.xp = (n.xp||0)+xg; n.coins = (n.coins||0)+(ok?3:1); n.answered = (n.answered||0)+1;
    if (ok) { n.correct = (n.correct||0)+1; n.streak = (n.streak||0)+1; n.best = Math.max(n.best||0, n.streak); }
    else {
      n.streak = 0;
      n.rq = [...(n.rq||[]), { id: Date.now(), tid: topic.id, lv, q: q.q, ad: today, rd: new Date(Date.now()+86400000).toDateString() }];
    }
    const tp = { ...(n.tp||{}) }; const key = rev ? "review" : topic.id;
    if (!tp[key]) tp[key] = {};
    if (!tp[key][lv]) tp[key][lv] = { c:0, t:0 };
    tp[key][lv] = { c: tp[key][lv].c+(ok?1:0), t: tp[key][lv].t+1 };
    n.tp = tp;
    const dl = { ...(n.dl||{}) }; dl[today] = (dl[today]||0)+3; n.dl = dl;
    const needed = xpFor(n.level||1);
    if (n.xp >= needed) { n.level = (n.level||1)+1; n.xp -= needed; }
    if (n.lastDay !== today) {
      const yd = new Date(Date.now()-86400000).toDateString();
      n.days = n.lastDay === yd ? (n.days||0)+1 : 1; n.lastDay = today;
    }
    if (rev && ok && q.rid) n.rq = (n.rq||[]).filter(r => r.id !== q.rid);
    save(n);
  }

  function next() {
    if (ci+1 >= qs.length) { setScr("results"); return; }
    setCi(c=>c+1); setPick(null); setDone(false); setHint(false); setDeep(false); setAk(k=>k+1);
  }

  const xpPct = Math.min(((D.xp||0)/xpFor(D.level||1))*100, 100);
  const dayPct = Math.min((todayMin/goal)*100, 100);

  // Shared button styles
  const pill = (bg, border, color) => ({ background: bg, border: `1px solid ${border}`, color, borderRadius: 14, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 });

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "linear-gradient(165deg, #0f0c29 0%, #1a1a4e 40%, #24243e 100%)", fontFamily: "'Nunito', sans-serif", color: "#fff", position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse { 0%{transform:translateX(-50%) scale(.8);opacity:0} 100%{transform:translateX(-50%) scale(1);opacity:1} }
        @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes slideIn { from{transform:translateX(30px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes celebrate { 0%{transform:scale(0)} 50%{transform:scale(1.3)} 100%{transform:scale(1)} }
        @keyframes confetti { 0%{transform:translateY(0) rotate(0);opacity:1} 100%{transform:translateY(400px) rotate(720deg);opacity:0} }
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent} button{font-family:inherit} button:active{transform:scale(.97)}
      `}</style>

      <div style={{ position:"absolute",top:-100,right:-100,width:300,height:300,borderRadius:"50%",background:"radial-gradient(circle,rgba(102,126,234,.15) 0%,transparent 70%)",pointerEvents:"none" }}/>
      <div style={{ position:"absolute",bottom:-80,left:-80,width:250,height:250,borderRadius:"50%",background:"radial-gradient(circle,rgba(240,147,251,.1) 0%,transparent 70%)",pointerEvents:"none" }}/>

      <div style={{ padding:"12px 16px 24px", position:"relative", zIndex:1 }}>

        {/* ═══════ HOME ═══════ */}
        {scr === "home" && <>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,padding:"8px 0" }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{ width:44,height:44,borderRadius:22,background:"linear-gradient(135deg,#667eea,#764ba2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:"0 4px 15px rgba(102,126,234,.4)" }}>{pet.e}</div>
              <div>
                <div style={{ fontSize:15,fontWeight:800 }}>Math Explorer</div>
                <div style={{ background:"rgba(255,255,255,.1)",borderRadius:12,padding:"2px 10px",fontSize:11,fontWeight:700,display:"inline-block" }}>Lv. {D.level||1}</div>
              </div>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(255,215,0,.15)",borderRadius:20,padding:"6px 14px",fontSize:14,fontWeight:700,color:"#FFD700" }}>🪙 {D.coins||0}</div>
          </div>

          <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:4 }}>
            <span>Level {D.level||1}</span><span>{D.xp||0}/{xpFor(D.level||1)} XP</span>
          </div>
          <div style={{ width:"100%",height:8,background:"rgba(255,255,255,.1)",borderRadius:4,marginBottom:20,overflow:"hidden" }}>
            <div style={{ height:"100%",borderRadius:4,background:"linear-gradient(90deg,#667eea,#764ba2,#f093fb)",width:`${xpPct}%`,transition:"width .6s" }}/>
          </div>

          <div style={{ textAlign:"center",padding:"12px 0",marginBottom:8 }}>
            <span style={{ fontSize:56,display:"block",marginBottom:4,animation:"float 3s ease-in-out infinite" }}>{pet.e}</span>
            <div style={{ fontSize:13,fontWeight:700,color:"rgba(255,255,255,.7)" }}>{pet.n} — {pet.t}</div>
          </div>

          <div style={{ background:"linear-gradient(135deg,rgba(102,126,234,.3),rgba(118,75,162,.3))",borderRadius:20,padding:20,marginBottom:20,border:"1px solid rgba(255,255,255,.1)",position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:50,background:"rgba(102,126,234,.3)",filter:"blur(30px)" }}/>
            <div style={{ display:"flex",alignItems:"center",gap:16,position:"relative" }}>
              <div style={{ position:"relative",width:60,height:60 }}>
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="4"/>
                  <circle cx="30" cy="30" r="26" fill="none" stroke={todayMin>=goal?"#2ed573":"#667eea"} strokeWidth="4" strokeDasharray={`${dayPct*1.63} 163`} strokeLinecap="round" transform="rotate(-90 30 30)" style={{transition:"stroke-dasharray .6s"}}/>
                </svg>
                <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:16,fontWeight:800 }}>{todayMin>=goal?"✅":`${todayMin}m`}</div>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15,fontWeight:800,marginBottom:4 }}>{todayMin>=goal?"Daily Goal Complete! 🎉":"Daily Mission"}</div>
                <div style={{ fontSize:12,color:"rgba(255,255,255,.5)" }}>{todayMin>=goal?"Great habits!": `${goal-todayMin} more minutes to go`}</div>
              </div>
            </div>
            {(D.days||0)>1 && <div style={{ background:"linear-gradient(135deg,rgba(255,165,0,.2),rgba(255,69,0,.2))",borderRadius:16,padding:12,marginTop:12,display:"flex",alignItems:"center",gap:12,border:"1px solid rgba(255,165,0,.2)" }}>
              <span style={{fontSize:28}}>🔥</span>
              <div><div style={{fontSize:14,fontWeight:800}}>{D.days} Day Streak!</div><div style={{fontSize:11,color:"rgba(255,255,255,.5)"}}>Keep going!</div></div>
            </div>}
          </div>

          {revCt > 0 && <div onClick={() => go({id:"review",name:"Review",icon:"📝"},1,true)} style={{ background:"linear-gradient(135deg,#ff6b6b,#ee5a24)",borderRadius:20,padding:"14px 20px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",boxShadow:"0 4px 15px rgba(255,107,107,.3)" }}>
            <div><div style={{fontSize:14,fontWeight:800}}>📝 Review Time!</div><div style={{fontSize:11,opacity:.8}}>{revCt} problems to revisit</div></div>
            <div style={{fontSize:22}}>→</div>
          </div>}

          <div style={{ display:"flex",gap:10,marginBottom:20 }}>
            {[{l:"Correct",v:D.correct||0,i:"✓"},{l:"Best Streak",v:D.best||0,i:"🔥"},{l:"Accuracy",v:D.answered?Math.round((D.correct/D.answered)*100):0,i:"🎯",s:"%"}].map((s,i)=>
              <div key={i} style={{ flex:1,background:"rgba(255,255,255,.05)",borderRadius:14,padding:"12px 8px",textAlign:"center",border:"1px solid rgba(255,255,255,.06)" }}>
                <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:4}}>{s.i} {s.l}</div>
                <div style={{fontSize:20,fontWeight:800}}>{s.v}{s.s||""}</div>
              </div>
            )}
          </div>

          <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>Topics</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.5)",marginBottom:16}}>Singapore Math — Dimensions 3B</div>
          {TOPICS.map(t => {
            const tp = D.tp?.[t.id]||{};
            const td = Object.values(tp).reduce((s,v)=>s+(v?.t||0),0);
            return <div key={t.id} onClick={()=>{setTopic(t);setScr("levels")}} style={{ background:"rgba(255,255,255,.06)",borderRadius:16,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:14,border:"1px solid rgba(255,255,255,.06)",cursor:"pointer" }}>
              <div style={{ width:48,height:48,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,background:`${t.color}22`,border:`1px solid ${t.color}44` }}>{t.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700,marginBottom:2}}>{t.name}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.45)"}}>{t.desc}</div>
                {td>0 && <div style={{fontSize:10,color:t.color,marginTop:4,fontWeight:700}}>{td} solved</div>}
              </div>
              <div style={{fontSize:18,color:"rgba(255,255,255,.3)"}}>›</div>
            </div>;
          })}
          <div style={{height:40}}/>
        </>}

        {/* ═══════ LEVELS ═══════ */}
        {scr === "levels" && topic && <>
          <button onClick={()=>setScr("home")} style={{ background:"rgba(255,255,255,.1)",border:"none",color:"#fff",borderRadius:12,padding:"8px 14px",fontSize:14,cursor:"pointer",fontWeight:600,marginBottom:16 }}>← Back</button>
          <div style={{textAlign:"center",marginBottom:24}}>
            <div style={{fontSize:48,marginBottom:8}}>{topic.icon}</div>
            <div style={{fontSize:22,fontWeight:800}}>{topic.name}</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.5)"}}>{topic.desc}</div>
          </div>
          <div style={{fontSize:17,fontWeight:800,marginBottom:4}}>Select Level</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.4)",marginBottom:16}}>Master each level to unlock the next!</div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20 }}>
            {Array.from({length:topic.levels},(_,i)=>{
              const l=i+1, tp=D.tp?.[topic.id]||{}, st=tp[l]||{c:0,t:0}, pr=tp[l-1]||{c:0,t:0};
              const unlk=l===1||pr.c>=5, mast=st.c>=8;
              return <button key={l} onClick={()=>unlk&&go(topic,l)} style={{ aspectRatio:"1",borderRadius:14,border:"1px solid rgba(255,255,255,.1)",background:mast?"rgba(46,213,115,.2)":unlk?"rgba(255,255,255,.06)":"rgba(255,255,255,.02)",color:unlk?"#fff":"rgba(255,255,255,.2)",fontSize:18,fontWeight:700,cursor:unlk?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column" }}>
                {mast?"⭐":unlk?l:"🔒"}
                {st.t>0 && <div style={{fontSize:8,marginTop:2,color:"rgba(255,255,255,.4)"}}>{st.c}/{st.t}</div>}
              </button>;
            })}
          </div>
          <div style={{ background:"rgba(255,255,255,.05)",borderRadius:16,padding:16 }}>
            <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>💡 Singapore Math Tip</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.6)",lineHeight:1.7}}>
              {topic.id==="bar_models"?"Bar models help you SEE the problem. Draw bars for numbers, find what's missing!":
               topic.id==="fractions"?"Fractions = parts of a whole. Think pizza slices!":
               topic.id==="multiplication"?"Multiplication = repeated addition. 4×3 = 4 groups of 3!":
               "Take your time. Understanding beats speed!"}
            </div>
          </div>
        </>}

        {/* ═══════ QUIZ ═══════ */}
        {scr === "quiz" && qs.length > 0 && (()=>{
          const q = qs[ci], ok = done && pick === q.ans;
          return <div key={ak}>
            {combo>=3 && !done && <div style={{ position:"fixed",top:80,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#f093fb,#f5576c)",borderRadius:20,padding:"8px 20px",fontSize:14,fontWeight:800,zIndex:100,animation:"pulse .5s",boxShadow:"0 4px 20px rgba(240,147,251,.4)" }}>🔥 {combo}× Combo!</div>}

            {celeb && <div style={{ position:"fixed",inset:0,zIndex:200,pointerEvents:"none" }}>
              {Array.from({length:20}).map((_,i)=><div key={i} style={{ position:"absolute",left:`${rand(10,90)}%`,top:`${rand(0,30)}%`,fontSize:rand(16,32),animation:`confetti ${rand(10,25)/10}s ease-out forwards`,animationDelay:`${i*.05}s` }}>{["⭐","🌟","✨","💫","🎉","🏆"][rand(0,5)]}</div>)}
            </div>}

            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
              <button onClick={()=>setScr("home")} style={{ background:"rgba(255,255,255,.1)",border:"none",color:"#fff",borderRadius:12,padding:"8px 14px",fontSize:14,cursor:"pointer",fontWeight:600 }}>✕</button>
              <div style={{display:"flex",gap:6}}>
                {qs.map((_,i)=><div key={i} style={{ width:i===ci?24:10,height:10,borderRadius:5,background:i<ci?"linear-gradient(135deg,#667eea,#764ba2)":i===ci?"#fff":"rgba(255,255,255,.15)",transition:"all .3s" }}/>)}
              </div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.4)",fontWeight:700}}>{Math.floor(timer/60)}:{String(timer%60).padStart(2,"0")}</div>
            </div>

            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16 }}>
              <span style={{fontSize:14}}>{topic?.icon}</span>
              <span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.6)"}}>{rev?"Review Session":`${topic?.name} · Level ${lvl}`}</span>
            </div>

            <div style={{ background:"rgba(255,255,255,.07)",borderRadius:24,padding:24,marginBottom:20,border:"1px solid rgba(255,255,255,.08)",minHeight:120,animation:"slideIn .3s" }}>
              <div style={{fontSize:18,fontWeight:700,lineHeight:1.5,textAlign:"center"}}>{q.q}</div>
              {q.bar && <div style={{ marginTop:16,padding:12,background:"rgba(255,255,255,.05)",borderRadius:12 }}>
                <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:8,textAlign:"center"}}>📊 Bar Model</div>
                <div style={{display:"flex",gap:4,height:28}}>
                  {q.bar.parts.map((p,i)=><div key={i} style={{ flex:p,background:i===0?"rgba(102,126,234,.4)":"rgba(240,147,251,.4)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700 }}>{q.bar.labels?.[i]||"?"}</div>)}
                </div>
              </div>}
              {q.fracVis && <div style={{ display:"flex",justifyContent:"center",gap:4,marginTop:16 }}>
                {Array.from({length:q.fracVis.den}).map((_,i)=><div key={i} style={{ width:36,height:36,borderRadius:8,background:i<q.fracVis.num?"rgba(102,126,234,.6)":"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.15)" }}/>)}
              </div>}
            </div>

            {!done && <div style={{ display:"flex",gap:10,marginBottom:16 }}>
              <button onClick={()=>setHint(!hint)} style={pill("rgba(255,215,0,.15)","rgba(255,215,0,.3)","#FFD700")}>💡 {hint?"Hide":"Hint?"}</button>
              <button onClick={()=>setDeep(!deep)} style={pill("rgba(102,126,234,.15)","rgba(102,126,234,.3)","#a8b5ff")}>🧠 Think Deeper</button>
            </div>}
            {hint && <div style={{ background:"rgba(255,215,0,.08)",border:"1px solid rgba(255,215,0,.2)",borderRadius:16,padding:16,marginBottom:12,fontSize:14,lineHeight:1.6,color:"rgba(255,255,255,.85)" }}>💡 <strong>Hint:</strong> {q.hint}</div>}
            {deep && <div style={{ background:"rgba(102,126,234,.1)",border:"1px solid rgba(102,126,234,.2)",borderRadius:16,padding:16,marginBottom:12,fontSize:14,lineHeight:1.6,color:"rgba(255,255,255,.8)" }}>🧠 <strong>Think:</strong> {q.think}</div>}
            {!done && !hint && <div style={{fontSize:12,color:"rgba(255,255,255,.3)",textAlign:"center",marginBottom:12,fontStyle:"italic"}}>{THINK_PROMPTS[ci%THINK_PROMPTS.length]}</div>}

            <div style={{marginTop:12}}>
              {q.choices.map((ch,i)=>{
                const isSel = pick===ch, isAns = ch===q.ans;
                let bg="rgba(255,255,255,.06)", bc="rgba(255,255,255,.08)";
                if (done&&isSel) { bg=isAns?"rgba(46,213,115,.2)":"rgba(255,71,87,.2)"; bc=isAns?"#2ed573":"#ff4757"; }
                else if (done&&isAns) { bg="rgba(46,213,115,.15)"; bc="#2ed573"; }
                return <button key={i} onClick={()=>answer(ch)} style={{ width:"100%",padding:"16px 20px",borderRadius:16,border:`2px solid ${bc}`,background:bg,color:"#fff",fontSize:16,fontWeight:600,cursor:done?"default":"pointer",textAlign:"center",marginBottom:10,transition:"all .2s" }}>
                  {q.type==="txt"?ch:typeof ch==="number"?ch.toLocaleString():ch}
                </button>;
              })}
            </div>

            {done && <div style={{animation:"slideUp .3s",marginTop:12}}>
              <div style={{ background:ok?"rgba(46,213,115,.1)":"rgba(255,71,87,.1)",border:`1px solid ${ok?"rgba(46,213,115,.3)":"rgba(255,71,87,.3)"}`,borderRadius:16,padding:16,textAlign:"center",marginBottom:12 }}>
                <div style={{fontSize:28,marginBottom:8}}>{ok?"🎉":"💪"}</div>
                <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>{ok?CHEERS[rand(0,CHEERS.length-1)]:"Not quite! Let's learn from this."}</div>
                {!ok && <div style={{fontSize:13,color:"rgba(255,255,255,.6)",marginTop:8}}>Answer: <strong>{typeof q.ans==="number"?q.ans.toLocaleString():q.ans}</strong><br/><span style={{fontSize:11}}>This will come back for review! 💪</span></div>}
                {ok && combo>=3 && <div style={{fontSize:12,color:"#FFD700",marginTop:4}}>🔥 {combo}× Combo! +{combo>=5?15:5} XP</div>}
              </div>
              {ok && <div style={{ background:"rgba(102,126,234,.1)",border:"1px solid rgba(102,126,234,.2)",borderRadius:16,padding:16,marginBottom:12,fontSize:14,lineHeight:1.6,color:"rgba(255,255,255,.8)" }}>🧠 <strong>Go deeper:</strong> {q.think}</div>}
              {!ok && <div style={{ background:"rgba(255,215,0,.08)",border:"1px solid rgba(255,215,0,.2)",borderRadius:16,padding:16,marginBottom:12,fontSize:14,lineHeight:1.6,color:"rgba(255,255,255,.85)" }}>💡 <strong>How to solve:</strong> {q.hint}</div>}
              <button onClick={next} style={{ width:"100%",padding:16,borderRadius:16,border:"none",background:"linear-gradient(135deg,#667eea,#764ba2)",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",marginTop:10,boxShadow:"0 4px 20px rgba(102,126,234,.4)" }}>
                {ci+1>=qs.length?"See Results →":"Next Question →"}
              </button>
            </div>}
          </div>;
        })()}

        {/* ═══════ RESULTS ═══════ */}
        {scr === "results" && (()=>{
          const pct = stats.t?Math.round((stats.c/stats.t)*100):0;
          const stars = pct>=90?3:pct>=70?2:pct>=50?1:0;
          const msg = ["Keep practicing! 💪","Good effort! 📚","Great job! 🌟","Outstanding! 🏆"][stars];
          return <div style={{animation:"slideUp .4s"}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:64,marginBottom:12,animation:"celebrate .6s"}}>{pct>=90?"🏆":pct>=70?"🌟":pct>=50?"👍":"💪"}</div>
              <div style={{fontSize:24,fontWeight:900,marginBottom:8}}>Session Complete!</div>
              <div style={{fontSize:14,color:"rgba(255,255,255,.6)",marginBottom:24}}>{msg}</div>
            </div>
            <div style={{ background:"rgba(255,255,255,.07)",borderRadius:24,padding:28,textAlign:"center",border:"1px solid rgba(255,255,255,.08)" }}>
              <div style={{fontSize:40,marginBottom:4}}>{[0,1,2].map(i=><span key={i} style={{fontSize:32,opacity:i<stars?1:.2}}>⭐</span>)}</div>
              <div style={{display:"flex",justifyContent:"space-around",margin:"20px 0"}}>
                {[{n:`${stats.c}/${stats.t}`,l:"Correct"},{n:`${pct}%`,l:"Accuracy"},{n:`+${stats.xp}`,l:"XP Earned"}].map((s,i)=>
                  <div key={i} style={{textAlign:"center"}}>
                    <div style={{fontSize:28,fontWeight:800,background:"linear-gradient(135deg,#667eea,#f093fb)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{s.n}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.5)",marginTop:4}}>{s.l}</div>
                  </div>
                )}
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:8,padding:"10px 16px",background:"rgba(255,215,0,.1)",borderRadius:12}}>
                <span>🪙</span><span style={{fontSize:14,fontWeight:700,color:"#FFD700"}}>+{stats.c*3+(stats.t-stats.c)} coins</span>
              </div>
            </div>
            <div style={{textAlign:"center",margin:"20px 0"}}>
              <span style={{fontSize:40}}>{pet.e}</span>
              <div style={{fontSize:13,color:"rgba(255,255,255,.5)",marginTop:4}}>Keep earning XP to evolve {pet.n}!</div>
            </div>
            {stats.t-stats.c>0 && <div style={{ background:"rgba(255,107,107,.1)",borderRadius:16,padding:16,marginBottom:16,textAlign:"center" }}>
              <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>📝 Review Added</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.5)"}}>{stats.t-stats.c} problem(s) will come back tomorrow!</div>
            </div>}
            <button onClick={()=>go(topic,lvl,rev)} style={{ width:"100%",padding:16,borderRadius:16,border:"none",background:"linear-gradient(135deg,#667eea,#764ba2)",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 20px rgba(102,126,234,.4)" }}>Play Again 🔄</button>
            <button onClick={()=>setScr("home")} style={{ width:"100%",padding:16,borderRadius:16,border:"none",background:"rgba(255,255,255,.08)",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",marginTop:10 }}>Back to Home</button>
          </div>;
        })()}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(<App />)
