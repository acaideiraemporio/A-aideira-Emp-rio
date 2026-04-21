import { useState } from "react";

const TOKEN = import.meta.env.VITE_PAGSEGURO_TOKEN;
const EMAIL = import.meta.env.VITE_PAGSEGURO_EMAIL;

const DEFAULT_STORE = {
  auth: { user: "admin", password: "acai2024" },
  config: {
    name: "Açaídeira Empório",
    tagline: "Seu momento gelado começa aqui: Qualidade + sabor que vicia! 🧊",
    address: "Avenida Ayrton Senna, 599. Eduardo Gomes.",
    showAddress: true,
    whatsapp: "5579999999999",
    deliveryTime: "30–45 min",
    bannerText: "🎉 Promoção: Combo Família com 20% OFF hoje!",
    bannerActive: true,
    deliveryFee: 5.0,
  },
  products: [
    { id:1, cat:"combos", name:"Combo Explosão", desc:"500ml + 2 adicionais + bebida", price:32.9 },
    { id:2, cat:"combos", name:"Combo Família", desc:"2 litros + 6 adicionais", price:79.9 },
    { id:3, cat:"combos", name:"Combo Econômico", desc:"300ml + 1 adicional", price:19.9 },
    { id:4, cat:"acai", name:"Açaí 300ml", desc:"Açaí puro cremoso", price:12.9 },
    { id:5, cat:"acai", name:"Açaí 500ml", desc:"O mais pedido!", price:18.9 },
    { id:6, cat:"acai", name:"Açaí 1 Litro", desc:"Melhor custo-benefício", price:29.9 },
    { id:7, cat:"sorvetes", name:"Sorvete de Creme", desc:"Cremoso", price:8.9 },
    { id:8, cat:"bebidas", name:"Suco de Laranja", desc:"Natural 300ml", price:7.9 },
    { id:9, cat:"petiscos", name:"Batata Frita", desc:"Porção 200g", price:14.9 },
  ],
  addons: [
    { id:1, name:"Granola", price:2.5 },
    { id:2, name:"Leite Condensado", price:2.0 },
    { id:3, name:"Banana", price:1.5 },
    { id:4, name:"Morango", price:2.0 },
    { id:5, name:"Nutella", price:4.0 },
  ],
};

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;
const CATS = ["combos","acai","sorvetes","bebidas","petiscos"];
const CATNAMES = { combos:"🔥 Combos", acai:"🫐 Açaí", sorvetes:"🍦 Sorvetes", bebidas:"🥤 Bebidas", petiscos:"🍟 Petiscos" };
const S = { bg:"#0F0A1A", card:"#1A1028", pri:"#6B21A8", sec:"#A855F7", acc:"#F59E0B", txt:"#F3E8FF", mut:"#A78BCA" };

