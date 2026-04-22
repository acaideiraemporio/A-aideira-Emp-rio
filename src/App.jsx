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
  optionGroups: [
    {
      id: "og1", name: "Sabor do Açaí", required: true, multiple: false,
      choices: [
        { id: "c1", name: "Tradicional", price: 0 },
        { id: "c2", name: "Morango", price: 0 },
        { id: "c3", name: "Creme", price: 0 },
      ]
    },
    {
      id: "og2", name: "Sabor do Sorvete", required: true, multiple: false,
      choices: [
        { id: "c4", name: "Creme", price: 0 },
        { id: "c5", name: "Morango", price: 0 },
        { id: "c6", name: "Chocolate", price: 0 },
      ]
    },
  ],
  products: [
    { id: 1, cat: "combos", name: "Combo Explosão", desc: "500ml + 2 adicionais + bebida", price: 32.9, image: null, active: true, optionGroups: ["og1", "og2"] },
    { id: 2, cat: "combos", name: "Combo Família", desc: "2 litros + 6 adicionais", price: 79.9, image: null, active: true, optionGroups: ["og1"] },
    { id: 3, cat: "combos", name: "Combo Econômico", desc: "300ml + 1 adicional", price: 19.9, image: null, active: true, optionGroups: ["og1"] },
    { id: 4, cat: "acai", name: "Açaí 300ml", desc: "Açaí puro cremoso", price: 12.9, image: null, active: true, optionGroups: ["og1"] },
    { id: 5, cat: "acai", name: "Açaí 500ml", desc: "O mais pedido!", price: 18.9, image: null, active: true, optionGroups: ["og1"] },
    { id: 6, cat: "acai", name: "Açaí 1 Litro", desc: "Melhor custo-benefício", price: 29.9, image: null, active: true, optionGroups: ["og1"] },
    { id: 7, cat: "sorvetes", name: "Sorvete de Creme", desc: "Cremoso e delicioso", price: 8.9, image: null, active: true, optionGroups: ["og2"] },
    { id: 8, cat: "bebidas", name: "Suco de Laranja", desc: "Natural 300ml", price: 7.9, image: null, active: true, optionGroups: [] },
    { id: 9, cat: "petiscos", name: "Batata Frita", desc: "Porção 200g", price: 14.9, image: null, active: true, optionGroups: [] },
  ],
  addons: [
    { id: 1, name: "Granola", price: 2.5, active: true },
    { id: 2, name: "Leite Condensado", price: 2.0, active: true },
    { id: 3, name: "Banana", price: 1.5, active: true },
    { id: 4, name: "Morango", price: 2.0, active: true },
    { id: 5, name: "Nutella", price: 4.0, active: true },
    { id: 6, name: "Gotas de Chocolate", price: 2.0, active: true },
  ],
};

const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;
const uid = () => Date.now() + Math.random().toString(36).slice(2);

