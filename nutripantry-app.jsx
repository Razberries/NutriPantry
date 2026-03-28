import { useState, useRef, useEffect } from "react";

const PALETTES = {
  sage:     { name:"Sage",     emoji:"🌿", bg:"#F5F7F4", surface:"#FFFFFF", card:"#FAFBF9", border:"#DDE5D8", accent:"#6B9E78", accentDark:"#4E7A59", accentLight:"#A8C9B0", accentGlow:"rgba(107,158,120,0.18)", text:"#1C2B1F", textMuted:"#7A9080", textDim:"#B5C9BA", warn:"#C9873A", danger:"#C95252", blue:"#4A86B8", navBg:"#FFFFFF", inputBg:"#F5F7F4" },
  blush:    { name:"Blush",    emoji:"🌸", bg:"#FDF6F7", surface:"#FFFFFF", card:"#FEF9FA", border:"#F0D8DC", accent:"#C4737E", accentDark:"#A85560", accentLight:"#E0A8B0", accentGlow:"rgba(196,115,126,0.18)", text:"#2B1C1E", textMuted:"#9B7075", textDim:"#D4B0B4", warn:"#C98A3A", danger:"#A83030", blue:"#7A8EC9", navBg:"#FFFFFF", inputBg:"#FDF6F7" },
  sky:      { name:"Sky",      emoji:"🩵", bg:"#F4F7FB", surface:"#FFFFFF", card:"#F8FAFD", border:"#D4E2F0", accent:"#4A86C4", accentDark:"#3068A8", accentLight:"#8AB5DA", accentGlow:"rgba(74,134,196,0.18)",  text:"#1A2430", textMuted:"#6A8299", textDim:"#B0C4D4", warn:"#C99B3A", danger:"#C95050", blue:"#4A86C4", navBg:"#FFFFFF", inputBg:"#F4F7FB" },
  midnight: { name:"Midnight", emoji:"🌙", bg:"#0E1117", surface:"#161C22", card:"#1C2430", border:"#2A3540", accent:"#6BA8A0", accentDark:"#4D8880", accentLight:"#8FBFB8", accentGlow:"rgba(107,168,160,0.18)", text:"#E8EEF0", textMuted:"#7A9CA0", textDim:"#3A5058", warn:"#C4A05A", danger:"#C47070", blue:"#6A9EC4", navBg:"#161C22", inputBg:"#0E1117" },
  sand:     { name:"Sand",     emoji:"🏜️", bg:"#FAF6F0", surface:"#FFFFFF", card:"#FDF9F4", border:"#E8D8C4", accent:"#B08050", accentDark:"#8C6438", accentLight:"#CCB080", accentGlow:"rgba(176,128,80,0.18)",  text:"#2A2018", textMuted:"#8C7060", textDim:"#C4B0A0", warn:"#B08050", danger:"#C05040", blue:"#6080A8", navBg:"#FFFFFF", inputBg:"#FAF6F0" },
};

// ── BMI ───────────────────────────────────────────────────────────
function calcBMI(weight, wUnit, height, hUnit) {
  const kg = wUnit === "lbs" ? +weight * 0.453592 : +weight;
  const m  = hUnit === "in"  ? +height * 0.0254   : +height / 100;
  if (!kg || !m || m === 0) return null;
  return kg / (m * m);
}
function bmiLabel(b) {
  if (b < 18.5) return { label:"Underweight",  color:"#4A86B8" };
  if (b < 25)   return { label:"Healthy Weight",color:"#6B9E78" };
  if (b < 30)   return { label:"Overweight",    color:"#C9873A" };
  return           { label:"Obese",            color:"#C95252" };
}

// ── SPROUT LOGO ───────────────────────────────────────────────────
function Sprout({ size=32, color="#6B9E78" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill={color} fillOpacity="0.12"/>
      <path d="M20 33 Q20 24 20 18" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M20 24 Q12 19 11 12 Q17 13 20 19" fill={color} fillOpacity="0.9"/>
      <path d="M20 20 Q28 15 29 8 Q23 9 20 15" fill={color}/>
      <circle cx="20" cy="15" r="2.2" fill={color}/>
    </svg>
  );
}