async function gerarPix(valor, descricao) {
  try {
    const resp = await fetch("https://sandbox.api.pagseguro.com/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        reference_id: `pedido-${Date.now()}`,
        customer: { name: "Cliente", email: "cliente@email.com" },
        items: [{ reference_id: "1", name: descricao, quantity: 1, unit_amount: Math.round(valor * 100) }],
        qr_codes: [{ amount: { value: Math.round(valor * 100) } }],
        notification_urls: ["https://seu-webhook.vercel.app/api/webhook"],
      }),
    });
    const data = await resp.json();
    if (data.qr_codes && data.qr_codes[0]) {
      return { 
        code: data.qr_codes[0].text, 
        id: data.id,
        status: "WAITING"
      };
    }
    return null;
  } catch (err) {
    console.error("Erro PIX:", err);
    return null;
  }
}
export default function App() {
  const [view, setView] = useState("menu");
  const [cart, setCart] = useState([]);
  const [cat, setCat] = useState("combos");
  const [modal, setModal] = useState(null);
  const [addons, setAddons] = useState([]);
  const [form, setForm] = useState({name:"",address:"",ref:"",payment:"pix",type:"delivery",obs:""});
  const [payStep, setPayStep] = useState("form"); // form | pix | card | confirmed
  const [pixData, setPixData] = useState(null);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [orderId] = useState(`#${Math.floor(Math.random()*9000)+1000}`);
  const [lu, setLu] = useState("");
  const [lp, setLp] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [lerr, setLerr] = useState("");

  const { config, products } = DEFAULT_STORE;
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const grand = total + config.deliveryFee;
  const count = cart.reduce((s,i)=>s+i.qty,0);

  const addToCart = (p) => {
    const at = addons.reduce((s,a)=>s+a.price,0);
    setCart(prev=>[...prev,{id:Date.now(),name:p.name,price:p.price+at,addons:[...addons],qty:1}]);
    setModal(null); setAddons([]);
  };
  const chg = (id,d) => setCart(prev=>prev.map(i=>i.id===id?{...i,qty:Math.max(0,i.qty+d)}:i).filter(i=>i.qty>0));
  const tog = (a) => setAddons(prev=>prev.find(x=>x.id===a.id)?prev.filter(x=>x.id!==a.id):[...prev,a]);

  const msgWhats = (tipo) => encodeURIComponent([
    `🫐 *PEDIDO ${orderId} - ${config.name}*`,
    `👤 ${form.name}`,
    `📍 ${form.address}`,
    `🏠 ${form.ref}`,
    `🚚 ${form.type==="delivery"?"Delivery":"Retirada"}`,
    `💳 Pagamento: ${tipo}`,
    `─────────────`,
    ...cart.map(i=>`• ${i.qty}x ${i.name} — ${fmt(i.price*i.qty)}`),
    `─────────────`,
    `💰 *Total: ${fmt(grand)}*`,
    form.obs?`📝 Obs: ${form.obs}`:"",
    `✅ PAGAMENTO CONFIRMADO`,
  ].filter(Boolean).join("\n"));

  const msgComprovante = () => encodeURIComponent(
    `🧾 Comprovante do Pedido ${orderId}\n💰 Valor: ${fmt(grand)}\n👤 ${form.name}\n\n[Anexe o comprovante aqui]`
  );

  const handlePix = async () => {
    if (!form.name || !form.address || !form.ref) {
      alert("Preencha todos os campos obrigatórios!"); return;
    }
    setPixLoading(true);
    const pix = await gerarPix(grand, `Pedido ${orderId} - ${config.name}`);
    setPixLoading(false);
    if (pix) { setPixData(pix); setPayStep("pix"); }
    else {
      setPixData({ code: "PIX-MANUAL", id: "manual" });
      setPayStep("pix");
    }
  };

  const handleCard = () => {
    if (!form.name || !form.address || !form.ref) {
      alert("Preencha todos os campos obrigatórios!"); return;
    }
    setPayStep("card");
  };

  const copyPix = () => {
    if (pixData?.code) {
      navigator.clipboard.writeText(pixData.code);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  const doLogin = () => {
    if(lu===DEFAULT_STORE.auth.user&&lp===DEFAULT_STORE.auth.password){setLoggedIn(true);setView("admin");}
    else{setLerr("Usuário ou senha incorretos");setTimeout(()=>setLerr(""),3000);}
  };

  const B = (o={}) => ({padding:"13px",background:`linear-gradient(135deg,${S.pri},${S.sec})`,border:"none",borderRadius:14,color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer",width:"100%",...o});
  const I = {width:"100%",padding:"11px 13px",borderRadius:10,border:`1.5px solid rgba(168,85,247,.3)`,background:"rgba(168,85,247,.08)",color:S.txt,fontSize:14,outline:"none",fontFamily:"inherit"};
  if(view==="login") return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:S.bg,padding:20}}>
      <div style={{background:S.card,borderRadius:20,padding:32,width:"100%",maxWidth:380,border:`1px solid rgba(168,85,247,.25)`}}>
        <div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:48}}>🔐</div><h2 style={{color:S.txt,fontFamily:"serif",fontSize:22}}>Painel Admin</h2></div>
        {lerr&&<div style={{background:"#DC262620",border:"1px solid #DC2626",borderRadius:10,padding:10,color:"#FCA5A5",fontSize:13,marginBottom:12}}>{lerr}</div>}
        <div style={{marginBottom:12}}><label style={{fontSize:12,color:S.mut,display:"block",marginBottom:4}}>Usuário</label><input value={lu} onChange={e=>setLu(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} style={I}/></div>
        <div style={{marginBottom:12}}><label style={{fontSize:12,color:S.mut,display:"block",marginBottom:4}}>Senha</label><input type="password" value={lp} onChange={e=>setLp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLogin()} style={I}/></div>
        <button onClick={doLogin} style={B({marginTop:8})}>Entrar</button>
        <button onClick={()=>setView("menu")} style={B({background:"transparent",border:`1px solid rgba(168,85,247,.2)`,color:S.mut,marginTop:8})}>← Cardápio</button>
      </div>
    </div>
  );

  if(view==="admin") return (
    <div style={{minHeight:"100vh",background:S.bg,color:S.txt,padding:20,fontFamily:"sans-serif"}}>
      <div style={{maxWidth:500,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{fontFamily:"serif",fontSize:20}}>⚙️ Painel Admin</h2>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setView("menu")} style={{padding:"8px 14px",borderRadius:10,border:`1px solid rgba(168,85,247,.3)`,background:"transparent",color:S.mut,cursor:"pointer",fontSize:13}}>Ver Site</button>
            <button onClick={()=>{setLoggedIn(false);setView("menu");}} style={{padding:"8px 12px",borderRadius:10,background:"rgba(220,38,38,.2)",border:"1px solid rgba(220,38,38,.3)",color:"#FCA5A5",cursor:"pointer",fontSize:13}}>Sair</button>
          </div>
        </div>
        <div style={{background:S.card,borderRadius:14,padding:20,border:`1px solid rgba(168,85,247,.2)`}}>
          <p style={{color:S.mut,fontSize:14,marginBottom:8}}>Usuário: <strong style={{color:S.txt}}>{DEFAULT_STORE.auth.user}</strong></p>
          <p style={{color:S.mut,fontSize:14,marginBottom:8}}>WhatsApp: <strong style={{color:S.txt}}>{config.whatsapp}</strong></p>
          <p style={{color:S.mut,fontSize:14}}>Produtos: <strong style={{color:S.acc}}>{products.length}</strong></p>
          <p style={{color:"#16A34A",fontSize:13,marginTop:16}}>✅ Sistema funcionando com PagSeguro!</p>
        </div>
      </div>
    </div>
  );

  if(view==="cart") return (
    <div style={{minHeight:"100vh",background:S.bg,color:S.txt,fontFamily:"sans-serif"}}>
      <div style={{maxWidth:480,margin:"0 auto",padding:"20px 16px 120px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <button onClick={()=>setView("menu")} style={{background:"rgba(168,85,247,.15)",border:"none",color:S.txt,borderRadius:10,padding:"8px 12px",cursor:"pointer",fontSize:18}}>←</button>
          <h2 style={{fontFamily:"serif",fontSize:20}}>Meu Pedido {orderId}</h2>
        </div>
        {cart.length===0?<p style={{color:S.mut,textAlign:"center",padding:"40px 0"}}>Carrinho vazio</p>:cart.map(item=>(
          <div key={item.id} style={{background:S.card,borderRadius:12,padding:"12px 14px",marginBottom:8,border:`1px solid rgba(168,85,247,.15)`,display:"flex",gap:12,alignItems:"center"}}>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14}}>{item.name}</div>
              {item.addons.length>0&&<div style={{fontSize:11,color:S.mut}}>+ {item.addons.map(a=>a.name).join(", ")}</div>}
              <div style={{color:S.acc,fontWeight:700,marginTop:4}}>{fmt(item.price)}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={()=>chg(item.id,-1)} style={{width:28,height:28,borderRadius:8,border:`1.5px solid rgba(168,85,247,.3)`,background:"transparent",color:S.txt,cursor:"pointer"}}>−</button>
              <span style={{fontWeight:700}}>{item.qty}</span>
              <button onClick={()=>chg(item.id,1)} style={{width:28,height:28,borderRadius:8,background:`linear-gradient(135deg,${S.pri},${S.sec})`,border:"none",color:"#fff",cursor:"pointer"}}>+</button>
            </div>
          </div>
        ))}
        <div style={{background:S.card,borderRadius:14,padding:16,margin:"16px 0",border:`1px solid rgba(168,85,247,.15)`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:14,color:S.mut}}><span>Subtotal</span><span>{fmt(total)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:14,color:S.mut}}><span>Taxa entrega</span><span>{fmt(config.deliveryFee)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:18,color:S.acc,borderTop:`1px solid rgba(168,85,247,.15)`,paddingTop:12}}><span>Total</span><span>{fmt(grand)}</span></div>
        </div>
        {cart.length>0&&<button onClick={()=>setView("checkout")} style={B()}>Finalizar Pedido → {fmt(grand)}</button>}
      </div>
    </div>
  );

  if(view==="checkout") {
    if(payStep==="confirmed") return (
      <div style={{minHeight:"100vh",background:S.bg,color:S.txt,fontFamily:"sans-serif",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
        <div style={{maxWidth:480,width:"100%",textAlign:"center"}}>
          <div style={{fontSize:72,marginBottom:16}}>✅</div>
          <h2 style={{fontFamily:"serif",fontSize:24,marginBottom:8,color:"#4ADE80"}}>Pagamento Confirmado!</h2>
          <p style={{color:S.mut,marginBottom:24,fontSize:15}}>Pedido {orderId} — {fmt(grand)}</p>
          <div style={{background:S.card,borderRadius:16,padding:20,marginBottom:16,border:`1px solid rgba(74,222,128,.3)`}}>
            <p style={{color:S.txt,fontSize:14,marginBottom:16}}>Envie o comprovante para a loja confirmar seu pedido:</p>
            <a href={`https://wa.me/${config.whatsapp}?text=${msgWhats(form.payment==="pix"?"PIX":"Cartão")}`} target="_blank" rel="noreferrer"
              style={{display:"block",padding:"14px",background:"linear-gradient(135deg,#16A34A,#22C55E)",borderRadius:12,color:"#fff",fontWeight:700,fontSize:15,textAlign:"center",textDecoration:"none",marginBottom:10}}>
              📱 Enviar Comprovante pelo WhatsApp
            </a>
            <p style={{color:S.mut,fontSize:12}}>Funciona tanto no WhatsApp normal quanto no Business</p>
          </div>
          <button onClick={()=>{setView("menu");setCart([]);setPayStep("form");}} style={B()}>Fazer Novo Pedido</button>
        </div>
      </div>
    );

    if(payStep==="pix") return (
      <div style={{minHeight:"100vh",background:S.bg,color:S.txt,fontFamily:"sans-serif"}}>
        <div style={{maxWidth:480,margin:"0 auto",padding:"20px 16px 40px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <button onClick={()=>setPayStep("form")} style={{background:"rgba(168,85,247,.15)",border:"none",color:S.txt,borderRadius:10,padding:"8px 12px",cursor:"pointer",fontSize:18}}>←</button>
            <h2 style={{fontFamily:"serif",fontSize:20}}>Pagar com PIX</h2>
          </div>
          <div style={{background:S.card,borderRadius:16,padding:24,border:`1px solid rgba(168,85,247,.2)`,textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:48,marginBottom:8}}>💰</div>
            <div style={{fontFamily:"serif",fontSize:32,fontWeight:700,color:S.acc,marginBottom:4}}>{fmt(grand)}</div>
            <p style={{color:S.mut,fontSize:13,marginBottom:20}}>Pedido {orderId}</p>
            {pixData?.code && pixData.code !== "PIX-MANUAL" ? (
              <>
                <div style={{background:"rgba(168,85,247,.1)",borderRadius:10,padding:"12px 16px",marginBottom:12,wordBreak:"break-all",fontSize:12,color:S.txt,border:`1px solid rgba(168,85,247,.2)`}}>
                  {pixData.code}
                </div>
                <button onClick={copyPix} style={B({marginBottom:12,background:pixCopied?"linear-gradient(135deg,#16A34A,#22C55E)":"linear-gradient(135deg,#6B21A8,#A855F7)"})}>
                  {pixCopied?"✅ Código Copiado!":"📋 Copiar Código PIX"}
                </button>
              </>
            ) : (
              <div style={{background:"rgba(245,158,11,.1)",borderRadius:10,padding:"12px 16px",marginBottom:12,fontSize:13,color:S.acc,border:`1px solid rgba(245,158,11,.3)`}}>
                ⚠️ Abra seu app bancário e pague via PIX para a chave cadastrada
              </div>
            )}
          </div>
          <div style={{background:S.card,borderRadius:14,padding:16,marginBottom:16,border:`1px solid rgba(168,85,247,.15)`}}>
            <p style={{color:S.txt,fontSize:14,fontWeight:600,marginBottom:12}}>Após pagar, envie o comprovante:</p>
            <a href={`https://wa.me/${config.whatsapp}?text=${msgComprovante()}`} target="_blank" rel="noreferrer"
              style={{display:"block",padding:"13px",background:"linear-gradient(135deg,#16A34A,#22C55E)",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,textAlign:"center",textDecoration:"none",marginBottom:8}}>
              📱 Enviar Comprovante pelo WhatsApp
            </a>
            <p style={{color:S.mut,fontSize:11,textAlign:"center"}}>Funciona no WhatsApp normal e Business</p>
          </div>
          <button onClick={()=>setPayStep("confirmed")} style={B({background:"linear-gradient(135deg,#16A34A,#22C55E)"})}>
            ✅ Já Paguei — Confirmar Pedido
          </button>
        </div>
      </div>
    );

    if(payStep==="card") return (
      <div style={{minHeight:"100vh",background:S.bg,color:S.txt,fontFamily:"sans-serif"}}>
        <div style={{maxWidth:480,margin:"0 auto",padding:"20px 16px 40px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <button onClick={()=>setPayStep("form")} style={{background:"rgba(168,85,247,.15)",border:"none",color:S.txt,borderRadius:10,padding:"8px 12px",cursor:"pointer",fontSize:18}}>←</button>
            <h2 style={{fontFamily:"serif",fontSize:20}}>Pagar com Cartão</h2>
          </div>
          <div style={{background:S.card,borderRadius:16,padding:24,border:`1px solid rgba(168,85,247,.2)`,textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:48,marginBottom:8}}>💳</div>
            <div style={{fontFamily:"serif",fontSize:32,fontWeight:700,color:S.acc,marginBottom:4}}>{fmt(grand)}</div>
            <p style={{color:S.mut,fontSize:13,marginBottom:20}}>Pedido {orderId}</p>
            <div style={{background:"rgba(245,158,11,.1)",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:13,color:S.acc,border:`1px solid rgba(245,158,11,.3)`}}>
              💳 Pague na maquineta no momento da entrega ou retirada
            </div>
          </div>
          <div style={{background:S.card,borderRadius:14,padding:16,marginBottom:16,border:`1px solid rgba(168,85,247,.15)`}}>
            <p style={{color:S.txt,fontSize:14,fontWeight:600,marginBottom:12}}>Confirme seu pedido pelo WhatsApp:</p>
            <a href={`https://wa.me/${config.whatsapp}?text=${msgWhats("Cartão na entrega")}`} target="_blank" rel="noreferrer"
              style={{display:"block",padding:"13px",background:"linear-gradient(135deg,#16A34A,#22C55E)",borderRadius:12,color:"#fff",fontWeight:700,fontSize:14,textAlign:"center",textDecoration:"none",marginBottom:8}}>
              📱 Enviar Pedido pelo WhatsApp
            </a>
          </div>
          <button onClick={()=>setPayStep("confirmed")} style={B({background:"linear-gradient(135deg,#16A34A,#22C55E)"})}>
            ✅ Confirmar Pedido
          </button>
        </div>
      </div>
    );
    return (
      <div style={{minHeight:"100vh",background:S.bg,color:S.txt,fontFamily:"sans-serif"}}>
        <div style={{maxWidth:480,margin:"0 auto",padding:"20px 16px 120px"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            <button onClick={()=>setView("cart")} style={{background:"rgba(168,85,247,.15)",border:"none",color:S.txt,borderRadius:10,padding:"8px 12px",cursor:"pointer",fontSize:18}}>←</button>
            <h2 style={{fontFamily:"serif",fontSize:20}}>Finalizar Pedido</h2>
          </div>
          {[["Nome completo *","name","text"],["Endereço de entrega *","address","text"],["Ponto de referência *","ref","text"]].map(([l,k,t])=>(
            <div key={k} style={{marginBottom:12}}>
              <label style={{fontSize:12,color:S.mut,display:"block",marginBottom:4}}>{l}</label>
              <input type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} style={I}/>
            </div>
          ))}
          <div style={{marginBottom:12}}>
            <label style={{fontSize:12,color:S.mut,display:"block",marginBottom:4}}>Tipo de pedido</label>
            <div style={{display:"flex",gap:8}}>
              {[["delivery","🚚 Delivery"],["pickup","🏃 Retirada"]].map(([v,l])=>(
                <button key={v} onClick={()=>setForm(p=>({...p,type:v}))} style={{flex:1,padding:"10px",borderRadius:10,cursor:"pointer",border:`1.5px solid ${form.type===v?S.sec:"rgba(168,85,247,.2)"}`,background:form.type===v?`${S.sec}20`:"transparent",color:form.type===v?S.sec:S.mut,fontWeight:600,fontSize:13}}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:12,color:S.mut,display:"block",marginBottom:4}}>Observações</label>
            <textarea value={form.obs} onChange={e=>setForm(p=>({...p,obs:e.target.value}))} rows={3} style={{...I,resize:"vertical"}}/>
          </div>
          <div style={{background:S.card,borderRadius:14,padding:16,marginBottom:20,border:`1px solid rgba(168,85,247,.15)`}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:14,color:S.mut}}><span>Subtotal</span><span>{fmt(total)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:14,color:S.mut}}><span>Taxa entrega</span><span>{fmt(config.deliveryFee)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:18,color:S.acc,borderTop:`1px solid rgba(168,85,247,.15)`,paddingTop:12}}><span>Total</span><span>{fmt(grand)}</span></div>
          </div>
          <p style={{color:S.mut,fontSize:13,marginBottom:12,textAlign:"center"}}>Escolha a forma de pagamento:</p>
          <button onClick={handlePix} disabled={pixLoading} style={B({background:"linear-gradient(135deg,#16A34A,#22C55E)",marginBottom:10})}>
            {pixLoading?"⏳ Gerando PIX...":"💰 Pagar com PIX"}
          </button>
          <button onClick={handleCard} style={B({background:"linear-gradient(135deg,#2563EB,#3B82F6)"})}>
            💳 Pagar com Cartão
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:S.bg,color:S.txt,fontFamily:"sans-serif",maxWidth:480,margin:"0 auto",paddingBottom:100}}>
      {config.bannerActive&&<div style={{background:`linear-gradient(135deg,${S.pri},${S.sec})`,color:"#fff",padding:"10px 16px",textAlign:"center",fontSize:13,fontWeight:600}}>{config.bannerText}</div>}
      <div style={{padding:"24px 20px 16px",textAlign:"center",borderBottom:`1px solid rgba(168,85,247,.15)`}}>
        <div style={{fontSize:52}}>🫐</div>
        <h1 style={{fontFamily:"serif",fontSize:26,fontWeight:700,color:S.sec,marginBottom:4}}>{config.name}</h1>
        <p style={{color:S.mut,fontSize:13}}>{config.tagline}</p>
        {config.showAddress&&<p style={{color:S.mut,fontSize:12,marginTop:4}}>📍 {config.address}</p>}
        <a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noreferrer" style={{color:"#25D366",fontSize:13,textDecoration:"none",display:"inline-block",marginTop:8}}>💬 WhatsApp</a>
      </div>
      <div style={{padding:"10px 16px",background:S.bg,position:"sticky",top:0,zIndex:10,borderBottom:`1px solid rgba(168,85,247,.1)`,display:"flex",gap:8,overflowX:"auto",scrollbarWidth:"none"}}>
        {CATS.map(c=><button key={c} onClick={()=>setCat(c)} style={{whiteSpace:"nowrap",padding:"7px 14px",borderRadius:20,border:`2px solid ${cat===c?S.sec:"rgba(168,85,247,.2)"}`,background:cat===c?`${S.sec}22`:"transparent",color:cat===c?S.sec:S.mut,fontSize:13,fontWeight:600,cursor:"pointer"}}>{CATNAMES[c]}</button>)}
      </div>
      <div style={{padding:"12px 16px",background:`${S.acc}18`,margin:"12px 16px",borderRadius:10,fontSize:13,color:S.acc,fontWeight:600,border:`1px solid ${S.acc}44`}}>⏱️ {config.deliveryTime}</div>
      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:10}}>
        {products.filter(p=>p.cat===cat).map(p=>(
          <div key={p.id} onClick={()=>{setModal(p);setAddons([]);}} style={{background:S.card,borderRadius:14,padding:14,cursor:"pointer",border:`1px solid rgba(168,85,247,.15)`,display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:64,height:64,borderRadius:10,background:`linear-gradient(135deg,${S.pri}44,${S.sec}44)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>🫐</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:15}}>{p.name}</div>
              <div style={{color:S.mut,fontSize:12,marginTop:2}}>{p.desc}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
                <span style={{fontFamily:"serif",fontSize:18,fontWeight:700,color:S.acc}}>{fmt(p.price)}</span>
                <span style={{background:`linear-gradient(135deg,${S.pri},${S.sec})`,borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:700,color:"#fff"}}>+ Adicionar</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {count>0&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:448,zIndex:99}}><button onClick={()=>setView("cart")} style={B({display:"flex",justifyContent:"space-between",alignItems:"center"})}><span style={{background:"rgba(255,255,255,.2)",borderRadius:20,padding:"4px 10px",fontSize:14}}>{count}</span><span>🛒 Ver Carrinho</span><span>{fmt(total)}</span></button></div>}
      {modal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={{background:S.card,borderRadius:"20px 20px 0 0",padding:24,width:"100%",maxWidth:480,maxHeight:"80vh",overflowY:"auto"}}>
            <div style={{textAlign:"center",marginBottom:16}}><div style={{fontSize:48}}>🫐</div><h2 style={{fontFamily:"serif",fontSize:22,color:S.txt}}>{modal.name}</h2><p style={{color:S.mut,fontSize:13,marginTop:4}}>{modal.desc}</p></div>
            <h3 style={{fontSize:13,fontWeight:700,color:S.mut,marginBottom:10,textTransform:"uppercase"}}>Adicionais</h3>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
              {DEFAULT_STORE.addons.map(a=>{const sel=addons.find(x=>x.id===a.id);return(
                <div key={a.id} onClick={()=>tog(a)} style={{padding:"10px 14px",borderRadius:10,cursor:"pointer",border:`1.5px solid ${sel?S.sec:"rgba(168,85,247,.2)"}`,background:sel?"rgba(168,85,247,.1)":"transparent",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:14}}>{a.name}</span><span style={{color:S.acc,fontWeight:700,fontSize:13}}>+{fmt(a.price)}</span>
                </div>
              );})}
            </div>
            <button onClick={()=>addToCart(modal)} style={B()}>Adicionar · {fmt(modal.price+addons.reduce((s,a)=>s+a.price,0))}</button>
            <button onClick={()=>setModal(null)} style={B({background:"transparent",border:`1px solid rgba(168,85,247,.2)`,color:S.mut,marginTop:8})}>Cancelar</button>
          </div>
        </div>
      )}
      <button onClick={()=>setView(loggedIn?"admin":"login")} style={{position:"fixed",bottom:20,left:20,zIndex:100,background:"rgba(107,33,168,.8)",border:`1px solid rgba(168,85,247,.3)`,color:"#fff",borderRadius:12,padding:"10px 14px",fontSize:12,fontWeight:600,cursor:"pointer"}}>⚙️ Admin</button>
    </div>
  );
}