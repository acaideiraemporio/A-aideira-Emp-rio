import { useState, useCallback } from "react";

const DEFAULT_STORE = {
  auth: { user: "admin", password: "acai2024", loggedIn: false },
  config: {
    name: "Açaídeira Empório",
    tagline: "O melhor açaí da cidade 🍇",
    address: "Rua das Flores, 123 – Centro",
    showAddress: true,
    whatsapp: "5511999999999",
    deliveryTime: "30–45 min",
    pixLink: "https://nubank.com.br/cobrar/exemplo",
    cardLink: "https://link-cartao.com",
    bannerText: "🎉 Promoção: Combo Família com 20% OFF hoje!",
    bannerActive: true,
    deliveryFee: 5.0,
  },
  products: [
    { id: 1, cat: "combos", name: "Combo Explosão", desc: "500ml + 2 adicionais + bebida", price: 32.9 },
    { id: 2, cat: "combos", name: "Combo Família", desc: "2 litros + 6 adicionais", price: 79.9 },
    { id: 3, cat: "combos", name: "Combo Econômico", desc: "300ml + 1 adicional", price: 19.9 },
    { id: 4, cat: "acai", name: "Açaí 300ml", desc: "Açaí puro cremoso", price: 12.9 },
    { id: 5, cat: "acai", name: "Açaí 500ml", desc: "O mais pedido!", price: 18.9 },
    { id: 6, cat: "acai", name: "Açaí 1 Litro", desc: "Melhor custo-benefício", price: 29.9 },
    { id: 7, cat: "sorvetes", name: "Sorvete de Creme", desc: "Cremoso", price: 8.9 },
    { id: 8, cat: "bebidas", name: "Suco de Laranja", desc: "Natural 300ml", price: 7.9 },
    { id: 9, cat: "petiscos", name: "Batata Frita", desc: "Porção 200g", price: 14.9 },
  ],
  addons: [
    { id: 1, name: "Granola", price: 2.5 },
    { id: 2, name: "Leite Condensado", price: 2.0 },
    { id: 3, name: "Banana", price: 1.5 },
    { id: 4, name: "Morango", price: 2.0 },
    { id: 5, name: "Nutella", price: 4.0 },
  ],
};

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;
const CATS = ["combos","acai","sorvetes","bebidas","petiscos"];
const CAT_NAMES = { combos:"🔥 Combos", acai:"🫐 Açaí", sorvetes:"🍦 Sorvetes", bebidas:"🥤 Bebidas", petiscos:"🍟 Petiscos" };
export default function App() {
  const [store] = useState(DEFAULT_STORE);
  const [view, setView] = useState("menu");
  const [cart, setCart] = useState([]);
  const [cat, setCat] = useState("combos");
  const [modal, setModal] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [form, setForm] = useState({ name:"", address:"", ref:"", payment:"pix", type:"delivery", obs:"" });
  const [paid, setPaid] = useState(false);
  const [loginForm, setLoginForm] = useState({ user:"", pass:"" });
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginErr, setLoginErr] = useState("");

  const { config, products, addons } = store;
  const cartTotal = cart.reduce((s,i) => s + i.price * i.qty, 0);
  const finalTotal = cartTotal + (config.deliveryFee || 0);
  const cartCount = cart.reduce((s,i) => s + i.qty, 0);

  const addToCart = (product) => {
    const addonTotal = selectedAddons.reduce((s,a) => s + a.price, 0);
    setCart(prev => [...prev, { id: Date.now(), name: product.name, price: product.price + addonTotal, addons: selectedAddons, qty: 1 }]);
    setModal(null);
    setSelectedAddons([]);
  };

  const changeQty = (id, d) => setCart(prev => prev.map(i => i.id === id ? {...i, qty: Math.max(0, i.qty+d)} : i).filter(i => i.qty > 0));

  const toggleAddon = (addon) => setSelectedAddons(prev => prev.find(a=>a.id===addon.id) ? prev.filter(a=>a.id!==addon.id) : [...prev, addon]);

  const buildMsg = () => encodeURIComponent([
    `🫐 *PEDIDO - ${config.name}*`,
    `👤 Cliente: ${form.name}`,
    `📍 Endereço: ${form.address}`,
    `🏠 Ref: ${form.ref}`,
    `🚚 Tipo: ${form.type === "delivery" ? "Delivery" : "Retirada"}`,
    `💳 Pagamento: ${form.payment === "pix" ? "PIX" : "Cartão"}`,
    `─────────────`,
    ...cart.map(i => `• ${i.qty}x ${i.name} — ${fmt(i.price*i.qty)}`),
    `─────────────`,
    `💰 Total: ${fmt(finalTotal)}`,
    form.obs ? `📝 Obs: ${form.obs}` : null,
  ].filter(Boolean).join("\n"));

  const login = () => {
    if (loginForm.user === store.auth.user && loginForm.pass === store.auth.password) {
      setLoggedIn(true); setView("admin");
    } else { setLoginErr("Usuário ou senha incorretos"); }
  };

  const s = { bg:"#0F0A1A", card:"#1A1028", primary:"#6B21A8", secondary:"#A855F7", accent:"#F59E0B", text:"#F3E8FF", muted:"#A78BCA" };
  const btn = (extra={}) => ({ padding:"13px", background:`linear-gradient(135deg,${s.primary},${s.secondary})`, border:"none", borderRadius:14, color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer", width:"100%", ...extra });
  const inp = { width:"100%", padding:"11px 13px", borderRadius:10, border:`1.5px solid rgba(168,85,247,.3)`, background:"rgba(168,85,247,.08)", color:s.text, fontSize:14, outline:"none", fontFamily:"inherit" };
  if (view === "login") return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:s.bg,padding:20}}>
      <div style={{background:s.card,borderRadius:20,padding:32,width:"100%",maxWidth:380,border:`1px solid rgba(168,85,247,.25)`}}>
        <div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:48}}>🔐</div><h2 style={{color:s.text,fontFamily:"serif",fontSize:22}}>Painel Admin</h2></div>
        {loginErr && <div style={{background:"#DC262620",border:"1px solid #DC2626",borderRadius:10,padding:"10px",color:"#FCA5A5",fontSize:13,marginBottom:12}}>{loginErr}</div>}
        {[["Usuário","user","text"],["Senha","pass","password"]].map(([l,k,t]) => (
          <div key={k} style={{marginBottom:12}}>
            <label style={{fontSize:12,color:s.muted,display:"block",marginBottom:4}}>{l}</label>
            <input type={t} value={loginForm[k]} onChange={e=>setLoginForm(p=>({...p,[k]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&login()} style={inp}/>
          </div>
        ))}
        <button onClick={login} style={btn({marginTop:8})}>Entrar</button>
        <button onClick={()=>setView("menu")} style={{...btn(),background:"transparent",border:`1px solid rgba(168,85,247,.2)`,color:s.muted,marginTop:8}}>← Cardápio</button>
      </div>
    </div>
  );

  if (view === "admin") return (
    <div style={{minHeight:"100vh",background:s.bg,color:s.text,padding:20,fontFamily:"sans-serif"}}>
      <div style={{maxWidth:500,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <h2 style={{fontFamily:"serif",fontSize:20}}>⚙️ Painel Admin</h2>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setView("menu")} style={{padding:"8px 14px",borderRadius:10,border:`1px solid rgba(168,85,247,.3)`,background:"transparent",color:s.muted,cursor:"pointer",fontSize:13}}>Ver Site</button>
            <button onClick={()=>{setLoggedIn(false);setView("menu");}} style={{padding:"8px 12px",borderRadius:10,background:"rgba(220,38,38,.2)",border:"1px solid rgba(220,38,38,.3)",color:"#FCA5A5",cursor:"pointer",fontSize:13}}>Sair</button>
          </div>
        </div>
        <div style={{background:s.card,borderRadius:14,padding:20,border:`1px solid rgba(168,85,247,.2)`}}>
          <p style={{color:s.muted,marginBottom:8,fontSize:14}}>Usuário: <strong style={{color:s.text}}>{store.auth.user}</strong></p>
          <p style={{color:s.muted,fontSize:14}}>WhatsApp: <strong style={{color:s.text}}>{config.whatsapp}</strong></p>
          <p style={{color:s.muted,fontSize:14,marginTop:8}}>Produtos cadastrados: <strong style={{color:s.accent}}>{products.length}</strong></p>
          <p style={{color:"#16A34A",fontSize:13,marginTop:16}}>✅ Sistema funcionando! Para edições avançadas acesse o código no GitHub.</p>
        </div>
      </div>
    </div>
  );

  if (view === "checkout") return (
    <div style={{minHeight:"100vh",background:s.bg,color:s.text,fontFamily:"sans-serif"}}>
      <div style={{maxWidth:480,margin:"0 auto",padding:"20px 16px 120px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <button onClick={()=>setView("cart")} style={{background:"rgba(168,85,247,.15)",border:"none",color:s.text,borderRadius:10,padding:"8px 12px",cursor:"pointer",fontSize:18}}>←</button>
          <h2 style={{fontFamily:"serif",fontSize:20}}>Finalizar Pedido</h2>
        </div>
        {!paid ? (
          <>
            {[["Nome completo *","name","text"],["Endereço *","address","text"],["Referência *","ref","text"]].map(([l,k,t])=>(
              <div key={k} style={{marginBottom:12}}>
                <label style={{fontSize:12,color:s.muted,display:"block",marginBottom:4}}>{l}</label>
                <input type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} style={inp}/>
              </div>
            ))}
            <div style={{marginBottom:12}}>
              <label style={{fontSize:12,color:s.muted,display:"block",marginBottom:4}}>Tipo</label>
              <div style={{display:"flex",gap:8}}>
                {[["delivery","🚚 Delivery"],["pickup","🏃 Retirada"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setForm(p=>({...p,type:v}))} style={{flex:1,padding:"10px",borderRadius:10,cursor:"pointer",border:`1.5px solid ${form.type===v?s.secondary:"rgba(168,85,247,.2)"}`,background:form.type===v?`${s.secondary}20`:"transparent",color:form.type===v?s.secondary:s.muted,fontWeight:600,fontSize:13}}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:12,color:s.muted,display:"block",marginBottom:4}}>Pagamento</label>
              <div style={{display:"flex",gap:8}}>
                {[["pix","💰 PIX"],["card","💳 Cartão"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setForm(p=>({...p,payment:v}))} style={{flex:1,padding:"10px",borderRadius:10,cursor:"pointer",border:`1.5px solid ${form.payment===v?s.accent:"rgba(168,85,247,.2)"}`,background:form.payment===v?`${s.accent}15`:"transparent",color:form.payment===v?s.accent:s.muted,fontWeight:600,fontSize:13}}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:12,color:s.muted,display:"block",marginBottom:4}}>Observações</label>
              <textarea value={form.obs} onChange={e=>setForm(p=>({...p,obs:e.target.value}))} rows={3} style={{...inp,resize:"vertical"}}/>
            </div>
            <div style={{background:s.card,borderRadius:14,padding:16,marginBottom:20,border:`1px solid rgba(168,85,247,.15)`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:14,color:s.muted}}><span>Subtotal</span><span>{fmt(cartTotal)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:14,color:s.muted}}><span>Taxa entrega</span><span>{fmt(config.deliveryFee)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:18,color:s.accent,borderTop:`1px solid rgba(168,85,247,.15)`,paddingTop:12}}><span>Total</span><span>{fmt(finalTotal)}</span></div>
            </div>
            <a href={form.payment==="pix"?config.pixLink:config.cardLink} target="_blank" rel="noreferrer" onClick={()=>setTimeout(()=>setPaid(true),1500)}
              style={{display:"block",padding:"15px",background:form.payment==="pix"?"linear-gradient(135deg,#16A34A,#22C55E)":"linear-gradient(135deg,#2563EB,#3B82F6)",borderRadius:14,color:"#fff",fontWeight:700,fontSize:16,textAlign:"center",textDecoration:"none",marginBottom:12}}>
              {form.payment==="pix"?"💰 Pagar via PIX":"💳 Pagar via Cartão"}
            </a>
            {!paid && <p style={{textAlign:"center",color:s.muted,fontSize:13}}>Pague primeiro para liberar o envio do pedido</p>}
          </>
        ) : (
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:60,marginBottom:16}}>✅</div>
            <h3 style={{fontFamily:"serif",fontSize:22,marginBottom:8}}>Pagamento confirmado!</h3>
            <p style={{color:s.muted,marginBottom:24}}>Agora envie seu pedido pelo WhatsApp</p>
            <a href={`https://wa.me/${config.whatsapp}?text=${buildMsg()}`} target="_blank" rel="noreferrer"
              style={{display:"block",padding:"15px",background:"linear-gradient(135deg,#16A34A,#22C55E)",borderRadius:14,color:"#fff",fontWeight:700,fontSize:16,textAlign:"center",textDecoration:"none"}}>
              📱 Enviar Pedido pelo WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );

  if (view === "cart") return (
    <div style={{minHeight:"100vh",background:s.bg,color:s.text,fontFamily:"sans-serif"}}>
      <div style={{maxWidth:480,margin:"0 auto",padding:"20px 16px 120px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <button onClick={()=>setView("menu")} style={{background:"rgba(168,85,247,.15)",border:"none",color:s.text,borderRadius:10,padding:"8px 12px",cursor:"pointer",fontSize:18}}>←</button>
          <h2 style={{fontFamily:"serif",fontSize:20}}>Meu Pedido</h2>
        </div>
        {cart.length===0 ? <p style={{color:s.muted,textAlign:"center",padding:"40px 0"}}>Carrinho vazio</p> :
          cart.map(item=>(
            <div key={item.id} style={{background:s.card,borderRadius:12,padding:"12px 14px",marginBottom:8,border:`1px solid rgba(168,85,247,.15)`,display:"flex",gap:12,alignItems:"center"}}>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14}}>{item.name}</div>
                {item.addons.length>0 && <div style={{fontSize:11,color:s.muted}}>+ {item.addons.map(a=>a.name).join(", ")}</div>}
                <div style={{color:s.accent,fontWeight:700,marginTop:4}}>{fmt(item.price)}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <button onClick={()=>changeQty(item.id,-1)} style={{width:28,height:28,borderRadius:8,border:`1.5px solid rgba(168,85,247,.3)`,background:"transparent",color:s.text,cursor:"pointer"}}>−</button>
                <span style={{fontWeight:700}}>{item.qty}</span>
                <button onClick={()=>changeQty(item.id,1)} style={{width:28,height:28,borderRadius:8,background:`linear-gradient(135deg,${s.primary},${s.secondary})`,border:"none",color:"#fff",cursor:"pointer"}}>+</button>
              </div>
            </div>
          ))
        }
        {cart.length>0 && (
          <div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:448}}>
            <button onClick={()=>setView("checkout")} style={btn()}>Finalizar → {fmt(finalTotal)}</button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:s.bg,color:s.text,fontFamily:"sans-serif",maxWidth:480,margin:"0 auto",paddingBottom:100}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');`}</style>
      {config.bannerActive && <div style={{background:`linear-gradient(135deg,${s.primary},${s.secondary})`,color:"#fff",padding:"10px 16px",textAlign:"center",fontSize:13,fontWeight:600}}>{config.bannerText}</div>}
      <div style={{padding:"24px 20px 16px",textAlign:"center",borderBottom:`1px solid rgba(168,85,247,.15)`}}>
        <div style={{fontSize:52,marginBottom:4}}>🫐</div>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,background:`linear-gradient(135deg,${s.secondary},${s.accent})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:4}}>{config.name}</h1>
        <p style={{color:s.muted,fontSize:13}}>{config.tagline}</p>
        {config.showAddress && <p style={{color:s.muted,fontSize:12,marginTop:4}}>📍 {config.address}</p>}
        <a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noreferrer" style={{color:"#25D366",fontSize:13,textDecoration:"none",display:"inline-block",marginTop:8}}>💬 WhatsApp</a>
      </div>
      <div style={{padding:"10px 16px",background:s.bg,position:"sticky",top:0,zIndex:10,borderBottom:`1px solid rgba(168,85,247,.1)`,display:"flex",gap:8,overflowX:"auto",scrollbarWidth:"none"}}>
        {CATS.map(c=>(
          <button key={c} onClick={()=>setCat(c)} style={{whiteSpace:"nowrap",padding:"7px 14px",borderRadius:20,border:`2px solid ${cat===c?s.secondary:"rgba(168,85,247,.2)"}`,background:cat===c?`${s.secondary}22`:"transparent",color:cat===c?s.secondary:s.muted,fontSize:13,fontWeight:600,cursor:"pointer"}}>{CAT_NAMES[c]}</button>
        ))}
      </div>
      <div style={{padding:"12px 16px",background:`${s.accent}18`,margin:"12px 16px",borderRadius:10,fontSize:13,color:s.accent,fontWeight:600,border:`1px solid ${s.accent}44`}}>⏱️ {config.deliveryTime}</div>
      <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:10}}>
        {products.filter(p=>p.cat===cat).map(p=>(
          <div key={p.id} onClick={()=>{setModal(p);setSelectedAddons([]);}} style={{background:s.card,borderRadius:14,padding:14,cursor:"pointer",border:`1px solid rgba(168,85,247,.15)`,display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:64,height:64,borderRadius:10,background:`linear-gradient(135deg,${s.primary}44,${s.secondary}44)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>🫐</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:15}}>{p.name}</div>
              <div style={{color:s.muted,fontSize:12,marginTop:2}}>{p.desc}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
                <span style={{fontFamily:"serif",fontSize:18,fontWeight:700,color:s.accent}}>{fmt(p.price)}</span>
                <span style={{background:`linear-gradient(135deg,${s.primary},${s.secondary})`,borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:700,color:"#fff"}}>+ Adicionar</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {cartCount>0 && (
        <div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:448,zIndex:99}}>
          <button onClick={()=>setView("cart")} style={{...btn(),display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{background:"rgba(255,255,255,.2)",borderRadius:20,padding:"4px 10px",fontSize:14}}>{cartCount} {cartCount===1?"item":"itens"}</span>
            <span>🛒 Ver Carrinho</span>
            <span>{fmt(cartTotal)}</span>
          </button>
        </div>
      )}
      {modal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div style={{background:s.card,borderRadius:"20px 20px 0 0",padding:24,width:"100%",maxWidth:480,maxHeight:"80vh",overflowY:"auto"}}>
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{fontSize:48}}>🫐</div>
              <h2 style={{fontFamily:"serif",fontSize:22,fontWeight:700,color:s.text}}>{modal.name}</h2>
              <p style={{color:s.muted,fontSize:13,marginTop:4}}>{modal.desc}</p>
            </div>
            {addons.length>0 && (
              <>
                <h3 style={{fontSize:13,fontWeight:700,color:s.muted,marginBottom:10,textTransform:"uppercase"}}>Adicionais</h3>
                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
                  {addons.map(a=>{
                    const sel=selectedAddons.find(x=>x.id===a.id);
                    return (
                      <div key={a.id} onClick={()=>toggleAddon(a)} style={{padding:"10px 14px",borderRadius:10,cursor:"pointer",border:`1.5px solid ${sel?s.secondary:"rgba(168,85,247,.2)"}`,background:sel?"rgba(168,85,247,.1)":"transparent",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:14}}>{a.name}</span>
                        <span style={{color:s.accent,fontWeight:700,fontSize:13}}>+{fmt(a.price)}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            <button onClick={()=>addToCart(modal)} style={btn()}>
              Adicionar · {fmt(modal.price + selectedAddons.reduce((s,a)=>s+a.price,0))}
            </button>
            <button onClick={()=>setModal(null)} style={{...btn(),background:"transparent",border:`1px solid rgba(168,85,247,.2)`,color:s.muted,marginTop:8}}>Cancelar</button>
          </div>
        </div>
      )}
      <button onClick={()=>setView(loggedIn?"admin":"login")} style={{position:"fixed",bottom:20,left:20,zIndex:100,background:"rgba(107,33,168,.8)",border:`1px solid rgba(168,85,247,.3)`,color:"#fff",borderRadius:12,padding:"10px 14px",fontSize:12,fontWeight:600,cursor:"pointer"}}>⚙️ Admin</button>
    </div>
  );
}