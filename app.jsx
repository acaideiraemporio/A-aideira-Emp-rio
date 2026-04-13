import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// INITIAL DATA STORE
// ============================================================
const DEFAULT_STORE = {
  auth: { user: "admin", password: "acai2024", loggedIn: false },
  config: {
    name: "Açaídeira Empório",
    tagline: "O melhor açaí da cidade 🍇",
    address: "Rua das Flores, 123 – Centro",
    showAddress: true,
    whatsapp: "5511999999999",
    instagram: "https://instagram.com/acaideiraemporio",
    deliveryTime: "30–45 min",
    pixLink: "https://nubank.com.br/cobrar/exemplo",
    cardLink: "https://link-cartao-exemplo.com",
    logo: null,
    banner: null,
    bannerText: "🎉 Promoção: Combo Família com 20% OFF hoje!",
    bannerActive: true,
    coupon: { code: "ACAI10", discount: 10, active: true },
    deliveryFee: 5.0,
    theme: {
      primary: "#6B21A8",
      secondary: "#A855F7",
      accent: "#F59E0B",
      bg: "#0F0A1A",
      card: "#1A1028",
      text: "#F3E8FF",
      textMuted: "#A78BCA",
      fontFamily: "'Playfair Display', serif",
      fontBody: "'DM Sans', sans-serif",
      fontSize: 16,
      borderRadius: 16,
    },
  },
  categories: [
    { id: "combos", name: "🔥 Combos", active: true },
    { id: "acai", name: "🫐 Açaí Tradicional", active: true },
    { id: "sorvetes", name: "🍦 Sorvetes", active: true },
    { id: "bebidas", name: "🥤 Bebidas", active: true },
    { id: "petiscos", name: "🍟 Petiscos", active: true },
  ],
  products: [
    { id: 1, category: "combos", name: "Combo Explosão", desc: "500ml de açaí + 2 adicionais + bebida", price: 32.9, badge: "🔥 Top", image: null, active: true },
    { id: 2, category: "combos", name: "Combo Família", desc: "2 litros de açaí + 6 adicionais", price: 79.9, badge: "👨‍👩‍👧 Família", image: null, active: true },
    { id: 3, category: "combos", name: "Combo Econômico", desc: "300ml de açaí + 1 adicional", price: 19.9, badge: "💰 Econômico", image: null, active: true },
    { id: 4, category: "acai", name: "Açaí 300ml", desc: "Açaí puro cremoso", price: 12.9, badge: null, image: null, active: true },
    { id: 5, category: "acai", name: "Açaí 500ml", desc: "O mais pedido da casa!", price: 18.9, badge: "⭐ Mais Vendido", image: null, active: true },
    { id: 6, category: "acai", name: "Açaí 1 Litro", desc: "Melhor custo-benefício", price: 29.9, badge: "✅ Custo-Benefício", image: null, active: true },
    { id: 7, category: "sorvetes", name: "Sorvete de Creme", desc: "Cremoso e delicioso", price: 8.9, badge: null, image: null, active: true },
    { id: 8, category: "sorvetes", name: "Sorvete de Chocolate", desc: "Puro cacau", price: 9.9, badge: null, image: null, active: true },
    { id: 9, category: "bebidas", name: "Suco de Laranja", desc: "Natural 300ml", price: 7.9, badge: null, image: null, active: true },
    { id: 10, category: "bebidas", name: "Refrigerante Lata", desc: "350ml gelado", price: 5.9, badge: null, image: null, active: true },
    { id: 11, category: "petiscos", name: "Batata Frita", desc: "Porção crocante 200g", price: 14.9, badge: null, image: null, active: true },
    { id: 12, category: "petiscos", name: "Nuggets", desc: "8 unidades crocantes", price: 12.9, badge: null, image: null, active: true },
  ],
  addons: [
    { id: 1, name: "Granola", price: 2.5, active: true },
    { id: 2, name: "Leite Condensado", price: 2.0, active: true },
    { id: 3, name: "Banana", price: 1.5, active: true },
    { id: 4, name: "Morango", price: 2.0, active: true },
    { id: 5, name: "Mel", price: 1.5, active: true },
    { id: 6, name: "Paçoca", price: 2.0, active: true },
    { id: 7, name: "Nutella", price: 4.0, active: true },
    { id: 8, name: "Coco Ralado", price: 1.5, active: true },
  ],
};

