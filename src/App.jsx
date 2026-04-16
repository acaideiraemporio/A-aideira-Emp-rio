import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import {
  doc, getDoc, setDoc, collection,
  getDocs, addDoc, updateDoc, deleteDoc
} from "firebase/firestore";

const DEFAULT_CONFIG = {
  name: "Açaídeira Empório",
  tagline: "O melhor açaí da cidade 🍇",
  address: "Rua das Flores, 123 – Centro",
  showAddress: true,
  whatsapp: "5511999999999",
  instagram: "",
  deliveryTime: "30–45 min",
  pixLink: "https://nubank.com.br/cobrar/exemplo",
  cardLink: "https://link-cartao.com",
  bannerText: "🎉 Promoção: Combo Família com 20% OFF hoje!",
  bannerActive: true,
  deliveryFee: 5.0,
  logoUrl: "",
  theme: {
    bg: "#0F0A1A",
    card: "#1A1028",
    primary: "#6B21A8",
    secondary: "#A855F7",
    accent: "#F59E0B",
    text: "#F3E8FF",
    muted: "#A78BCA",
  },
  font: "sans-serif",
};

const DEFAULT_PRODUCTS = [
  { cat: "combos", name: "Combo Explosão", desc: "500ml + 2 adicionais + bebida", price: 32.9, imageUrl: "" },
  { cat: "combos", name: "Combo Família", desc: "2 litros + 6 adicionais", price: 79.9, imageUrl: "" },
  { cat: "combos", name: "Combo Econômico", desc: "300ml + 1 adicional", price: 19.9, imageUrl: "" },
  { cat: "acai", name: "Açaí 300ml", desc: "Açaí puro cremoso", price: 12.9, imageUrl: "" },
  { cat: "acai", name: "Açaí 500ml", desc: "O mais pedido!", price: 18.9, imageUrl: "" },
  { cat: "acai", name: "Açaí 1 Litro", desc: "Melhor custo-benefício", price: 29.9, imageUrl: "" },
  { cat: "sorvetes", name: "Sorvete de Creme", desc: "Cremoso", price: 8.9, imageUrl: "" },
  { cat: "bebidas", name: "Suco de Laranja", desc: "Natural 300ml", price: 7.9, imageUrl: "" },
  { cat: "petiscos", name: "Batata Frita", desc: "Porção 200g", price: 14.9, imageUrl: "" },
];

const DEFAULT_ADDONS = [
  { name: "Granola", price: 2.5 },
  { name: "Leite Condensado", price: 2.0 },
  { name: "Banana", price: 1.5 },
  { name: "Morango", price: 2.0 },
  { name: "Nutella", price: 4.0 },
];

const FONT_OPTIONS = [
  { label: "Moderno (padrão)", value: "sans-serif" },
  { label: "Elegante (Serif)", value: "Georgia, serif" },
  { label: "Divertido (Rounded)", value: "'Trebuchet MS', sans-serif" },
  { label: "Minimalista (Mono)", value: "'Courier New', monospace" },
];

const THEME_PRESETS = [
  { label: "🫐 Roxo (padrão)", bg: "#0F0A1A", card: "#1A1028", primary: "#6B21A8", secondary: "#A855F7", accent: "#F59E0B", text: "#F3E8FF", muted: "#A78BCA" },
  { label: "🌊 Azul Ocean", bg: "#030D1A", card: "#0A1A2E", primary: "#1D4ED8", secondary: "#3B82F6", accent: "#F59E0B", text: "#E0F2FE", muted: "#7DD3FC" },
  { label: "🌿 Verde Natural", bg: "#071A0F", card: "#0D2B18", primary: "#15803D", secondary: "#22C55E", accent: "#F59E0B", text: "#DCFCE7", muted: "#86EFAC" },
  { label: "🍓 Rosa Candy", bg: "#1A040D", card: "#2B0A14", primary: "#9D174D", secondary: "#EC4899", accent: "#FCD34D", text: "#FCE7F3", muted: "#F9A8D4" },
  { label: "🌙 Cinza Elegante", bg: "#0A0A0A", card: "#141414", primary: "#374151", secondary: "#6B7280", accent: "#F59E0B", text: "#F9FAFB", muted: "#9CA3AF" },
];

const AUTH = { user: "admin", password: "acai2024" };
const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;
const CATS = ["combos", "acai", "sorvetes", "bebidas", "petiscos"];
const CAT_NAMES = { combos: "🔥 Combos", acai: "🫐 Açaí", sorvetes: "🍦 Sorvetes", bebidas: "🥤 Bebidas", petiscos: "🍟 Petiscos" };

// Upload para Imgur (gratuito, sem autenticação)
async function uploadToImgur(file) {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: { Authorization: "Client-ID 546c25a59c58ad7" },
    body: formData,
  });
  const data = await res.json();
  if (data.success) return data.data.link;
  throw new Error("Falha no upload");
}