// ── BOLD MARKDOWN RENDERER ────────────────────────────────────────
function Md({ text, boldColor }) {
  return (
    <span>
      {text.split(/(\*\*[^*]+\*\*)/g).map((p,i) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={i} style={{fontWeight:700, color: boldColor||"inherit"}}>{p.slice(2,-2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </span>
  );
}

// ── ONBOARDING ────────────────────────────────────────────────────
const GOALS    = ["Lose weight","Build muscle","Eat healthier","Manage a condition","Improve energy","Just explore"];
const ACTIVITY = ["Sedentary","Lightly active","Moderately active","Very active"];

function Onboarding({ onDone, t }) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState({ name:"", email:"", password:"", dob:"", gender:"", weight:"", wUnit:"kg", height:"", hUnit:"cm", goals:[], activity:"", theme:"sage" });
  const upd = (k,v) => setD(p=>({...p,[k]:v}));
  const toggleGoal = g => upd("goals", d.goals.includes(g)?d.goals.filter(x=>x!==g):[...d.goals,g]);

  const bmi = calcBMI(d.weight, d.wUnit, d.height, d.hUnit);
  const bc  = bmi ? bmiLabel(bmi) : null;

  const ok = [true, d.name&&d.email&&d.password.length>=6, d.dob&&d.gender, d.weight&&d.height, d.goals.length>0, true][step];
  const inp = { width:"100%", padding:"13px 16px", background:t.inputBg, border:`1.5px solid ${t.border}`, borderRadius:12, color:t.text, fontSize:15, outline:"none", fontFamily:"'Jost',sans-serif", boxSizing:"border-box" };
  const lbl = { fontSize:12, fontWeight:600, color:t.textMuted, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:6, display:"block", fontFamily:"'Jost',sans-serif" };
  const seg = (opts, val, key) => (
    <div style={{display:"flex",background:t.surface,border:`1.5px solid ${t.border}`,borderRadius:12,overflow:"hidden"}}>
      {opts.map(o=><button key={o} onClick={()=>upd(key,o)} style={{flex:1,padding:"10px 0",background:val===o?t.accent:"transparent",border:"none",color:val===o?"#fff":t.textMuted,fontSize:13,fontFamily:"'Jost',sans-serif",cursor:"pointer",fontWeight:600}}>{o}</button>)}
    </div>
  );

  return (
    <div style={{minHeight:"100dvh",background:t.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 20px"}}>
      {/* progress */}
      <div style={{display:"flex",gap:8,marginBottom:36}}>
        {[0,1,2,3,4,5].map(i=><div key={i} style={{width:i===step?24:8,height:8,borderRadius:99,background:i<=step?t.accent:t.border,transition:"all 0.4s"}}/>)}
      </div>

      <div style={{width:"100%",maxWidth:400,animation:"slideUp 0.4s ease"}}>

        {/* STEP 0 – welcome */}
        {step===0&&<div style={{textAlign:"center"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
            <div style={{width:80,height:80,borderRadius:"50%",background:`${t.accentLight}44`,border:`2px solid ${t.accentLight}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Sprout size={48} color={t.accent}/></div>
          </div>
          <h1 style={{fontSize:38,fontWeight:700,color:t.text,marginBottom:8,fontFamily:"'Cormorant Garamond',serif"}}>NutriPantry</h1>
          <p style={{fontSize:18,color:t.textMuted,lineHeight:1.5,fontStyle:"italic",marginBottom:32,fontFamily:"'Cormorant Garamond',serif"}}>Nourish thoughtfully.<br/>Live beautifully.</p>
          {["🌿 AI-powered nutrition coaching","◎ Smart food & macro tracking","▣ Pantry & fridge scanner","📖 Curated health articles"].map(f=>(
            <div key={f} style={{display:"flex",alignItems:"center",gap:10,background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"12px 16px",marginBottom:8}}>
              <span style={{fontSize:16}}>{f.split(" ")[0]}</span>
              <span style={{fontSize:14,color:t.textMuted,fontFamily:"'Jost',sans-serif"}}>{f.split(" ").slice(1).join(" ")}</span>
            </div>
          ))}
        </div>}

        {/* STEP 1 – account */}
        {step===1&&<div>
          <h2 style={{fontSize:30,fontWeight:700,color:t.text,marginBottom:6,fontFamily:"'Cormorant Garamond',serif"}}>Create your account</h2>
          <p style={{fontSize:16,color:t.textMuted,marginBottom:28,fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif"}}>Secure & private</p>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div><label style={lbl}>Full Name</label><input style={inp} placeholder="e.g. Olivia Chen" value={d.name} onChange={e=>upd("name",e.target.value)}/></div>
            <div><label style={lbl}>Email</label><input style={inp} type="email" placeholder="you@example.com" value={d.email} onChange={e=>upd("email",e.target.value)}/></div>
            <div><label style={lbl}>Password</label><input style={inp} type="password" placeholder="Min. 6 characters" value={d.password} onChange={e=>upd("password",e.target.value)}/></div>
          </div>
        </div>}

        {/* STEP 2 – about */}
        {step===2&&<div>
          <h2 style={{fontSize:30,fontWeight:700,color:t.text,marginBottom:6,fontFamily:"'Cormorant Garamond',serif"}}>About you</h2>
          <p style={{fontSize:16,color:t.textMuted,marginBottom:28,fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif"}}>Personalise your experience</p>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div><label style={lbl}>Date of Birth</label><input style={inp} type="date" value={d.dob} onChange={e=>upd("dob",e.target.value)}/></div>
            <div>
              <label style={lbl}>Gender</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {["Female","Male","Non-binary"].map(g=><button key={g} onClick={()=>upd("gender",g)} style={{padding:"11px 8px",background:d.gender===g?t.accent:t.surface,border:`1.5px solid ${d.gender===g?t.accent:t.border}`,borderRadius:12,color:d.gender===g?"#fff":t.textMuted,fontSize:13,fontFamily:"'Jost',sans-serif",cursor:"pointer",fontWeight:d.gender===g?600:400}}>{g}</button>)}
              </div>
            </div>
            <div>
              <label style={lbl}>Activity Level</label>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {ACTIVITY.map(a=><button key={a} onClick={()=>upd("activity",a)} style={{padding:"12px 16px",background:d.activity===a?`${t.accent}18`:t.surface,border:`1.5px solid ${d.activity===a?t.accent:t.border}`,borderRadius:12,color:d.activity===a?t.accent:t.textMuted,fontSize:14,fontFamily:"'Jost',sans-serif",cursor:"pointer",fontWeight:d.activity===a?600:400,textAlign:"left"}}>{a}</button>)}
              </div>
            </div>
          </div>
        </div>}

        {/* STEP 3 – metrics */}
        {step===3&&<div>
          <h2 style={{fontSize:30,fontWeight:700,color:t.text,marginBottom:6,fontFamily:"'Cormorant Garamond',serif"}}>Your body metrics</h2>
          <p style={{fontSize:16,color:t.textMuted,marginBottom:28,fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif"}}>For accurate recommendations</p>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div>
              <label style={lbl}>Weight</label>
              <div style={{display:"flex",gap:10}}><input style={{...inp,flex:1}} type="number" placeholder="70" value={d.weight} onChange={e=>upd("weight",e.target.value)}/>{seg(["kg","lbs"],d.wUnit,"wUnit")}</div>
            </div>
            <div>
              <label style={lbl}>Height</label>
              <div style={{display:"flex",gap:10}}><input style={{...inp,flex:1}} type="number" placeholder="170" value={d.height} onChange={e=>upd("height",e.target.value)}/>{seg(["cm","in"],d.hUnit,"hUnit")}</div>
            </div>
            {bmi&&bc&&(
              <div style={{background:`${bc.color}12`,border:`1.5px solid ${bc.color}44`,borderRadius:14,padding:"16px 18px"}}>
                <div style={{fontSize:10,color:t.textMuted,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",marginBottom:4}}>Your BMI</div>
                <div style={{display:"flex",alignItems:"baseline",gap:10}}>
                  <div style={{fontSize:36,fontWeight:700,color:bc.color,fontFamily:"'Cormorant Garamond',serif",lineHeight:1}}>{bmi.toFixed(1)}</div>
                  <div style={{fontSize:14,fontWeight:600,color:bc.color,fontFamily:"'Jost',sans-serif"}}>{bc.label}</div>
                </div>
                <div style={{marginTop:10,height:6,background:t.border,borderRadius:99,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.min(((bmi-10)/30)*100,100)}%`,background:bc.color,borderRadius:99,transition:"width 0.5s"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                  {[{l:"<18.5",c:"#4A86B8"},{l:"18.5–25",c:"#6B9E78"},{l:"25–30",c:"#C9873A"},{l:"30+",c:"#C95252"}].map(r=><div key={r.l} style={{fontSize:9,color:r.c,fontFamily:"'Jost',sans-serif",fontWeight:600}}>{r.l}</div>)}
                </div>
              </div>
            )}
          </div>
        </div>}

        {/* STEP 4 – goals */}
        {step===4&&<div>
          <h2 style={{fontSize:30,fontWeight:700,color:t.text,marginBottom:6,fontFamily:"'Cormorant Garamond',serif"}}>Your goals</h2>
          <p style={{fontSize:16,color:t.textMuted,marginBottom:28,fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif"}}>Select all that apply</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {GOALS.map(g=>{const s=d.goals.includes(g);return(
              <button key={g} onClick={()=>toggleGoal(g)} style={{padding:"16px 12px",background:s?`${t.accent}18`:t.surface,border:`1.5px solid ${s?t.accent:t.border}`,borderRadius:14,color:s?t.accent:t.textMuted,fontSize:13.5,fontFamily:"'Jost',sans-serif",cursor:"pointer",fontWeight:s?600:400,textAlign:"center",lineHeight:1.3}}>
                {s&&<div style={{fontSize:10,marginBottom:4}}>✓</div>}{g}
              </button>
            );})}
          </div>
        </div>}

        {/* STEP 5 – theme */}
        {step===5&&<div>
          <h2 style={{fontSize:30,fontWeight:700,color:t.text,marginBottom:6,fontFamily:"'Cormorant Garamond',serif"}}>Choose your theme</h2>
          <p style={{fontSize:16,color:t.textMuted,marginBottom:28,fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif"}}>Make it yours</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {Object.entries(PALETTES).map(([key,pal])=>(
              <button key={key} onClick={()=>{upd("theme",key);onDone({...d,theme:key});}}
                style={{display:"flex",alignItems:"center",gap:14,padding:"16px 18px",background:pal.surface,border:`1.5px solid ${d.theme===key?pal.accent:pal.border}`,borderRadius:16,cursor:"pointer",boxShadow:d.theme===key?`0 0 0 3px ${pal.accentGlow}`:"none"}}>
                <div style={{display:"flex",gap:5}}>{[pal.bg,pal.accent,pal.accentLight,pal.text].map((c,i)=><div key={i} style={{width:18,height:18,borderRadius:"50%",background:c,border:`1px solid ${pal.border}`}}/>)}</div>
                <div style={{flex:1,textAlign:"left",fontSize:15,fontWeight:600,color:pal.text,fontFamily:"'Jost',sans-serif"}}>{pal.emoji} {pal.name}</div>
                {d.theme===key&&<div style={{color:pal.accent,fontSize:16}}>✓</div>}
              </button>
            ))}
          </div>
        </div>}

        {step<5&&(
          <div style={{display:"flex",gap:12,marginTop:32}}>
            {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:"15px",background:"transparent",border:`1.5px solid ${t.border}`,borderRadius:14,color:t.textMuted,fontSize:15,fontFamily:"'Jost',sans-serif",cursor:"pointer",fontWeight:500}}>Back</button>}
            <button onClick={()=>setStep(s=>s+1)} disabled={!ok}
              style={{flex:step>0?2:1,padding:"15px",background:ok?t.accent:t.border,border:"none",borderRadius:14,color:ok?"#fff":t.textMuted,fontSize:15,fontFamily:"'Jost',sans-serif",cursor:ok?"pointer":"default",fontWeight:600,boxShadow:ok?`0 4px 20px ${t.accentGlow}`:"none"}}>
              {step===0?"Get Started →":step===4?"Almost done →":"Continue →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DATA ──────────────────────────────────────────────────────────
const INIT_FOODS = [
  {id:1,name:"Greek Yogurt (Plain)",calories:130,protein:17,carbs:9,fat:4,time:"8:02 AM",emoji:"🥛"},
  {id:2,name:"Banana",calories:89,protein:1,carbs:23,fat:0,time:"8:05 AM",emoji:"🍌"},
  {id:3,name:"Grilled Chicken Breast",calories:165,protein:31,carbs:0,fat:4,time:"12:30 PM",emoji:"🍗"},
  {id:4,name:"Brown Rice (1 cup)",calories:215,protein:5,carbs:45,fat:2,time:"12:32 PM",emoji:"🍚"},
  {id:5,name:"Almonds (30g)",calories:173,protein:6,carbs:6,fat:15,time:"3:15 PM",emoji:"🌰"},
];

const INIT_PANTRY = [
  // ── Fridge ──
  {id:1, name:"Whole Milk",              brand:"Organic Valley",        calories:150, expires:"2026-04-03", barcode:"093966002055", emoji:"🥛", loc:"fridge"},
  {id:2, name:"Free-Range Eggs (12pk)",  brand:"Happy Egg Co.",         calories:70,  expires:"2026-04-12", barcode:"856645004001", emoji:"🥚", loc:"fridge"},
  {id:3, name:"Sliced Cheddar",          brand:"Tillamook",             calories:110, expires:"2026-04-22", barcode:"072830001027", emoji:"🧀", loc:"fridge"},
  {id:4, name:"Baby Spinach (5oz)",      brand:"Earthbound Farm",       calories:20,  expires:"2026-03-28", barcode:"032601011014", emoji:"🥬", loc:"fridge"},
  {id:5, name:"Greek Yogurt (Plain)",    brand:"Fage",                  calories:100, expires:"2026-04-06", barcode:"749094100073", emoji:"🍶", loc:"fridge"},
  {id:6, name:"Smoked Salmon",           brand:"Vital Choice",          calories:120, expires:"2026-03-30", barcode:"895532002014", emoji:"🐟", loc:"fridge"},
  {id:7, name:"Blueberries",             brand:"Driscoll's",            calories:57,  expires:"2026-03-27", barcode:"033383711005", emoji:"🫐", loc:"fridge"},
  {id:8, name:"Hummus (Classic)",        brand:"Ithaca",                calories:70,  expires:"2026-04-09", barcode:"853393003001", emoji:"🫙", loc:"fridge"},
  {id:9, name:"Almond Milk (Unsw.)",     brand:"Silk",                  calories:30,  expires:"2026-04-15", barcode:"025293000247", emoji:"🥛", loc:"fridge"},
  {id:10,name:"Leftover Stir-Fry",       brand:"Homemade",              calories:280, expires:"2026-03-25", barcode:"—",            emoji:"🥢", loc:"fridge"},
  {id:11,name:"Orange Juice",            brand:"Tropicana Pure Premium",calories:112, expires:"2026-04-01", barcode:"048500000229", emoji:"🍊", loc:"fridge"},
  {id:12,name:"Butter (Unsalted)",       brand:"Kerrygold",             calories:102, expires:"2026-05-10", barcode:"767563012014", emoji:"🧈", loc:"fridge"},
  // ── Pantry ──
  {id:13,name:"Oats (Old Fashioned)",    brand:"Bob's Red Mill",        calories:150, expires:"2026-08-01", barcode:"039978004352", emoji:"🌾", loc:"pantry"},
  {id:14,name:"Quinoa",                  brand:"Ancient Harvest",       calories:160, expires:"2027-03-20", barcode:"089125100027", emoji:"🌱", loc:"pantry"},
  {id:15,name:"Peanut Butter (Natural)", brand:"Justin's",              calories:190, expires:"2027-01-15", barcode:"894455001001", emoji:"🥜", loc:"pantry"},
  {id:16,name:"Canned Chickpeas",        brand:"Eden Organic",          calories:120, expires:"2028-06-01", barcode:"024182000019", emoji:"🫘", loc:"pantry"},
  {id:17,name:"Olive Oil (Extra Virgin)",brand:"California Olive Ranch", calories:120, expires:"2026-12-01", barcode:"854263001001", emoji:"🫒", loc:"pantry"},
  {id:18,name:"Canned Tomatoes",         brand:"Muir Glen",             calories:25,  expires:"2028-03-01", barcode:"051500069431", emoji:"🍅", loc:"pantry"},
  {id:19,name:"Lentils (Green, Dry)",    brand:"Bob's Red Mill",        calories:170, expires:"2027-09-01", barcode:"039978034380", emoji:"🫘", loc:"pantry"},
];

const ARTICLES = [
  {id:1, title:"The Power of Magnesium: Why Most People Are Deficient",    tag:"Nutrients",   read:"5 min", emoji:"⚡", color:"#6B9E78",
    summary:"Magnesium is involved in over 300 enzymatic reactions. Low levels are linked to poor sleep, muscle cramps, and anxiety. Dark chocolate, pumpkin seeds, and leafy greens are your best sources.",
    body:["Your ring data already shows you're running low — which is more common than you'd think. Studies suggest that **up to 50% of adults** in developed countries don't meet the daily recommended intake of **320–420 mg**.",
          "The best dietary sources include **pumpkin seeds** (156mg per 30g), **dark leafy greens**, **dark chocolate (70%+)**, **almonds**, and **black beans**. Adding a handful of seeds to your morning oats can close most of the gap.",
          "Supplementation is an option — **magnesium glycinate** is the most bioavailable and gentlest on the gut. Avoid magnesium oxide, which has poor absorption rates and is mainly used as a laxative."]},
  {id:2, title:"Protein Timing: Does It Actually Matter?",                 tag:"Muscle",      read:"4 min", emoji:"💪", color:"#4A86B8",
    summary:"New research suggests the anabolic window is wider than we thought — up to 5 hours post-workout. Total daily protein matters far more than exact timing.",
    body:["The old advice to slam a shake **within 30 minutes** of training has largely been revised. A 2023 meta-analysis found the window is closer to **4–5 hours**, meaning a meal eaten before training counts toward post-workout recovery.",
          "What does matter is **total daily intake**. Research consistently supports **1.6–2.2g of protein per kg of bodyweight** for muscle growth. Distributing this across **3–4 meals** optimises muscle protein synthesis better than eating it all at once.",
          "Good whole-food sources: **Greek yogurt, eggs, chicken breast, lentils, cottage cheese, and edamame**. Aim for at least **30g per meal** to maximally stimulate muscle protein synthesis."]},
  {id:3, title:"Gut Health & Immunity: The Connection You Need to Know",    tag:"Gut Health",  read:"6 min", emoji:"🦠", color:"#C4737E",
    summary:"70% of immune cells live in your gut. Fermented foods and plant diversity are your most powerful levers for a healthier microbiome.",
    body:["The gut microbiome contains **trillions of bacteria** influencing everything from immunity to mood. Low diversity is strongly associated with **inflammatory conditions, depression, and metabolic disease**.",
          "The single most evidence-backed intervention is **plant diversity** — aim for **30 different plant species per week**. This sounds harder than it is: herbs, spices, nuts, seeds, and legumes all count. Each species feeds different bacterial strains.",
          "Fermented foods — **kefir, kimchi, miso, sauerkraut, and natural yogurt** — directly introduce beneficial bacteria. A Stanford study found **10 weeks of fermented food consumption** increased microbiome diversity and reduced 19 inflammatory markers."]},
  {id:4, title:"Intermittent Fasting: What the Latest Science Says",        tag:"Fasting",     read:"7 min", emoji:"⏱", color:"#C9873A",
    summary:"A 2024 meta-analysis found 16:8 IF produces similar weight loss to caloric restriction, with notable benefits for insulin sensitivity.",
    body:["**Intermittent fasting (IF)** has gone from fringe to mainstream — and the science is finally catching up. The most popular protocol, **16:8** (16 hours fasted, 8-hour eating window), consistently produces **modest but reliable weight loss** comparable to continuous caloric restriction.",
          "Where IF shows clearer advantages is in **metabolic health**. Multiple trials show improvements in **fasting insulin, HbA1c, blood pressure, and triglycerides** — even without significant weight loss. These effects are particularly pronounced in people with pre-diabetes.",
          "Important caveats: IF isn't for everyone. It can trigger disordered eating in susceptible individuals, reduce muscle mass if protein intake is inadequate, and impair performance in high-volume athletes. Always consult a healthcare provider before starting."]},
  {id:5, title:"Hydration Beyond Water: Electrolytes Explained",            tag:"Hydration",   read:"4 min", emoji:"💧", color:"#8B6BB8",
    summary:"True hydration requires sodium, potassium, and magnesium alongside water. Most sports drinks are too sugary — try better alternatives.",
    body:["**Electrolytes** — sodium, potassium, magnesium, and chloride — regulate fluid balance at the cellular level. Drinking plain water excessively can actually *dilute* these minerals, causing **hyponatraemia** (low sodium), which in extreme cases is dangerous.",
          "Signs of electrolyte imbalance include **muscle cramps, brain fog, headaches, and persistent fatigue** — symptoms often mistaken for simple dehydration. Your ring's hydration score accounts for this.",
          "Better options than sugary sports drinks: **coconut water** (rich in potassium), **a pinch of Himalayan sea salt** in water, or homemade electrolyte drinks using lemon juice, salt, and a small amount of honey. Aim for **pale yellow urine** as your hydration guide."]},
  {id:6, title:"Anti-Inflammatory Foods: A Practical Shopping List",        tag:"Inflammation", read:"5 min", emoji:"🫐", color:"#6B9E78",
    summary:"Berries, fatty fish, turmeric, and extra virgin olive oil top every anti-inflammatory list. Small consistent swaps make the biggest difference.",
    body:["**Chronic low-grade inflammation** underlies most modern diseases — heart disease, type 2 diabetes, Alzheimer's, and many cancers. Diet is one of the most powerful levers for reducing it.",
          "The **Mediterranean diet** remains the most evidence-backed anti-inflammatory eating pattern. Core foods: **extra virgin olive oil** (use it daily), **fatty fish** 2–3x/week, **berries** daily, **turmeric with black pepper**, **leafy greens**, and **nuts**.",
          "Foods to reduce: **ultra-processed foods, refined seed oils (canola, soybean, sunflower), added sugar, and refined carbohydrates**. These directly upregulate inflammatory pathways. Swap vegetable oil for EVOO and refined grains for whole grains as a starting point."]},
  {id:7, title:"Sleep & Nutrition: How Your Dinner Affects Your Rest",      tag:"Sleep",       read:"5 min", emoji:"🌙", color:"#4A86B8",
    summary:"Tryptophan-rich foods boost melatonin naturally. Large meals and alcohol close to bedtime significantly fragment sleep architecture.",
    body:["Your **sleep quality directly affects appetite hormones**. Just one night of poor sleep raises **ghrelin (hunger hormone)** by 24% and lowers **leptin (satiety hormone)** — making overeating almost inevitable the next day.",
          "**Tryptophan** is an amino acid that converts to serotonin and then melatonin. Foods high in tryptophan include **turkey, eggs, pumpkin seeds, bananas, and oats**. A small carbohydrate with these foods helps tryptophan cross the blood-brain barrier.",
          "Timing matters: **avoid large meals within 3 hours of bed**. Alcohol is particularly disruptive — while it aids falling asleep, it fragments **REM sleep** in the second half of the night, reducing restorative deep sleep by up to 24%."]},
  {id:8, title:"The Glycaemic Index: A Smarter Way to Think About Carbs",   tag:"Blood Sugar", read:"6 min", emoji:"📊", color:"#C9873A",
    summary:"GI measures how quickly foods raise blood sugar. Food combining and cooking methods can dramatically lower a meal's glycaemic load.",
    body:["The **glycaemic index (GI)** ranks foods on a 0–100 scale based on how quickly they raise blood glucose. High-GI foods (>70) cause rapid spikes; low-GI foods (<55) produce a slower, flatter curve — better for energy, hunger control, and insulin sensitivity.",
          "The more useful concept is **glycaemic load (GL)**, which accounts for portion size. Watermelon has a high GI but low GL — you'd have to eat an enormous amount to get a significant blood sugar spike. Context matters.",
          "**Practical strategies to lower GL**: pair carbs with protein and fat, eat vegetables first in a meal, choose al-dente pasta over soft-cooked, cool and reheat potatoes and rice (creates resistant starch), and add a splash of vinegar to meals — all shown to **reduce post-meal blood sugar by 20–35%**."]},
];

const TABS = [
  {id:"chat",     label:"AI Coach",  icon:"✦"},
  {id:"tracker",  label:"Food Log",  icon:"◎"},
  {id:"pantry",   label:"Pantry",    icon:"▣"},
  {id:"articles", label:"Articles",  icon:"❧"},
  {id:"settings", label:"Profile",   icon:"◈"},
];

// ── CHAT ──────────────────────────────────────────────────────────
function ChatTab({ t, user }) {
  const first = user.name.split(" ")[0];
  const bmi = calcBMI(user.weight, user.wUnit, user.height, user.hUnit);
  const bc  = bmi ? bmiLabel(bmi) : null;
  const [msgs, setMsgs] = useState([
    {role:"assistant", text:`Welcome back, **${first}**! 🌿 Your ring shows you're **340mg low on magnesium** and **hydration is at 62%** today. ${bc?`Your BMI is **${bmi.toFixed(1)}** (${bc.label}). `:""}How can I help you reach your goals?`}
  ]);
  const [inp, setInp] = useState("");
  const [loading, setLoading] = useState(false);
  const bottom = useRef(null);
  useEffect(()=>{bottom.current?.scrollIntoView({behavior:"smooth"});},[msgs,loading]);

  async function send() {
    const text = inp.trim();
    if (!text||loading) return;
    setInp("");
    const next = [...msgs, {role:"user",text}];
    setMsgs(next);
    setLoading(true);
    try {
      const bmiStr = bmi ? `BMI ${bmi.toFixed(1)} (${bc.label})` : "";
      const sys = `You are NutriPantry AI — an expert, warm, evidence-based nutrition coach. User: ${user.name}, goals: ${user.goals?.join(", ")}, activity: ${user.activity}, gender: ${user.gender}. ${bmiStr}. Ring data: hydration 62%, magnesium -340mg, sleep 7h12m, BP 118/76, steps 6240. Fridge: eggs, cheddar, spinach, Greek yogurt, smoked salmon, blueberries, hummus, almond milk, butter. Pantry: oats, quinoa, peanut butter, chickpeas, olive oil, canned tomatoes, lentils. IMPORTANT: use **double asterisks** around key nutritional terms, food names, numbers, and key advice so they render in bold. Be specific, concise, motivating. Under 130 words.`;
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:220,system:sys,messages:next.map(m=>({role:m.role==="assistant"?"assistant":"user",content:m.text}))})});
      const data = await res.json();
      setMsgs(p=>[...p,{role:"assistant",text:data.content?.map(b=>b.text||"").join("")||"Please try again."}]);
    } catch { setMsgs(p=>[...p,{role:"assistant",text:"Connection issue — please try again."}]); }
    setLoading(false);
  }

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      {/* ring strip */}
      <div style={{padding:"11px 16px",background:t.surface,borderBottom:`1px solid ${t.border}`,display:"flex",gap:18,overflowX:"auto"}}>
        {[{l:"Hydration",v:"62%",c:t.blue,i:"💧"},{l:"Magnesium",v:"−340mg",c:t.warn,i:"⚡"},{l:"Sleep",v:"7h 12m",c:t.accent,i:"🌙"},{l:"BP",v:"118/76",c:t.accent,i:"❤️"},{l:"Steps",v:"6,240",c:t.blue,i:"👟"}].map(s=>(
          <div key={s.l} style={{flexShrink:0,display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:13}}>{s.i}</span>
            <div>
              <div style={{fontSize:9,color:t.textMuted,letterSpacing:"0.06em",fontFamily:"'Jost',sans-serif",textTransform:"uppercase"}}>{s.l}</div>
              <div style={{fontSize:13,fontWeight:700,color:s.c,fontFamily:"'Jost',sans-serif"}}>{s.v}</div>
            </div>
          </div>
        ))}
      </div>

      {/* messages */}
      <div style={{flex:1,overflowY:"auto",padding:"18px 16px",display:"flex",flexDirection:"column",gap:14}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",animation:"slideUp 0.3s ease"}}>
            {m.role==="assistant"&&<div style={{width:30,height:30,borderRadius:"50%",background:`${t.accentLight}44`,border:`1.5px solid ${t.accentLight}`,display:"flex",alignItems:"center",justifyContent:"center",marginRight:10,flexShrink:0,marginTop:2}}><Sprout size={18} color={t.accent}/></div>}
            <div style={{maxWidth:"76%",padding:"11px 16px",borderRadius:m.role==="user"?"18px 18px 4px 18px":"4px 18px 18px 18px",background:m.role==="user"?t.accent:t.surface,border:m.role==="assistant"?`1px solid ${t.border}`:"none",color:m.role==="user"?"#fff":t.text,fontSize:14,lineHeight:1.65,fontFamily:"'Jost',sans-serif",boxShadow:m.role==="assistant"?`0 2px 12px ${t.accentGlow}`:"none"}}>
              {m.role==="assistant"?<Md text={m.text} boldColor={t.accentDark}/>:m.text}
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:"50%",background:`${t.accentLight}44`,border:`1.5px solid ${t.accentLight}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Sprout size={18} color={t.accent}/></div>
          <div style={{padding:"11px 16px",background:t.surface,border:`1px solid ${t.border}`,borderRadius:"4px 18px 18px 18px",display:"flex",gap:5}}>
            {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:t.accentLight,animation:"pulse 1.2s ease-in-out infinite",animationDelay:`${i*0.2}s`}}/>)}
          </div>
        </div>}
        <div ref={bottom}/>
      </div>

      {msgs.length<=2&&<div style={{padding:"0 16px 10px",display:"flex",gap:8,overflowX:"auto"}}>
        {["Fix my magnesium","High-protein dinner from my fridge","How to hit 2,100 kcal today","Best foods for sleep"].map(s=>(
          <button key={s} onClick={()=>setInp(s)} style={{flexShrink:0,padding:"7px 14px",background:"transparent",border:`1px solid ${t.border}`,borderRadius:99,color:t.textMuted,fontSize:12,cursor:"pointer",fontFamily:"'Jost',sans-serif",whiteSpace:"nowrap"}}>{s}</button>
        ))}
      </div>}

      <div style={{padding:"12px 16px",borderTop:`1px solid ${t.border}`,display:"flex",gap:10,background:t.surface}}>
        <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about nutrition, recipes, goals…"
          style={{flex:1,background:t.inputBg,border:`1.5px solid ${t.border}`,borderRadius:14,padding:"11px 16px",color:t.text,fontSize:14,outline:"none",fontFamily:"'Jost',sans-serif"}}/>
        <button onClick={send} disabled={!inp.trim()||loading} style={{width:44,height:44,borderRadius:14,background:inp.trim()?t.accent:t.border,border:"none",cursor:inp.trim()?"pointer":"default",color:"#fff",fontSize:18,fontWeight:700,flexShrink:0}}>↑</button>
      </div>
    </div>
  );
}

// ── TRACKER ───────────────────────────────────────────────────────
function TrackerTab({ t }) {
  const [foods,setFoods] = useState(INIT_FOODS);
  const [showAdd,setShowAdd] = useState(false);
  const [nf,setNf] = useState({name:"",calories:"",protein:"",carbs:"",fat:""});
  const goal = 2100;
  const tot = foods.reduce((a,f)=>({cal:a.cal+f.calories,p:a.p+f.protein,c:a.c+f.carbs,f:a.f+f.fat}),{cal:0,p:0,c:0,f:0});
  const pct = Math.min(tot.cal/goal,1);
  const inp = {background:t.inputBg,border:`1.5px solid ${t.border}`,borderRadius:10,padding:"10px 14px",color:t.text,fontSize:13.5,outline:"none",fontFamily:"'Jost',sans-serif",width:"100%",boxSizing:"border-box"};

  function add(){
    if(!nf.name||!nf.calories) return;
    setFoods(p=>[...p,{id:Date.now(),name:nf.name,calories:+nf.calories,protein:+nf.protein||0,carbs:+nf.carbs||0,fat:+nf.fat||0,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),emoji:"🍽️"}]);
    setNf({name:"",calories:"",protein:"",carbs:"",fat:""});setShowAdd(false);
  }

  return (
    <div style={{overflowY:"auto",height:"100%"}}>
      <div style={{padding:"20px 18px 0",background:t.surface,borderBottom:`1px solid ${t.border}`}}>
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:14}}>
          <div>
            <div style={{fontSize:11,color:t.textMuted,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4,fontFamily:"'Jost',sans-serif"}}>Today's Intake</div>
            <div style={{fontSize:40,fontWeight:700,color:t.text,lineHeight:1,fontFamily:"'Cormorant Garamond',serif"}}>{tot.cal.toLocaleString()} <span style={{fontSize:16,color:t.textMuted,fontWeight:400}}>kcal</span></div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,color:t.textMuted,fontFamily:"'Jost',sans-serif"}}>REMAINING</div>
            <div style={{fontSize:24,fontWeight:700,color:goal-tot.cal>0?t.accent:t.danger,fontFamily:"'Cormorant Garamond',serif"}}>{Math.max(goal-tot.cal,0)}</div>
            <div style={{fontSize:10,color:t.textMuted,fontFamily:"'Jost',sans-serif"}}>of {goal.toLocaleString()} goal</div>
          </div>
        </div>
        <div style={{height:6,background:t.border,borderRadius:99,marginBottom:16,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct*100}%`,background:pct>0.95?t.danger:t.accent,borderRadius:99,transition:"width 0.6s ease",boxShadow:`0 0 8px ${t.accentGlow}`}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,paddingBottom:16}}>
          {[{l:"Protein",v:tot.p,g:160,c:t.blue},{l:"Carbs",v:tot.c,g:250,c:t.warn},{l:"Fat",v:tot.f,g:65,c:"#C77DFF"}].map(m=>(
            <div key={m.l} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,padding:"10px 12px"}}>
              <div style={{fontSize:10,color:t.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"'Jost',sans-serif"}}>{m.l}</div>
              <div style={{fontSize:20,fontWeight:700,color:m.c,marginTop:2,fontFamily:"'Cormorant Garamond',serif"}}>{m.v}g</div>
              <div style={{height:3,background:t.border,borderRadius:99,marginTop:5,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min(m.v/m.g*100,100)}%`,background:m.c,borderRadius:99}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{padding:"16px 18px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:12,color:t.textMuted,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif"}}>Food Log</div>
          <button onClick={()=>setShowAdd(!showAdd)} style={{padding:"7px 16px",background:showAdd?"transparent":t.accent,border:`1.5px solid ${showAdd?t.border:t.accent}`,borderRadius:99,color:showAdd?t.textMuted:"#fff",fontSize:12,fontFamily:"'Jost',sans-serif",fontWeight:600,cursor:"pointer"}}>{showAdd?"Cancel":"+ Add Food"}</button>
        </div>
        {showAdd&&<div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:16,padding:16,marginBottom:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            {[{k:"name",l:"Food Name",full:true},{k:"calories",l:"Calories"},{k:"protein",l:"Protein (g)"},{k:"carbs",l:"Carbs (g)"},{k:"fat",l:"Fat (g)"}].map(f=>(
              <input key={f.k} placeholder={f.l} value={nf[f.k]} onChange={e=>setNf(p=>({...p,[f.k]:e.target.value}))} style={{...inp,gridColumn:f.full?"1/-1":"auto"}}/>
            ))}
          </div>
          <button onClick={add} style={{width:"100%",padding:"12px",background:t.accent,border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Jost',sans-serif"}}>Log Food</button>
        </div>}
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {foods.map(f=>(
            <div key={f.id} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"13px 16px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:24}}>{f.emoji}</div>
              <div style={{flex:1}}>
                <div style={{color:t.text,fontSize:14,fontWeight:600,fontFamily:"'Jost',sans-serif"}}>{f.name}</div>
                <div style={{color:t.textMuted,fontSize:11,marginTop:2,fontFamily:"'Jost',sans-serif"}}>P:{f.protein}g · C:{f.carbs}g · F:{f.fat}g · {f.time}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:t.accent,fontSize:17,fontWeight:700,fontFamily:"'Cormorant Garamond',serif"}}>{f.calories}</div>
                <div style={{color:t.textMuted,fontSize:10,fontFamily:"'Jost',sans-serif"}}>kcal</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PANTRY ────────────────────────────────────────────────────────
function PantryTab({ t }) {
  const [pantry,setPantry] = useState(INIT_PANTRY);
  const [scanning,setScanning] = useState(false);
  const [scanned,setScanned] = useState(null);
  const [search,setSearch] = useState("");
  const [view,setView] = useState("all");
  const today = new Date();
  const daysUntil = d => Math.ceil((new Date(d)-today)/86400000);
  const fridgeN = pantry.filter(p=>p.loc==="fridge").length;
  const pantryN = pantry.filter(p=>p.loc==="pantry").length;
  const expiring = pantry.filter(p=>daysUntil(p.expires)<7).length;
  const filtered = pantry.filter(p=>(view==="all"||p.loc===view)&&p.name.toLowerCase().includes(search.toLowerCase()));

  function simulateScan(){
    setScanning(true);setScanned(null);
    setTimeout(()=>{setScanned({name:"Lentil Soup (Canned)",brand:"Amy's Kitchen",calories:180,expires:"2027-09-01",barcode:"042272009832",emoji:"🍲",loc:"pantry"});setScanning(false);},2200);
  }

  return (
    <div style={{overflowY:"auto",height:"100%"}}>
      {/* stats */}
      <div style={{padding:"12px 18px",background:t.surface,borderBottom:`1px solid ${t.border}`,display:"flex",gap:20}}>
        {[{l:"Fridge",v:fridgeN,i:"🧊"},{l:"Pantry",v:pantryN,i:"📦"},{l:"Expiring",v:expiring,i:"⏰",c:expiring>0?t.warn:t.textMuted}].map(s=>(
          <div key={s.l} style={{display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:15}}>{s.i}</span>
            <div>
              <div style={{fontSize:9,color:t.textMuted,fontFamily:"'Jost',sans-serif",textTransform:"uppercase",letterSpacing:"0.05em"}}>{s.l}</div>
              <div style={{fontSize:16,fontWeight:700,color:s.c||t.text,fontFamily:"'Cormorant Garamond',serif"}}>{s.v}</div>
            </div>
          </div>
        ))}
      </div>

      {/* scanner */}
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${t.border}`}}>
        <button onClick={simulateScan} disabled={scanning} style={{width:"100%",padding:"14px",background:scanning?t.card:t.accent,border:scanning?`1.5px solid ${t.border}`:"none",borderRadius:14,color:scanning?t.textMuted:"#fff",fontWeight:700,fontSize:15,cursor:scanning?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontFamily:"'Jost',sans-serif",boxShadow:scanning?"none":`0 4px 20px ${t.accentGlow}`}}>
          {scanning?(<><div style={{width:18,height:18,border:`2px solid ${t.border}`,borderTop:`2px solid ${t.textMuted}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Scanning…</>):"▣  Scan Barcode"}
        </button>
        {scanning&&<div style={{marginTop:12,background:t.card,border:`1px solid ${t.border}`,borderRadius:14,padding:"16px",overflow:"hidden"}}>
          <div style={{display:"flex",justifyContent:"center",gap:2,marginBottom:10}}>
            {Array.from({length:24}).map((_,i)=><div key={i} style={{width:2,height:14+Math.abs(Math.sin(i*0.7))*20,background:t.accent,borderRadius:1,opacity:0.25+(i%3)*0.25}}/>)}
          </div>
          <div style={{textAlign:"center",color:t.textMuted,fontSize:12,fontFamily:"'Jost',sans-serif"}}>Point camera at barcode</div>
        </div>}
        {scanned&&<div style={{marginTop:12,background:t.surface,border:`1.5px solid ${t.accent}`,borderRadius:14,padding:14,boxShadow:`0 0 20px ${t.accentGlow}`,animation:"slideUp 0.3s ease"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <div style={{fontSize:28}}>{scanned.emoji}</div>
            <div style={{flex:1}}>
              <div style={{color:t.text,fontWeight:700,fontSize:14,fontFamily:"'Jost',sans-serif"}}>{scanned.name}</div>
              <div style={{color:t.textMuted,fontSize:12,fontFamily:"'Jost',sans-serif"}}>{scanned.brand} · {scanned.calories} kcal/serving</div>
            </div>
            <div style={{background:`${t.accent}20`,color:t.accent,padding:"4px 10px",borderRadius:99,fontSize:10,fontWeight:700,fontFamily:"'Jost',sans-serif"}}>FOUND</div>
          </div>
          <button onClick={()=>{setPantry(p=>[...p,{...scanned,id:Date.now()}]);setScanned(null);}} style={{width:"100%",padding:"11px",background:t.accent,border:"none",borderRadius:12,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"'Jost',sans-serif"}}>+ Add to Pantry</button>
        </div>}
      </div>

      {/* search + filter */}
      <div style={{padding:"12px 18px 0"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search fridge & pantry…" style={{width:"100%",background:t.inputBg,border:`1.5px solid ${t.border}`,borderRadius:12,padding:"10px 16px",color:t.text,fontSize:13.5,outline:"none",fontFamily:"'Jost',sans-serif",boxSizing:"border-box"}}/>
        <div style={{display:"flex",gap:6,marginTop:10,paddingBottom:4}}>
          {[{k:"all",l:`All (${pantry.length})`},{k:"fridge",l:`🧊 Fridge`},{k:"pantry",l:`📦 Pantry`}].map(v=>(
            <button key={v.k} onClick={()=>setView(v.k)} style={{flexShrink:0,padding:"7px 16px",background:view===v.k?t.accent:"transparent",border:`1px solid ${view===v.k?t.accent:t.border}`,borderRadius:99,color:view===v.k?"#fff":t.textMuted,fontSize:12,fontFamily:"'Jost',sans-serif",fontWeight:view===v.k?600:400,cursor:"pointer"}}>{v.l}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"10px 18px",display:"flex",flexDirection:"column",gap:8}}>
        {filtered.map(p=>{
          const days=daysUntil(p.expires);
          const ec=days<7?t.danger:days<14?t.warn:t.textMuted;
          return(
            <div key={p.id} style={{background:t.surface,border:`1px solid ${days<7?t.danger+"55":t.border}`,borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:22}}>{p.emoji}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:t.text,fontSize:14,fontWeight:600,fontFamily:"'Jost',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                <div style={{color:t.textMuted,fontSize:11,marginTop:1,fontFamily:"'Jost',sans-serif"}}>{p.brand} · {p.calories} kcal</div>
                <div style={{fontFamily:"monospace",color:t.textDim,fontSize:9,marginTop:2}}>{p.barcode}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{color:ec,fontSize:12,fontWeight:700,fontFamily:"'Jost',sans-serif"}}>{days>0?`${days}d left`:"Expired"}</div>
                <div style={{background:t.border,borderRadius:6,padding:"2px 7px",marginTop:3,display:"inline-block"}}>
                  <div style={{color:t.textMuted,fontSize:9,fontFamily:"'Jost',sans-serif"}}>{p.loc==="fridge"?"🧊 Fridge":"📦 Pantry"}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ARTICLES ──────────────────────────────────────────────────────
function ArticlesTab({ t }) {
  const [sel,setSel]     = useState(null);
  const [saved,setSaved] = useState([]);
  const [tag,setTag]     = useState("All");
  const tags = ["All",...new Set(ARTICLES.map(a=>a.tag))];
  const list = tag==="All" ? ARTICLES : ARTICLES.filter(a=>a.tag===tag);
  const toggleSave = id => setSaved(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);

  // ── Article detail view ──
  if (sel) {
    const a = ARTICLES.find(x=>x.id===sel);
    return (
      <div style={{overflowY:"auto",height:"100%"}}>
        <div style={{padding:"14px 18px",background:t.surface,borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setSel(null)} style={{background:"transparent",border:`1px solid ${t.border}`,borderRadius:10,padding:"7px 14px",color:t.textMuted,fontSize:13,fontFamily:"'Jost',sans-serif",cursor:"pointer"}}>← Back</button>
          <div style={{flex:1}}/>
          <button onClick={()=>toggleSave(a.id)} style={{background:"transparent",border:`1px solid ${saved.includes(a.id)?t.accent:t.border}`,borderRadius:10,padding:"7px 14px",color:saved.includes(a.id)?t.accent:t.textMuted,fontSize:13,fontFamily:"'Jost',sans-serif",cursor:"pointer",fontWeight:saved.includes(a.id)?700:400}}>
            {saved.includes(a.id)?"★ Saved":"☆ Save"}
          </button>
        </div>
        <div style={{padding:"24px 22px"}}>
          <div style={{display:"inline-block",background:`${a.color}18`,color:a.color,padding:"4px 12px",borderRadius:99,fontSize:11,fontWeight:700,fontFamily:"'Jost',sans-serif",marginBottom:14}}>{a.tag}</div>
          <div style={{fontSize:34,marginBottom:10}}>{a.emoji}</div>
          <h2 style={{fontSize:27,fontWeight:700,color:t.text,lineHeight:1.28,marginBottom:10,fontFamily:"'Cormorant Garamond',serif"}}>{a.title}</h2>
          <div style={{display:"flex",gap:12,marginBottom:20}}>
            <span style={{fontSize:12,color:t.textMuted,fontFamily:"'Jost',sans-serif"}}>📖 {a.read} read</span>
            <span style={{fontSize:12,color:t.textMuted,fontFamily:"'Jost',sans-serif"}}>· NutriPantry Editorial</span>
          </div>
          <div style={{height:1,background:t.border,marginBottom:24}}/>
          <p style={{fontSize:15.5,color:t.text,lineHeight:1.75,fontFamily:"'Jost',sans-serif",marginBottom:24}}>{a.summary}</p>
          {a.body.map((para,i)=>(
            <p key={i} style={{fontSize:14.5,color:i===0?t.text:t.textMuted,lineHeight:1.75,fontFamily:"'Jost',sans-serif",marginBottom:18}}>
              <Md text={para} boldColor={t.accentDark}/>
            </p>
          ))}
          <div style={{background:`${a.color}12`,border:`1.5px solid ${a.color}44`,borderRadius:14,padding:"16px 18px",marginTop:12}}>
            <div style={{fontSize:11,fontWeight:700,color:a.color,fontFamily:"'Jost',sans-serif",marginBottom:6,letterSpacing:"0.06em",textTransform:"uppercase"}}>💬 Ask NutriPantry AI</div>
            <p style={{fontSize:13.5,color:t.text,fontFamily:"'Jost',sans-serif",lineHeight:1.55}}>Want personalised advice on {a.tag.toLowerCase()}? Head to the <strong>AI Coach</strong> tab and ask — the AI knows your ring data and what's in your fridge.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Article list view ──
  return (
    <div style={{overflowY:"auto",height:"100%"}}>
      <div style={{padding:"18px 18px 0",background:t.surface,borderBottom:`1px solid ${t.border}`}}>
        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:4}}>
          <h2 style={{fontSize:24,fontWeight:700,color:t.text,fontFamily:"'Cormorant Garamond',serif"}}>Health Articles</h2>
          {saved.length>0&&<span style={{fontSize:12,color:t.accent,fontFamily:"'Jost',sans-serif",fontWeight:600}}>★ {saved.length} saved</span>}
        </div>
        <p style={{fontSize:13,color:t.textMuted,fontFamily:"'Jost',sans-serif",marginBottom:14,fontStyle:"italic"}}>Curated reads for your wellness journey</p>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:12}}>
          {tags.map(tg=><button key={tg} onClick={()=>setTag(tg)} style={{flexShrink:0,padding:"6px 14px",background:tag===tg?t.accent:"transparent",border:`1px solid ${tag===tg?t.accent:t.border}`,borderRadius:99,color:tag===tg?"#fff":t.textMuted,fontSize:11.5,fontFamily:"'Jost',sans-serif",fontWeight:tag===tg?600:400,cursor:"pointer"}}>{tg}</button>)}
        </div>
      </div>

      {/* featured */}
      {tag==="All"&&<div style={{margin:"16px 18px 4px"}}>
        <div onClick={()=>setSel(ARTICLES[0].id)} style={{background:ARTICLES[0].color,borderRadius:20,padding:"22px 20px",cursor:"pointer",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",right:-8,top:-8,fontSize:90,opacity:0.12}}>{ARTICLES[0].emoji}</div>
          <div style={{background:"rgba(255,255,255,0.22)",display:"inline-block",padding:"3px 10px",borderRadius:99,fontSize:10,fontWeight:700,color:"#fff",fontFamily:"'Jost',sans-serif",marginBottom:10,letterSpacing:"0.06em"}}>FEATURED · {ARTICLES[0].read} read</div>
          <h3 style={{fontSize:20,fontWeight:700,color:"#fff",lineHeight:1.3,marginBottom:8,fontFamily:"'Cormorant Garamond',serif"}}>{ARTICLES[0].title}</h3>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.82)",lineHeight:1.5,fontFamily:"'Jost',sans-serif"}}>{ARTICLES[0].summary.substring(0,100)}…</p>
          <div style={{marginTop:14,display:"flex",alignItems:"center",gap:8}}>
            <button onClick={e=>{e.stopPropagation();toggleSave(ARTICLES[0].id);}} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:99,padding:"5px 12px",color:"#fff",fontSize:12,cursor:"pointer",fontFamily:"'Jost',sans-serif"}}>{saved.includes(ARTICLES[0].id)?"★ Saved":"☆ Save"}</button>
            <span style={{color:"rgba(255,255,255,0.75)",fontSize:12,fontFamily:"'Jost',sans-serif"}}>Read article →</span>
          </div>
        </div>
      </div>}

      <div style={{padding:"12px 18px",display:"flex",flexDirection:"column",gap:10}}>
        {list.filter(a=>tag!=="All"||a.id!==1).map(a=>(
          <div key={a.id} onClick={()=>setSel(a.id)} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:16,padding:"16px",cursor:"pointer",display:"flex",gap:14}}>
            <div style={{width:50,height:50,borderRadius:14,background:`${a.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{a.emoji}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",gap:6,marginBottom:5,alignItems:"center"}}>
                <div style={{background:`${a.color}18`,color:a.color,padding:"2px 8px",borderRadius:99,fontSize:10,fontWeight:700,fontFamily:"'Jost',sans-serif"}}>{a.tag}</div>
                <div style={{fontSize:10,color:t.textMuted,fontFamily:"'Jost',sans-serif"}}>{a.read}</div>
              </div>
              <h3 style={{fontSize:15,fontWeight:600,color:t.text,lineHeight:1.3,marginBottom:4,fontFamily:"'Cormorant Garamond',serif"}}>{a.title}</h3>
              <p style={{fontSize:12,color:t.textMuted,lineHeight:1.5,fontFamily:"'Jost',sans-serif",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{a.summary}</p>
            </div>
            <button onClick={e=>{e.stopPropagation();toggleSave(a.id);}} style={{background:"transparent",border:"none",cursor:"pointer",color:saved.includes(a.id)?t.accent:t.textDim,fontSize:18,alignSelf:"flex-start",flexShrink:0}}>{saved.includes(a.id)?"★":"☆"}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SETTINGS ──────────────────────────────────────────────────────
function SettingsTab({ t, curTheme, setTheme, user }) {
  const bmi = calcBMI(user.weight, user.wUnit, user.height, user.hUnit);
  const bc  = bmi ? bmiLabel(bmi) : null;
  return (
    <div style={{overflowY:"auto",height:"100%",padding:"20px 18px"}}>
      {/* profile */}
      <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:18,padding:"20px",marginBottom:20,display:"flex",alignItems:"center",gap:16}}>
        <div style={{width:56,height:56,borderRadius:"50%",background:`${t.accentLight}44`,border:`2px solid ${t.accentLight}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Sprout size={32} color={t.accent}/></div>
        <div>
          <div style={{fontSize:22,fontWeight:700,color:t.text,fontFamily:"'Cormorant Garamond',serif"}}>{user.name}</div>
          <div style={{fontSize:13,color:t.textMuted,fontFamily:"'Jost',sans-serif"}}>{user.email}</div>
          <div style={{fontSize:11,color:t.accent,fontFamily:"'Jost',sans-serif",marginTop:2}}>{user.goals?.slice(0,2).join(" · ")}</div>
        </div>
      </div>

      {/* stats grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {[{l:"Weight",v:`${user.weight} ${user.wUnit}`},{l:"Height",v:`${user.height} ${user.hUnit}`},{l:"Gender",v:user.gender||"—"},{l:"Activity",v:user.activity||"—"}].map(s=>(
          <div key={s.l} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"14px 16px"}}>
            <div style={{fontSize:10,color:t.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"'Jost',sans-serif",marginBottom:4}}>{s.l}</div>
            <div style={{fontSize:17,fontWeight:600,color:t.text,fontFamily:"'Cormorant Garamond',serif"}}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* bmi card */}
      {bmi&&bc&&<div style={{background:`${bc.color}12`,border:`1.5px solid ${bc.color}44`,borderRadius:14,padding:"16px 18px",marginBottom:20}}>
        <div style={{fontSize:11,color:t.textMuted,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:"'Jost',sans-serif",marginBottom:6}}>BMI</div>
        <div style={{display:"flex",alignItems:"baseline",gap:10}}>
          <div style={{fontSize:38,fontWeight:700,color:bc.color,fontFamily:"'Cormorant Garamond',serif",lineHeight:1}}>{bmi.toFixed(1)}</div>
          <div style={{fontSize:14,fontWeight:600,color:bc.color,fontFamily:"'Jost',sans-serif"}}>{bc.label}</div>
        </div>
        <div style={{marginTop:10,height:6,background:t.border,borderRadius:99,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${Math.min(((bmi-10)/30)*100,100)}%`,background:bc.color,borderRadius:99}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
          {[{l:"<18.5 Underweight",c:"#4A86B8"},{l:"18.5–25 Healthy",c:"#6B9E78"},{l:"25–30 Overweight",c:"#C9873A"},{l:"30+ Obese",c:"#C95252"}].map(r=>(
            <div key={r.l} style={{fontSize:8,color:r.c,fontFamily:"'Jost',sans-serif",fontWeight:600,maxWidth:60,textAlign:"center",lineHeight:1.2}}>{r.l}</div>
          ))}
        </div>
      </div>}

      {/* theme picker */}
      <div style={{fontSize:12,color:t.textMuted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12,fontFamily:"'Jost',sans-serif"}}>Appearance</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {Object.entries(PALETTES).map(([key,pal])=>(
          <button key={key} onClick={()=>setTheme(key)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",background:curTheme===key?`${t.accent}10`:t.surface,border:`1.5px solid ${curTheme===key?t.accent:t.border}`,borderRadius:14,cursor:"pointer"}}>
            <div style={{display:"flex",gap:5}}>{[pal.bg,pal.accent,pal.accentLight,pal.text].map((c,i)=><div key={i} style={{width:16,height:16,borderRadius:"50%",background:c,border:`1px solid ${pal.border}`}}/>)}</div>
            <div style={{flex:1,textAlign:"left",fontSize:14,fontWeight:curTheme===key?700:500,color:curTheme===key?t.accent:t.text,fontFamily:"'Jost',sans-serif"}}>{pal.emoji} {pal.name}</div>
            {curTheme===key&&<div style={{color:t.accent,fontSize:15}}>✓</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]     = useState(null);
  const [themeKey,setTK]   = useState("sage");
  const [tab,setTab]       = useState("chat");
  const t = PALETTES[themeKey];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Jost:wght@300;400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:${t.bg};font-family:'Jost',sans-serif;-webkit-font-smoothing:antialiased;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${t.border};border-radius:99px;}
        @keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        input::placeholder{color:${t.textDim};}
        input:focus{border-color:${t.accent}!important;}
        button{transition:all 0.2s;}
      `}</style>

      {!user
        ? <Onboarding onDone={d=>{setTK(d.theme||"sage");setUser(d);}} t={t}/>
        : <div style={{maxWidth:430,margin:"0 auto",height:"100dvh",display:"flex",flexDirection:"column",background:t.bg,overflow:"hidden"}}>

            {/* header */}
            <div style={{padding:"13px 20px 11px",background:t.surface,borderBottom:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:`${t.accentLight}33`,border:`1.5px solid ${t.accentLight}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Sprout size={22} color={t.accent}/></div>
                <div>
                  <div style={{color:t.text,fontWeight:700,fontSize:17,lineHeight:1,fontFamily:"'Cormorant Garamond',serif",letterSpacing:"0.01em"}}>NutriPantry</div>
                  <div style={{color:t.textMuted,fontSize:10,marginTop:1,fontFamily:"'Jost',sans-serif"}}>Ring connected · {user.name.split(" ")[0]}</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:t.accent,animation:"pulse 2.5s ease-in-out infinite"}}/>
                <span style={{color:t.textMuted,fontSize:11,fontFamily:"'Jost',sans-serif"}}>Live</span>
              </div>
            </div>

            {/* tab content */}
            <div style={{flex:1,overflow:"hidden"}} key={tab}>
              {tab==="chat"     && <ChatTab     t={t} user={user}/>}
              {tab==="tracker"  && <TrackerTab  t={t}/>}
              {tab==="pantry"   && <PantryTab   t={t}/>}
              {tab==="articles" && <ArticlesTab t={t}/>}
              {tab==="settings" && <SettingsTab t={t} curTheme={themeKey} setTheme={setTK} user={user}/>}
            </div>

            {/* bottom nav */}
            <div style={{display:"flex",background:t.navBg,borderTop:`1px solid ${t.border}`,padding:"8px 4px 14px",flexShrink:0}}>
              {TABS.map(tb=>(
                <button key={tb.id} onClick={()=>setTab(tb.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"5px 0",background:"none",border:"none",cursor:"pointer"}}>
                  <div style={{width:36,height:27,borderRadius:10,background:tab===tb.id?`${t.accent}18`:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontSize:14,color:tab===tb.id?t.accent:t.textDim,fontFamily:"'Cormorant Garamond',serif"}}>{tb.icon}</span>
                  </div>
                  <div style={{fontSize:9,color:tab===tb.id?t.accent:t.textDim,fontWeight:tab===tb.id?700:400,letterSpacing:"0.04em",fontFamily:"'Jost',sans-serif"}}>{tb.label}</div>
                </button>
              ))}
            </div>

          </div>
      }
    </>
  );
}