// ============================================================
// STORAGE HELPER
// ============================================================
function useStore() {
  const [store, setStore] = useState(() => {
    try {
      const saved = sessionStorage.getItem("acai_store");
      return saved ? { ...DEFAULT_STORE, ...JSON.parse(saved) } : DEFAULT_STORE;
    } catch { return DEFAULT_STORE; }
  });

  const update = useCallback((updater) => {
    setStore(prev => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      try { sessionStorage.setItem("acai_store", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  return [store, update];
}

// ============================================================
// ICONS
// ============================================================
const Icon = {
  cart: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  plus: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  minus: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash: () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  wa: () => <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  ig: () => <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
  edit: () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  lock: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  logout: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  check: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
  settings: () => <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
};

// ============================================================
// THEME PROVIDER
// ============================================================
function ThemeStyle({ theme }) {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&family=Bebas+Neue&family=Cormorant+Garamond:wght@400;600;700&display=swap');
      :root {
        --primary: ${theme.primary};
        --secondary: ${theme.secondary};
        --accent: ${theme.accent};
        --bg: ${theme.bg};
        --card: ${theme.card};
        --text: ${theme.text};
        --text-muted: ${theme.textMuted};
        --font-head: ${theme.fontFamily};
        --font-body: ${theme.fontBody};
        --font-size: ${theme.fontSize}px;
        --radius: ${theme.borderRadius}px;
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: var(--bg); color: var(--text); font-family: var(--font-body); font-size: var(--font-size); }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: var(--bg); }
      ::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 4px; }
      .pulse { animation: pulse 2s infinite; }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
      .slide-up { animation: slideUp .3s ease; }
      @keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
      .fade-in { animation: fadeIn .4s ease; }
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      .bounce { animation: bounce .4s ease; }
      @keyframes bounce { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
    `}</style>
  );
}

// ============================================================
// FORMATTERS
// ============================================================
const fmt = (n) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [store, update] = useStore();
  const [view, setView] = useState("menu"); // menu | cart | checkout | payment | admin | login
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderSent, setOrderSent] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeCategory, setActiveCategory] = useState("combos");

  const { config, products, addons, categories, auth } = store;
  const { theme } = config;

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 2500);
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const discount = couponApplied && config.coupon.active && couponInput.toUpperCase() === config.coupon.code
    ? (cartTotal * config.coupon.discount) / 100 : 0;
  const finalTotal = cartTotal - discount + (config.deliveryFee || 0);

  const addToCart = (product, selectedAddons = []) => {
    const addonTotal = selectedAddons.reduce((s, a) => s + a.price, 0);
    const item = {
      id: Date.now(),
      productId: product.id,
      name: product.name,
      price: product.price + addonTotal,
      addons: selectedAddons,
      qty: 1,
    };
    setCart(prev => [...prev, item]);
    notify(`${product.name} adicionado! 🛒`);
    setSelectedProduct(null);
  };

  const changeQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  if (view === "login") return <LoginScreen store={store} update={update} setView={setView} notify={notify} theme={theme} />;
  if (view === "admin" && auth.loggedIn) return <AdminPanel store={store} update={update} setView={setView} notify={notify} />;
  if (view === "admin" && !auth.loggedIn) { setView("login"); return null; }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-body)" }}>
      <ThemeStyle theme={theme} />

      {/* Notification */}
      {notification && (
        <div className="slide-up" style={{
          position: "fixed", top: 16, right: 16, zIndex: 9999,
          background: notification.type === "error" ? "#DC2626" : "#16A34A",
          color: "#fff", padding: "12px 20px", borderRadius: 12,
          fontSize: 14, fontWeight: 600, boxShadow: "0 8px 32px rgba(0,0,0,.4)",
          maxWidth: 300
        }}>{notification.msg}</div>
      )}

      {view === "menu" && (
        <MenuView
          store={store} cart={cart} cartCount={cartCount}
          setView={setView} setSelectedProduct={setSelectedProduct}
          activeCategory={activeCategory} setActiveCategory={setActiveCategory}
          notify={notify}
        />
      )}
      {view === "cart" && (
        <CartView
          cart={cart} config={config} cartTotal={cartTotal} finalTotal={finalTotal}
          discount={discount} couponInput={couponInput} setCouponInput={setCouponInput}
          couponApplied={couponApplied} setCouponApplied={setCouponApplied}
          changeQty={changeQty} setView={setView} notify={notify}
        />
      )}
      {view === "checkout" && (
        <CheckoutView
          cart={cart} config={config} finalTotal={finalTotal} discount={discount}
          setView={setView} notify={notify} setOrderSent={setOrderSent}
        />
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct} addons={addons.filter(a => a.active)}
          onClose={() => setSelectedProduct(null)} onAdd={addToCart}
        />
      )}

      {/* Admin FAB */}
      <button
        onClick={() => setView(auth.loggedIn ? "admin" : "login")}
        style={{
          position: "fixed", bottom: 20, left: 20, zIndex: 100,
          background: "rgba(107,33,168,.8)", border: "1px solid rgba(168,85,247,.3)",
          color: "#fff", borderRadius: 12, padding: "10px 14px",
          fontSize: 12, fontWeight: 600, cursor: "pointer",
          backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: 6
        }}
      >
        <Icon.settings /> Painel Admin
      </button>
    </div>
  );
}

// ============================================================
// MENU VIEW
// ============================================================
function MenuView({ store, cart, cartCount, setView, setSelectedProduct, activeCategory, setActiveCategory }) {
  const { config, products, categories } = store;
  const { theme } = config;
  const activeCats = categories.filter(c => c.active);
  const visibleProducts = products.filter(p => p.active && p.category === activeCategory);

  return (
    <div className="fade-in" style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 100 }}>
      {/* Banner */}
      {config.bannerActive && config.bannerText && (
        <div className="pulse" style={{
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
          color: "#fff", padding: "10px 16px", textAlign: "center",
          fontSize: 13, fontWeight: 600, letterSpacing: ".3px"
        }}>{config.bannerText}</div>
      )}

      {/* Header */}
      <div style={{
        background: `linear-gradient(180deg, ${theme.bg} 0%, ${theme.card} 100%)`,
        padding: "28px 20px 20px", textAlign: "center",
        borderBottom: `1px solid rgba(168,85,247,.15)`
      }}>
        {config.logo ? (
          <img src={config.logo} alt="Logo" style={{ height: 72, objectFit: "contain", marginBottom: 12 }} />
        ) : (
          <div style={{
            fontSize: 52, marginBottom: 4,
            filter: "drop-shadow(0 0 20px rgba(168,85,247,.6))"
          }}>🫐</div>
        )}
        <h1 style={{
          fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 700,
          background: `linear-gradient(135deg, ${theme.secondary}, ${theme.accent})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 4
        }}>{config.name}</h1>
        <p style={{ color: theme.textMuted, fontSize: 13 }}>{config.tagline}</p>
        {config.showAddress && (
          <p style={{ color: theme.textMuted, fontSize: 12, marginTop: 4 }}>📍 {config.address}</p>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 12 }}>
          {config.whatsapp && (
            <a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noreferrer"
              style={{ color: "#25D366", display: "flex", alignItems: "center", gap: 4, fontSize: 13, textDecoration: "none" }}>
              <Icon.wa /> WhatsApp
            </a>
          )}
          {config.instagram && (
            <a href={config.instagram} target="_blank" rel="noreferrer"
              style={{ color: theme.secondary, display: "flex", alignItems: "center", gap: 4, fontSize: 13, textDecoration: "none" }}>
              <Icon.ig /> Instagram
            </a>
          )}
        </div>
      </div>

      {/* Categories */}
      <div style={{
        display: "flex", gap: 8, padding: "14px 16px",
        overflowX: "auto", scrollbarWidth: "none", position: "sticky", top: 0,
        background: theme.bg, zIndex: 10,
        borderBottom: `1px solid rgba(168,85,247,.1)`
      }}>
        {activeCats.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            style={{
              whiteSpace: "nowrap", padding: "8px 16px", borderRadius: 24,
              border: activeCategory === cat.id ? `2px solid ${theme.secondary}` : "2px solid rgba(168,85,247,.2)",
              background: activeCategory === cat.id ? `${theme.secondary}22` : "transparent",
              color: activeCategory === cat.id ? theme.secondary : theme.textMuted,
              fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .2s"
            }}>{cat.name}</button>
        ))}
      </div>

      {/* Delivery time */}
      <div style={{
        margin: "12px 16px", padding: "10px 14px",
        background: `${theme.accent}18`, border: `1px solid ${theme.accent}44`,
        borderRadius: 10, fontSize: 13, color: theme.accent, fontWeight: 600
      }}>⏱️ Tempo de entrega: {config.deliveryTime}</div>

      {/* Products */}
      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {visibleProducts.length === 0 ? (
          <div style={{ textAlign: "center", color: theme.textMuted, padding: "40px 0", fontSize: 14 }}>
            Nenhum produto nesta categoria ainda
          </div>
        ) : visibleProducts.map(product => (
          <ProductCard key={product.id} product={product} theme={theme}
            onClick={() => setSelectedProduct(product)} />
        ))}
      </div>

      {/* Cart button */}
      {cartCount > 0 && (
        <div className="slide-up" style={{
          position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
          zIndex: 99, width: "calc(100% - 32px)", maxWidth: 448
        }}>
          <button onClick={() => setView("cart")} style={{
            width: "100%", padding: "16px 20px",
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            border: "none", borderRadius: 16, color: "#fff",
            fontSize: 16, fontWeight: 700, cursor: "pointer",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            boxShadow: `0 8px 32px ${theme.primary}66`
          }}>
            <span style={{
              background: "rgba(255,255,255,.2)", borderRadius: 20,
              padding: "4px 10px", fontSize: 14
            }}>{cartCount} {cartCount === 1 ? "item" : "itens"}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon.cart /> Ver Carrinho
            </span>
            <span>{fmt(cart.reduce((s, i) => s + i.price * i.qty, 0))}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PRODUCT CARD
// ============================================================
function ProductCard({ product, theme, onClick }) {
  return (
    <div onClick={onClick} className="slide-up" style={{
      background: theme.card, borderRadius: "var(--radius)",
      border: `1px solid rgba(168,85,247,.15)`, padding: 14,
      cursor: "pointer", transition: "all .2s",
      display: "flex", gap: 12, alignItems: "center",
      boxShadow: "0 2px 12px rgba(0,0,0,.2)"
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(168,85,247,.5)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(168,85,247,.15)"}
    >
      <div style={{
        width: 72, height: 72, borderRadius: 12, flexShrink: 0,
        background: product.image ? "transparent" : `linear-gradient(135deg, ${theme.primary}44, ${theme.secondary}44)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 32, overflow: "hidden"
      }}>
        {product.image ? (
          <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : "🫐"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: theme.text }}>{product.name}</span>
          {product.badge && (
            <span style={{
              fontSize: 10, padding: "2px 7px", borderRadius: 20,
              background: `${theme.accent}25`, color: theme.accent, fontWeight: 700
            }}>{product.badge}</span>
          )}
        </div>
        <p style={{ color: theme.textMuted, fontSize: 12, marginTop: 3, lineHeight: 1.4 }}>{product.desc}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <span style={{
            fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 700,
            color: theme.accent
          }}>{fmt(product.price)}</span>
          <div style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, color: "#fff"
          }}>+ Adicionar</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PRODUCT MODAL
// ============================================================
function ProductModal({ product, addons, onClose, onAdd }) {
  const [selected, setSelected] = useState([]);

  const toggle = (addon) => {
    setSelected(prev =>
      prev.find(a => a.id === addon.id) ? prev.filter(a => a.id !== addon.id) : [...prev, addon]
    );
  };

  const total = product.price + selected.reduce((s, a) => s + a.price, 0);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,.75)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "flex-end", justifyContent: "center"
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="slide-up" style={{
        background: "var(--card)", borderRadius: "20px 20px 0 0",
        padding: 24, width: "100%", maxWidth: 480,
        maxHeight: "80vh", overflowY: "auto"
      }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>
            {product.image ? (
              <img src={product.image} alt="" style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover" }} />
            ) : "🫐"}
          </div>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 700 }}>{product.name}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>{product.desc}</p>
        </div>

        {addons.length > 0 && (
          <>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".5px" }}>
              Adicionais
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {addons.map(addon => {
                const isSelected = selected.find(a => a.id === addon.id);
                return (
                  <div key={addon.id} onClick={() => toggle(addon)} style={{
                    padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                    border: `1.5px solid ${isSelected ? "var(--secondary)" : "rgba(168,85,247,.2)"}`,
                    background: isSelected ? "rgba(168,85,247,.1)" : "transparent",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    transition: "all .15s"
                  }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{addon.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: 13 }}>+{fmt(addon.price)}</span>
                      {isSelected && <span style={{ color: "var(--secondary)" }}><Icon.check /></span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <button onClick={() => onAdd(product, selected)} style={{
          width: "100%", padding: "15px",
          background: "linear-gradient(135deg, var(--primary), var(--secondary))",
          border: "none", borderRadius: 14, color: "#fff",
          fontSize: 16, fontWeight: 700, cursor: "pointer"
        }}>
          Adicionar ao Carrinho · {fmt(total)}
        </button>
        <button onClick={onClose} style={{
          width: "100%", padding: "12px", marginTop: 8,
          background: "transparent", border: "1px solid rgba(168,85,247,.2)",
          borderRadius: 14, color: "var(--text-muted)", fontSize: 14, cursor: "pointer"
        }}>Cancelar</button>
      </div>
    </div>
  );
}

// ============================================================
// CART VIEW
// ============================================================
function CartView({ cart, config, cartTotal, finalTotal, discount, couponInput, setCouponInput, couponApplied, setCouponApplied, changeQty, setView, notify }) {
  const { theme } = config;

  const applyCoupon = () => {
    if (couponInput.toUpperCase() === config.coupon.code && config.coupon.active) {
      setCouponApplied(true);
      notify(`Cupom aplicado! ${config.coupon.discount}% de desconto 🎉`);
    } else {
      notify("Cupom inválido ou expirado", "error");
    }
  };

  if (cart.length === 0) return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
      <ThemeStyle theme={theme} />
      <div style={{ fontSize: 60, marginBottom: 16 }}>🛒</div>
      <h2 style={{ fontFamily: "var(--font-head)", fontSize: 22, marginBottom: 8 }}>Carrinho vazio</h2>
      <p style={{ color: theme.textMuted, marginBottom: 24 }}>Adicione itens do cardápio para continuar</p>
      <button onClick={() => setView("menu")} style={{
        padding: "13px 28px", background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
        border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer"
      }}>Ver Cardápio</button>
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 120 }}>
      <ThemeStyle theme={theme} />
      <div style={{
        padding: "20px 16px 16px", display: "flex", alignItems: "center", gap: 12,
        borderBottom: `1px solid rgba(168,85,247,.15)`
      }}>
        <button onClick={() => setView("menu")} style={{
          background: "rgba(168,85,247,.15)", border: "none", color: theme.text,
          borderRadius: 10, padding: "8px 12px", cursor: "pointer", fontSize: 18
        }}>←</button>
        <h2 style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700 }}>Meu Pedido</h2>
      </div>

      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {cart.map(item => (
          <div key={item.id} style={{
            background: theme.card, borderRadius: 12, padding: "12px 14px",
            border: "1px solid rgba(168,85,247,.15)", display: "flex", gap: 12, alignItems: "center"
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
              {item.addons.length > 0 && (
                <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                  + {item.addons.map(a => a.name).join(", ")}
                </div>
              )}
              <div style={{ color: theme.accent, fontWeight: 700, fontSize: 15, marginTop: 4 }}>
                {fmt(item.price)}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => changeQty(item.id, -1)} style={{
                width: 28, height: 28, borderRadius: 8, border: "1.5px solid rgba(168,85,247,.3)",
                background: "transparent", color: theme.text, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}><Icon.minus /></button>
              <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
              <button onClick={() => changeQty(item.id, 1)} style={{
                width: 28, height: 28, borderRadius: 8,
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                border: "none", color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}><Icon.plus /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon */}
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={couponInput} onChange={e => setCouponInput(e.target.value)}
            placeholder="Cupom de desconto"
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 10,
              border: "1.5px solid rgba(168,85,247,.3)", background: "rgba(168,85,247,.08)",
              color: theme.text, fontSize: 14, outline: "none"
            }}
          />
          <button onClick={applyCoupon} style={{
            padding: "10px 16px", borderRadius: 10,
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            border: "none", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer"
          }}>Aplicar</button>
        </div>
      </div>

      {/* Summary */}
      <div style={{ margin: "0 16px", background: theme.card, borderRadius: 14, padding: 16, border: "1px solid rgba(168,85,247,.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: theme.textMuted }}>
          <span>Subtotal</span><span>{fmt(cartTotal)}</span>
        </div>
        {discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 14, color: "#16A34A" }}>
            <span>Desconto ({config.coupon.discount}%)</span><span>-{fmt(discount)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 14, color: theme.textMuted }}>
          <span>Taxa de entrega</span><span>{fmt(config.deliveryFee || 0)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18, color: theme.accent, borderTop: "1px solid rgba(168,85,247,.15)", paddingTop: 12 }}>
          <span>Total</span><span>{fmt(finalTotal)}</span>
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 448, zIndex: 99 }}>
        <button onClick={() => setView("checkout")} style={{
          width: "100%", padding: "16px",
          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
          border: "none", borderRadius: 16, color: "#fff",
          fontSize: 16, fontWeight: 700, cursor: "pointer",
          boxShadow: `0 8px 32px ${theme.primary}66`
        }}>Finalizar Pedido → {fmt(finalTotal)}</button>
      </div>
    </div>
  );
}

// ============================================================
// CHECKOUT VIEW
// ============================================================
function CheckoutView({ cart, config, finalTotal, discount, setView, notify, setOrderSent }) {
  const { theme } = config;
  const [form, setForm] = useState({ name: "", address: "", ref: "", payment: "pix", type: "delivery", obs: "" });
  const [paymentStep, setPaymentStep] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const valid = form.name && form.address && form.ref;

  const buildMessage = () => {
    const lines = [
      `🫐 *NOVO PEDIDO - ${config.name}*`,
      `━━━━━━━━━━━━━━━━━━`,
      `👤 *Cliente:* ${form.name}`,
      `📍 *Endereço:* ${form.address}`,
      `🏠 *Referência:* ${form.ref}`,
      `🚚 *Tipo:* ${form.type === "delivery" ? "Delivery" : "Retirada"}`,
      `💳 *Pagamento:* ${form.payment === "pix" ? "PIX" : "Cartão"}`,
      `━━━━━━━━━━━━━━━━━━`,
      `🛒 *Itens:*`,
      ...cart.map(i => `• ${i.qty}x ${i.name}${i.addons.length ? ` (+${i.addons.map(a => a.name).join(", ")})` : ""} — ${fmt(i.price * i.qty)}`),
      `━━━━━━━━━━━━━━━━━━`,
      discount > 0 ? `🎟️ Desconto: -${fmt(discount)}` : null,
      `💰 *Total: ${fmt(finalTotal)}*`,
      form.obs ? `📝 *Obs:* ${form.obs}` : null,
      `⏱️ Tempo estimado: ${config.deliveryTime}`,
    ].filter(Boolean).join("\n");
    return encodeURIComponent(lines);
  };

  const sendToWhatsApp = () => {
    window.open(`https://wa.me/${config.whatsapp}?text=${buildMessage()}`, "_blank");
    setOrderSent(true);
    notify("Pedido enviado com sucesso! 🎉");
  };

  if (paymentStep) return (
    <div className="fade-in" style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px" }}>
      <ThemeStyle theme={theme} />
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>💳</div>
        <h2 style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Realize o Pagamento</h2>
        <p style={{ color: theme.textMuted, fontSize: 14 }}>
          {form.payment === "pix" ? "Pague via PIX antes de enviar o pedido" : "Pague via cartão antes de enviar o pedido"}
        </p>
      </div>

      <div style={{
        background: theme.card, borderRadius: 16, padding: 20, marginBottom: 16,
        border: `1px solid ${theme.accent}44`, textAlign: "center"
      }}>
        <div style={{ fontSize: 32, fontFamily: "var(--font-head)", fontWeight: 700, color: theme.accent, marginBottom: 4 }}>
          {fmt(finalTotal)}
        </div>
        <div style={{ color: theme.textMuted, fontSize: 13 }}>Valor total do pedido</div>
      </div>

      <a
        href={form.payment === "pix" ? config.pixLink : config.cardLink}
        target="_blank" rel="noreferrer"
        onClick={() => setTimeout(() => setPaymentConfirmed(true), 2000)}
        style={{
          display: "block", padding: "15px",
          background: form.payment === "pix" ? "linear-gradient(135deg, #16A34A, #22C55E)" : "linear-gradient(135deg, #2563EB, #3B82F6)",
          borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 16,
          textAlign: "center", textDecoration: "none", marginBottom: 12
        }}
      >
        {form.payment === "pix" ? "💰 Pagar via PIX Agora" : "💳 Pagar via Cartão Agora"}
      </a>

      {paymentConfirmed ? (
        <button onClick={sendToWhatsApp} style={{
          width: "100%", padding: "15px",
          background: "linear-gradient(135deg, #16A34A, #22C55E)",
          border: "none", borderRadius: 14, color: "#fff",
          fontSize: 16, fontWeight: 700, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8
        }}>
          <Icon.wa /> Já paguei! Enviar Pedido pelo WhatsApp
        </button>
      ) : (
        <p style={{ textAlign: "center", color: theme.textMuted, fontSize: 13, marginTop: 8 }}>
          Após confirmar o pagamento, o botão para enviar ao WhatsApp será liberado
        </p>
      )}

      <button onClick={() => setPaymentStep(false)} style={{
        width: "100%", padding: "12px", marginTop: 10,
        background: "transparent", border: "1px solid rgba(168,85,247,.2)",
        borderRadius: 12, color: theme.textMuted, fontSize: 13, cursor: "pointer"
      }}>← Voltar</button>
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 120 }}>
      <ThemeStyle theme={theme} />
      <div style={{ padding: "20px 16px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(168,85,247,.15)" }}>
        <button onClick={() => setView("cart")} style={{ background: "rgba(168,85,247,.15)", border: "none", color: theme.text, borderRadius: 10, padding: "8px 12px", cursor: "pointer", fontSize: 18 }}>←</button>
        <h2 style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700 }}>Finalizar Pedido</h2>
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { label: "Nome completo *", key: "name", placeholder: "Seu nome", type: "text" },
          { label: "Endereço de entrega *", key: "address", placeholder: "Rua, número, bairro", type: "text" },
          { label: "Ponto de referência *", key: "ref", placeholder: "Ex: próximo à padaria", type: "text" },
        ].map(field => (
          <div key={field.key}>
            <label style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, display: "block", marginBottom: 5 }}>{field.label}</label>
            <input
              type={field.type} value={form[field.key]}
              onChange={e => f(field.key, e.target.value)}
              placeholder={field.placeholder}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10,
                border: "1.5px solid rgba(168,85,247,.3)", background: "rgba(168,85,247,.08)",
                color: theme.text, fontSize: 14, outline: "none"
              }}
            />
          </div>
        ))}

        {/* Type */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, display: "block", marginBottom: 5 }}>Tipo de pedido *</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[["delivery", "🚚 Delivery"], ["pickup", "🏃 Retirada"]].map(([val, label]) => (
              <button key={val} onClick={() => f("type", val)} style={{
                flex: 1, padding: "11px", borderRadius: 10, cursor: "pointer",
                border: `1.5px solid ${form.type === val ? theme.secondary : "rgba(168,85,247,.2)"}`,
                background: form.type === val ? `${theme.secondary}20` : "transparent",
                color: form.type === val ? theme.secondary : theme.textMuted,
                fontSize: 13, fontWeight: 600
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, display: "block", marginBottom: 5 }}>Forma de pagamento *</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[["pix", "💰 PIX"], ["card", "💳 Cartão"]].map(([val, label]) => (
              <button key={val} onClick={() => f("payment", val)} style={{
                flex: 1, padding: "11px", borderRadius: 10, cursor: "pointer",
                border: `1.5px solid ${form.payment === val ? theme.accent : "rgba(168,85,247,.2)"}`,
                background: form.payment === val ? `${theme.accent}15` : "transparent",
                color: form.payment === val ? theme.accent : theme.textMuted,
                fontSize: 13, fontWeight: 600
              }}>{label}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: theme.textMuted, display: "block", marginBottom: 5 }}>Observações</label>
          <textarea
            value={form.obs} onChange={e => f("obs", e.target.value)}
            placeholder="Alguma observação? (opcional)"
            rows={3}
            style={{
              width: "100%", padding: "12px 14px", borderRadius: 10,
              border: "1.5px solid rgba(168,85,247,.3)", background: "rgba(168,85,247,.08)",
              color: theme.text, fontSize: 14, outline: "none", resize: "vertical", fontFamily: "var(--font-body)"
            }}
          />
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", width: "calc(100% - 32px)", maxWidth: 448, zIndex: 99 }}>
        <button
          onClick={() => valid ? setPaymentStep(true) : notify("Preencha todos os campos obrigatórios", "error")}
          style={{
            width: "100%", padding: "16px",
            background: valid ? `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : "rgba(100,100,100,.3)",
            border: "none", borderRadius: 16, color: "#fff",
            fontSize: 16, fontWeight: 700, cursor: valid ? "pointer" : "not-allowed",
            boxShadow: valid ? `0 8px 32px ${theme.primary}66` : "none"
          }}
        >
          Ir para Pagamento → {fmt(finalTotal)}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// LOGIN SCREEN
// ============================================================
function LoginScreen({ store, update, setView, notify, theme }) {
  const [u, setU] = useState(""); const [p, setP] = useState("");
  const [err, setErr] = useState("");

  const login = () => {
    if (u === store.auth.user && p === store.auth.password) {
      update(prev => ({ ...prev, auth: { ...prev.auth, loggedIn: true } }));
      setView("admin");
    } else {
      setErr("Usuário ou senha incorretos");
      setTimeout(() => setErr(""), 3000);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(135deg, #0F0A1A 0%, #1A1028 100%)`, padding: 20
    }}>
      <ThemeStyle theme={theme} />
      <div className="slide-up" style={{
        background: "#1A1028", borderRadius: 20, padding: 32, width: "100%", maxWidth: 380,
        border: "1px solid rgba(168,85,247,.25)", boxShadow: "0 24px 64px rgba(0,0,0,.5)"
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔐</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#F3E8FF" }}>Painel Administrativo</h1>
          <p style={{ color: "#A78BCA", fontSize: 13, marginTop: 4 }}>Açaídeira Empório</p>
        </div>
        {err && <div style={{ background: "#DC262620", border: "1px solid #DC2626", borderRadius: 10, padding: "10px 14px", color: "#FCA5A5", fontSize: 13, marginBottom: 16 }}>{err}</div>}
        {[
          { label: "Usuário", val: u, set: setU, type: "text", ph: "admin" },
          { label: "Senha", val: p, set: setP, type: "password", ph: "••••••••" },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#A78BCA", display: "block", marginBottom: 5 }}>{f.label}</label>
            <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)}
              placeholder={f.ph}
              onKeyDown={e => e.key === "Enter" && login()}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10,
                border: "1.5px solid rgba(168,85,247,.3)", background: "rgba(168,85,247,.08)",
                color: "#F3E8FF", fontSize: 14, outline: "none"
              }} />
          </div>
        ))}
        <button onClick={login} style={{
          width: "100%", padding: "14px",
          background: "linear-gradient(135deg, #6B21A8, #A855F7)",
          border: "none", borderRadius: 12, color: "#fff",
          fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4,
          boxShadow: "0 8px 24px rgba(107,33,168,.4)"
        }}>Entrar</button>
        <button onClick={() => setView("menu")} style={{
          width: "100%", padding: "11px", marginTop: 10,
          background: "transparent", border: "1px solid rgba(168,85,247,.2)",
          borderRadius: 12, color: "#A78BCA", fontSize: 13, cursor: "pointer"
        }}>← Voltar ao Cardápio</button>
      </div>
    </div>
  );
}