// ─── ESTILOS FIXOS (fora dos componentes para não recriar a cada render) ──────
const AS = {
  adminWrap: { minHeight: "100vh", background: "#0a0612", color: "#F3E8FF", fontFamily: "system-ui,sans-serif" },
  adminHeader: { background: "#120c1e", borderBottom: "1px solid rgba(168,85,247,.2)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  adminSection: { background: "#1a1028", borderRadius: 14, padding: 18, marginBottom: 14 },
  adminLabel: { fontSize: 12, color: "#A78BCA", display: "block", marginBottom: 5, fontWeight: 600 },
  adminInput: { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid rgba(168,85,247,.2)", background: "rgba(0,0,0,.3)", color: "#F3E8FF", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "system-ui,sans-serif" },
  adminBtn: { padding: "8px 16px", borderRadius: 8, border: "none", background: "rgba(168,85,247,.2)", color: "#F3E8FF", fontSize: 13, cursor: "pointer" },
  dangerBtn: { padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(220,38,38,.3)", background: "transparent", color: "#FCA5A5", fontSize: 12, cursor: "pointer" },
  saveBtn: { width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#15803D,#22C55E)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 6 },
  toggleOn: { width: 42, height: 24, borderRadius: 12, background: "#7C3AED", position: "relative", cursor: "pointer", border: "none", transition: "background .2s", flexShrink: 0 },
  toggleOff: { width: 42, height: 24, borderRadius: 12, background: "#374151", position: "relative", cursor: "pointer", border: "none", transition: "background .2s", flexShrink: 0 },
  dotOn: { position: "absolute", top: 3, left: 20, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s" },
  dotOff: { position: "absolute", top: 3, left: 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s" },
  successBox: { background: "#14532d", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#86EFAC" },
};
const Tog = ({ on, onClick }) => (
  <button style={on ? AS.toggleOn : AS.toggleOff} onClick={onClick}>
    <div style={on ? AS.dotOn : AS.dotOff} />
  </button>
);

// ─── STORE ────────────────────────────────────────────────────────────────────
function useStore() {
  const [store, setStore] = useState(() => {
    try {
      const s = localStorage.getItem("acai_store_v3");
      if (!s) return INITIAL;
      const p = JSON.parse(s);
      return { ...INITIAL, ...p, config: { ...INITIAL.config, ...p.config }, optionGroups: p.optionGroups ?? INITIAL.optionGroups };
    } catch { return INITIAL; }
  });
  const update = (fn) => setStore((prev) => {
    const next = typeof fn === "function" ? fn(prev) : { ...prev, ...fn };
    try { localStorage.setItem("acai_store_v3", JSON.stringify(next)); } catch {}
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

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={AS.adminLabel}>{label}</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
        <button style={AS.adminBtn} onClick={() => fileRef.current?.click()}>📁 Arquivo</button>
        <button style={AS.adminBtn} onClick={() => cameraRef.current?.click()}>📷 Câmera</button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
        {value && <img src={value} alt="" style={{ width: 50, height: 50, borderRadius: 10, objectFit: "cover", border: "2px solid rgba(168,85,247,.4)" }} />}
        {value && <button style={AS.dangerBtn} onClick={() => onChange(null)}>🗑 Remover</button>}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input style={{ ...AS.adminInput, flex: 1 }} placeholder="Ou cole URL da imagem..."
          value={urlInput} onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && urlInput.trim() && onChange(urlInput.trim())} />
        <button style={AS.adminBtn} onClick={() => urlInput.trim() && onChange(urlInput.trim())}>OK</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [store, update] = useStore();
  const { config, categories, products, addons, optionGroups } = store;

  const [cart, setCart] = useState([]);
  const [view, setView] = useState("menu");
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminTab, setAdminTab] = useState("produtos");
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [selectedCat, setSelectedCat] = useState(null);
  const [productModal, setProductModal] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [obs, setObs] = useState("");
  const [qty, setQty] = useState(1);
  const [showPayModal, setShowPayModal] = useState(false); // ← modal de aviso pagamento

  // checkout
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddr, setClientAddr] = useState("");
  const [deliveryType, setDeliveryType] = useState("entrega");
  const [payMethod, setPayMethod] = useState("pix");

  const activeCats = categories.filter(c => c.active);
  const activeCat = selectedCat || (activeCats[0]?.id ?? null);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const deliveryFee = deliveryType === "entrega" ? Number(config.deliveryFee) || 0 : 0;
  const orderTotal = cartTotal + deliveryFee;

  // estilos dinâmicos (dependem do config)
  const mainBtn = { width: "100%", padding: "14px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${config.primaryColor},${config.secondaryColor})`, color: config.buttonTextColor, fontSize: 16, fontWeight: 700, cursor: "pointer", marginTop: 10 };
  const secondBtn = { width: "100%", padding: "12px", borderRadius: 12, border: `1.5px solid rgba(168,85,247,.3)`, background: "transparent", color: config.textColor, fontSize: 14, cursor: "pointer", marginTop: 8 };
  const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid rgba(168,85,247,.2)", background: "rgba(0,0,0,.25)", color: config.textColor, fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: config.bodyFont };
  const sectionTitle = { fontSize: 13, fontWeight: 700, color: config.mutedColor, textTransform: "uppercase", letterSpacing: 1, marginTop: 18, marginBottom: 10 };
  const qtyBtn = { width: 36, height: 36, borderRadius: 10, border: "none", background: "rgba(168,85,247,.2)", color: config.textColor, fontSize: 20, cursor: "pointer" };

  const openProduct = (p) => { setProductModal(p); setSelectedAddons([]); setSelectedOptions({}); setObs(""); setQty(1); };

  const optionsExtraPrice = () => Object.values(selectedOptions).flat().reduce((s, cid) => {
    for (const og of (optionGroups || [])) { const ch = og.choices?.find(c => c.id === cid); if (ch) return s + (ch.price || 0); }
    return s;
  }, 0);

  const addonsExtraPrice = () => selectedAddons.reduce((s, id) => s + (addons.find(a => a.id === id)?.price || 0), 0);

  const validateOptions = () => {
    if (!productModal) return true;
    for (const ogId of (productModal.optionGroups || [])) {
      const og = (optionGroups || []).find(x => x.id === ogId);
      if (og?.required && !selectedOptions[og.id]) return false;
    }
    return true;
  };

  const addToCart = () => {
    if (!productModal) return;
    if (!validateOptions()) { alert("Selecione todas as opções obrigatórias (marcadas com *)."); return; }
    const optionsSummary = (productModal.optionGroups || [])
      .map(ogId => (optionGroups || []).find(og => og.id === ogId)).filter(Boolean)
      .map(og => { const val = selectedOptions[og.id]; if (!val) return null; const ids = Array.isArray(val) ? val : [val]; return `${og.name}: ${ids.map(id => og.choices?.find(c => c.id === id)?.name).filter(Boolean).join(", ")}`; })
      .filter(Boolean);
    const addonsSummary = selectedAddons.map(id => addons.find(a => a.id === id)?.name).filter(Boolean);
    setCart(prev => [...prev, { cartId: uid(), name: productModal.name, price: productModal.price + optionsExtraPrice() + addonsExtraPrice(), qty, options: optionsSummary, addonsList: addonsSummary, obs }]);
    setProductModal(null);
  };

  const removeFromCart = (cartId) => setCart(prev => prev.filter(i => i.cartId !== cartId));
  const changeQty = (cartId, d) => setCart(prev => prev.map(i => i.cartId === cartId ? { ...i, qty: Math.max(1, i.qty + d) } : i));

  // Validação antes de mostrar modal de aviso
  const handleCheckout = () => {
    if (!clientName.trim()) { alert("Informe seu nome."); return; }
    if (deliveryType === "entrega" && !clientAddr.trim()) { alert("Informe o endereço."); return; }
    setShowPayModal(true);
  };

  // Envia para WhatsApp de fato
  const sendWhatsApp = () => {
    setShowPayModal(false);
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
        if (item.options?.length) line += `\n   🔸 ${item.options.join(" | ")}`;
        if (item.addonsList?.length) line += `\n   ➕ Adicionais: ${item.addonsList.join(", ")}`;
        if (item.obs) line += `\n   📝 Obs: ${item.obs}`;
        return line;
      }),
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `🧾 *Subtotal:* ${fmt(cartTotal)}`,
      deliveryType === "entrega" ? `🚚 *Taxa de entrega:* ${fmt(deliveryFee)}` : null,
      `💰 *TOTAL: ${fmt(orderTotal)}*`,
      `━━━━━━━━━━━━━━━━━━━━━━`,
      `💳 *Pagamento:* ${payMethod === "pix" ? "PIX" : "Cartão"}`,
      config.pixKey && payMethod === "pix" ? `🔑 *Chave PIX:* ${config.pixKey}` : null,
      `⏱ Previsão: ${config.deliveryTime}`,
      `\n_Pedido enviado pelo cardápio digital_`,
    ].filter(Boolean).join("\n");
    window.open(`https://wa.me/${config.whatsapp.replace(/\D/g,"")}?text=${encodeURIComponent(lines)}`, "_blank");
  };

  const doLogin = () => {
    if (loginUser === store.auth.user && loginPass === store.auth.password) { setAdminAuth(true); setLoginErr(""); }
    else setLoginErr("Usuário ou senha incorretos.");
  };

  // ── MENU VIEW ─────────────────────────────────────────────────────────────
  if (view === "menu") {
    const catProducts = products.filter(p => p.active && p.cat === activeCat);
    return (
      <div style={{ minHeight: "100vh", background: config.bgColor, color: config.textColor, fontFamily: config.bodyFont, fontSize: config.fontSize }}>
        {/* Header */}
        <header style={{ background: config.headerBg, borderBottom: "1px solid rgba(168,85,247,.18)", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {config.logo && <img src={config.logo} alt="logo" style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", marginRight: 10 }} />}
            <div>
              <div style={{ fontFamily: config.titleFont, fontSize: 20, fontWeight: 700 }}>{config.name}</div>
              <div style={{ fontSize: 11, color: config.mutedColor }}>{config.tagline}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {config.instagram && (
              <a href={`https://instagram.com/${config.instagram.replace(/.*instagram\.com\//,"").replace(/\//,"")}`} target="_blank" rel="noreferrer" style={{ color: config.mutedColor, fontSize: 22, textDecoration: "none" }}>📸</a>
            )}
            {config.whatsapp && (
              <a href={`https://wa.me/${config.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{ color: config.mutedColor, fontSize: 22, textDecoration: "none" }}>💬</a>
            )}
            <button onClick={() => { setView("admin"); setAdminAuth(false); }} style={{ background: "none", border: "none", color: config.mutedColor, fontSize: 22, cursor: "pointer" }}>⚙️</button>
          </div>
        </header>

        {config.bannerActive && config.bannerText && (
          <div style={{ background: `linear-gradient(135deg,${config.primaryColor},${config.secondaryColor})`, padding: "10px 16px", textAlign: "center", fontSize: 13, fontWeight: 600, color: "#fff" }}>{config.bannerText}</div>
        )}

        {config.showAddress && (
          <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(168,85,247,.1)", display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: config.mutedColor }}>📍 {config.address}</span>
            <span style={{ fontSize: 12, color: config.mutedColor }}>⏱ {config.deliveryTime}</span>
            {Number(config.deliveryFee) > 0 && <span style={{ fontSize: 12, color: config.mutedColor }}>🚚 {fmt(config.deliveryFee)}</span>}
          </div>
        )}

        {/* Category bar */}
        <div style={{ display: "flex", gap: 8, padding: "12px 16px", overflowX: "auto", scrollbarWidth: "none" }}>
          {activeCats.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCat(cat.id)} style={{ padding: "8px 18px", borderRadius: 30, border: `1.5px solid ${activeCat === cat.id ? config.secondaryColor : "rgba(168,85,247,.2)"}`, background: activeCat === cat.id ? `linear-gradient(135deg,${config.primaryColor},${config.secondaryColor})` : "transparent", color: activeCat === cat.id ? "#fff" : config.mutedColor, fontSize: 13, fontWeight: activeCat === cat.id ? 700 : 400, cursor: "pointer", whiteSpace: "nowrap" }}>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 14, padding: "16px" }}>
          {catProducts.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", color: config.mutedColor, padding: 40 }}>Nenhum produto nesta categoria.</div>}
          {catProducts.map(p => (
            <div key={p.id} onClick={() => openProduct(p)}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseLeave={e => e.currentTarget.style.transform = ""}
              style={{ background: config.cardColor, borderRadius: config.borderRadius, overflow: "hidden", cursor: "pointer", border: "1px solid rgba(168,85,247,.12)", transition: "transform .18s" }}>
              {p.image ? <img src={p.image} alt={p.name} style={{ width: "100%", height: 130, objectFit: "cover" }} /> : <div style={{ width: "100%", height: 130, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, background: "rgba(168,85,247,.06)" }}>🫐</div>}
              <div style={{ padding: "10px 12px 12px" }}>
                <div style={{ fontFamily: config.titleFont, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: config.mutedColor, marginBottom: 8, lineHeight: 1.4 }}>{p.desc}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: config.priceColor }}>{fmt(p.price)}</span>
                  <button onClick={e => { e.stopPropagation(); openProduct(p); }} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: `linear-gradient(135deg,${config.primaryColor},${config.secondaryColor})`, color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cartCount > 0 && <div style={{ height: 70 }} />}
        {cartCount > 0 && (
          <div onClick={() => setView("checkout")} style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: `linear-gradient(135deg,${config.primaryColor},${config.secondaryColor})`, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", zIndex: 200 }}>
            <span style={{ color: "#fff", fontWeight: 700 }}>🛒 Ver pedido ({cartCount})</span>
            <span style={{ color: "#fff", fontWeight: 700 }}>{fmt(cartTotal)}</span>
          </div>
        )}

        {config.showFooter && <div style={{ textAlign: "center", padding: "20px 16px", color: config.mutedColor, fontSize: 11 }}>{config.footerText}</div>}

        {/* Product modal */}
        {productModal && (() => {
          const groups = (productModal.optionGroups || []).map(id => (optionGroups || []).find(og => og.id === id)).filter(Boolean);
          const unitPrice = productModal.price + optionsExtraPrice() + addonsExtraPrice();
          return (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 300, display: "flex", alignItems: "flex-end" }} onClick={e => e.target === e.currentTarget && setProductModal(null)}>
              <div style={{ background: config.cardColor, borderRadius: `${config.borderRadius} ${config.borderRadius} 0 0`, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "24px 20px 32px" }}>
                {productModal.image && <img src={productModal.image} alt={productModal.name} style={{ width: "100%", borderRadius: 12, maxHeight: 200, objectFit: "cover", marginBottom: 14 }} />}
                <div style={{ fontFamily: config.titleFont, fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{productModal.name}</div>
                <div style={{ color: config.mutedColor, fontSize: 13, marginBottom: 6 }}>{productModal.desc}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: config.priceColor }}>{fmt(productModal.price)}</div>

                {groups.map(og => (
                  <div key={og.id}>
                    <div style={sectionTitle}>{og.name} {og.required && <span style={{ color: "#F87171", fontSize: 11, textTransform: "none" }}>*obrigatório</span>}</div>
                    {og.choices?.map(ch => {
                      const sel = og.multiple ? (selectedOptions[og.id] || []).includes(ch.id) : selectedOptions[og.id] === ch.id;
                      return (
                        <div key={ch.id} onClick={() => {
                          if (og.multiple) setSelectedOptions(prev => { const cur = prev[og.id] || []; return { ...prev, [og.id]: sel ? cur.filter(x => x !== ch.id) : [...cur, ch.id] }; });
                          else setSelectedOptions(prev => ({ ...prev, [og.id]: ch.id }));
                        }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${sel ? config.secondaryColor : "rgba(168,85,247,.15)"}`, background: sel ? "rgba(168,85,247,.12)" : "transparent", marginBottom: 6, cursor: "pointer" }}>
                          <span>{sel ? "✅" : "⬜"} {ch.name}</span>
                          {ch.price > 0 && <span style={{ color: config.priceColor, fontSize: 13 }}>+ {fmt(ch.price)}</span>}
                        </div>
                      );
                    })}
                  </div>
                ))}

                {addons.filter(a => a.active).length > 0 && (
                  <>
                    <div style={sectionTitle}>Adicionais</div>
                    {addons.filter(a => a.active).map(a => {
                      const sel = selectedAddons.includes(a.id);
                      return (
                        <div key={a.id} onClick={() => setSelectedAddons(prev => sel ? prev.filter(x => x !== a.id) : [...prev, a.id])}
                          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${sel ? config.secondaryColor : "rgba(168,85,247,.15)"}`, background: sel ? "rgba(168,85,247,.12)" : "transparent", marginBottom: 6, cursor: "pointer" }}>
                          <span>{sel ? "✅" : "⬜"} {a.name}</span>
                          <span style={{ color: config.priceColor, fontSize: 13 }}>+ {fmt(a.price)}</span>
                        </div>
                      );
                    })}
                  </>
                )}

                <div style={sectionTitle}>Observações</div>
                <textarea placeholder="Ex: sem granola, calda extra..." value={obs} onChange={e => setObs(e.target.value)}
                  style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} />

                <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center", margin: "16px 0" }}>
                  <button style={qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                  <span style={{ fontSize: 20, fontWeight: 700, minWidth: 32, textAlign: "center" }}>{qty}</span>
                  <button style={qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
                </div>

                <button style={mainBtn} onClick={addToCart}>Adicionar — {fmt(unitPrice * qty)}</button>
                <button style={secondBtn} onClick={() => setProductModal(null)}>Cancelar</button>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  // ── CHECKOUT VIEW ─────────────────────────────────────────────────────────
  if (view === "checkout") {
    return (
      <div style={{ minHeight: "100vh", background: config.bgColor, color: config.textColor, fontFamily: config.bodyFont, fontSize: config.fontSize }}>
        <header style={{ background: config.headerBg, borderBottom: "1px solid rgba(168,85,247,.18)", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <button onClick={() => setView("menu")} style={{ background: "none", border: "none", color: config.textColor, fontSize: 22, cursor: "pointer" }}>←</button>
          <span style={{ fontFamily: config.titleFont, fontSize: 17, fontWeight: 700 }}>Finalizar Pedido</span>
          <span />
        </header>

        <div style={{ padding: "16px 16px 120px" }}>
          {/* Resumo */}
          <div style={{ background: config.cardColor, borderRadius: config.borderRadius, padding: 16, marginBottom: 14 }}>
            <div style={sectionTitle}>Seu Pedido</div>
            {cart.map(item => (
              <div key={item.cartId} style={{ display: "flex", gap: 10, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid rgba(168,85,247,.1)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name} x{item.qty}</div>
                  {item.options?.map((o, i) => <div key={i} style={{ fontSize: 11, color: config.mutedColor }}>🔸 {o}</div>)}
                  {item.addonsList?.length > 0 && <div style={{ fontSize: 11, color: config.mutedColor }}>➕ {item.addonsList.join(", ")}</div>}
                  {item.obs && <div style={{ fontSize: 11, color: config.mutedColor }}>📝 {item.obs}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: config.priceColor, fontWeight: 700 }}>{fmt(item.price * item.qty)}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 4, justifyContent: "flex-end" }}>
                    <button onClick={() => changeQty(item.cartId, -1)} style={{ ...qtyBtn, width: 24, height: 24, fontSize: 14 }}>−</button>
                    <button onClick={() => changeQty(item.cartId, 1)} style={{ ...qtyBtn, width: 24, height: 24, fontSize: 14 }}>+</button>
                    <button onClick={() => removeFromCart(item.cartId)} style={{ padding: "2px 8px", borderRadius: 6, border: "1px solid rgba(220,38,38,.3)", background: "transparent", color: "#FCA5A5", fontSize: 12, cursor: "pointer" }}>🗑</button>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: config.mutedColor }}>Subtotal</span><span style={{ fontWeight: 700 }}>{fmt(cartTotal)}</span>
            </div>
            {deliveryType === "entrega" && (
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ color: config.mutedColor }}>Taxa de entrega</span><span style={{ fontWeight: 700 }}>{fmt(deliveryFee)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(168,85,247,.2)" }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
              <span style={{ fontWeight: 700, fontSize: 18, color: config.priceColor }}>{fmt(orderTotal)}</span>
            </div>
          </div>

          {/* Dados */}
          <div style={{ background: config.cardColor, borderRadius: config.borderRadius, padding: 16, marginBottom: 14 }}>
            <div style={sectionTitle}>Seus Dados</div>
            <label style={{ fontSize: 12, color: config.mutedColor, display: "block", marginBottom: 4 }}>Nome completo *</label>
            <input style={{ ...inputStyle, marginBottom: 10 }} placeholder="Seu nome" value={clientName} onChange={e => setClientName(e.target.value)} />
            <label style={{ fontSize: 12, color: config.mutedColor, display: "block", marginBottom: 4 }}>WhatsApp (opcional)</label>
            <input style={inputStyle} placeholder="(79) 9 9999-9999" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
          </div>

          {/* Entrega */}
          <div style={{ background: config.cardColor, borderRadius: config.borderRadius, padding: 16, marginBottom: 14 }}>
            <div style={sectionTitle}>Tipo de entrega</div>
            <div style={{ display: "flex", gap: 10 }}>
              {["entrega","retirada"].map(t => (
                <button key={t} onClick={() => setDeliveryType(t)} style={{ flex: 1, padding: "12px 8px", borderRadius: 10, border: `2px solid ${deliveryType === t ? config.secondaryColor : "rgba(168,85,247,.2)"}`, background: deliveryType === t ? "rgba(168,85,247,.15)" : "transparent", color: config.textColor, fontSize: 14, fontWeight: deliveryType === t ? 700 : 400, cursor: "pointer" }}>
                  {t === "entrega" ? "🚚 Entrega" : "🏪 Retirar"}
                </button>
              ))}
            </div>
            {deliveryType === "entrega" && (
              <div style={{ marginTop: 12 }}>
                <label style={{ fontSize: 12, color: config.mutedColor, display: "block", marginBottom: 4 }}>Endereço de entrega *</label>
                <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} placeholder="Rua, número, bairro, complemento..." value={clientAddr} onChange={e => setClientAddr(e.target.value)} />
              </div>
            )}
          </div>

          {/* Pagamento */}
          <div style={{ background: config.cardColor, borderRadius: config.borderRadius, padding: 16, marginBottom: 14 }}>
            <div style={sectionTitle}>Forma de pagamento</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[["pix","💳 PIX"],["cartao","💳 Cartão"]].map(([v,l]) => (
                <button key={v} onClick={() => setPayMethod(v)} style={{ padding: "11px 14px", borderRadius: 10, border: `2px solid ${payMethod === v ? config.secondaryColor : "rgba(168,85,247,.15)"}`, background: payMethod === v ? "rgba(168,85,247,.12)" : "transparent", color: config.textColor, fontSize: 14, textAlign: "left", cursor: "pointer" }}>
                  {payMethod === v ? "✅" : "⬜"} {l}
                </button>
              ))}
              {payMethod === "pix" && config.pixKey && (
                <div style={{ background: "rgba(168,85,247,.08)", borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
                  🔑 Chave PIX: <b style={{ color: config.textColor }}>{config.pixKey}</b>
                </div>
              )}
            </div>
          </div>

          <button style={{ ...mainBtn, background: "#25D366", fontSize: 17, padding: 16 }} onClick={handleCheckout}>
            💬 Enviar pedido pelo WhatsApp
          </button>
          <button style={secondBtn} onClick={() => setView("menu")}>← Voltar ao cardápio</button>
        </div>

        {/* ── MODAL AVISO PAGAMENTO ── */}
        {showPayModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: "#1a1028", borderRadius: 20, padding: 28, maxWidth: 360, width: "100%", border: "1px solid rgba(168,85,247,.3)", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, marginBottom: 12, color: "#F3E8FF" }}>
                Antes de confirmar!
              </div>
              <div style={{ fontSize: 14, color: "#A78BCA", lineHeight: 1.7, marginBottom: 20 }}>
                Você será redirecionado para o <b style={{ color: "#F3E8FF" }}>WhatsApp da loja</b> com todos os detalhes do seu pedido.<br /><br />
                📲 O atendente irá <b style={{ color: "#F3E8FF" }}>enviar um link de pagamento</b> para você pelo WhatsApp.<br /><br />
                ✅ Após efetuar o pagamento, <b style={{ color: "#F3E8FF" }}>envie o comprovante</b> na conversa para seu pedido entrar em preparo e ser enviado.
              </div>
              <button onClick={sendWhatsApp} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "#25D366", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>
                ✅ Entendi, ir para o WhatsApp
              </button>
              <button onClick={() => setShowPayModal(false)} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1.5px solid rgba(168,85,247,.3)", background: "transparent", color: "#A78BCA", fontSize: 14, cursor: "pointer" }}>
                ← Voltar e revisar pedido
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── ADMIN VIEW ────────────────────────────────────────────────────────────
  if (view === "admin") {
    if (!adminAuth) {
      return (
        <div style={{ ...AS.adminWrap, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#1a1028", borderRadius: 18, padding: 32, width: 320, border: "1px solid rgba(168,85,247,.2)" }}>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 24, fontWeight: 700, textAlign: "center", marginBottom: 24 }}>⚙️ Admin</div>
            <label style={AS.adminLabel}>Usuário</label>
            <input style={{ ...AS.adminInput, marginBottom: 12 }} value={loginUser} onChange={e => setLoginUser(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} />
            <label style={AS.adminLabel}>Senha</label>
            <input type="password" style={{ ...AS.adminInput, marginBottom: 16 }} value={loginPass} onChange={e => setLoginPass(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} />
            {loginErr && <div style={{ color: "#FCA5A5", fontSize: 12, marginBottom: 12 }}>{loginErr}</div>}
            <button style={AS.saveBtn} onClick={doLogin}>Entrar</button>
            <button onClick={() => setView("menu")} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1.5px solid rgba(168,85,247,.3)", background: "transparent", color: "#A78BCA", fontSize: 14, cursor: "pointer", marginTop: 8 }}>← Voltar</button>
          </div>
        </div>
      );
    }

    return (
      <div style={AS.adminWrap}>
        <header style={AS.adminHeader}>
          <span style={{ fontFamily: "Georgia,serif", fontSize: 17, fontWeight: 700 }}>⚙️ Painel Admin</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setView("menu")} style={AS.adminBtn}>👁 Ver cardápio</button>
            <button onClick={() => { setAdminAuth(false); setView("menu"); }} style={AS.dangerBtn}>Sair</button>
          </div>
        </header>
        <div style={{ display: "flex", gap: 4, padding: "10px 16px", overflowX: "auto", borderBottom: "1px solid rgba(168,85,247,.1)" }}>
          {[["produtos","🛍️ Produtos"],["opcoes","🔸 Opções"],["categorias","📂 Categorias"],["adicionais","➕ Adicionais"],["config","🔧 Config"],["aparencia","🎨 Aparência"],["acesso","🔐 Acesso"]].map(([t,l]) => (
            <button key={t} style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: adminTab === t ? "rgba(168,85,247,.25)" : "transparent", color: adminTab === t ? "#F3E8FF" : "#A78BCA", fontSize: 13, fontWeight: adminTab === t ? 700 : 400, cursor: "pointer", whiteSpace: "nowrap" }} onClick={() => setAdminTab(t)}>{l}</button>
          ))}
        </div>
        <div style={{ padding: 16 }}>
          {adminTab === "produtos" && <AdminProdutos store={store} update={update} />}
          {adminTab === "opcoes" && <AdminOpcoes store={store} update={update} />}
          {adminTab === "categorias" && <AdminCategorias store={store} update={update} />}
          {adminTab === "adicionais" && <AdminAdicionais store={store} update={update} />}
          {adminTab === "config" && <AdminConfig store={store} update={update} />}
          {adminTab === "aparencia" && <AdminAparencia store={store} update={update} />}
          {adminTab === "acesso" && <AdminAcesso store={store} update={update} />}
        </div>
      </div>
    );
  }

  return null;
}

// ─── ADMIN: PRODUTOS ──────────────────────────────────────────────────────────
function AdminProdutos({ store, update }) {
  const { products, categories, optionGroups } = store;
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const startEdit = (p) => { setEditing(p.id); setForm({ ...p, optionGroups: p.optionGroups || [] }); };
  const startNew = () => { setEditing("new"); setForm({ id: Date.now(), cat: categories[0]?.id || "", name: "", desc: "", price: "", image: null, active: true, optionGroups: [] }); };
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name?.trim()) { alert("Nome obrigatório"); return; }
    update(s => ({ ...s, products: editing === "new" ? [...s.products, { ...form, price: Number(form.price) || 0 }] : s.products.map(p => p.id === editing ? { ...form, price: Number(form.price) || 0 } : p) }));
    setEditing(null);
  };
  const del = (id) => { if (window.confirm("Excluir produto?")) update(s => ({ ...s, products: s.products.filter(p => p.id !== id) })); };
  const toggle = (id) => update(s => ({ ...s, products: s.products.map(p => p.id === id ? { ...p, active: !p.active } : p) }));

  if (editing !== null) {
    return (
      <div style={AS.adminSection}>
        <div style={{ fontWeight: 700, marginBottom: 16 }}>{editing === "new" ? "Novo Produto" : "Editar Produto"}</div>
        <label style={AS.adminLabel}>Nome *</label>
        <input style={{ ...AS.adminInput, marginBottom: 10 }} value={form.name || ""} onChange={e => setF("name", e.target.value)} />
        <label style={AS.adminLabel}>Descrição</label>
        <textarea style={{ ...AS.adminInput, minHeight: 60, resize: "vertical", marginBottom: 10 }} value={form.desc || ""} onChange={e => setF("desc", e.target.value)} />
        <label style={AS.adminLabel}>Preço (R$) *</label>
        <input type="number" step="0.01" style={{ ...AS.adminInput, marginBottom: 10 }} value={form.price || ""} onChange={e => setF("price", e.target.value)} />
        <label style={AS.adminLabel}>Categoria</label>
        <select style={{ ...AS.adminInput, marginBottom: 12 }} value={form.cat || ""} onChange={e => setF("cat", e.target.value)}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label style={AS.adminLabel}>Grupos de opções vinculados</label>
        <div style={{ marginBottom: 12 }}>
          {(optionGroups || []).length === 0 && <div style={{ fontSize: 12, color: "#A78BCA", marginBottom: 8 }}>Nenhum grupo. Crie em "🔸 Opções".</div>}
          {(optionGroups || []).map(og => {
            const sel = (form.optionGroups || []).includes(og.id);
            return (
              <div key={og.id} onClick={() => setF("optionGroups", sel ? (form.optionGroups || []).filter(x => x !== og.id) : [...(form.optionGroups || []), og.id])}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${sel ? "#A855F7" : "rgba(168,85,247,.2)"}`, background: sel ? "rgba(168,85,247,.1)" : "transparent", marginBottom: 6, cursor: "pointer" }}>
                <span>{sel ? "✅" : "⬜"}</span>
                <span style={{ fontSize: 13 }}>{og.name}</span>
                {og.required && <span style={{ fontSize: 11, color: "#F87171" }}>obrigatório</span>}
              </div>
            );
          })}
        </div>
        <ImageUpload value={form.image} onChange={v => setF("image", v)} label="Foto do produto" />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Tog on={form.active} onClick={() => setF("active", !form.active)} />
          <span style={{ fontSize: 13 }}>{form.active ? "Produto ativo" : "Produto inativo"}</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...AS.saveBtn, flex: 1 }} onClick={save}>💾 Salvar</button>
          <button onClick={() => setEditing(null)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid rgba(168,85,247,.3)", background: "transparent", color: "#A78BCA", fontSize: 14, cursor: "pointer", marginTop: 6 }}>Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button style={{ ...AS.saveBtn, marginBottom: 16 }} onClick={startNew}>+ Novo Produto</button>
      {products.map(p => (
        <div key={p.id} style={{ ...AS.adminSection, display: "flex", gap: 12, alignItems: "flex-start", opacity: p.active ? 1 : 0.5 }}>
          {p.image ? <img src={p.image} alt={p.name} style={{ width: 54, height: 54, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} /> : <div style={{ width: 54, height: 54, borderRadius: 10, background: "rgba(168,85,247,.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>🫐</div>}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: "#A78BCA" }}>{p.desc}</div>
            <div style={{ fontSize: 13, color: "#F59E0B", fontWeight: 700 }}>{fmt(p.price)}</div>
            {(p.optionGroups || []).length > 0 && <div style={{ fontSize: 11, color: "#A78BCA", marginTop: 2 }}>🔸 {(p.optionGroups || []).map(id => (store.optionGroups || []).find(og => og.id === id)?.name).filter(Boolean).join(" · ")}</div>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Tog on={p.active} onClick={() => toggle(p.id)} />
            <button style={AS.adminBtn} onClick={() => startEdit(p)}>✏️</button>
            <button style={AS.dangerBtn} onClick={() => del(p.id)}>🗑</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ADMIN: OPÇÕES ────────────────────────────────────────────────────────────
function AdminOpcoes({ store, update }) {
  const { optionGroups } = store;
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const startNew = () => { setEditing("new"); setForm({ id: uid(), name: "", required: true, multiple: false, choices: [] }); };
  const startEdit = (og) => { setEditing(og.id); setForm({ ...og, choices: (og.choices || []).map(c => ({ ...c })) }); };
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addChoice = () => setForm(f => ({ ...f, choices: [...(f.choices || []), { id: uid(), name: "", price: 0 }] }));
  const updChoice = (idx, k, v) => setForm(f => ({ ...f, choices: f.choices.map((c, i) => i === idx ? { ...c, [k]: v } : c) }));
  const delChoice = (idx) => setForm(f => ({ ...f, choices: f.choices.filter((_, i) => i !== idx) }));

  const save = () => {
    if (!form.name?.trim()) { alert("Nome obrigatório"); return; }
    update(s => ({ ...s, optionGroups: editing === "new" ? [...(s.optionGroups || []), form] : (s.optionGroups || []).map(og => og.id === editing ? form : og) }));
    setEditing(null);
  };
  const del = (id) => { if (window.confirm("Excluir grupo?")) update(s => ({ ...s, optionGroups: s.optionGroups.filter(og => og.id !== id) })); };

  if (editing !== null) {
    return (
      <div style={AS.adminSection}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>{editing === "new" ? "Novo Grupo" : "Editar Grupo"}</div>
        <label style={AS.adminLabel}>Nome do grupo (ex: "Sabor do Açaí")</label>
        <input style={{ ...AS.adminInput, marginBottom: 10 }} value={form.name || ""} onChange={e => setF("name", e.target.value)} />
        <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Tog on={form.required} onClick={() => setF("required", !form.required)} />
            <span style={{ fontSize: 13 }}>Obrigatório</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Tog on={form.multiple} onClick={() => setF("multiple", !form.multiple)} />
            <span style={{ fontSize: 13 }}>Múltipla escolha</span>
          </div>
        </div>
        <label style={AS.adminLabel}>Opções disponíveis</label>
        {(form.choices || []).map((ch, idx) => (
          <div key={ch.id} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center" }}>
            <input style={{ ...AS.adminInput, flex: 2 }} placeholder="Nome (ex: Morango)" value={ch.name || ""} onChange={e => updChoice(idx, "name", e.target.value)} />
            <input type="number" step="0.01" style={{ ...AS.adminInput, flex: 1 }} placeholder="+ Preço" value={ch.price || 0} onChange={e => updChoice(idx, "price", parseFloat(e.target.value) || 0)} />
            <button style={AS.dangerBtn} onClick={() => delChoice(idx)}>🗑</button>
          </div>
        ))}
        <button style={{ ...AS.adminBtn, width: "100%", marginBottom: 12 }} onClick={addChoice}>+ Adicionar opção</button>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...AS.saveBtn, flex: 1 }} onClick={save}>💾 Salvar grupo</button>
          <button onClick={() => setEditing(null)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid rgba(168,85,247,.3)", background: "transparent", color: "#A78BCA", fontSize: 14, cursor: "pointer", marginTop: 6 }}>Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ ...AS.adminSection, fontSize: 13, color: "#A78BCA", lineHeight: 1.6 }}>
        💡 Crie grupos de opções (ex: "Sabor do Açaí") e vincule a produtos em "🛍️ Produtos". As escolhas do cliente aparecem na comanda do WhatsApp.
      </div>
      <button style={{ ...AS.saveBtn, marginBottom: 16 }} onClick={startNew}>+ Novo Grupo de Opções</button>
      {(optionGroups || []).map(og => (
        <div key={og.id} style={AS.adminSection}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{og.name}</div>
              <div style={{ fontSize: 11, color: "#A78BCA", marginTop: 2 }}>{og.required ? "✅ Obrigatório" : "Opcional"} · {og.multiple ? "Múltipla" : "Única"} escolha</div>
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {og.choices?.map(ch => <span key={ch.id} style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(168,85,247,.15)", fontSize: 12 }}>{ch.name}{ch.price > 0 ? ` (+${fmt(ch.price)})` : ""}</span>)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, marginLeft: 10 }}>
              <button style={AS.adminBtn} onClick={() => startEdit(og)}>✏️</button>
              <button style={AS.dangerBtn} onClick={() => del(og.id)}>🗑</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ADMIN: CATEGORIAS ────────────────────────────────────────────────────────
function AdminCategorias({ store, update }) {
  const [draft, setDraft] = useState(() => store.categories.map(c => ({ ...c })));
  const [saved, setSaved] = useState("");

  const saveAll = () => {
    update(s => ({ ...s, categories: draft }));
    setSaved("✅ Categorias salvas!"); setTimeout(() => setSaved(""), 2000);
  };

  return (
    <div>
      {saved && <div style={AS.successBox}>{saved}</div>}
      {draft.map((cat, i) => (
        <div key={cat.id} style={{ ...AS.adminSection, display: "flex", alignItems: "center", gap: 10 }}>
          <input style={{ ...AS.adminInput, flex: 1 }} value={cat.name} onChange={e => setDraft(d => d.map((c, j) => j === i ? { ...c, name: e.target.value } : c))} />
          <Tog on={cat.active} onClick={() => setDraft(d => d.map((c, j) => j === i ? { ...c, active: !c.active } : c))} />
          <button style={AS.dangerBtn} onClick={() => setDraft(d => d.filter((_, j) => j !== i))}>🗑</button>
        </div>
      ))}
      <button style={{ ...AS.adminBtn, marginBottom: 10 }} onClick={() => setDraft(d => [...d, { id: uid(), name: "Nova Categoria", active: true }])}>+ Nova categoria</button>
      <button style={AS.saveBtn} onClick={saveAll}>💾 Salvar categorias</button>
    </div>
  );
}

// ─── ADMIN: ADICIONAIS ────────────────────────────────────────────────────────
function AdminAdicionais({ store, update }) {
  const { addons } = store;
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name?.trim()) { alert("Nome obrigatório"); return; }
    update(s => ({ ...s, addons: editing === "new" ? [...s.addons, { ...form, price: Number(form.price) || 0 }] : s.addons.map(a => a.id === editing ? { ...form, price: Number(form.price) || 0 } : a) }));
    setEditing(null);
  };
  const del = (id) => { if (window.confirm("Excluir?")) update(s => ({ ...s, addons: s.addons.filter(a => a.id !== id) })); };
  const toggle = (id) => update(s => ({ ...s, addons: s.addons.map(a => a.id === id ? { ...a, active: !a.active } : a) }));

  if (editing !== null) {
    return (
      <div style={AS.adminSection}>
        <label style={AS.adminLabel}>Nome</label>
        <input style={{ ...AS.adminInput, marginBottom: 10 }} value={form.name || ""} onChange={e => setF("name", e.target.value)} />
        <label style={AS.adminLabel}>Preço (R$)</label>
        <input type="number" step="0.01" style={{ ...AS.adminInput, marginBottom: 12 }} value={form.price || ""} onChange={e => setF("price", e.target.value)} />
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...AS.saveBtn, flex: 1 }} onClick={save}>💾 Salvar</button>
          <button onClick={() => setEditing(null)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid rgba(168,85,247,.3)", background: "transparent", color: "#A78BCA", fontSize: 14, cursor: "pointer", marginTop: 6 }}>Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button style={{ ...AS.saveBtn, marginBottom: 16 }} onClick={() => { setEditing("new"); setForm({ id: Date.now(), name: "", price: "", active: true }); }}>+ Novo Adicional</button>
      {addons.map(a => (
        <div key={a.id} style={{ ...AS.adminSection, display: "flex", alignItems: "center", gap: 10, opacity: a.active ? 1 : 0.5 }}>
          <span style={{ flex: 1, fontWeight: 600 }}>{a.name}</span>
          <span style={{ color: "#F59E0B", fontSize: 13 }}>{fmt(a.price)}</span>
          <Tog on={a.active} onClick={() => toggle(a.id)} />
          <button style={AS.adminBtn} onClick={() => { setEditing(a.id); setForm({ ...a }); }}>✏️</button>
          <button style={AS.dangerBtn} onClick={() => del(a.id)}>🗑</button>
        </div>
      ))}
    </div>
  );
}

// ─── ADMIN: CONFIG ────────────────────────────────────────────────────────────
function AdminConfig({ store, update }) {
  const [draft, setDraft] = useState({ ...store.config });
  const [saved, setSaved] = useState("");
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const saveAll = () => {
    update(s => ({ ...s, config: draft }));
    setSaved("✅ Configurações salvas!"); setTimeout(() => setSaved(""), 2000);
  };

  return (
    <div>
      {saved && <div style={AS.successBox}>{saved}</div>}
      <div style={AS.adminSection}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>🏪 Informações da Loja</div>
        {[["name","Nome da loja"],["tagline","Slogan"],["address","Endereço"],["whatsapp","WhatsApp (com DDI, ex: 5579999999999)"],["instagram","Instagram (@username ou URL)"],["deliveryTime","Tempo de entrega"],["pixKey","Chave PIX"]].map(([k,l]) => (
          <div key={k} style={{ marginBottom: 12 }}>
            <label style={AS.adminLabel}>{l}</label>
            <input style={AS.adminInput} value={draft[k] || ""} onChange={e => set(k, e.target.value)} />
          </div>
        ))}
        {[["deliveryFee","Taxa de entrega (R$)"],["minOrder","Pedido mínimo (R$)"]].map(([k,l]) => (
          <div key={k} style={{ marginBottom: 12 }}>
            <label style={AS.adminLabel}>{l}</label>
            <input type="number" step="0.01" style={AS.adminInput} value={draft[k] || 0} onChange={e => set(k, parseFloat(e.target.value) || 0)} />
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Tog on={draft.showAddress} onClick={() => set("showAddress", !draft.showAddress)} />
          <span style={{ fontSize: 13 }}>Exibir endereço no cardápio</span>
        </div>
        <ImageUpload value={draft.logo} onChange={v => set("logo", v)} label="Logo da loja" />
      </div>
      <div style={AS.adminSection}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>📢 Banner</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Tog on={draft.bannerActive} onClick={() => set("bannerActive", !draft.bannerActive)} />
          <span style={{ fontSize: 13 }}>Exibir banner</span>
        </div>
        <label style={AS.adminLabel}>Texto do banner</label>
        <input style={AS.adminInput} value={draft.bannerText || ""} onChange={e => set("bannerText", e.target.value)} />
      </div>
      <div style={AS.adminSection}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>🦶 Rodapé</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Tog on={draft.showFooter} onClick={() => set("showFooter", !draft.showFooter)} />
          <span style={{ fontSize: 13 }}>Exibir rodapé</span>
        </div>
        <label style={AS.adminLabel}>Texto do rodapé</label>
        <input style={AS.adminInput} value={draft.footerText || ""} onChange={e => set("footerText", e.target.value)} />
      </div>
      <button style={AS.saveBtn} onClick={saveAll}>💾 Salvar configurações</button>
    </div>
  );
}

// ─── ADMIN: APARÊNCIA ─────────────────────────────────────────────────────────
function AdminAparencia({ store, update }) {
  const [draft, setDraft] = useState({ ...store.config });
  const [saved, setSaved] = useState("");
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  const saveAll = () => {
    update(s => ({ ...s, config: draft }));
    setSaved("✅ Aparência salva!"); setTimeout(() => setSaved(""), 2000);
  };

  const themes = [
    { name: "🍇 Roxo Escuro", bg: "#0F0A1A", card: "#1A1028", primary: "#6B21A8", secondary: "#A855F7", text: "#F3E8FF", muted: "#A78BCA", header: "#0F0A1A", price: "#F59E0B" },
    { name: "🌊 Azul Noite", bg: "#0A0F1A", card: "#0F1728", primary: "#1D4ED8", secondary: "#3B82F6", text: "#EFF6FF", muted: "#93C5FD", header: "#0A0F1A", price: "#FCD34D" },
    { name: "🌿 Verde Natureza", bg: "#051A0A", card: "#0A2010", primary: "#15803D", secondary: "#22C55E", text: "#F0FDF4", muted: "#86EFAC", header: "#051A0A", price: "#FCD34D" },
    { name: "🌅 Laranja Tropical", bg: "#1A0A00", card: "#2A1200", primary: "#C2410C", secondary: "#FB923C", text: "#FFF7ED", muted: "#FDBA74", header: "#1A0A00", price: "#FDE68A" },
    { name: "🌸 Rosa Pink", bg: "#1A0010", card: "#280018", primary: "#9D174D", secondary: "#EC4899", text: "#FDF2F8", muted: "#F9A8D4", header: "#1A0010", price: "#FDE047" },
    { name: "☀️ Claro", bg: "#F8F5FF", card: "#FFFFFF", primary: "#6B21A8", secondary: "#A855F7", text: "#1A0A2E", muted: "#6B7280", header: "#FFFFFF", price: "#6B21A8" },
  ];

  return (
    <div>
      {saved && <div style={AS.successBox}>{saved}</div>}
      <div style={AS.adminSection}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>🎨 Temas Prontos</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {themes.map(t => (
            <button key={t.name} onClick={() => setDraft(d => ({ ...d, bgColor: t.bg, cardColor: t.card, primaryColor: t.primary, secondaryColor: t.secondary, textColor: t.text, mutedColor: t.muted, headerBg: t.header, priceColor: t.price }))}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(168,85,247,.2)", background: t.bg, color: t.text, fontSize: 12, cursor: "pointer", textAlign: "left" }}>
              {t.name}
            </button>
          ))}
        </div>
      </div>
      <div style={AS.adminSection}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>🖌 Cores Personalizadas</div>
        {[["bgColor","Fundo da página"],["cardColor","Fundo dos cards"],["primaryColor","Cor primária"],["secondaryColor","Cor secundária"],["textColor","Texto principal"],["mutedColor","Texto secundário"],["headerBg","Header"],["priceColor","Cor dos preços"],["buttonTextColor","Texto dos botões"]].map(([k,l]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <input type="color" value={draft[k] || "#000000"} onChange={e => set(k, e.target.value)} style={{ width: 40, height: 34, borderRadius: 8, border: "none", cursor: "pointer" }} />
            <span style={{ fontSize: 13, flex: 1 }}>{l}</span>
            <input style={{ ...AS.adminInput, width: 100, fontSize: 12 }} value={draft[k] || ""} onChange={e => set(k, e.target.value)} />
          </div>
        ))}
      </div>
      <div style={AS.adminSection}>
        <div style={{ fontWeight: 700, marginBottom: 14 }}>✍️ Tipografia</div>
        {[["titleFont","Fonte do título",[["Georgia, serif","Georgia"],["'Playfair Display', serif","Playfair Display"],["'Montserrat', sans-serif","Montserrat"],["'Poppins', sans-serif","Poppins"],["system-ui, sans-serif","System UI"]]],
          ["bodyFont","Fonte do corpo",[["system-ui, sans-serif","System UI"],["'Poppins', sans-serif","Poppins"],["'Roboto', sans-serif","Roboto"],["Georgia, serif","Georgia"]]],
          ["fontSize","Tamanho da fonte",[["13px","13px"],["14px","14px"],["15px","15px"],["16px","16px"],["17px","17px"],["18px","18px"]]],
          ["borderRadius","Arredondamento",[["4px","Reto"],["8px","Leve"],["14px","Arredondado"],["20px","Muito arredondado"],["30px","Cápsulas"]]]
        ].map(([k,l,opts]) => (
          <div key={k} style={{ marginBottom: 12 }}>
            <label style={AS.adminLabel}>{l}</label>
            <select style={AS.adminInput} value={draft[k] || ""} onChange={e => set(k, e.target.value)}>
              {opts.map(([v,lbl]) => <option key={v} value={v}>{lbl}</option>)}
            </select>
          </div>
        ))}
      </div>
      <button style={AS.saveBtn} onClick={saveAll}>💾 Salvar aparência</button>
    </div>
  );
}

// ─── ADMIN: ACESSO ────────────────────────────────────────────────────────────
function AdminAcesso({ store, update }) {
  const [form, setForm] = useState({ user: store.auth.user, password: "", confirm: "" });
  const [msg, setMsg] = useState("");
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.user.trim()) { setMsg("Usuário não pode ser vazio."); return; }
    if (form.password && form.password !== form.confirm) { setMsg("Senhas não coincidem."); return; }
    update(s => ({ ...s, auth: { user: form.user, password: form.password || s.auth.password } }));
    setMsg("✅ Salvo com sucesso!");
    setForm(f => ({ ...f, password: "", confirm: "" }));
  };

  return (
    <div style={AS.adminSection}>
      <div style={{ fontWeight: 700, marginBottom: 14 }}>🔐 Alterar Login</div>
      <label style={AS.adminLabel}>Usuário</label>
      <input style={{ ...AS.adminInput, marginBottom: 10 }} value={form.user} onChange={e => setF("user", e.target.value)} />
      <label style={AS.adminLabel}>Nova Senha (em branco = não altera)</label>
      <input type="password" style={{ ...AS.adminInput, marginBottom: 10 }} value={form.password} onChange={e => setF("password", e.target.value)} />
      <label style={AS.adminLabel}>Confirmar Nova Senha</label>
      <input type="password" style={{ ...AS.adminInput, marginBottom: 14 }} value={form.confirm} onChange={e => setF("confirm", e.target.value)} />
      {msg && <div style={{ fontSize: 13, color: msg.startsWith("✅") ? "#86EFAC" : "#FCA5A5", marginBottom: 10 }}>{msg}</div>}
      <button style={AS.saveBtn} onClick={save}>💾 Salvar alterações</button>
    </div>
  );
}
