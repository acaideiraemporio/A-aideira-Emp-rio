import { useState, useRef, useEffect } from "react";

// ─── DADOS INICIAIS ───────────────────────────────────────────────────────────
const INITIAL = {
  auth: { user: "admin", password: "acai2024" },
  config: {
    name: "Açaídeira Empório",
    tagline: "Seu momento gelado começa aqui 🧊",
    address: "Avenida Ayrton Senna, 599. Eduardo Gomes.",
    showAddress: true,
    whatsapp: "5579999999999",
    instagram: "acaideiraemporio",
    deliveryTime: "30–45 min",
    bannerText: "🎉 Promoção: Combo Família com 20% OFF hoje!",
    bannerActive: true,
    deliveryFee: 5.0,
    minOrder: 0,
    pixKey: "",
    logo: null,
    bgColor: "#0F0A1A",
    cardColor: "#1A1028",
    primaryColor: "#6B21A8",
    secondaryColor: "#A855F7",
    accentColor: "#F59E0B",
    textColor: "#F3E8FF",
    mutedColor: "#A78BCA",
    titleFont: "Georgia, serif",
    bodyFont: "system-ui, sans-serif",
    fontSize: "15px",
    borderRadius: "14px",
    headerBg: "#0F0A1A",
    buttonTextColor: "#ffffff",
    priceColor: "#F59E0B",
    badgeColor: "#6B21A8",
    footerText: "© 2026 Açaídeira Empório",
    showFooter: true,
  },
  categories: [
    { id: "combos", name: "🔥 Combos", active: true },
    { id: "acai", name: "🫐 Açaí", active: true },
    { id: "sorvetes", name: "🍦 Sorvetes", active: true },
    { id: "bebidas", name: "🥤 Bebidas", active: true },
    { id: "petiscos", name: "🍟 Petiscos", active: true },
  ],
  products: [
    { id: 1, cat: "combos", name: "Combo Explosão", desc: "500ml + 2 adicionais + bebida", price: 32.9, image: null, active: true },
    { id: 2, cat: "combos", name: "Combo Família", desc: "2 litros + 6 adicionais", price: 79.9, image: null, active: true },
    { id: 3, cat: "combos", name: "Combo Econômico", desc: "300ml + 1 adicional", price: 19.9, image: null, active: true },
    { id: 4, cat: "acai", name: "Açaí 300ml", desc: "Açaí puro cremoso", price: 12.9, image: null, active: true },
    { id: 5, cat: "acai", name: "Açaí 500ml", desc: "O mais pedido!", price: 18.9, image: null, active: true },
    { id: 6, cat: "acai", name: "Açaí 1 Litro", desc: "Melhor custo-benefício", price: 29.9, image: null, active: true },
    { id: 7, cat: "sorvetes", name: "Sorvete de Creme", desc: "Cremoso e delicioso", price: 8.9, image: null, active: true },
    { id: 8, cat: "bebidas", name: "Suco de Laranja", desc: "Natural 300ml", price: 7.9, image: null, active: true },
    { id: 9, cat: "petiscos", name: "Batata Frita", desc: "Porção 200g", price: 14.9, image: null, active: true },
  ],
  addons: [
    { id: 1, name: "Granola", price: 2.5, active: true },
    { id: 2, name: "Leite Condensado", price: 2.0, active: true },
    { id: 3, name: "Banana", price: 1.5, active: true },
    { id: 4, name: "Morango", price: 2.0, active: true },
    { id: 5, name: "Nutella", price: 4.0, active: true },
  ],
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;
const uid = () => Date.now() + Math.random().toString(36).slice(2);

function useStore() {
  const [store, setStore] = useState(() => {
    try {
      const s = localStorage.getItem("acai_store_v2");
      if (!s) return INITIAL;
      const parsed = JSON.parse(s);
      // merge config keys from INITIAL in case new keys were added
      return { ...INITIAL, ...parsed, config: { ...INITIAL.config, ...parsed.config } };
    } catch { return INITIAL; }
  });
  const update = (fn) =>
    setStore((prev) => {
      const next = typeof fn === "function" ? fn(prev) : { ...prev, ...fn };
      try { localStorage.setItem("acai_store_v2", JSON.stringify(next)); } catch {}
      return next;
    });
  return [store, update];
}

// ─── IMAGE UPLOAD ─────────────────────────────────────────────────────────────
function ImageUpload({ value, onChange, label = "Imagem" }) {
  const fileRef = useRef();
  const cameraRef = useRef();
  const [urlInput, setUrlInput] = useState("");

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Imagem muito grande! Máximo 5MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { onChange(ev.target.result); setUrlInput(""); };
    reader.readAsDataURL(file);
  };

  const handleUrl = () => {
    if (urlInput.trim()) { onChange(urlInput.trim()); }
  };

  const s = {
    wrap: { marginBottom: 14 },
    lbl: { fontSize: 12, color: "#A78BCA", display: "block", marginBottom: 6, fontWeight: 600 },
    row: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 8 },
    btn: { padding: "8px 14px", borderRadius: 8, border: "1.5px solid rgba(168,85,247,.35)", background: "rgba(168,85,247,.1)", color: "#F3E8FF", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" },
    preview: { width: 50, height: 50, borderRadius: 10, objectFit: "cover", border: "2px solid rgba(168,85,247,.4)" },
    delBtn: { padding: "4px 10px", borderRadius: 6, border: "1px solid rgba(220,38,38,.3)", background: "transparent", color: "#FCA5A5", fontSize: 11, cursor: "pointer" },
    urlRow: { display: "flex", gap: 6 },
    urlInput: { flex: 1, padding: "8px 12px", borderRadius: 8, border: "1.5px solid rgba(168,85,247,.2)", background: "rgba(0,0,0,.2)", color: "#F3E8FF", fontSize: 12, outline: "none" },
    urlBtn: { padding: "8px 14px", borderRadius: 8, border: "none", background: "rgba(168,85,247,.25)", color: "#F3E8FF", fontSize: 12, cursor: "pointer" },
  };

  return (
    <div style={s.wrap}>
      <label style={s.lbl}>{label}</label>
      <div style={s.row}>
        <button style={s.btn} onClick={() => fileRef.current?.click()}>📁 Arquivo</button>
        <button style={s.btn} onClick={() => cameraRef.current?.click()}>📷 Câmera</button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
        {value && <img src={value} alt="" style={s.preview} />}
        {value && <button style={s.delBtn} onClick={() => onChange(null)}>🗑 Remover</button>}
      </div>
      <div style={s.urlRow}>
        <input style={s.urlInput} placeholder="Ou cole URL da imagem aqui..." value={urlInput} onChange={e => setUrlInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleUrl()} />
        <button style={s.urlBtn} onClick={handleUrl}>OK</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [store, update] = useStore();
  const { config, categories, products, addons } = store;

  const [cart, setCart] = useState([]);
  const [view, setView] = useState("menu"); // menu | checkout | admin
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminTab, setAdminTab] = useState("produtos");
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [selectedCat, setSelectedCat] = useState(null);
  const [productModal, setProductModal] = useState(null); // product being added
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [obs, setObs] = useState("");
  const [qty, setQty] = useState(1);

  // checkout form
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddr, setClientAddr] = useState("");
  const [deliveryType, setDeliveryType] = useState("entrega");
  const [payMethod, setPayMethod] = useState("pix");
  const [changeFor, setChangeFor] = useState("");

  const activeCats = categories.filter(c => c.active);
  const activeCat = selectedCat || (activeCats[0]?.id ?? null);

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const deliveryFee = deliveryType === "entrega" ? Number(config.deliveryFee) || 0 : 0;
  const orderTotal = cartTotal + deliveryFee;

  // ── CSS vars injection ────────────────────────────────────────────────────
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--bg", config.bgColor);
    r.setProperty("--card", config.cardColor);
    r.setProperty("--primary", config.primaryColor);
    r.setProperty("--secondary", config.secondaryColor);
    r.setProperty("--accent", config.accentColor);
    r.setProperty("--text", config.textColor);
    r.setProperty("--muted", config.mutedColor);
    r.setProperty("--radius", config.borderRadius);
    r.setProperty("--font-title", config.titleFont);
    r.setProperty("--font-body", config.bodyFont);
    r.setProperty("--font-size", config.fontSize);
    r.setProperty("--price-color", config.priceColor);
    r.setProperty("--btn-text", config.buttonTextColor);
    r.setProperty("--header-bg", config.headerBg);
  }, [config]);

  // ── helpers ───────────────────────────────────────────────────────────────
  const addToCart = () => {
    if (!productModal) return;
    const addonsTotal = selectedAddons.reduce((s, id) => {
      const a = addons.find(x => x.id === id);
      return s + (a ? a.price : 0);
    }, 0);
    const item = {
      cartId: uid(),
      productId: productModal.id,
      name: productModal.name,
      price: productModal.price + addonsTotal,
      qty,
      addons: selectedAddons.map(id => addons.find(x => x.id === id)?.name).filter(Boolean),
      obs,
    };
    setCart(prev => [...prev, item]);
    setProductModal(null);
    setSelectedAddons([]);
    setObs("");
    setQty(1);
  };

  const removeFromCart = (cartId) => setCart(prev => prev.filter(i => i.cartId !== cartId));
  const changeQty = (cartId, delta) =>
    setCart(prev => prev.map(i => i.cartId === cartId ? { ...i, qty: Math.max(1, i.qty + delta) } : i));

  // ── WhatsApp checkout ─────────────────────────────────────────────────────
  const sendWhatsApp = () => {
    if (!clientName.trim()) { alert("Por favor, informe seu nome."); return; }
    if (deliveryType === "entrega" && !clientAddr.trim()) { alert("Por favor, informe o endereço de entrega."); return; }

    const lines = [
      `🛒 *NOVO PEDIDO — ${config.name}*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `👤 *Cliente:* ${clientName}`,
      clientPhone ? `📱 *Telefone:* ${clientPhone}` : null,
      `🚚 *Tipo:* ${deliveryType === "entrega" ? "Entrega" : "Retirada no local"}`,
      deliveryType === "entrega" ? `📍 *Endereço:* ${clientAddr}` : null,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `📋 *ITENS DO PEDIDO:*`,
      ...cart.map((item, i) => {
        let line = `${i + 1}. *${item.name}* x${item.qty} — ${fmt(item.price * item.qty)}`;
        if (item.addons.length) line += `\n   ➕ Adicionais: ${item.addons.join(", ")}`;
        if (item.obs) line += `\n   📝 Obs: ${item.obs}`;
        return line;
      }),
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `🧾 *Subtotal:* ${fmt(cartTotal)}`,
      deliveryType === "entrega" ? `🚚 *Taxa de entrega:* ${fmt(deliveryFee)}` : null,
      `💰 *TOTAL: ${fmt(orderTotal)}*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `💳 *Forma de pagamento:* ${payMethod === "pix" ? "PIX" : payMethod === "cartao" ? "Cartão" : `Dinheiro${changeFor ? ` (troco para ${fmt(changeFor)})` : ""}`}`,
      config.pixKey && payMethod === "pix" ? `🔑 *Chave PIX:* ${config.pixKey}` : null,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `⏱ Previsão: ${config.deliveryTime}`,
      `\n_Pedido enviado pelo cardápio digital_`,
    ].filter(Boolean).join("\n");

    const phone = config.whatsapp.replace(/\D/g, "");
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(lines)}`;
    window.open(url, "_blank");
  };

  // ── Admin ─────────────────────────────────────────────────────────────────
  const doLogin = () => {
    if (loginUser === store.auth.user && loginPass === store.auth.password) {
      setAdminAuth(true); setLoginErr("");
    } else setLoginErr("Usuário ou senha incorretos.");
  };

  const cfgSet = (key, val) => update(s => ({ ...s, config: { ...s.config, [key]: val } }));

  // ─── STYLES ───────────────────────────────────────────────────────────────
  const S = {
    app: { minHeight: "100vh", background: config.bgColor, color: config.textColor, fontFamily: config.bodyFont, fontSize: config.fontSize },
    header: { background: config.headerBg, borderBottom: "1px solid rgba(168,85,247,.18)", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
    logo: { width: 44, height: 44, borderRadius: 10, objectFit: "cover", marginRight: 10 },
    storeName: { fontFamily: config.titleFont, fontSize: 20, fontWeight: 700, color: config.textColor },
    tagline: { fontSize: 11, color: config.mutedColor, marginTop: 1 },
    banner: { background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})`, padding: "10px 16px", textAlign: "center", fontSize: 13, fontWeight: 600, color: "#fff" },
    catBar: { display: "flex", gap: 8, padding: "12px 16px", overflowX: "auto", scrollbarWidth: "none" },
    catBtn: (active) => ({ padding: "8px 18px", borderRadius: 30, border: `1.5px solid ${active ? config.secondaryColor : "rgba(168,85,247,.2)"}`, background: active ? `linear-gradient(135deg,${config.primaryColor},${config.secondaryColor})` : "transparent", color: active ? "#fff" : config.mutedColor, fontSize: 13, fontWeight: active ? 700 : 400, cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s" }),
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14, padding: "16px" },
    card: { background: config.cardColor, borderRadius: config.borderRadius, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(168,85,247,.12)", transition: "transform .18s,box-shadow .18s" },
    cardImg: { width: "100%", height: 130, objectFit: "cover" },
    cardImgPh: { width: "100%", height: 130, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, background: "rgba(168,85,247,.06)" },
    cardBody: { padding: "10px 12px 12px" },
    cardName: { fontFamily: config.titleFont, fontSize: 14, fontWeight: 700, marginBottom: 4, color: config.textColor },
    cardDesc: { fontSize: 11, color: config.mutedColor, marginBottom: 8, lineHeight: 1.4 },
    cardPrice: { fontSize: 16, fontWeight: 700, color: config.priceColor },
    addBtn: { float: "right", width: 30, height: 30, borderRadius: 8, border: "none", background: `linear-gradient(135deg,${config.primaryColor},${config.secondaryColor})`, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 },
    cartBar: { position: "fixed", bottom: 0, left: 0, right: 0, background: `linear-gradient(135deg,${config.primaryColor},${config.secondaryColor})`, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", zIndex: 200 },
    cartBarText: { color: "#fff", fontWeight: 700, fontSize: 15 },
    modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 300, display: "flex", alignItems: "flex-end" },
    modalBox: { background: config.cardColor, borderRadius: `${config.borderRadius} ${config.borderRadius} 0 0`, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "24px 20px 32px" },
    modalTitle: { fontFamily: config.titleFont, fontSize: 20, fontWeight: 700, marginBottom: 6 },
    sectionTitle: { fontSize: 13, fontWeight: 700, color: config.mutedColor, textTransform: "uppercase", letterSpacing: 1, marginTop: 18, marginBottom: 10 },
    addonRow: (sel) => ({ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${sel ? config.secondaryColor : "rgba(168,85,247,.15)"}`, background: sel ? "rgba(168,85,247,.12)" : "transparent", marginBottom: 6, cursor: "pointer" }),
    qtyRow: { display: "flex", alignItems: "center", gap: 14, justifyContent: "center", margin: "16px 0" },
    qtyBtn: { width: 36, height: 36, borderRadius: 10, border: "none", background: `rgba(168,85,247,.2)`, color: config.textColor, fontSize: 20, cursor: "pointer" },
    mainBtn: { width: "100%", padding: "14px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${config.primaryColor},${config.secondaryColor})`, color: config.buttonTextColor, fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 10 },
    secondBtn: { width: "100%", padding: "12px", borderRadius: 12, border: `1.5px solid rgba(168,85,247,.3)`, background: "transparent", color: config.textColor, fontSize: 14, cursor: "pointer", marginTop: 8 },
    input: { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid rgba(168,85,247,.2)", background: "rgba(0,0,0,.25)", color: config.textColor, fontSize: 14, outline: "none", boxSizing: "border-box" },
    adminWrap: { minHeight: "100vh", background: "#0a0612", color: "#F3E8FF", fontFamily: "system-ui,sans-serif" },
    adminHeader: { background: "#120c1e", borderBottom: "1px solid rgba(168,85,247,.2)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    adminTab: (a) => ({ padding: "10px 18px", borderRadius: 10, border: "none", background: a ? "rgba(168,85,247,.25)" : "transparent", color: a ? "#F3E8FF" : "#A78BCA", fontSize: 13, fontWeight: a ? 700 : 400, cursor: "pointer" }),
    adminSection: { background: "#1a1028", borderRadius: 14, padding: 18, marginBottom: 14 },
    adminLabel: { fontSize: 12, color: "#A78BCA", display: "block", marginBottom: 5, fontWeight: 600 },
    adminInput: { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid rgba(168,85,247,.2)", background: "rgba(0,0,0,.3)", color: "#F3E8FF", fontSize: 13, outline: "none", boxSizing: "border-box" },
    adminBtn: { padding: "8px 16px", borderRadius: 8, border: "none", background: "rgba(168,85,247,.2)", color: "#F3E8FF", fontSize: 13, cursor: "pointer" },
    dangerBtn: { padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(220,38,38,.3)", background: "transparent", color: "#FCA5A5", fontSize: 12, cursor: "pointer" },
    toggle: (on) => ({ width: 42, height: 24, borderRadius: 12, background: on ? "#7C3AED" : "#374151", position: "relative", cursor: "pointer", border: "none", transition: "background .2s", flexShrink: 0 }),
    toggleDot: (on) => ({ position: "absolute", top: 3, left: on ? 20 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s" }),
  };

  // ── MENU VIEW ─────────────────────────────────────────────────────────────
  if (view === "menu") {
    const catProducts = products.filter(p => p.active && p.cat === activeCat);
    return (
      <div style={S.app}>
        {/* Header */}
        <header style={S.header}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {config.logo && <img src={config.logo} alt="logo" style={S.logo} />}
            <div>
              <div style={S.storeName}>{config.name}</div>
              <div style={S.tagline}>{config.tagline}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {config.instagram && (
              <a href={`https://instagram.com/${config.instagram.replace(/.*instagram\.com\//,"").replace(/\//,"")}`} target="_blank" rel="noreferrer"
                style={{ color: config.mutedColor, fontSize: 22, textDecoration: "none" }}>📸</a>
            )}
            {config.whatsapp && (
              <a href={`https://wa.me/${config.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                style={{ color: config.mutedColor, fontSize: 22, textDecoration: "none" }}>💬</a>
            )}
            <button onClick={() => { setView("admin"); setAdminAuth(false); }}
              style={{ background: "none", border: "none", color: config.mutedColor, fontSize: 22, cursor: "pointer" }}>⚙️</button>
          </div>
        </header>

        {/* Banner */}
        {config.bannerActive && config.bannerText && (
          <div style={S.banner}>{config.bannerText}</div>
        )}

        {/* Address + Delivery Info */}
        {config.showAddress && (
          <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(168,85,247,.1)", display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: config.mutedColor }}>📍 {config.address}</span>
            <span style={{ fontSize: 12, color: config.mutedColor }}>⏱ {config.deliveryTime}</span>
            {Number(config.deliveryFee) > 0 && <span style={{ fontSize: 12, color: config.mutedColor }}>🚚 {fmt(config.deliveryFee)}</span>}
          </div>
        )}

        {/* Category Bar */}
        <div style={S.catBar}>
          {activeCats.map(cat => (
            <button key={cat.id} style={S.catBtn(activeCat === cat.id)} onClick={() => setSelectedCat(cat.id)}>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products */}
        <div style={S.grid}>
          {catProducts.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: config.mutedColor, padding: 40 }}>Nenhum produto nesta categoria.</div>
          )}
          {catProducts.map(p => (
            <div key={p.id} style={S.card}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,.4)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
              onClick={() => { setProductModal(p); setSelectedAddons([]); setObs(""); setQty(1); }}>
              {p.image
                ? <img src={p.image} alt={p.name} style={S.cardImg} />
                : <div style={S.cardImgPh}>🫐</div>}
              <div style={S.cardBody}>
                <div style={S.cardName}>{p.name}</div>
                <div style={S.cardDesc}>{p.desc}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={S.cardPrice}>{fmt(p.price)}</span>
                  <button style={S.addBtn} onClick={e => { e.stopPropagation(); setProductModal(p); setSelectedAddons([]); setObs(""); setQty(1); }}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom spacer for cart bar */}
        {cartCount > 0 && <div style={{ height: 70 }} />}

        {/* Cart Bar */}
        {cartCount > 0 && (
          <div style={S.cartBar} onClick={() => setView("checkout")}>
            <span style={S.cartBarText}>🛒 Ver pedido ({cartCount})</span>
            <span style={S.cartBarText}>{fmt(cartTotal)}</span>
          </div>
        )}

        {/* Footer */}
        {config.showFooter && (
          <div style={{ textAlign: "center", padding: "20px 16px", color: config.mutedColor, fontSize: 11 }}>
            {config.footerText}
          </div>
        )}

        {/* Product Modal */}
        {productModal && (
          <div style={S.modal} onClick={e => e.target === e.currentTarget && setProductModal(null)}>
            <div style={S.modalBox}>
              {productModal.image && <img src={productModal.image} alt={productModal.name} style={{ width: "100%", borderRadius: 12, maxHeight: 200, objectFit: "cover", marginBottom: 14 }} />}
              <div style={S.modalTitle}>{productModal.name}</div>
              <div style={{ color: config.mutedColor, fontSize: 13, marginBottom: 8 }}>{productModal.desc}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: config.priceColor, marginBottom: 4 }}>{fmt(productModal.price)}</div>

              {addons.filter(a => a.active).length > 0 && (
                <>
                  <div style={S.sectionTitle}>Adicionais</div>
                  {addons.filter(a => a.active).map(a => {
                    const sel = selectedAddons.includes(a.id);
                    return (
                      <div key={a.id} style={S.addonRow(sel)}
                        onClick={() => setSelectedAddons(prev => sel ? prev.filter(x => x !== a.id) : [...prev, a.id])}>
                        <span style={{ fontSize: 14 }}>{sel ? "✅" : "⬜"} {a.name}</span>
                        <span style={{ color: config.priceColor, fontSize: 13 }}>+ {fmt(a.price)}</span>
                      </div>
                    );
                  })}
                </>
              )}

              <div style={S.sectionTitle}>Observações</div>
              <textarea placeholder="Ex: sem granola, calda extra..." value={obs} onChange={e => setObs(e.target.value)}
                style={{ ...S.input, minHeight: 60, resize: "vertical", fontFamily: "inherit" }} />

              <div style={S.qtyRow}>
                <button style={S.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span style={{ fontSize: 20, fontWeight: 700, minWidth: 32, textAlign: "center" }}>{qty}</span>
                <button style={S.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
              </div>

              <button style={S.mainBtn} onClick={addToCart}>
                Adicionar ao pedido — {fmt((productModal.price + selectedAddons.reduce((s, id) => s + (addons.find(x => x.id === id)?.price || 0), 0)) * qty)}
              </button>
              <button style={S.secondBtn} onClick={() => setProductModal(null)}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── CHECKOUT VIEW ─────────────────────────────────────────────────────────
  if (view === "checkout") {
    return (
      <div style={S.app}>
        <header style={S.header}>
          <button onClick={() => setView("menu")} style={{ background: "none", border: "none", color: config.textColor, fontSize: 22, cursor: "pointer" }}>←</button>
          <span style={{ ...S.storeName, fontSize: 17 }}>Finalizar Pedido</span>
          <span />
        </header>
        <div style={{ padding: "16px 16px 100px" }}>

          {/* Order Summary */}
          <div style={{ ...S.adminSection, background: config.cardColor }}>
            <div style={S.sectionTitle}>Seu Pedido</div>
            {cart.map(item => (
              <div key={item.cartId} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid rgba(168,85,247,.1)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name} x{item.qty}</div>
                  {item.addons.length > 0 && <div style={{ fontSize: 11, color: config.mutedColor }}>+ {item.addons.join(", ")}</div>}
                  {item.obs && <div style={{ fontSize: 11, color: config.mutedColor }}>📝 {item.obs}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: config.priceColor, fontWeight: 700 }}>{fmt(item.price * item.qty)}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 4, justifyContent: "flex-end" }}>
                    <button onClick={() => changeQty(item.cartId, -1)} style={{ ...S.qtyBtn, width: 24, height: 24, fontSize: 14 }}>−</button>
                    <button onClick={() => changeQty(item.cartId, 1)} style={{ ...S.qtyBtn, width: 24, height: 24, fontSize: 14 }}>+</button>
                    <button onClick={() => removeFromCart(item.cartId)} style={{ ...S.dangerBtn, padding: "2px 8px", fontSize: 11 }}>🗑</button>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ color: config.mutedColor }}>Subtotal</span>
              <span style={{ fontWeight: 700 }}>{fmt(cartTotal)}</span>
            </div>
            {deliveryType === "entrega" && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ color: config.mutedColor }}>Taxa de entrega</span>
                <span style={{ fontWeight: 700 }}>{fmt(deliveryFee)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(168,85,247,.2)" }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: 18, color: config.priceColor }}>{fmt(orderTotal)}</span>
            </div>
          </div>

          {/* Client Info */}
          <div style={{ ...S.adminSection, background: config.cardColor }}>
            <div style={S.sectionTitle}>Seus Dados</div>
            <label style={S.adminLabel}>Nome completo *</label>
            <input style={{ ...S.input, marginBottom: 10 }} placeholder="Seu nome" value={clientName} onChange={e => setClientName(e.target.value)} />
            <label style={S.adminLabel}>WhatsApp (opcional)</label>
            <input style={{ ...S.input, marginBottom: 10 }} placeholder="(79) 9 9999-9999" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
          </div>

          {/* Delivery Type */}
          <div style={{ ...S.adminSection, background: config.cardColor }}>
            <div style={S.sectionTitle}>Como você quer receber?</div>
            <div style={{ display: "flex", gap: 10 }}>
              {["entrega", "retirada"].map(t => (
                <button key={t} onClick={() => setDeliveryType(t)}
                  style={{ flex: 1, padding: "12px 8px", borderRadius: 10, border: `2px solid ${deliveryType === t ? config.secondaryColor : "rgba(168,85,247,.2)"}`, background: deliveryType === t ? "rgba(168,85,247,.15)" : "transparent", color: config.textColor, fontSize: 14, fontWeight: deliveryType === t ? 700 : 400, cursor: "pointer" }}>
                  {t === "entrega" ? "🚚 Entrega" : "🏪 Retirar"}
                </button>
              ))}
            </div>
            {deliveryType === "entrega" && (
              <div style={{ marginTop: 12 }}>
                <label style={S.adminLabel}>Endereço de entrega *</label>
                <textarea style={{ ...S.input, minHeight: 60, resize: "vertical", fontFamily: "inherit" }}
                  placeholder="Rua, número, bairro, complemento..." value={clientAddr} onChange={e => setClientAddr(e.target.value)} />
              </div>
            )}
          </div>

          {/* Payment */}
          <div style={{ ...S.adminSection, background: config.cardColor }}>
            <div style={S.sectionTitle}>Forma de pagamento</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[["pix", "💳 PIX"], ["cartao", "💳 Cartão"], ["dinheiro", "💵 Dinheiro"]].map(([v, l]) => (
                <button key={v} onClick={() => setPayMethod(v)}
                  style={{ padding: "11px 14px", borderRadius: 10, border: `2px solid ${payMethod === v ? config.secondaryColor : "rgba(168,85,247,.15)"}`, background: payMethod === v ? "rgba(168,85,247,.12)" : "transparent", color: config.textColor, fontSize: 14, textAlign: "left", cursor: "pointer" }}>
                  {payMethod === v ? "✅" : "⬜"} {l}
                </button>
              ))}
              {payMethod === "pix" && config.pixKey && (
                <div style={{ background: "rgba(168,85,247,.08)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: config.mutedColor }}>
                  🔑 Chave PIX: <b style={{ color: config.textColor }}>{config.pixKey}</b>
                </div>
              )}
              {payMethod === "dinheiro" && (
                <input style={S.input} placeholder="Troco para quanto? (opcional)" value={changeFor} onChange={e => setChangeFor(e.target.value)} />
              )}
            </div>
          </div>

          {/* Submit */}
          <button style={{ ...S.mainBtn, background: "#25D366", fontSize: 17, padding: 16 }} onClick={sendWhatsApp}>
            💬 Enviar pedido pelo WhatsApp
          </button>
          <button style={S.secondBtn} onClick={() => setView("menu")}>← Voltar ao cardápio</button>
        </div>
      </div>
    );
  }

  // ── ADMIN VIEW ────────────────────────────────────────────────────────────
  if (view === "admin") {
    if (!adminAuth) {
      return (
        <div style={{ ...S.adminWrap, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <div style={{ background: "#1a1028", borderRadius: 18, padding: 32, width: 320, border: "1px solid rgba(168,85,247,.2)" }}>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 24 }}>⚙️ Admin</div>
            <label style={S.adminLabel}>Usuário</label>
            <input style={{ ...S.adminInput, marginBottom: 12 }} value={loginUser} onChange={e => setLoginUser(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} />
            <label style={S.adminLabel}>Senha</label>
            <input type="password" style={{ ...S.adminInput, marginBottom: 16 }} value={loginPass} onChange={e => setLoginPass(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} />
            {loginErr && <div style={{ color: "#FCA5A5", fontSize: 12, marginBottom: 12 }}>{loginErr}</div>}
            <button style={{ ...S.mainBtn, marginTop: 0 }} onClick={doLogin}>Entrar</button>
            <button style={S.secondBtn} onClick={() => setView("menu")}>← Voltar</button>
          </div>
        </div>
      );
    }

    return (
      <div style={S.adminWrap}>
        {/* Admin Header */}
        <header style={S.adminHeader}>
          <span style={{ fontFamily: "Georgia,serif", fontSize: 17, fontWeight: 700 }}>⚙️ Painel Admin</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setView("menu")} style={S.adminBtn}>👁 Ver cardápio</button>
            <button onClick={() => { setAdminAuth(false); setView("menu"); }} style={S.dangerBtn}>Sair</button>
          </div>
        </header>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, padding: "12px 16px", overflowX: "auto", borderBottom: "1px solid rgba(168,85,247,.1)" }}>
          {[["produtos","🛍️ Produtos"],["categorias","📂 Categorias"],["adicionais","➕ Adicionais"],["config","🔧 Config"],["aparencia","🎨 Aparência"],["acesso","🔐 Acesso"]].map(([t,l]) => (
            <button key={t} style={S.adminTab(adminTab === t)} onClick={() => setAdminTab(t)}>{l}</button>
          ))}
        </div>

        <div style={{ padding: 16 }}>

          {/* PRODUTOS */}
          {adminTab === "produtos" && <AdminProdutos store={store} update={update} S={S} addons={addons} />}

          {/* CATEGORIAS */}
          {adminTab === "categorias" && <AdminCategorias store={store} update={update} S={S} />}

          {/* ADICIONAIS */}
          {adminTab === "adicionais" && <AdminAdicionais store={store} update={update} S={S} />}

          {/* CONFIG */}
          {adminTab === "config" && (
            <AdminConfig config={config} cfgSet={cfgSet} S={S} />
          )}

          {/* APARÊNCIA */}
          {adminTab === "aparencia" && (
            <AdminAparencia config={config} cfgSet={cfgSet} S={S} />
          )}

          {/* ACESSO */}
          {adminTab === "acesso" && (
            <AdminAcesso store={store} update={update} S={S} />
          )}

        </div>
      </div>
    );
  }

  return null;
}

// ─── ADMIN: PRODUTOS ──────────────────────────────────────────────────────────
function AdminProdutos({ store, update, S }) {
  const { products, categories } = store;
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const startEdit = (p) => { setEditing(p.id); setForm({ ...p }); };
  const startNew = () => {
    const id = Date.now();
    setEditing("new");
    setForm({ id, cat: categories[0]?.id || "", name: "", desc: "", price: "", image: null, active: true });
  };
  const save = () => {
    if (!form.name.trim()) { alert("Nome obrigatório"); return; }
    update(s => ({
      ...s,
      products: editing === "new"
        ? [...s.products, { ...form, price: Number(form.price) || 0 }]
        : s.products.map(p => p.id === editing ? { ...form, price: Number(form.price) || 0 } : p),
    }));
    setEditing(null);
  };
  const del = (id) => { if (window.confirm("Excluir produto?")) update(s => ({ ...s, products: s.products.filter(p => p.id !== id) })); };
  const toggle = (id) => update(s => ({ ...s, products: s.products.map(p => p.id === id ? { ...p, active: !p.active } : p) }));

  if (editing !== null) {
    return (
      <div>
        <div style={{ ...S.adminSection }}>
          <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>{editing === "new" ? "Novo Produto" : "Editar Produto"}</div>
          <label style={S.adminLabel}>Nome *</label>
          <input style={{ ...S.adminInput, marginBottom: 10 }} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <label style={S.adminLabel}>Descrição</label>
          <textarea style={{ ...S.adminInput, minHeight: 60, resize: "vertical", fontFamily: "inherit", marginBottom: 10 }} value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
          <label style={S.adminLabel}>Preço (R$) *</label>
          <input type="number" step="0.01" style={{ ...S.adminInput, marginBottom: 10 }} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
          <label style={S.adminLabel}>Categoria</label>
          <select style={{ ...S.adminInput, marginBottom: 10 }} value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ImageUpload value={form.image} onChange={img => setForm(f => ({ ...f, image: img }))} label="Foto do produto" />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <button style={S.toggle(form.active)} onClick={() => setForm(f => ({ ...f, active: !f.active }))}>
              <div style={S.toggleDot(form.active)} />
            </button>
            <span style={{ fontSize: 13 }}>{form.active ? "Produto ativo" : "Produto inativo"}</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ ...S.mainBtn, marginTop: 0 }} onClick={save}>💾 Salvar</button>
            <button style={{ ...S.secondBtn, marginTop: 0 }} onClick={() => setEditing(null)}>Cancelar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button style={{ ...S.mainBtn, marginBottom: 16 }} onClick={startNew}>+ Novo Produto</button>
      {products.map(p => (
        <div key={p.id} style={{ ...S.adminSection, display: "flex", gap: 12, alignItems: "flex-start" }}>
          {p.image
            ? <img src={p.image} alt={p.name} style={{ width: 54, height: 54, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
            : <div style={{ width: 54, height: 54, borderRadius: 10, background: "rgba(168,85,247,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🫐</div>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: "#A78BCA", marginBottom: 4 }}>{p.desc}</div>
            <div style={{ fontSize: 14, color: "#F59E0B", fontWeight: 700 }}>{fmt(p.price)}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
            <button style={S.toggle(p.active)} onClick={() => toggle(p.id)}><div style={S.toggleDot(p.active)} /></button>
            <button style={S.adminBtn} onClick={() => startEdit(p)}>✏️</button>
            <button style={S.dangerBtn} onClick={() => del(p.id)}>🗑</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ADMIN: CATEGORIAS ────────────────────────────────────────────────────────
function AdminCategorias({ store, update, S }) {
  const { categories } = store;
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const startEdit = (c) => { setEditing(c.id); setForm({ ...c }); };
  const startNew = () => { const id = uid(); setEditing("new"); setForm({ id, name: "", active: true }); };
  const save = () => {
    if (!form.name.trim()) { alert("Nome obrigatório"); return; }
    update(s => ({
      ...s,
      categories: editing === "new"
        ? [...s.categories, form]
        : s.categories.map(c => c.id === editing ? form : c),
    }));
    setEditing(null);
  };
  const del = (id) => { if (window.confirm("Excluir categoria?")) update(s => ({ ...s, categories: s.categories.filter(c => c.id !== id) })); };
  const toggle = (id) => update(s => ({ ...s, categories: s.categories.map(c => c.id === id ? { ...c, active: !c.active } : c) }));

  if (editing !== null) {
    return (
      <div style={S.adminSection}>
        <label style={S.adminLabel}>Nome da categoria (com emoji) *</label>
        <input style={{ ...S.adminInput, marginBottom: 12 }} placeholder="🍕 Pizza" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <button style={S.toggle(form.active)} onClick={() => setForm(f => ({ ...f, active: !f.active }))}><div style={S.toggleDot(form.active)} /></button>
          <span style={{ fontSize: 13 }}>Ativa</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...S.mainBtn, marginTop: 0 }} onClick={save}>💾 Salvar</button>
          <button style={{ ...S.secondBtn, marginTop: 0 }} onClick={() => setEditing(null)}>Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button style={{ ...S.mainBtn, marginBottom: 16 }} onClick={startNew}>+ Nova Categoria</button>
      {categories.map(c => (
        <div key={c.id} style={{ ...S.adminSection, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ flex: 1, fontWeight: 600 }}>{c.name}</span>
          <button style={S.toggle(c.active)} onClick={() => toggle(c.id)}><div style={S.toggleDot(c.active)} /></button>
          <button style={S.adminBtn} onClick={() => startEdit(c)}>✏️</button>
          <button style={S.dangerBtn} onClick={() => del(c.id)}>🗑</button>
        </div>
      ))}
    </div>
  );
}

// ─── ADMIN: ADICIONAIS ────────────────────────────────────────────────────────
function AdminAdicionais({ store, update, S }) {
  const { addons } = store;
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const startEdit = (a) => { setEditing(a.id); setForm({ ...a }); };
  const startNew = () => { const id = Date.now(); setEditing("new"); setForm({ id, name: "", price: "", active: true }); };
  const save = () => {
    if (!form.name.trim()) { alert("Nome obrigatório"); return; }
    update(s => ({
      ...s,
      addons: editing === "new"
        ? [...s.addons, { ...form, price: Number(form.price) || 0 }]
        : s.addons.map(a => a.id === editing ? { ...form, price: Number(form.price) || 0 } : a),
    }));
    setEditing(null);
  };
  const del = (id) => { if (window.confirm("Excluir adicional?")) update(s => ({ ...s, addons: s.addons.filter(a => a.id !== id) })); };
  const toggle = (id) => update(s => ({ ...s, addons: s.addons.map(a => a.id === id ? { ...a, active: !a.active } : a) }));

  if (editing !== null) {
    return (
      <div style={S.adminSection}>
        <label style={S.adminLabel}>Nome *</label>
        <input style={{ ...S.adminInput, marginBottom: 10 }} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        <label style={S.adminLabel}>Preço (R$)</label>
        <input type="number" step="0.01" style={{ ...S.adminInput, marginBottom: 12 }} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...S.mainBtn, marginTop: 0 }} onClick={save}>💾 Salvar</button>
          <button style={{ ...S.secondBtn, marginTop: 0 }} onClick={() => setEditing(null)}>Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button style={{ ...S.mainBtn, marginBottom: 16 }} onClick={startNew}>+ Novo Adicional</button>
      {addons.map(a => (
        <div key={a.id} style={{ ...S.adminSection, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ flex: 1, fontWeight: 600 }}>{a.name}</span>
          <span style={{ color: "#F59E0B", fontSize: 13 }}>{fmt(a.price)}</span>
          <button style={S.toggle(a.active)} onClick={() => toggle(a.id)}><div style={S.toggleDot(a.active)} /></button>
          <button style={S.adminBtn} onClick={() => startEdit(a)}>✏️</button>
          <button style={S.dangerBtn} onClick={() => del(a.id)}>🗑</button>
        </div>
      ))}
    </div>
  );
}

// ─── ADMIN: CONFIG ────────────────────────────────────────────────────────────
function AdminConfig({ config, cfgSet, S }) {
  const Row = ({ label, children }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={S.adminLabel}>{label}</label>
      {children}
    </div>
  );
  const Inp = ({ k, ...rest }) => (
    <input style={S.adminInput} value={config[k] ?? ""} onChange={e => cfgSet(k, e.target.value)} {...rest} />
  );
  const Tog = ({ k, label }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <button style={S.toggle(config[k])} onClick={() => cfgSet(k, !config[k])}><div style={S.toggleDot(config[k])} /></button>
      <span style={{ fontSize: 13 }}>{label}</span>
    </div>
  );

  return (
    <div>
      <div style={S.adminSection}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>🏪 Informações da Loja</div>
        <Row label="Nome da loja"><Inp k="name" /></Row>
        <Row label="Slogan / tagline"><Inp k="tagline" /></Row>
        <Row label="Endereço"><Inp k="address" /></Row>
        <Tog k="showAddress" label="Exibir endereço no cardápio" />
        <Row label="WhatsApp (com DDI, ex: 5579999999999)"><Inp k="whatsapp" /></Row>
        <Row label="Instagram (só o @ ou URL completa)">
          <input style={S.adminInput} value={config.instagram ?? ""} onChange={e => cfgSet("instagram", e.target.value)} placeholder="acaideiraemporio" />
          <div style={{ fontSize: 11, color: "#A78BCA", marginTop: 4 }}>Pode ser só o @username ou a URL completa</div>
        </Row>
        <Row label="Tempo de entrega"><Inp k="deliveryTime" /></Row>
        <Row label="Taxa de entrega (R$)"><Inp k="deliveryFee" type="number" step="0.01" /></Row>
        <Row label="Pedido mínimo (R$, 0 = sem mínimo)"><Inp k="minOrder" type="number" step="0.01" /></Row>
        <Row label="Chave PIX"><Inp k="pixKey" /></Row>
        <ImageUpload value={config.logo} onChange={v => cfgSet("logo", v)} label="Logo da loja" />
      </div>

      <div style={S.adminSection}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>📢 Banner de Promoção</div>
        <Tog k="bannerActive" label="Exibir banner" />
        <Row label="Texto do banner"><Inp k="bannerText" /></Row>
      </div>

      <div style={S.adminSection}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>🦶 Rodapé</div>
        <Tog k="showFooter" label="Exibir rodapé" />
        <Row label="Texto do rodapé"><Inp k="footerText" /></Row>
      </div>
    </div>
  );
}

// ─── ADMIN: APARÊNCIA ─────────────────────────────────────────────────────────
function AdminAparencia({ config, cfgSet, S }) {
  const Row = ({ label, children }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={S.adminLabel}>{label}</label>
      {children}
    </div>
  );
  const ColorRow = ({ label, k }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <input type="color" value={config[k] || "#000000"} onChange={e => cfgSet(k, e.target.value)}
        style={{ width: 40, height: 34, borderRadius: 8, border: "none", cursor: "pointer", background: "transparent" }} />
      <span style={{ fontSize: 13, flex: 1 }}>{label}</span>
      <input style={{ ...S.adminInput, width: 110, fontSize: 12 }} value={config[k] || ""} onChange={e => cfgSet(k, e.target.value)} />
    </div>
  );

  const themes = [
    { name: "🍇 Roxo Escuro", bg: "#0F0A1A", card: "#1A1028", primary: "#6B21A8", secondary: "#A855F7", accent: "#F59E0B", text: "#F3E8FF", muted: "#A78BCA", header: "#0F0A1A" },
    { name: "🌊 Azul Noite", bg: "#0A0F1A", card: "#0F1728", primary: "#1D4ED8", secondary: "#3B82F6", accent: "#F59E0B", text: "#EFF6FF", muted: "#93C5FD", header: "#0A0F1A" },
    { name: "🌿 Verde Natureza", bg: "#051A0A", card: "#0A2010", primary: "#15803D", secondary: "#22C55E", accent: "#FCD34D", text: "#F0FDF4", muted: "#86EFAC", header: "#051A0A" },
    { name: "🌅 Laranja Tropical", bg: "#1A0A00", card: "#2A1200", primary: "#C2410C", secondary: "#FB923C", accent: "#FDE68A", text: "#FFF7ED", muted: "#FDBA74", header: "#1A0A00" },
    { name: "🌸 Rosa Pink", bg: "#1A0010", card: "#280018", primary: "#9D174D", secondary: "#EC4899", accent: "#FDE047", text: "#FDF2F8", muted: "#F9A8D4", header: "#1A0010" },
    { name: "☀️ Claro Branco", bg: "#F8F5FF", card: "#FFFFFF", primary: "#6B21A8", secondary: "#A855F7", accent: "#F59E0B", text: "#1A0A2E", muted: "#6B7280", header: "#FFFFFF" },
  ];

  const applyTheme = (t) => {
    cfgSet("bgColor", t.bg);
    cfgSet("cardColor", t.card);
    cfgSet("primaryColor", t.primary);
    cfgSet("secondaryColor", t.secondary);
    cfgSet("accentColor", t.accent);
    cfgSet("textColor", t.text);
    cfgSet("mutedColor", t.muted);
    cfgSet("headerBg", t.header);
  };

  return (
    <div>
      {/* Themes */}
      <div style={S.adminSection}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>🎨 Temas Prontos</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {themes.map(t => (
            <button key={t.name} onClick={() => applyTheme(t)}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(168,85,247,.2)", background: t.bg, color: t.text, fontSize: 12, cursor: "pointer", textAlign: "left" }}>
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div style={S.adminSection}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>🖌 Cores Personalizadas</div>
        <ColorRow label="Fundo da página" k="bgColor" />
        <ColorRow label="Fundo dos cards" k="cardColor" />
        <ColorRow label="Cor primária" k="primaryColor" />
        <ColorRow label="Cor secundária" k="secondaryColor" />
        <ColorRow label="Destaque / acento" k="accentColor" />
        <ColorRow label="Texto principal" k="textColor" />
        <ColorRow label="Texto secundário" k="mutedColor" />
        <ColorRow label="Fundo do header" k="headerBg" />
        <ColorRow label="Cor dos preços" k="priceColor" />
        <ColorRow label="Texto dos botões" k="buttonTextColor" />
      </div>

      {/* Typography */}
      <div style={S.adminSection}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>✍️ Tipografia</div>
        <Row label="Fonte do título">
          <select style={S.adminInput} value={config.titleFont} onChange={e => cfgSet("titleFont", e.target.value)}>
            {[["Georgia, serif","Georgia (Clássica)"],["'Playfair Display', serif","Playfair Display"],["'Montserrat', sans-serif","Montserrat"],["'Poppins', sans-serif","Poppins"],["system-ui, sans-serif","System UI"],["'Courier New', monospace","Courier (Mono)"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Row>
        <Row label="Fonte do corpo">
          <select style={S.adminInput} value={config.bodyFont} onChange={e => cfgSet("bodyFont", e.target.value)}>
            {[["system-ui, sans-serif","System UI"],["'Poppins', sans-serif","Poppins"],["'Roboto', sans-serif","Roboto"],["Georgia, serif","Georgia"],["'Courier New', monospace","Courier"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Row>
        <Row label="Tamanho da fonte base">
          <select style={S.adminInput} value={config.fontSize} onChange={e => cfgSet("fontSize", e.target.value)}>
            {["13px","14px","15px","16px","17px","18px"].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </Row>
        <Row label="Arredondamento dos cantos (border-radius)">
          <select style={S.adminInput} value={config.borderRadius} onChange={e => cfgSet("borderRadius", e.target.value)}>
            {[["4px","Reto"],["8px","Levemente arredondado"],["14px","Arredondado (padrão)"],["20px","Muito arredondado"],["30px","Cápsulas"]].map(([v,l]) => <option key={v} value={v}>{v} — {l}</option>)}
          </select>
        </Row>
      </div>
    </div>
  );
}

// ─── ADMIN: ACESSO ────────────────────────────────────────────────────────────
function AdminAcesso({ store, update, S }) {
  const [form, setForm] = useState({ user: store.auth.user, password: "", confirm: "" });
  const [msg, setMsg] = useState("");

  const save = () => {
    if (!form.user.trim()) { setMsg("Usuário não pode ser vazio."); return; }
    if (form.password && form.password !== form.confirm) { setMsg("Senhas não coincidem."); return; }
    update(s => ({ ...s, auth: { user: form.user, password: form.password || s.auth.password } }));
    setMsg("✅ Salvo com sucesso!");
    setForm(f => ({ ...f, password: "", confirm: "" }));
  };

  return (
    <div style={S.adminSection}>
      <div style={{ fontWeight: 700, marginBottom: 14 }}>🔐 Alterar Login do Admin</div>
      <label style={S.adminLabel}>Usuário</label>
      <input style={{ ...S.adminInput, marginBottom: 10 }} value={form.user} onChange={e => setForm(f => ({ ...f, user: e.target.value }))} />
      <label style={S.adminLabel}>Nova Senha (deixe em branco para não alterar)</label>
      <input type="password" style={{ ...S.adminInput, marginBottom: 10 }} placeholder="Nova senha..." value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
      <label style={S.adminLabel}>Confirmar Nova Senha</label>
      <input type="password" style={{ ...S.adminInput, marginBottom: 14 }} placeholder="Confirme a senha..." value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
      {msg && <div style={{ fontSize: 13, color: msg.startsWith("✅") ? "#86EFAC" : "#FCA5A5", marginBottom: 10 }}>{msg}</div>}
      <button style={{ ...S.mainBtn, marginTop: 0 }} onClick={save}>💾 Salvar alterações</button>
    </div>
  );
}