function ImageUploader({ value, onChange, label = "Foto" }) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value || "");
  const [mode, setMode] = useState("url");
  const fileRef = useRef();

  const s_inp = { width: "100%", padding: "9px 13px", borderRadius: 10, border: "1.5px solid rgba(168,85,247,.3)", background: "rgba(168,85,247,.08)", color: "#F3E8FF", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Imagem muito grande! Use até 5MB."); return; }
    setUploading(true);
    try {
      const url = await uploadToImgur(file);
      onChange(url);
      setUrlInput(url);
    } catch {
      alert("Erro no upload. Tente colar uma URL de imagem.");
    }
    setUploading(false);
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: "#A78BCA", display: "block", marginBottom: 6 }}>{label}</label>
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {["url", "upload"].map(m => (
          <button key={m} onClick={() => setMode(m)} type="button" style={{ flex: 1, padding: "7px", borderRadius: 8, border: `1.5px solid ${mode === m ? "#A855F7" : "rgba(168,85,247,.2)"}`, background: mode === m ? "rgba(168,85,247,.15)" : "transparent", color: mode === m ? "#A855F7" : "#A78BCA", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
            {m === "url" ? "🔗 Colar URL" : "📁 Enviar Foto"}
          </button>
        ))}
      </div>
      {mode === "url" ? (
        <input
          value={urlInput}
          onChange={e => { setUrlInput(e.target.value); onChange(e.target.value); }}
          style={s_inp}
          placeholder="https://exemplo.com/foto.jpg"
        />
      ) : (
        <div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
          <button onClick={() => fileRef.current.click()} type="button" disabled={uploading} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1.5px dashed rgba(168,85,247,.4)", background: "rgba(168,85,247,.05)", color: "#A78BCA", cursor: "pointer", fontSize: 13 }}>
            {uploading ? "⏳ Enviando..." : "📷 Escolher imagem do dispositivo"}
          </button>
        </div>
      )}
      {(value || urlInput) && (
        <div style={{ marginTop: 8, borderRadius: 10, overflow: "hidden", height: 80, background: "#1A1028" }}>
          <img src={value || urlInput} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [products, setProducts] = useState([]);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [view, setView] = useState("menu");
  const [cart, setCart] = useState([]);
  const [cat, setCat] = useState("combos");
  const [modal, setModal] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [form, setForm] = useState({ name: "", address: "", ref: "", payment: "pix", type: "delivery", obs: "" });
  const [paid, setPaid] = useState(false);
  const [loginForm, setLoginForm] = useState({ user: "", pass: "" });
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginErr, setLoginErr] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({ cat: "combos", name: "", desc: "", price: "", imageUrl: "" });
  const [configDraft, setConfigDraft] = useState(DEFAULT_CONFIG);
  const [adminTab, setAdminTab] = useState("produtos");
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const configDoc = await getDoc(doc(db, "loja", "config"));
        if (configDoc.exists()) {
          const data = configDoc.data();
          setConfig({ ...DEFAULT_CONFIG, ...data, theme: { ...DEFAULT_CONFIG.theme, ...(data.theme || {}) } });
        } else {
          await setDoc(doc(db, "loja", "config"), DEFAULT_CONFIG);
        }
        const prodSnap = await getDocs(collection(db, "produtos"));
        if (prodSnap.empty) {
          for (const p of DEFAULT_PRODUCTS) await addDoc(collection(db, "produtos"), p);
          const s2 = await getDocs(collection(db, "produtos"));
          setProducts(s2.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
        const addonSnap = await getDocs(collection(db, "adicionais"));
        if (addonSnap.empty) {
          for (const a of DEFAULT_ADDONS) await addDoc(collection(db, "adicionais"), a);
          const s2 = await getDocs(collection(db, "adicionais"));
          setAddons(s2.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          setAddons(addonSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (e) { console.error("Erro:", e); }
      setLoading(false);
    }
    loadData();
  }, []);

  const s = config.theme || DEFAULT_CONFIG.theme;
  const font = config.font || "sans-serif";
  const btn = (extra = {}) => ({ padding: "13px", background: `linear-gradient(135deg,${s.primary},${s.secondary})`, border: "none", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", width: "100%", fontFamily: font, ...extra });
  const inp = { width: "100%", padding: "11px 13px", borderRadius: 10, border: `1.5px solid rgba(168,85,247,.3)`, background: "rgba(168,85,247,.08)", color: s.text, fontSize: 14, outline: "none", fontFamily: font, boxSizing: "border-box" };

  const saveConfig = async (newConfig) => {
    setSaving(true);
    await setDoc(doc(db, "loja", "config"), newConfig);
    setConfig(newConfig);
    setSaving(false);
    setSaveMsg("✅ Configurações salvas!");
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const saveProduct = async (product) => {
    setSaving(true);
    if (product.id) {
      const { id, ...data } = product;
      await updateDoc(doc(db, "produtos", id), { ...data, price: Number(data.price) });
      setProducts(prev => prev.map(p => p.id === id ? { id, ...data, price: Number(data.price) } : p));
    } else {
      const ref = await addDoc(collection(db, "produtos"), { ...product, price: Number(product.price) });
      setProducts(prev => [...prev, { id: ref.id, ...product, price: Number(product.price) }]);
    }
    setSaving(false);
    setEditingProduct(null);
    setNewProduct({ cat: "combos", name: "", desc: "", price: "", imageUrl: "" });
    setSaveMsg("✅ Produto salvo!");
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Excluir este produto?")) return;
    await deleteDoc(doc(db, "produtos", id));
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const finalTotal = cartTotal + (config.deliveryFee || 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = (product) => {
    const addonTotal = selectedAddons.reduce((s, a) => s + a.price, 0);
    setCart(prev => [...prev, { id: Date.now(), name: product.name, price: product.price + addonTotal, addons: selectedAddons, qty: 1 }]);
    setModal(null);
    setSelectedAddons([]);
  };

  const changeQty = (id, d) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + d) } : i).filter(i => i.qty > 0));
  const toggleAddon = (addon) => setSelectedAddons(prev => prev.find(a => a.id === addon.id) ? prev.filter(a => a.id !== addon.id) : [...prev, addon]);

  const buildMsg = () => encodeURIComponent([
    `🫐 *PEDIDO - ${config.name}*`,
    `👤 Cliente: ${form.name}`,
    `📍 Endereço: ${form.address}`,
    `🏠 Ref: ${form.ref}`,
    `🚚 Tipo: ${form.type === "delivery" ? "Delivery" : "Retirada"}`,
    `💳 Pagamento: ${form.payment === "pix" ? "PIX" : "Cartão"}`,
    `─────────────`,
    ...cart.map(i => `• ${i.qty}x ${i.name} — ${fmt(i.price * i.qty)}`),
    `─────────────`,
    `💰 Total: ${fmt(finalTotal)}`,
    form.obs ? `📝 Obs: ${form.obs}` : null,
  ].filter(Boolean).join("\n"));

  const login = () => {
    if (loginForm.user === AUTH.user && loginForm.pass === AUTH.password) {
      setLoggedIn(true); setView("admin"); setConfigDraft({ ...DEFAULT_CONFIG, ...config, theme: { ...DEFAULT_CONFIG.theme, ...(config.theme || {}) } });
    } else { setLoginErr("Usuário ou senha incorretos"); }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: s.bg, color: s.text, flexDirection: "column", gap: 16, fontFamily: font }}>
      <div style={{ fontSize: 52 }}>🫐</div>
      <p style={{ color: s.muted }}>Carregando cardápio...</p>
    </div>
  );

  if (view === "login") return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: s.bg, padding: 20, fontFamily: font }}>
      <div style={{ background: s.card, borderRadius: 20, padding: 32, width: "100%", maxWidth: 380, border: `1px solid rgba(168,85,247,.25)` }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          {config.logoUrl ? <img src={config.logoUrl} alt="logo" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", marginBottom: 8 }} /> : <div style={{ fontSize: 48 }}>🔐</div>}
          <h2 style={{ color: s.text, fontFamily: font, fontSize: 22 }}>Painel Admin</h2>
        </div>
        {loginErr && <div style={{ background: "#DC262620", border: "1px solid #DC2626", borderRadius: 10, padding: 10, color: "#FCA5A5", fontSize: 13, marginBottom: 12 }}>{loginErr}</div>}
        {[["Usuário", "user", "text"], ["Senha", "pass", "password"]].map(([l, k, t]) => (
          <div key={k} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: s.muted, display: "block", marginBottom: 4 }}>{l}</label>
            <input type={t} value={loginForm[k]} onChange={e => setLoginForm(p => ({ ...p, [k]: e.target.value }))} onKeyDown={e => e.key === "Enter" && login()} style={inp} />
          </div>
        ))}
        <button onClick={login} style={btn({ marginTop: 8 })}>Entrar</button>
        <button onClick={() => setView("menu")} style={{ ...btn(), background: "transparent", border: `1px solid rgba(168,85,247,.2)`, color: s.muted, marginTop: 8 }}>← Cardápio</button>
      </div>
    </div>
  );

  if (view === "admin") return (
    <div style={{ minHeight: "100vh", background: s.bg, color: s.text, padding: 20, fontFamily: font }}>
      <div style={{ maxWidth: 540, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 20 }}>⚙️ Painel Admin</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setView("menu")} style={{ padding: "8px 14px", borderRadius: 10, border: `1px solid rgba(168,85,247,.3)`, background: "transparent", color: s.muted, cursor: "pointer", fontSize: 13 }}>Ver Site</button>
            <button onClick={() => { setLoggedIn(false); setView("menu"); }} style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(220,38,38,.2)", border: "1px solid rgba(220,38,38,.3)", color: "#FCA5A5", cursor: "pointer", fontSize: 13 }}>Sair</button>
          </div>
        </div>

        {saveMsg && <div style={{ background: "#16A34A22", border: "1px solid #16A34A", borderRadius: 10, padding: "10px 14px", color: "#4ADE80", fontSize: 14, marginBottom: 16 }}>{saveMsg}</div>}

        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[["produtos", "🛍️ Produtos"], ["config", "🔧 Configurações"], ["aparencia", "🎨 Aparência"]].map(([tab, label]) => (
            <button key={tab} onClick={() => setAdminTab(tab)} style={{ padding: "9px 18px", borderRadius: 10, border: `1.5px solid ${adminTab === tab ? s.secondary : "rgba(168,85,247,.2)"}`, background: adminTab === tab ? `rgba(168,85,247,.15)` : "transparent", color: adminTab === tab ? s.secondary : s.muted, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>{label}</button>
          ))}
        </div>

        {/* ABA PRODUTOS */}
        {adminTab === "produtos" && (
          <>
            <div style={{ background: s.card, borderRadius: 14, padding: 18, border: `1px solid rgba(168,85,247,.2)`, marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: s.muted, marginBottom: 12 }}>+ Novo Produto</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: s.muted, display: "block", marginBottom: 3 }}>Categoria</label>
                  <select value={newProduct.cat} onChange={e => setNewProduct(p => ({ ...p, cat: e.target.value }))} style={{ ...inp, padding: "9px 13px" }}>
                    {CATS.map(c => <option key={c} value={c}>{CAT_NAMES[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: s.muted, display: "block", marginBottom: 3 }}>Preço (R$)</label>
                  <input type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} style={{ ...inp, padding: "9px 13px" }} placeholder="0,00" />
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 11, color: s.muted, display: "block", marginBottom: 3 }}>Nome do produto</label>
                <input value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} style={inp} placeholder="Ex: Açaí 700ml" />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 11, color: s.muted, display: "block", marginBottom: 3 }}>Descrição</label>
                <input value={newProduct.desc} onChange={e => setNewProduct(p => ({ ...p, desc: e.target.value }))} style={inp} placeholder="Ex: Cremoso e gelado" />
              </div>
              <ImageUploader value={newProduct.imageUrl} onChange={url => setNewProduct(p => ({ ...p, imageUrl: url }))} label="Foto do produto" />
              <button onClick={() => { if (newProduct.name && newProduct.price) saveProduct(newProduct); }} style={btn({ padding: "10px" })} disabled={saving}>
                {saving ? "Salvando..." : "Adicionar Produto"}
              </button>
            </div>

            <h3 style={{ fontSize: 14, color: s.muted, marginBottom: 10 }}>Produtos cadastrados ({products.length})</h3>
            {CATS.map(c => {
              const catProds = products.filter(p => p.cat === c);
              if (!catProds.length) return null;
              return (
                <div key={c} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: s.secondary, marginBottom: 6, textTransform: "uppercase" }}>{CAT_NAMES[c]}</div>
                  {catProds.map(p => (
                    <div key={p.id}>
                      {editingProduct?.id === p.id ? (
                        <div style={{ background: s.card, borderRadius: 12, padding: 14, marginBottom: 8, border: `1.5px solid ${s.secondary}` }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                            <div>
                              <label style={{ fontSize: 11, color: s.muted, display: "block", marginBottom: 3 }}>Categoria</label>
                              <select value={editingProduct.cat} onChange={e => setEditingProduct(p => ({ ...p, cat: e.target.value }))} style={{ ...inp, padding: "9px 13px" }}>
                                {CATS.map(c => <option key={c} value={c}>{CAT_NAMES[c]}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: 11, color: s.muted, display: "block", marginBottom: 3 }}>Preço (R$)</label>
                              <input type="number" step="0.01" value={editingProduct.price} onChange={e => setEditingProduct(p => ({ ...p, price: e.target.value }))} style={{ ...inp, padding: "9px 13px" }} />
                            </div>
                          </div>
                          <input value={editingProduct.name} onChange={e => setEditingProduct(p => ({ ...p, name: e.target.value }))} style={{ ...inp, marginBottom: 8 }} placeholder="Nome" />
                          <input value={editingProduct.desc} onChange={e => setEditingProduct(p => ({ ...p, desc: e.target.value }))} style={{ ...inp, marginBottom: 8 }} placeholder="Descrição" />
                          <ImageUploader value={editingProduct.imageUrl || ""} onChange={url => setEditingProduct(p => ({ ...p, imageUrl: url }))} label="Foto do produto" />
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => saveProduct(editingProduct)} style={btn({ padding: "9px", flex: 1 })} disabled={saving}>{saving ? "..." : "✅ Salvar"}</button>
                            <button onClick={() => setEditingProduct(null)} style={{ ...btn({ padding: "9px", flex: 1 }), background: "transparent", border: `1px solid rgba(168,85,247,.2)`, color: s.muted }}>Cancelar</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ background: s.card, borderRadius: 12, padding: "10px 14px", marginBottom: 8, border: `1px solid rgba(168,85,247,.15)`, display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", background: `linear-gradient(135deg,${s.primary}44,${s.secondary}44)`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                            {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} /> : "🫐"}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                            <div style={{ fontSize: 12, color: s.muted }}>{p.desc}</div>
                            <div style={{ color: s.accent, fontWeight: 700, fontSize: 14, marginTop: 2 }}>{fmt(p.price)}</div>
                          </div>
                          <button onClick={() => setEditingProduct({ ...p })} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid rgba(168,85,247,.3)`, background: "transparent", color: s.muted, cursor: "pointer", fontSize: 12 }}>✏️</button>
                          <button onClick={() => deleteProduct(p.id)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(220,38,38,.3)", background: "rgba(220,38,38,.1)", color: "#FCA5A5", cursor: "pointer", fontSize: 12 }}>🗑️</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}

        {/* ABA CONFIGURAÇÕES */}
        {adminTab === "config" && (
          <div style={{ background: s.card, borderRadius: 14, padding: 20, border: `1px solid rgba(168,85,247,.2)` }}>
            <ImageUploader value={configDraft.logoUrl || ""} onChange={url => setConfigDraft(p => ({ ...p, logoUrl: url }))} label="Logo da loja (foto ou URL)" />
            {[
              ["Nome do estabelecimento", "name", "text"],
              ["Slogan", "tagline", "text"],
              ["Endereço", "address", "text"],
              ["WhatsApp (com DDI, ex: 5511999999999)", "whatsapp", "text"],
              ["Instagram (ex: @acaideiraemporio)", "instagram", "text"],
              ["Tempo de entrega", "deliveryTime", "text"],
              ["Taxa de entrega (R$)", "deliveryFee", "number"],
              ["Link PIX", "pixLink", "text"],
              ["Link Cartão", "cardLink", "text"],
              ["Texto do banner", "bannerText", "text"],
            ].map(([label, key, type]) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: s.muted, display: "block", marginBottom: 4 }}>{label}</label>
                <input type={type} value={configDraft[key] ?? ""} onChange={e => setConfigDraft(p => ({ ...p, [key]: e.target.value }))} style={inp} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
              <label style={{ fontSize: 13, color: s.muted }}>Mostrar endereço?</label>
              <button onClick={() => setConfigDraft(p => ({ ...p, showAddress: !p.showAddress }))} style={{ padding: "6px 16px", borderRadius: 8, border: `1.5px solid ${configDraft.showAddress ? s.secondary : "rgba(168,85,247,.2)"}`, background: configDraft.showAddress ? `rgba(168,85,247,.15)` : "transparent", color: configDraft.showAddress ? s.secondary : s.muted, cursor: "pointer", fontWeight: 600 }}>
                {configDraft.showAddress ? "✅ Sim" : "❌ Não"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
              <label style={{ fontSize: 13, color: s.muted }}>Banner ativo?</label>
              <button onClick={() => setConfigDraft(p => ({ ...p, bannerActive: !p.bannerActive }))} style={{ padding: "6px 16px", borderRadius: 8, border: `1.5px solid ${configDraft.bannerActive ? s.accent : "rgba(168,85,247,.2)"}`, background: configDraft.bannerActive ? `rgba(245,158,11,.15)` : "transparent", color: configDraft.bannerActive ? s.accent : s.muted, cursor: "pointer", fontWeight: 600 }}>
                {configDraft.bannerActive ? "✅ Ativo" : "❌ Inativo"}
              </button>
            </div>
            <button onClick={() => saveConfig({ ...configDraft, deliveryFee: Number(configDraft.deliveryFee) })} style={btn()} disabled={saving}>
              {saving ? "Salvando..." : "💾 Salvar Configurações"}
            </button>
          </div>
        )}

        {/* ABA APARÊNCIA */}
        {adminTab === "aparencia" && (
          <div>
            {/* Temas prontos */}
            <div style={{ background: s.card, borderRadius: 14, padding: 18, border: `1px solid rgba(168,85,247,.2)`, marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: s.muted, marginBottom: 12 }}>🎨 Temas prontos</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {THEME_PRESETS.map((preset, i) => (
                  <button key={i} onClick={() => setConfigDraft(p => ({ ...p, theme: { bg: preset.bg, card: preset.card, primary: preset.primary, secondary: preset.secondary, accent: preset.accent, text: preset.text, muted: preset.muted } }))}
                    style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${configDraft.theme?.primary === preset.primary ? preset.secondary : "rgba(168,85,247,.2)"}`, background: configDraft.theme?.primary === preset.primary ? "rgba(168,85,247,.1)" : "transparent", color: s.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, fontSize: 14, textAlign: "left" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[preset.bg, preset.primary, preset.secondary, preset.accent].map((c, j) => (
                        <div key={j} style={{ width: 16, height: 16, borderRadius: 4, background: c, border: "1px solid rgba(255,255,255,.2)" }} />
                      ))}
                    </div>
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cores personalizadas */}
            <div style={{ background: s.card, borderRadius: 14, padding: 18, border: `1px solid rgba(168,85,247,.2)`, marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: s.muted, marginBottom: 12 }}>🖌️ Cores personalizadas</h3>
              {[
                ["Cor de fundo", "bg"],
                ["Cor dos cards", "card"],
                ["Cor primária", "primary"],
                ["Cor secundária", "secondary"],
                ["Cor de destaque (preços)", "accent"],
              ].map(([label, key]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <input type="color" value={configDraft.theme?.[key] || "#000000"} onChange={e => setConfigDraft(p => ({ ...p, theme: { ...p.theme, [key]: e.target.value } }))}
                    style={{ width: 40, height: 36, borderRadius: 8, border: "none", cursor: "pointer", background: "transparent" }} />
                  <label style={{ fontSize: 13, color: s.muted, flex: 1 }}>{label}</label>
                  <span style={{ fontSize: 12, color: s.muted, fontFamily: "monospace" }}>{configDraft.theme?.[key]}</span>
                </div>
              ))}
            </div>

            {/* Fonte */}
            <div style={{ background: s.card, borderRadius: 14, padding: 18, border: `1px solid rgba(168,85,247,.2)`, marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: s.muted, marginBottom: 12 }}>🔤 Fonte do cardápio</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {FONT_OPTIONS.map(f => (
                  <button key={f.value} onClick={() => setConfigDraft(p => ({ ...p, font: f.value }))}
                    style={{ padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${configDraft.font === f.value ? s.secondary : "rgba(168,85,247,.2)"}`, background: configDraft.font === f.value ? "rgba(168,85,247,.1)" : "transparent", color: s.text, cursor: "pointer", textAlign: "left", fontFamily: f.value, fontSize: 14 }}>
                    {f.label} — <span style={{ color: s.muted }}>Amostra de texto</span>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => saveConfig({ ...configDraft, deliveryFee: Number(configDraft.deliveryFee) })} style={btn()} disabled={saving}>
              {saving ? "Salvando..." : "💾 Salvar Aparência"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (view === "checkout") return (
    <div style={{ minHeight: "100vh", background: s.bg, color: s.text, fontFamily: font }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 120px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={() => setView("cart")} style={{ background: "rgba(168,85,247,.15)", border: "none", color: s.text, borderRadius: 10, padding: "8px 12px", cursor: "pointer", fontSize: 18 }}>←</button>
          <h2 style={{ fontSize: 20 }}>Finalizar Pedido</h2>
        </div>
        {!paid ? (
          <>
            {[["Nome completo *", "name", "text"], ["Endereço *", "address", "text"], ["Referência *", "ref", "text"]].map(([l, k, t]) => (
              <div key={k} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: s.muted, display: "block", marginBottom: 4 }}>{l}</label>
                <input type={t} value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} style={inp} />
              </div>
            ))}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: s.muted, display: "block", marginBottom: 4 }}>Tipo</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[["delivery", "🚚 Delivery"], ["pickup", "🏃 Retirada"]].map(([v, l]) => (
                  <button key={v} onClick={() => setForm(p => ({ ...p, type: v }))} style={{ flex: 1, padding: 10, borderRadius: 10, cursor: "pointer", border: `1.5px solid ${form.type === v ? s.secondary : "rgba(168,85,247,.2)"}`, background: form.type === v ? `${s.secondary}20` : "transparent", color: form.type === v ? s.secondary : s.muted, fontWeight: 600, fontSize: 13 }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: s.muted, display: "block", marginBottom: 4 }}>Pagamento</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[["pix", "💰 PIX"], ["card", "💳 Cartão"]].map(([v, l]) => (
                  <button key={v} onClick={() => setForm(p => ({ ...p, payment: v }))} style={{ flex: 1, padding: 10, borderRadius: 10, cursor: "pointer", border: `1.5px solid ${form.payment === v ? s.accent : "rgba(168,85,247,.2)"}`, background: form.payment === v ? `${s.accent}15` : "transparent", color: form.payment === v ? s.accent : s.muted, fontWeight: 600, fontSize: 13 }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, color: s.muted, display: "block", marginBottom: 4 }}>Observações</label>
              <textarea value={form.obs} onChange={e => setForm(p => ({ ...p, obs: e.target.value }))} rows={3} style={{ ...inp, resize: "vertical" }} />
            </div>
            <div style={{ background: s.card, borderRadius: 14, padding: 16, marginBottom: 20, border: `1px solid rgba(168,85,247,.15)` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: s.muted }}><span>Subtotal</span><span>{fmt(cartTotal)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: s.muted }}><span>Taxa entrega</span><span>{fmt(config.deliveryFee)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18, color: s.accent, borderTop: `1px solid rgba(168,85,247,.15)`, paddingTop: 12 }}><span>Total</span><span>{fmt(finalTotal)}</span></div>
            </div>
            <a href={form.payment === "pix" ? config.pixLink : config.cardLink} target="_blank" rel="noreferrer" onClick={() => setTimeout(() => setPaid(true), 1500)}
              style={{ display: "block", padding: 15, background: form.payment === "pix" ? "linear-gradient(135deg,#16A34A,#22C55E)" : "linear-gradient(135deg,#2563EB,#3B82F6)", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 16, textAlign: "center", textDecoration: "none", marginBottom: 12 }}>
              {form.payment === "pix" ? "💰 Pagar via PIX" : "💳 Pagar via Cartão"}
            </a>
            <p style={{ textAlign: "center", color: s.muted, fontSize: 13 }}>Pague primeiro para liberar o envio do pedido</p>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 22, marginBottom: 8 }}>Pagamento confirmado!</h3>
            <p style={{ color: s.muted, marginBottom: 24 }}>Agora envie seu pedido pelo WhatsApp</p>
            <a href={`https://wa.me/${config.whatsapp}?text=${buildMsg()}`} target="_blank" rel="noreferrer"
              style={{ display: "block", padding: 15, background: "linear-gradient(135deg,#16A34A,#22C55E)", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 16, textAlign: "center", textDecoration: "none" }}>
              📱 Enviar Pedido pelo WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );

  if (view === "cart") return (
    <div style={{ minHeight: "100vh", background: s.bg, color: s.text, fontFamily: font }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 120px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={() => setView("menu")} style={{ background: "rgba(168,85,247,.15)", border: "none", color: s.text, borderRadius: 10, padding: "8px 12px", cursor: "pointer", fontSize: 18 }}>←</button>
          <h2 style={{ fontSize: 20 }}>Meu Pedido</h2>
        </div>
        {cart.length === 0 ? <p style={{ color: s.muted, textAlign: "center", padding: "40px 0" }}>Carrinho vazio</p> :
          cart.map(item => (
            <div key={item.id} style={{ background: s.card, borderRadius: 12, padding: "12px 14px", marginBottom: 8, border: `1px solid rgba(168,85,247,.15)`, display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
                {item.addons.length > 0 && <div style={{ fontSize: 11, color: s.muted }}>+ {item.addons.map(a => a.name).join(", ")}</div>}
                <div style={{ color: s.accent, fontWeight: 700, marginTop: 4 }}>{fmt(item.price)}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => changeQty(item.id, -1)} style={{ width: 28, height: 28, borderRadius: 8, border: `1.5px solid rgba(168,85,247,.3)`, background: "transparent", color: s.text, cursor: "pointer" }}>−</button>
                <span style={{ fontWeight: 700 }}>{item.qty}</span>
                <button onClick={() => changeQty(item.id, 1)} style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${s.primary},${s.secondary})`, border: "none", color: "#fff", cursor: "pointer" }}>+</button>
              </div>
            </div>
          ))
        }
        {cart.length > 0 && (
          <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 448 }}>
            <button onClick={() => setView("checkout")} style={btn()}>Finalizar → {fmt(finalTotal)}</button>
          </div>
        )}
      </div>
    </div>
  );

  // CARDÁPIO PRINCIPAL
  return (
    <div style={{ minHeight: "100vh", background: s.bg, color: s.text, fontFamily: font, maxWidth: 480, margin: "0 auto", paddingBottom: 100 }}>
      {config.bannerActive && (
        <div style={{ background: `linear-gradient(135deg,${s.primary},${s.secondary})`, color: "#fff", padding: "10px 16px", textAlign: "center", fontSize: 13, fontWeight: 600 }}>{config.bannerText}</div>
      )}
      <div style={{ padding: "24px 20px 16px", textAlign: "center", borderBottom: `1px solid rgba(168,85,247,.15)` }}>
        {config.logoUrl ? (
          <img src={config.logoUrl} alt="logo" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", marginBottom: 10, border: `3px solid ${s.secondary}` }} />
        ) : (
          <div style={{ fontSize: 52, marginBottom: 4 }}>🫐</div>
        )}
        <h1 style={{ fontSize: 26, fontWeight: 700, background: `linear-gradient(135deg,${s.secondary},${s.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4 }}>{config.name}</h1>
        <p style={{ color: s.muted, fontSize: 13 }}>{config.tagline}</p>
        {config.showAddress && <p style={{ color: s.muted, fontSize: 12, marginTop: 4 }}>📍 {config.address}</p>}
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
          <a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noreferrer" style={{ color: "#25D366", fontSize: 13, textDecoration: "none" }}>💬 WhatsApp</a>
          {config.instagram && (
            <a href={`https://instagram.com/${config.instagram.replace("@", "")}`} target="_blank" rel="noreferrer" style={{ color: "#E1306C", fontSize: 13, textDecoration: "none" }}>📸 Instagram</a>
          )}
        </div>
      </div>

      <div style={{ padding: "10px 16px", background: s.bg, position: "sticky", top: 0, zIndex: 10, borderBottom: `1px solid rgba(168,85,247,.1)`, display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none" }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{ whiteSpace: "nowrap", padding: "7px 14px", borderRadius: 20, border: `2px solid ${cat === c ? s.secondary : "rgba(168,85,247,.2)"}`, background: cat === c ? `${s.secondary}22` : "transparent", color: cat === c ? s.secondary : s.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{CAT_NAMES[c]}</button>
        ))}
      </div>

      <div style={{ padding: "12px 16px", background: `${s.accent}18`, margin: "12px 16px", borderRadius: 10, fontSize: 13, color: s.accent, fontWeight: 600, border: `1px solid ${s.accent}44` }}>⏱️ {config.deliveryTime}</div>

      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {products.filter(p => p.cat === cat).map(p => (
          <div key={p.id} onClick={() => { setModal(p); setSelectedAddons([]); }} style={{ background: s.card, borderRadius: 14, padding: 14, cursor: "pointer", border: `1px solid rgba(168,85,247,.15)`, display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: 12, overflow: "hidden", background: `linear-gradient(135deg,${s.primary}44,${s.secondary}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>
              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} /> : "🫐"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
              <div style={{ color: s.muted, fontSize: 12, marginTop: 2 }}>{p.desc}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: s.accent }}>{fmt(p.price)}</span>
                <span style={{ background: `linear-gradient(135deg,${s.primary},${s.secondary})`, borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, color: "#fff" }}>+ Adicionar</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cartCount > 0 && (
        <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 448, zIndex: 99 }}>
          <button onClick={() => setView("cart")} style={{ ...btn(), display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ background: "rgba(255,255,255,.2)", borderRadius: 20, padding: "4px 10px", fontSize: 14 }}>{cartCount} {cartCount === 1 ? "item" : "itens"}</span>
            <span>🛒 Ver Carrinho</span>
            <span>{fmt(cartTotal)}</span>
          </button>
        </div>
      )}

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div style={{ background: s.card, borderRadius: "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              {modal.imageUrl ? (
                <img src={modal.imageUrl} alt={modal.name} style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 14, marginBottom: 12 }} onError={e => e.target.style.display = "none"} />
              ) : (
                <div style={{ fontSize: 56, marginBottom: 8 }}>🫐</div>
              )}
              <h2 style={{ fontSize: 22, fontWeight: 700, color: s.text }}>{modal.name}</h2>
              <p style={{ color: s.muted, fontSize: 13, marginTop: 4 }}>{modal.desc}</p>
            </div>
            {addons.length > 0 && (
              <>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: s.muted, marginBottom: 10, textTransform: "uppercase" }}>Adicionais</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {addons.map(a => {
                    const sel = selectedAddons.find(x => x.id === a.id);
                    return (
                      <div key={a.id} onClick={() => toggleAddon(a)} style={{ padding: "10px 14px", borderRadius: 10, cursor: "pointer", border: `1.5px solid ${sel ? s.secondary : "rgba(168,85,247,.2)"}`, background: sel ? "rgba(168,85,247,.1)" : "transparent", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 14 }}>{a.name}</span>
                        <span style={{ color: s.accent, fontWeight: 700, fontSize: 13 }}>+{fmt(a.price)}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            <button onClick={() => addToCart(modal)} style={btn()}>
              Adicionar · {fmt(modal.price + selectedAddons.reduce((s, a) => s + a.price, 0))}
            </button>
            <button onClick={() => setModal(null)} style={{ ...btn(), background: "transparent", border: `1px solid rgba(168,85,247,.2)`, color: s.muted, marginTop: 8 }}>Cancelar</button>
          </div>
        </div>
      )}

      <button onClick={() => setView(loggedIn ? "admin" : "login")} style={{ position: "fixed", bottom: 20, left: 20, zIndex: 100, background: "rgba(107,33,168,.8)", border: `1px solid rgba(168,85,247,.3)`, color: "#fff", borderRadius: 12, padding: "10px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>⚙️ Admin</button>
    </div>
  );
}