// ============================================================
// ADMIN PANEL
// ============================================================
function AdminPanel({ store, update, setView, notify }) {
  const [tab, setTab] = useState("products");
  const [changingPw, setChangingPw] = useState(false);
  const [pwForm, setPwForm] = useState({ old: "", new1: "", new2: "" });

  const logout = () => {
    update(prev => ({ ...prev, auth: { ...prev.auth, loggedIn: false } }));
    setView("menu");
  };

  const changePw = () => {
    if (pwForm.old !== store.auth.password) return notify("Senha atual incorreta", "error");
    if (pwForm.new1 !== pwForm.new2) return notify("Senhas não conferem", "error");
    if (pwForm.new1.length < 6) return notify("Senha mínima de 6 caracteres", "error");
    update(prev => ({ ...prev, auth: { ...prev.auth, password: pwForm.new1 } }));
    notify("Senha alterada com sucesso! ✅");
    setChangingPw(false);
    setPwForm({ old: "", new1: "", new2: "" });
  };

  const tabs = [
    { id: "products", label: "Produtos" },
    { id: "addons", label: "Adicionais" },
    { id: "config", label: "Configurações" },
    { id: "design", label: "Design" },
    { id: "security", label: "Segurança" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0F0A1A", color: "#F3E8FF", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        input, select, textarea { color-scheme: dark; }
      `}</style>

      {/* Header */}
      <div style={{
        padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid rgba(168,85,247,.2)",
        background: "linear-gradient(135deg, #1A1028, #0F0A1A)"
      }}>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#F3E8FF" }}>⚙️ Painel Admin</div>
          <div style={{ fontSize: 12, color: "#A78BCA" }}>Açaídeira Empório</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setView("menu")} style={{
            padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(168,85,247,.3)",
            background: "transparent", color: "#A78BCA", fontSize: 13, cursor: "pointer"
          }}>Ver Site</button>
          <button onClick={logout} style={{
            padding: "8px 12px", borderRadius: 10,
            background: "rgba(220,38,38,.2)", border: "1px solid rgba(220,38,38,.3)",
            color: "#FCA5A5", fontSize: 13, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6
          }}><Icon.logout /> Sair</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", overflowX: "auto", borderBottom: "1px solid rgba(168,85,247,.15)", scrollbarWidth: "none" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "12px 18px", whiteSpace: "nowrap",
            background: "transparent", border: "none",
            borderBottom: `2px solid ${tab === t.id ? "#A855F7" : "transparent"}`,
            color: tab === t.id ? "#A855F7" : "#A78BCA",
            fontSize: 13, fontWeight: 600, cursor: "pointer"
          }}>{t.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: 16, maxWidth: 700, margin: "0 auto" }}>
        {tab === "products" && <AdminProducts store={store} update={update} notify={notify} />}
        {tab === "addons" && <AdminAddons store={store} update={update} notify={notify} />}
        {tab === "config" && <AdminConfig store={store} update={update} notify={notify} />}
        {tab === "design" && <AdminDesign store={store} update={update} notify={notify} />}
        {tab === "security" && (
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 16 }}>🔐 Segurança</h3>
            {!changingPw ? (
              <div style={{ background: "#1A1028", borderRadius: 14, padding: 20, border: "1px solid rgba(168,85,247,.2)" }}>
                <p style={{ color: "#A78BCA", marginBottom: 14, fontSize: 14 }}>Usuário atual: <strong style={{ color: "#F3E8FF" }}>{store.auth.user}</strong></p>
                <button onClick={() => setChangingPw(true)} style={{
                  padding: "10px 20px", background: "linear-gradient(135deg, #6B21A8, #A855F7)",
                  border: "none", borderRadius: 10, color: "#fff", fontWeight: 600, cursor: "pointer"
                }}>Alterar Senha</button>
              </div>
            ) : (
              <div style={{ background: "#1A1028", borderRadius: 14, padding: 20, border: "1px solid rgba(168,85,247,.2)", display: "flex", flexDirection: "column", gap: 12 }}>
                {[["Senha atual", "old", "password"], ["Nova senha", "new1", "password"], ["Confirmar nova senha", "new2", "password"]].map(([l, k, t]) => (
                  <div key={k}>
                    <label style={{ fontSize: 12, color: "#A78BCA", display: "block", marginBottom: 4 }}>{l}</label>
                    <input type={t} value={pwForm[k]} onChange={e => setPwForm(p => ({ ...p, [k]: e.target.value }))}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid rgba(168,85,247,.3)", background: "rgba(168,85,247,.08)", color: "#F3E8FF", fontSize: 14, outline: "none" }} />
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={changePw} style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg, #6B21A8, #A855F7)", border: "none", borderRadius: 10, color: "#fff", fontWeight: 600, cursor: "pointer" }}>Salvar</button>
                  <button onClick={() => setChangingPw(false)} style={{ flex: 1, padding: "11px", background: "transparent", border: "1px solid rgba(168,85,247,.2)", borderRadius: 10, color: "#A78BCA", cursor: "pointer" }}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ADMIN: PRODUCTS
// ============================================================
function AdminProducts({ store, update, notify }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const fileRef = useRef();

  const startEdit = (p) => { setEditing(p.id); setForm({ ...p }); };
  const startNew = () => {
    const newP = { id: Date.now(), category: "acai", name: "", desc: "", price: 0, badge: "", image: null, active: true };
    setEditing("new");
    setForm(newP);
  };

  const save = () => {
    if (!form.name || !form.price) return notify("Nome e preço são obrigatórios", "error");
    update(prev => ({
      ...prev,
      products: editing === "new"
        ? [...prev.products, { ...form, id: Date.now() }]
        : prev.products.map(p => p.id === editing ? form : p)
    }));
    notify("Produto salvo! ✅");
    setEditing(null);
  };

  const del = (id) => {
    update(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));
    notify("Produto removido");
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, image: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const F = ({ label, k, type = "text", options }) => (
    <div>
      <label style={{ fontSize: 12, color: "#A78BCA", display: "block", marginBottom: 4 }}>{label}</label>
      {options ? (
        <select value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
          style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid rgba(168,85,247,.3)", background: "#0F0A1A", color: "#F3E8FF", fontSize: 14, outline: "none" }}>
          {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      ) : (
        <input type={type} value={form[k] || ""} onChange={e => setForm(f => ({ ...f, [k]: type === "number" ? parseFloat(e.target.value) : e.target.value }))}
          style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid rgba(168,85,247,.3)", background: "rgba(168,85,247,.08)", color: "#F3E8FF", fontSize: 14, outline: "none" }} />
      )}
    </div>
  );

  return (