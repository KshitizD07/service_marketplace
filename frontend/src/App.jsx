import React, { useState, useMemo, useEffect } from "react";
import {
  Search, Star, MapPin, Calendar, Clock, CheckCircle2,
  Briefcase, LayoutDashboard, Menu, X, Settings, TrendingUp,
  Users, DollarSign, ShieldCheck, Bell, ArrowLeft, MessageSquare,
  CircleDot,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

/* ============================================================
   DESIGN TOKENS
   Warm linen surface, ink text, muted taupe for secondary text
   (recedes into the background rather than shouting), deep pine
   teal as the working accent, burnt clay as the secondary/status
   accent, ink-navy for structural dark surfaces.
   Fraunces (serif) carries identity/headlines. Plus Jakarta Sans
   carries everything you read and interact with.
   ============================================================ */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    .svc-app {
      --bg: #F5F2EA;
      --bg-dim: #EDE8DA;
      --surface: #FFFFFF;
      --ink: #1B1F1C;
      --muted: #8D8577;
      --muted-2: #A9A292;
      --line: #E1DACB;
      --line-strong: #CFC6B2;
      --accent: #1F6E5E;
      --accent-dark: #154E43;
      --accent-tint: #E4EEE9;
      --clay: #C1622F;
      --clay-tint: #F5E4D9;
      --navy: #12181B;
      --navy-2: #1C2429;
      --gold: #B8912B;
      --danger: #A6432B;
      --danger-tint: #F3E1DA;
      --radius-card: 16px;
      --radius-pill: 999px;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      color: var(--ink);
      background: var(--bg);
      min-height: 100vh;
    }
    .svc-app * { box-sizing: border-box; }
    .svc-serif { font-family: 'Fraunces', serif; }
    .svc-serif-italic { font-family: 'Fraunces', serif; font-style: italic; font-weight: 500; }

    .svc-muted { color: var(--muted); }

    .svc-btn {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      border: none;
      transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      white-space: nowrap;
    }
    .svc-btn-primary {
      background: var(--accent);
      color: #FBFAF6;
      border-radius: var(--radius-pill);
      padding: 0.75rem 1.5rem;
      box-shadow: 3px 3px 0 var(--ink);
    }
    .svc-btn-primary:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0 var(--ink); }
    .svc-btn-primary:active { transform: translate(0,0); box-shadow: 1px 1px 0 var(--ink); }
    .svc-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform:none; box-shadow: 3px 3px 0 var(--ink); }

    .svc-btn-secondary {
      background: transparent;
      color: var(--ink);
      border: 1.5px solid var(--ink);
      border-radius: 2px;
      padding: 0.7rem 1.4rem;
    }
    .svc-btn-secondary:hover { background: var(--ink); color: var(--bg); }

    .svc-btn-ghost {
      background: transparent;
      color: var(--muted);
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
    }
    .svc-btn-ghost:hover { color: var(--ink); background: var(--bg-dim); }

    .svc-btn-clay {
      background: var(--clay);
      color: #FBF6F1;
      border-radius: var(--radius-pill);
      padding: 0.65rem 1.3rem;
    }
    .svc-btn-clay:hover { background: #A8511F; }

    .svc-card {
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: var(--radius-card);
    }

    .svc-input {
      width: 100%;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 0.95rem;
      padding: 0.75rem 0.9rem;
      border: 1.5px solid var(--line-strong);
      border-radius: 10px;
      background: var(--surface);
      color: var(--ink);
      outline: none;
      transition: border-color 0.15s ease;
    }
    .svc-input:focus { border-color: var(--accent); }
    .svc-input::placeholder { color: var(--muted-2); }

    .svc-label {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--muted);
      display: block;
      margin-bottom: 0.4rem;
    }

    .svc-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.75rem;
      border-radius: var(--radius-pill);
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.01em;
    }
    .svc-pill-pending { background: var(--clay-tint); color: #8A481F; }
    .svc-pill-confirmed { background: var(--accent-tint); color: var(--accent-dark); }
    .svc-pill-progress { background: #EAE6F2; color: #4A3E73; }
    .svc-pill-completed { background: #E4EEE9; color: var(--accent-dark); }
    .svc-pill-cancelled { background: var(--danger-tint); color: var(--danger); }

    .svc-nav-link {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--muted);
      cursor: pointer;
      padding: 0.4rem 0;
      border-bottom: 2px solid transparent;
      transition: color 0.15s ease, border-color 0.15s ease;
    }
    .svc-nav-link:hover, .svc-nav-link.active { color: var(--ink); }
    .svc-nav-link.active { border-color: var(--clay); }

    .svc-sidebar-link {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      padding: 0.65rem 0.9rem;
      border-radius: 10px;
      font-size: 0.88rem;
      font-weight: 600;
      color: #B7BEBB;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .svc-sidebar-link:hover { background: rgba(255,255,255,0.06); color: #F2F0E8; }
    .svc-sidebar-link.active { background: var(--accent); color: #FBFAF6; }

    .svc-scrim {
      background:
        radial-gradient(circle at 15% 20%, rgba(31,110,94,0.10), transparent 40%),
        radial-gradient(circle at 85% 75%, rgba(193,98,47,0.10), transparent 42%);
    }

    .svc-star { color: var(--gold); }

    .svc-divider { height: 1px; background: var(--line); border: none; }

    .svc-avatar {
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Fraunces', serif;
      font-weight: 600;
      color: #FBFAF6;
      flex-shrink: 0;
    }

    .svc-fade-in { animation: svcFadeIn 0.35s ease both; }
    @keyframes svcFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

    .svc-step-line {
      position: absolute;
      left: 15px;
      top: 32px;
      bottom: -8px;
      width: 2px;
      background: var(--line-strong);
    }
  `}</style>
);

/* ============================================================
   MOCK DATA
   In a real build these arrays are replaced by REST calls
   (Express/Django) authenticated with a JWT, e.g.
   fetch('/api/providers', { headers: { Authorization: `Bearer ${token}` }})
   ============================================================ */
const CATEGORIES = [
  { id: "cleaning", name: "Home Cleaning", count: 48, blurb: "Deep cleans, move-outs, recurring visits" },
  { id: "electrical", name: "Electrical", count: 21, blurb: "Wiring, fixtures, inspections" },
  { id: "plumbing", name: "Plumbing", count: 33, blurb: "Leaks, installs, drain clearing" },
  { id: "landscaping", name: "Landscaping", count: 19, blurb: "Lawn care, design, seasonal upkeep" },
  { id: "tutoring", name: "Tutoring", count: 27, blurb: "K-12, test prep, languages" },
  { id: "it-support", name: "IT Support", count: 14, blurb: "Setup, troubleshooting, networks" },
];

const AVAILABILITY_TEMPLATE = ["9:00 AM", "10:30 AM", "1:00 PM", "2:30 PM", "4:00 PM"];


const REVIEWS = [
  { id: "r1", providerId: "p1", customer: "Sanket A.", rating: 5, date: "3 Sep 2026", comment: "Showed up on time and the flat looked brand new after. Booking again for next month." },
  { id: "r2", providerId: "p1", customer: "Priya M.", rating: 5, date: "28 Aug 2026", comment: "Careful with the furniture, brought their own supplies as promised." },
  { id: "r3", providerId: "p1", customer: "Farah K.", rating: 4, date: "19 Aug 2026", comment: "Good clean overall, arrived twenty minutes late but called ahead." },
  { id: "r4", providerId: "p2", customer: "Omkar J.", rating: 5, date: "1 Sep 2026", comment: "Found the fault in ten minutes that two other electricians missed." },
  { id: "r5", providerId: "p3", customer: "Neha S.", rating: 5, date: "30 Aug 2026", comment: "My son's grades went up within a month. Explains concepts patiently." },
];

const INITIAL_BOOKINGS = [
  { id: "b1", providerId: "p1", providerName: "Meera Kulkarni", customerName: "Sanket Abhang", service: "Standard Home Clean", date: "Mon 15 Sep", time: "10:30 AM", price: 799, status: "confirmed" },
  { id: "b2", providerId: "p2", providerName: "Rohan Deshmukh", customerName: "Sanket Abhang", service: "Diagnostic Visit", date: "Tue 16 Sep", time: "9:00 AM", price: 499, status: "pending" },
  { id: "b3", providerId: "p3", providerName: "Ayesha Sheikh", customerName: "Sanket Abhang", service: "1:1 Session (60 min)", date: "5 Sep", time: "4:00 PM", price: 600, status: "completed" },
  { id: "b4", providerId: "p1", providerName: "Meera Kulkarni", customerName: "Karan V.", service: "Deep Clean", date: "Tue 16 Sep", time: "11:00 AM", price: 1899, status: "in-progress" },
  { id: "b5", providerId: "p1", providerName: "Meera Kulkarni", customerName: "Ritu S.", service: "Move-out Clean", date: "8 Sep", time: "9:00 AM", price: 2499, status: "cancelled" },
];

const ADMIN_BOOKING_TREND = [
  { week: "Wk 1", bookings: 62 }, { week: "Wk 2", bookings: 74 }, { week: "Wk 3", bookings: 68 },
  { week: "Wk 4", bookings: 91 }, { week: "Wk 5", bookings: 103 }, { week: "Wk 6", bookings: 97 },
];
const ADMIN_CATEGORY_SPLIT = CATEGORIES.map(c => ({ name: c.name, providers: c.count }));

const STATUS_LABEL = {
  pending: "Requested", confirmed: "Confirmed", "in-progress": "In progress",
  completed: "Completed", cancelled: "Cancelled",
};
const STATUS_PILL_CLASS = {
  pending: "svc-pill-pending", confirmed: "svc-pill-confirmed", "in-progress": "svc-pill-progress",
  completed: "svc-pill-completed", cancelled: "svc-pill-cancelled",
};
const STATUS_FLOW = ["pending", "confirmed", "in-progress", "completed"];

/* ============================================================
   SMALL SHARED COMPONENTS
   ============================================================ */
function Initials({ name }) {
  return (name || "Provider")
    .split(" ")
    .map(p => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Avatar({ name, color = "#1F6E5E", size = 40 }) {
  return (
    <div className="svc-avatar" style={{ width: size, height: size, background: color, fontSize: size * 0.4 }}>
      <Initials name={name} />
    </div>
  );
}

function StarRating({ rating, size = 14, showNumber = true }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <Star className="svc-star" size={size} fill="currentColor" strokeWidth={0} />
      {showNumber && <span style={{ fontWeight: 700, fontSize: size * 0.85 }}>{Number(rating || 0).toFixed(1)}</span>}
    </span>
  );
}

function StatusPill({ status }) {
  return <span className={`svc-pill ${STATUS_PILL_CLASS[status]}`}>{STATUS_LABEL[status]}</span>;
}

function SectionHeading({ eyebrow, title, sub }) {
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      {eyebrow && <div className="svc-muted" style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>{eyebrow}</div>}
      <h2 className="svc-serif" style={{ fontSize: "1.9rem", fontWeight: 600, margin: 0 }}>{title}</h2>
      {sub && <p className="svc-muted" style={{ maxWidth: 480, marginTop: 8, lineHeight: 1.55 }}>{sub}</p>}
    </div>
  );
}

/* ============================================================
   NAV BAR
   ============================================================ */
function NavBar({ user, onNavigate, current, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = user
    ? user.role === "provider"
      ? [{ id: "browse", label: "Marketplace" }, { id: "providerDashboard", label: "My workspace" }]
      : user.role === "admin"
        ? [{ id: "browse", label: "Marketplace" }, { id: "adminDashboard", label: "Admin" }]
        : [{ id: "browse", label: "Marketplace" }, { id: "customerDashboard", label: "My bookings" }]
    : [{ id: "browse", label: "Marketplace" }];

  return (
    <header style={{ borderBottom: "1px solid var(--line)", background: "var(--bg)", position: "sticky", top: 0, zIndex: 30 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "1.1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
          <div onClick={() => onNavigate("browse")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircleDot size={16} color="#FBFAF6" />
            </div>
            <span className="svc-serif" style={{ fontSize: "1.3rem", fontWeight: 600 }}>Hearthwork</span>
          </div>
          <nav style={{ display: "flex", gap: "1.75rem" }} className="svc-nav-desktop">
            {links.map(l => (
              <span key={l.id} className={`svc-nav-link ${current === l.id ? "active" : ""}`} onClick={() => onNavigate(l.id)}>
                {l.label}
              </span>
            ))}
          </nav>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }} className="svc-nav-desktop">
          {user ? (
            <>
              <Bell size={18} className="svc-muted" style={{ cursor: "pointer" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={onLogout}>
                <Avatar name={user.name} size={32} color="var(--clay)" />
                <div style={{ lineHeight: 1.2 }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>{user.name.split(" ")[0]}</div>
                  <div className="svc-muted" style={{ fontSize: "0.72rem" }}>Sign out</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <button className="svc-btn svc-btn-ghost" onClick={() => onNavigate("login")}>Log in</button>
              <button className="svc-btn svc-btn-primary" onClick={() => onNavigate("register")}>Get started</button>
            </>
          )}
        </div>

        <div style={{ display: "none" }} className="svc-nav-mobile-toggle">
          <button className="svc-btn svc-btn-ghost" onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ============================================================
   AUTH — LOGIN / REGISTER (centered on the page)
   ============================================================ */
function AuthPage({ mode, onSubmit, onSwitch }) {
  const isLogin = mode === "login";
  const [role, setRole] = useState("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

const handleSubmit = (e) => {
  e.preventDefault();

  if (!email || !password || (!isLogin && !name)) {
    setError("Fill in every field to continue.");
    return;
  }

  setError("");

  onSubmit({
    name: name || email.split("@")[0],
    email,
    password,
    role,
    mode,
  });
};

  return (
    <div className="svc-scrim" style={{ minHeight: "calc(100vh - 73px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2.5rem 1.5rem" }}>
      <div className="svc-fade-in" style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        <div style={{ position: "absolute", top: 14, left: 14, width: "100%", height: "100%", border: "1.5px solid var(--line-strong)", borderRadius: "var(--radius-card)", zIndex: 0 }} />
        <div className="svc-card svc-fade-in" style={{ position: "relative", zIndex: 1, padding: "2.4rem 2.2rem" }}>
          <div style={{ textAlign: "center", marginBottom: "1.9rem" }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <CircleDot size={22} color="#FBFAF6" />
            </div>
            <h1 className="svc-serif" style={{ fontSize: "1.7rem", fontWeight: 600, margin: 0 }}>
              {isLogin ? "Welcome back" : "Join Hearthwork"}
            </h1>
            <p className="svc-muted" style={{ fontSize: "0.88rem", marginTop: 6 }}>
              {isLogin ? "Sign in to manage your bookings" : "Book trusted help, or offer your services"}
            </p>
          </div>

          {!isLogin && (
            <div style={{ display: "flex", gap: 8, marginBottom: "1.3rem", background: "var(--bg-dim)", padding: 4, borderRadius: 10 }}>
              {["customer", "provider"].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className="svc-btn"
                  style={{
                    flex: 1, padding: "0.55rem", borderRadius: 8,
                    background: role === r ? "var(--surface)" : "transparent",
                    color: role === r ? "var(--ink)" : "var(--muted)",
                    boxShadow: role === r ? "0 1px 0 var(--line-strong)" : "none",
                  }}
                >
                  {r === "customer" ? "I need a service" : "I offer a service"}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div style={{ marginBottom: "1rem" }}>
                <label className="svc-label">Full name</label>
                <input className="svc-input" value={name} onChange={e => setName(e.target.value)} placeholder="Sanket Abhang" />
              </div>
            )}
            <div style={{ marginBottom: "1rem" }}>
              <label className="svc-label">Email</label>
              <input className="svc-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div style={{ marginBottom: "0.4rem" }}>
              <label className="svc-label">Password</label>
              <input className="svc-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {isLogin && (
              <div style={{ textAlign: "right", marginBottom: "1.2rem" }}>
                <span className="svc-muted" style={{ fontSize: "0.78rem", cursor: "pointer" }}>Forgot password?</span>
              </div>
            )}
            {error && <p style={{ color: "var(--danger)", fontSize: "0.82rem", marginTop: "0.6rem" }}>{error}</p>}
            <button type="submit" className="svc-btn svc-btn-primary" style={{ width: "100%", marginTop: "1.4rem", padding: "0.85rem" }}>
              {isLogin ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="svc-muted" style={{ textAlign: "center", fontSize: "0.85rem", marginTop: "1.6rem" }}>
            {isLogin ? "New to Hearthwork? " : "Already have an account? "}
            <span style={{ color: "var(--accent-dark)", fontWeight: 700, cursor: "pointer" }} onClick={() => onSwitch(isLogin ? "register" : "login")}>
              {isLogin ? "Create one" : "Sign in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   BROWSE / LANDING
   ============================================================ */
function BrowsePage({ onSelectProvider, onNavigate, user, categories }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [providers, setProviders] = useState([]);

useEffect(() => {
  fetch("http://localhost:5000/api/providers")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        setProviders(data.providers);
        console.log("PROVIDER COUNT:", data.providers.length);
      }
    })
    .catch((error) => {
      console.error("Error loading providers:", error);
    }); }, []);

  const filtered = useMemo(() => {
    console.log("FILTER INPUT:", providers);
  return providers.filter((p) => {
    const providerName = p.provider_name || "";
    const categoryName = p.category_name || "";

    const matchesQuery =
      !query ||
      providerName.toLowerCase().includes(query.toLowerCase()) ||
      categoryName.toLowerCase().includes(query.toLowerCase());

    const matchesCategory =
  !activeCategory ||
  categoryName === categories.find(c => c.id === activeCategory)?.name;

    return matchesQuery && matchesCategory;
  });
}, [providers, query, activeCategory, categories]);

  return (
    <div>
      {/* Hero — asymmetric: one large statement + two supporting stats */}
      <section className="svc-scrim" style={{ borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "3.5rem 1.5rem", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "2.5rem", alignItems: "center" }}>
          <div>
            <div className="svc-muted" style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: 10 }}>Home & professional services</div>
            <h1 className="svc-serif" style={{ fontSize: "clamp(2.2rem, 4vw, 3.1rem)", fontWeight: 600, lineHeight: 1.12, margin: 0, maxWidth: 560 }}>
              Find someone who'll actually show up on time.
            </h1>
            <p className="svc-muted" style={{ fontSize: "1.02rem", marginTop: "1.1rem", maxWidth: 460, lineHeight: 1.6 }}>
              Vetted cleaners, electricians, tutors and more — book a time slot directly from their calendar and pay once the job's done.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: "1.8rem", maxWidth: 480 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <Search size={17} className="svc-muted" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  className="svc-input"
                  style={{ paddingLeft: 40 }}
                  placeholder="Try “electrician” or a name…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
              <button className="svc-btn svc-btn-primary">Search</button>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="svc-card" style={{ padding: "1.3rem" }}>
              <div className="svc-serif" style={{ fontSize: "1.9rem", fontWeight: 600 }}>4.8<span className="svc-muted" style={{ fontSize: "1rem" }}> / 5</span></div>
              <div className="svc-muted" style={{ fontSize: "0.82rem", marginTop: 4 }}>Average rating across 1,240 completed bookings</div>
            </div>
            <div className="svc-card" style={{ padding: "1.3rem" }}>
              <div className="svc-serif" style={{ fontSize: "1.9rem", fontWeight: 600 }}>162</div>
              <div className="svc-muted" style={{ fontSize: "0.82rem", marginTop: 4 }}>Verified providers currently taking bookings</div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <SectionHeading eyebrow="Browse by category" title="What do you need help with?" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "0.9rem", marginBottom: "3rem" }}>
          {categories.map(c => (
            <div
              key={c.id}
              onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
              className="svc-card"
              style={{
                padding: "1.1rem", cursor: "pointer",
                borderColor: activeCategory === c.id ? "var(--accent)" : "var(--line)",
                background: activeCategory === c.id ? "var(--accent-tint)" : "var(--surface)",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{c.name}</div>
              <div
                  className="svc-muted"
                  style={{ fontSize: "0.78rem", marginTop: 4 }}
                >
                  {c.description}
                </div>
            </div>
          ))}
        </div>

        <SectionHeading eyebrow="Featured this week" title="Providers near you" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.1rem" }}>
          {filtered.map(p => (
  <div
    key={p.id}
    className="svc-card svc-fade-in"
    style={{ padding: "1.4rem", cursor: "pointer" }}
    onClick={() => {
  onSelectProvider(p.id);
}}
  >
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <Avatar
        name={p.provider_name}
        size={48}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: "1rem" }}>
          {p.provider_name}
        </div>

        <div
          className="svc-muted"
          style={{ fontSize: "0.8rem", textTransform: "capitalize" }}
        >
          {p.category_name}
        </div>
      </div>

      <StarRating rating={Number(p.rating) || 0} />
    </div>

    <p
      className="svc-muted"
      style={{
        fontSize: "0.85rem",
        marginTop: "0.9rem",
        lineHeight: 1.5,
        minHeight: 42
      }}
    >
      {(p.description || "").slice(0, 90)}
      {p.description && p.description.length > 90 ? "…" : ""}
    </p>

    <hr className="svc-divider" style={{ margin: "1rem 0" }} />

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "0.82rem"
      }}
    >
      <span
        className="svc-muted"
        style={{ display: "flex", alignItems: "center", gap: 4 }}
      >
        <MapPin size={13} /> {p.location}
      </span>

      <span style={{ fontWeight: 700 }}>
        From ₹{p.hourly_rate}
      </span>
    </div>
  </div>
))}
        </div>
      </div>
    </div>
  );
}
/* ============================================================
   PROVIDER PROFILE
   ============================================================ */
function ProviderProfilePage({ provider, onBack, onBook }) {
  console.log("PROVIDER PROFILE DATA:", provider);
  const providerReviews = REVIEWS.filter(
    r => r.providerId === provider.id
  );

  const providerName =
    provider.provider_name ||
    provider.business_name ||
    "Provider";

  const providerDescription =
    provider.description ||
    "Professional service provider.";

  const totalReviews =
    provider.total_reviews ??
    provider.reviewCount ??
    providerReviews.length;

  const rating =
    Number(provider.rating) || 0;

  return (
    <div
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "2rem 1.5rem 4rem"
      }}
    >

      <button
        className="svc-btn svc-btn-ghost"
        onClick={onBack}
        style={{
          marginBottom: "1.2rem",
          padding: "0.4rem 0"
        }}
      >
        <ArrowLeft size={16} /> Back to marketplace
      </button>


      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.7fr 1fr",
          gap: "2.2rem"
        }}
      >

        {/* =========================
            LEFT SIDE
        ========================= */}

        <div>

          {/* Provider Header */}

          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center"
            }}
          >

            <Avatar
              name={providerName}
              color={provider.color}
              size={68}
            />

            <div>

              <h1
                className="svc-serif"
                style={{
                  fontSize: "1.9rem",
                  fontWeight: 600,
                  margin: 0
                }}
              >
                {providerName}
              </h1>


              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginTop: 6
                }}
              >

                {/* Rating */}

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
  <StarRating rating={5} />
  <span style={{ fontWeight: 700 }}>5 / 5</span>
</div>


                {/* Review Count */}

                <span
                  className="svc-muted"
                  style={{
                    fontSize: "0.85rem"
                  }}
                >
                  {totalReviews} reviews
                </span>


                {/* Location */}

                <span
                  className="svc-muted"
                  style={{
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  <MapPin size={13} />
                  {provider.location || "Location not available"}
                </span>

              </div>

            </div>

          </div>


          {/* Provider Description */}

          <p
            style={{
              marginTop: "1.6rem",
              lineHeight: 1.7,
              fontSize: "0.97rem"
            }}
          >
            {providerDescription}
          </p>


          {/* =========================
              SERVICES
          ========================= */}

          <div style={{ marginTop: "2.2rem" }}>

            <h3
              className="svc-serif"
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                marginBottom: "0.9rem"
              }}
            >
              Services
            </h3>


            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8
              }}
            >

              {(provider.services || []).map(s => (

                <div
                  key={s.id}
                  className="svc-card"
                  style={{
                    padding: "1rem 1.2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >

                  <div>

                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.92rem"
                      }}
                    >
                      {s.name}
                    </div>


                    <div
                      className="svc-muted"
                      style={{
                        fontSize: "0.78rem",
                        marginTop: 2
                      }}
                    >
                      {s.duration} minutes
                    </div>

                  </div>


                  <div
                    style={{
                      fontWeight: 700
                    }}
                  >
                    ₹{s.price}
                  </div>

                </div>

              ))}

            </div>

          </div>


          {/* =========================
              REVIEWS
          ========================= */}

          <div
            style={{
              marginTop: "2.4rem"
            }}
          >

            <h3
              className="svc-serif"
              style={{
                fontSize: "1.25rem",
                fontWeight: 600,
                marginBottom: "0.9rem"
              }}
            >
              Reviews

              <span
                className="svc-muted"
                style={{
                  fontFamily:
                    "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 500,
                  fontSize: "0.85rem",
                  marginLeft: 5
                }}
              >
                ({totalReviews})
              </span>

            </h3>


            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.1rem"
              }}
            >

              {providerReviews.length > 0 ? (

                providerReviews.map(r => (

                  <div
                    key={r.id}
                    style={{
                      borderBottom:
                        "1px solid var(--line)",
                      paddingBottom: "1.1rem"
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center"
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8
                        }}
                      >

                        <Avatar
                          name={r.customer}
                          size={30}
                          color="var(--navy-2)"
                        />

                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "0.88rem"
                          }}
                        >
                          {r.customer}
                        </span>

                      </div>


                      <span
                        className="svc-muted"
                        style={{
                          fontSize: "0.76rem"
                        }}
                      >
                        {r.date}
                      </span>

                    </div>


                    <div
                      style={{
                        margin: "0.4rem 0"
                      }}
                    >
                      <StarRating
                        rating={r.rating}
                        showNumber={false}
                        size={13}
                      />
                    </div>


                    <p
                      style={{
                        fontSize: "0.88rem",
                        lineHeight: 1.55,
                        margin: 0
                      }}
                    >
                      {r.comment}
                    </p>

                  </div>

                ))

              ) : (

                <p
                  className="svc-muted"
                  style={{
                    fontSize: "0.88rem"
                  }}
                >
                  No reviews yet.
                </p>

              )}

            </div>

          </div>

        </div>


        {/* =========================
            BOOKING SIDE PANEL
        ========================= */}

        <div>

          <div
            className="svc-card"
            style={{
              padding: "1.4rem",
              position: "sticky",
              top: 90
            }}
          >

            <div
              className="svc-muted"
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                marginBottom: 10
              }}
            >
              Book this provider
            </div>


            <p
              style={{
                fontSize: "0.88rem",
                lineHeight: 1.5,
                marginBottom: "1.1rem"
              }}
            >
              Pick a service and Hearthwork will show
              real-time openings from{" "}
              {providerName.split(" ")[0]}'s calendar.
            </p>


            <button
              className="svc-btn svc-btn-primary"
              style={{
                width: "100%"
              }}
              onClick={onBook}
            >
              Check availability
            </button>


            <div
              className="svc-muted"
              style={{
                fontSize: "0.76rem",
                marginTop: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
            >
              <ShieldCheck size={14} />
              Identity-verified provider
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
/* ============================================================
   BOOKING FLOW — service, then date/time from availability
   ============================================================ */
function BookingFlowPage({ provider, onBack, onConfirm }) {
  const [service, setService] = useState(null);
  const [day, setDay] = useState(null);
  const [time, setTime] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Convert database availability into usable day/time data
  const availability = provider.availability || {};

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

const getTimeSlots = (dayName) => {
  const value = availability[dayName];

  if (!value) return [];

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return [value];
  }

  if (value.start_time) {
    return [value.start_time];
  }

  return [];
};

  // Create next 14 available dates
  const days = [];

  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    const dayName = dayNames[date.getDay()];

    if (getTimeSlots(dayName).length > 0) {
      days.push({
        label: date.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short"
        }),
        date: date.toISOString().split("T")[0],
        dayName
      });
    }
  }

  if (confirmed) {
    return (
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "5rem 1.5rem",
          textAlign: "center"
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--accent-tint)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.3rem"
          }}
        >
          <CheckCircle2 size={28} color="var(--accent-dark)" />
        </div>

        <h2
          className="svc-serif"
          style={{ fontSize: "1.7rem", fontWeight: 600 }}
        >
          Booking requested
        </h2>

        <p
          className="svc-muted"
          style={{ marginTop: 8, lineHeight: 1.6 }}
        >
          {provider.provider_name ||
            provider.business_name ||
            "Provider"}{" "}
          will confirm your {service.name.toLowerCase()} on{" "}
          {day?.label} at {time}. You'll get a notification when
          it's accepted.
        </p>

        <button
          className="svc-btn svc-btn-primary"
          style={{ marginTop: "1.8rem" }}
          onClick={() => {
            window.location.reload();
          }}
        >
          Go to my bookings
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "2rem 1.5rem 4rem"
      }}
    >
      <button
        className="svc-btn svc-btn-ghost"
        onClick={onBack}
        style={{
          marginBottom: "1rem",
          padding: "0.4rem 0"
        }}
      >
        <ArrowLeft size={16} /> Back to profile
      </button>

      <SectionHeading
        eyebrow={`Booking with ${
          provider.provider_name ||
          provider.business_name ||
          "Provider"
        }`}
        title="Choose a service and time"
      />

      {/* SERVICE */}
      <div style={{ marginBottom: "2rem" }}>
        <div
          className="svc-label"
          style={{ marginBottom: "0.7rem" }}
        >
          1. Select a service
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8
          }}
        >
          {(provider.services || []).map((s) => (
            <div
              key={s.id}
              onClick={() => setService(s)}
              className="svc-card"
              style={{
                padding: "1rem 1.2rem",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                borderColor:
                  service?.id === s.id
                    ? "var(--accent)"
                    : "var(--line)",
                background:
                  service?.id === s.id
                    ? "var(--accent-tint)"
                    : "var(--surface)"
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "0.92rem"
                  }}
                >
                  {s.name}
                </div>

                <div
                  className="svc-muted"
                  style={{ fontSize: "0.78rem" }}
                >
                  {s.duration}
                </div>
              </div>

              <div style={{ fontWeight: 700 }}>
                ₹{s.price}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DAY */}
      <div style={{ marginBottom: "2rem" }}>
        <div
          className="svc-label"
          style={{ marginBottom: "0.7rem" }}
        >
          2. Pick a day
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap"
          }}
        >
          {days.length === 0 ? (
            <p className="svc-muted">
              No available days for this provider.
            </p>
          ) : (
            days.map((d) => (
              <button
                key={d.date}
                onClick={() => {
  setDay(d);
  setTime(null);
}}
                className="svc-btn"
                style={{
                  padding: "0.6rem 1.1rem",
                  borderRadius: 10,
                  border: `1.5px solid ${
                    day?.date === d.date
                      ? "var(--accent)"
                      : "var(--line-strong)"
                  }`,
                  background:
                    day?.date === d.date
                      ? "var(--accent)"
                      : "var(--surface)",
                  color:
                    day?.date === d.date
                      ? "#FBFAF6"
                      : "var(--ink)"
                }}
              >
                <Calendar size={14} /> {d.label}
              </button>
            ))
          )}
        </div>
      </div>

      {/* TIME */}
      {day && (
        <div style={{ marginBottom: "2.2rem" }}>
          <div
            className="svc-label"
            style={{ marginBottom: "0.7rem" }}
          >
            3. Pick a time
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap"
            }}
          >
            {getTimeSlots(day.dayName).map((t) => (
              <button
                key={t}
                onClick={() => setTime(t)}
                className="svc-btn"
                style={{
                  padding: "0.55rem 1rem",
                  borderRadius: 10,
                  border: `1.5px solid ${
                    time === t
                      ? "var(--accent)"
                      : "var(--line-strong)"
                  }`,
                  background:
                    time === t
                      ? "var(--accent)"
                      : "var(--surface)",
                  color:
                    time === t
                      ? "#FBFAF6"
                      : "var(--ink)"
                }}
              >
                <Clock size={14} /> {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* REQUEST */}
     <button
  className="svc-btn svc-btn-primary"
  disabled={false}
  style={{
    width: "100%",
    padding: "0.9rem",
    cursor: "pointer"
  }}
  onClick={() => {
    console.log("SERVICE:", service);
    console.log("DAY:", day);
    console.log("TIME:", time);

    onConfirm({
      provider,
      service,
      day: day?.date || day,
      time
    });

    setConfirmed(true);
  }}
  
> 
  Request booking {service ? `· ₹${service.price}` : ""}
</button>
    </div>
  );
}

/* ============================================================
   CUSTOMER DASHBOARD — bookings with status workflow
   ============================================================ */
function CustomerDashboard({ bookings, onCancel, onReview, user }) {
  console.log("CUSTOMER BOOKINGS:", bookings);
  const myBookings = bookings.filter(
  b => b.customerId === user?.id
);
  const [reviewTarget, setReviewTarget] = useState(null);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2.2rem 1.5rem 4rem" }}>
      <SectionHeading eyebrow="Your account" title="My bookings" sub="Track each request from confirmation through completion." />
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {myBookings.map(b => (
          <div key={b.id} className="svc-card" style={{ padding: "1.3rem 1.4rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <Avatar name={b.providerName} size={44} color="var(--navy-2)" />
                <div>
                  <div style={{ fontWeight: 700 }}>{b.service}</div>
                  <div className="svc-muted" style={{ fontSize: "0.83rem", marginTop: 2 }}>with {b.providerName}</div>
                  <div className="svc-muted" style={{ fontSize: "0.8rem", marginTop: 4, display: "flex", gap: 12 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
  📅 {b.date}
</span>

<span style={{ display: "flex", alignItems: "center", gap: 4 }}>
  🕐 {b.time}
</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <StatusPill status={b.status} />
                <div style={{ fontWeight: 700, marginTop: 8 }}>₹{b.price}</div>
              </div>
            </div>

            {/* status stepper */}
            {b.status !== "cancelled" && (
              <div style={{ display: "flex", gap: 0, marginTop: "1.1rem" }}>
                {STATUS_FLOW.map((s, i) => {
                  const reached = STATUS_FLOW.indexOf(b.status) >= i;
                  return (
                    <div key={s} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{
                        height: 4, borderRadius: 2, background: reached ? "var(--accent)" : "var(--line)",
                        marginBottom: 6,
                      }} />
                      <span style={{ fontSize: "0.7rem", color: reached ? "var(--accent-dark)" : "var(--muted-2)", fontWeight: 600 }}>
                        {STATUS_LABEL[s]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: "1rem" }}>
              {b.status === "pending" && (
                <button className="svc-btn svc-btn-secondary" style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }} onClick={() => onCancel(b.id)}>
                  Cancel request
                </button>
              )}
              {b.status === "completed" && (
                <button className="svc-btn svc-btn-clay" style={{ fontSize: "0.8rem", padding: "0.5rem 1rem" }} onClick={() => setReviewTarget(b)}>
                  <MessageSquare size={14} /> Leave a review
                </button>
              )}
            </div>

            {reviewTarget?.id === b.id && (
              <ReviewComposer
                onCancel={() => setReviewTarget(null)}
                onSubmit={(rating, comment) => { onReview(b, rating, comment); setReviewTarget(null); }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewComposer({ onSubmit, onCancel }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  return (
    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--line)" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <Star
            key={n}
            size={22}
            className="svc-star"
            fill={n <= rating ? "currentColor" : "none"}
            strokeWidth={1.5}
            style={{ cursor: "pointer" }}
            onClick={() => setRating(n)}
          />
        ))}
      </div>
      <textarea
        className="svc-input"
        rows={3}
        placeholder="How did it go?"
        value={comment}
        onChange={e => setComment(e.target.value)}
        style={{ resize: "vertical" }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button className="svc-btn svc-btn-primary" style={{ fontSize: "0.82rem" }} onClick={() => onSubmit(rating, comment)}>Submit review</button>
        <button className="svc-btn svc-btn-ghost" style={{ fontSize: "0.82rem" }} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

/* ============================================================
   PROVIDER DASHBOARD — incoming bookings + availability
   ============================================================ */
function ProviderDashboard({ bookings, onUpdateStatus, user, providers }) {
  const [providerRating, setProviderRating] = useState(0);
  const [tab, setTab] = useState("bookings");
  useEffect(() => {
  fetch("http://localhost:5000/api/providers")
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const myProvider = data.providers.find(
          p => p.user_id === user?.id
        );

        if (myProvider) {
          setProviderRating(Number(myProvider.rating) || 0);
        }
      }
    })
    .catch(error => {
      console.error("Error loading provider rating:", error);
    });
}, [user]);
  console.log("ALL PROVIDERS:", providers);
  const myProvider = providers?.find(
  p => p.user_id === user?.id
);
console.log("PROVIDER USER:", user?.id);
console.log("MY PROVIDER:", myProvider);
console.log("ALL BOOKINGS:", bookings);

const myBookings = bookings.filter(
  b => b.providerId === myProvider?.id
);
  const earnings = myBookings
  .filter(b => b.status === "completed")
  .reduce((sum, b) => sum + Number(b.price), 0);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2.2rem 1.5rem 4rem" }}>
      <SectionHeading
  eyebrow="Provider workspace"
  title="Provider dashboard"
  sub="Manage incoming requests and keep your open slots current." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        <div className="svc-card" style={{ padding: "1.2rem" }}>
          <div className="svc-muted" style={{ fontSize: "0.78rem", fontWeight: 600 }}>This week</div>
          <div className="svc-serif" style={{ fontSize: "1.7rem", fontWeight: 600, marginTop: 4 }}>{myBookings.length} bookings</div>
        </div>
        <div className="svc-card" style={{ padding: "1.2rem" }}>
          <div className="svc-muted" style={{ fontSize: "0.78rem", fontWeight: 600 }}>Completed earnings</div>
          <div className="svc-serif" style={{ fontSize: "1.7rem", fontWeight: 600, marginTop: 4 }}>₹{earnings.toLocaleString()}</div>
        </div>
       <div className="svc-card" style={{ padding: "1.2rem" }}>
  <div
    className="svc-muted"
    style={{ fontSize: "0.78rem", fontWeight: 600 }}
  >
    Rating
  </div>

  <div
    className="svc-serif"
    style={{
      fontSize: "1.7rem",
      fontWeight: 600,
      marginTop: 4
    }}
  >
    {providerRating.toFixed(1)} / 5
  </div>
</div>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", borderBottom: "1px solid var(--line)", marginBottom: "1.5rem" }}>
        {[{ id: "bookings", label: "Booking requests" }, { id: "availability", label: "Availability" }].map(t => (
          <div key={t.id} className={`svc-nav-link ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)} style={{ paddingBottom: "0.8rem" }}>
            {t.label}
          </div>
        ))}
      </div>

      {tab === "bookings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          {myBookings.map(b => (
            <div key={b.id} className="svc-card" style={{ padding: "1.2rem 1.4rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Avatar name={b.customerName} size={40} color="var(--clay)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem" }}>{b.customerName}</div>
                  <div className="svc-muted" style={{ fontSize: "0.8rem" }}>{b.service} · {b.date}, {b.time}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <StatusPill status={b.status} />
                {b.status === "pending" && (
  <>
    <button
      type="button"
      className="svc-btn svc-btn-primary"
      style={{
        fontSize: "0.78rem",
        padding: "0.5rem 0.9rem"
      }}
      onClick={() => {
        console.log("ACCEPT BUTTON CLICKED:", b.id);
        onUpdateStatus(b.id, "confirmed");
      }}
    >
      Accept
    </button>

    <button
      type="button"
      className="svc-btn svc-btn-secondary"
      style={{
        fontSize: "0.78rem",
        padding: "0.5rem 0.9rem"
      }}
      onClick={() => onUpdateStatus(b.id, "cancelled")}
    >
      Decline
    </button>
  </>
)}
                {b.status === "confirmed" && (
                  <button className="svc-btn svc-btn-clay" style={{ fontSize: "0.78rem", padding: "0.5rem 0.9rem" }} onClick={() => onUpdateStatus(b.id, "in-progress")}>Start job</button>
                )}
                {b.status === "in-progress" && (
                  <button className="svc-btn svc-btn-primary" style={{ fontSize: "0.78rem", padding: "0.5rem 0.9rem" }} onClick={() => onUpdateStatus(b.id, "completed")}>Mark complete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "availability" && (
        <div className="svc-card" style={{ padding: "1.6rem" }}>
          <p className="svc-muted" style={{ fontSize: "0.88rem", marginBottom: "1.2rem" }}>
            Toggle the slots you're free for this week. Customers only see what's switched on.
          </p>
          {Object.entries(myProvider?.availability || {}).map(([day, slots]) => (
            <div key={day} style={{ marginBottom: "1.2rem" }}>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", marginBottom: 8 }}>{day}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {AVAILABILITY_TEMPLATE.map(t => {
                  const active = Array.isArray(slots) && slots.includes(t);
                  return (
                    <span
                      key={t}
                      className="svc-pill"
                      style={{
                        cursor: "pointer",
                        background: active ? "var(--accent-tint)" : "var(--bg-dim)",
                        color: active ? "var(--accent-dark)" : "var(--muted-2)",
                        border: `1px solid ${active ? "var(--accent)" : "var(--line-strong)"}`,
                      }}
                    >
                      {t}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ADMIN DASHBOARD
   ============================================================ */
function AdminDashboard({ bookings, onUpdateStatus }) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [adminTab, setAdminTab] = useState("overview");

  const [adminUsers, setAdminUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [adminReviews, setAdminReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [bookingFilter, setBookingFilter] = useState("all");

  const filteredAdminBookings = bookings.filter((booking) => {
  if (bookingFilter === "all") {
    return true;
  }

  return booking.status === bookingFilter;
});

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeProviders: 0,
    bookingsThisMonth: 0,
    revenue: 0,
    categorySplit: []
  });

  const [loading, setLoading] = useState(true);

  // ============================================================
  // LOAD ADMIN STATS
  // ============================================================

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/stats")
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
        }
      })
      .catch(error => {
        console.error("Admin stats error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);


  // ============================================================
// LOAD USERS & PROVIDERS
// ============================================================

useEffect(() => {
  if (adminTab !== "users") return;

  setUsersLoading(true);

  fetch("http://localhost:5000/api/admin/users")
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setAdminUsers(Array.isArray(data.users) ? data.users : []);
      } else {
        setAdminUsers([]);
      }
    })
    .catch(error => {
      console.error("Admin users error:", error);
      setAdminUsers([]);
    })
    .finally(() => {
      setUsersLoading(false);
    });
}, [adminTab]);


// ============================================================
// LOAD REVIEWS
// ============================================================

useEffect(() => {
  if (adminTab !== "reviews") return;

  setReviewsLoading(true);

  fetch("http://localhost:5000/api/admin/reviews")
    .then(response => response.json())
    .then(data => {
      console.log("ADMIN REVIEWS DATA:", data);

      if (data.success) {
        setAdminReviews(data.reviews);
      }
    })
    .catch(error => {
      console.error("Admin reviews error:", error);
    })
    .finally(() => {
      setReviewsLoading(false);
    });

}, [adminTab]);

{adminTab === "reviews" && (
  <div>
    ...
  </div>
)}



    // ============================================================
  // ADD CATEGORY
  // ============================================================
  
  useEffect(() => {
  if (adminTab !== "categories") return;

  setCategoriesLoading(true);

  fetch("http://localhost:5000/api/categories")
    .then((response) => response.json())
    .then((data) => {
      console.log("ADMIN CATEGORIES DATA:", data);

      if (data.success) {
        setCategories(data.categories || []);
      } else {
        setCategories([]);
      }
    })
    .catch((error) => {
      console.error("Admin categories error:", error);
      setCategories([]);
    })
    .finally(() => {
      setCategoriesLoading(false);
    });
}, [adminTab]);


  const handleAddCategory = async () => {

    if (!newCategoryName.trim()) {
      alert("Please enter category name.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/categories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: newCategoryName.trim(),
            description: newCategoryDescription.trim()
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to add category");
        return;
      }

      setCategories(prev => [...prev, data.category]);

      setNewCategoryName("");
      setNewCategoryDescription("");

      alert("Category added successfully.");
    } catch (error) {
      console.error("Add category error:", error);
      alert("Cannot connect to backend server.");
    }
  };


  // ============================================================
  // EDIT CATEGORY
  // ============================================================

  const handleEditCategory = async (category) => {
    const newName = prompt(
      "Enter new category name:",
      category.name
    );

    if (!newName || !newName.trim()) {
      return;
    }

    const newDescription = prompt(
      "Enter new description:",
      category.description || ""
    );

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/categories/${category.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: newName.trim(),
            description: newDescription
              ? newDescription.trim()
              : ""
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update category");
        return;
      }

      setCategories(prev =>
        prev.map(item =>
          item.id === category.id
            ? data.category
            : item
        )
      );

      alert("Category updated successfully.");
    } catch (error) {
      console.error("Edit category error:", error);
      alert("Cannot connect to backend server.");
    }
  };


  // ============================================================
  // DELETE CATEGORY
  // ============================================================

  const handleDeleteCategory = async (categoryId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/categories/${categoryId}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete category");
        return;
      }

      setCategories(prev =>
        prev.filter(
          category => category.id !== categoryId
        )
      );

      alert("Category deleted successfully.");
    } catch (error) {
      console.error("Delete category error:", error);
      alert("Cannot connect to backend server.");
    }
  };

  // ============================================================
  // BOOKING TREND
  // ============================================================

  const getBookingTrend = () => {
    const weeks = [];

    for (let i = 5; i >= 0; i--) {
      const start = new Date();

      start.setDate(
        start.getDate() - i * 7
      );

      const weekStart = new Date(start);

      weekStart.setDate(
        start.getDate() - start.getDay()
      );

      const weekEnd = new Date(weekStart);

      weekEnd.setDate(
        weekStart.getDate() + 6
      );

      const count = bookings.filter(b => {
        if (!b.date) return false;

        const bookingDate = new Date(b.date);

      const handleAddCategory = async () => {
  if (!newCategoryName.trim()) {
    alert("Please enter category name.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5000/api/admin/categories",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim()
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to add category");
      return;
    }

    setCategories(prev => [...prev, data.category]);

    setNewCategoryName("");
    setNewCategoryDescription("");

    alert("Category added successfully.");
  } catch (error) {
    console.error("Add category error:", error);
    alert("Cannot connect to backend server.");
  }
};


const handleEditCategory = async (category) => {
  const newName = prompt(
    "Enter new category name:",
    category.name
  );

  if (!newName || !newName.trim()) {
    return;
  }

  const newDescription = prompt(
    "Enter new description:",
    category.description || ""
  );

  try {
    const response = await fetch(
      `http://localhost:5000/api/admin/categories/${category.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription
            ? newDescription.trim()
            : ""
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to update category");
      return;
    }

    setCategories(prev =>
      prev.map(item =>
        item.id === category.id
          ? data.category
          : item
      )
    );

    alert("Category updated successfully.");
  } catch (error) {
    console.error("Edit category error:", error);
    alert("Cannot connect to backend server.");
  }
};


const handleDeleteCategory = async (categoryId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this category?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/admin/categories/${categoryId}`,
      {
        method: "DELETE"
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to delete category");
      return;
    }

    setCategories(prev =>
      prev.filter(
        category => category.id !== categoryId
      )
    );

    alert("Category deleted successfully.");
  } catch (error) {
    console.error("Delete category error:", error);
    alert("Cannot connect to backend server.");
  }
};
const filteredAdminBookings = bookings.filter((booking) => {
  if (bookingFilter === "all") {
    return true;
  }

  return booking.status === bookingFilter;
});

useEffect(() => {
  if (adminTab !== "reviews") return;

  setReviewsLoading(true);

  fetch("http://localhost:5000/api/admin/reviews")
    .then((response) => response.json())
    .then((data) => {
      console.log("ADMIN REVIEWS DATA:", data);

      if (data.success) {
        setAdminReviews(data.reviews || []);
      } else {
        setAdminReviews([]);
      }
    })
    .catch((error) => {
      console.error("Admin reviews error:", error);
      setAdminReviews([]);
    })
    .finally(() => {
      setReviewsLoading(false);
    });
}, [adminTab]);


        return (
          bookingDate >= weekStart &&
          bookingDate <= weekEnd
        );
      }).length;

      weeks.push({
        week: `Wk ${6 - i}`,
        bookings: count
      });
    }

    return weeks;
  };

  const bookingTrend = getBookingTrend();


  // ============================================================
  // RECENT BOOKINGS
  // ============================================================

  const recentPending = bookings.filter(
    b => b.status === "pending"
  );


  // ============================================================
  // STATS CARDS
  // ============================================================

  const statsCards = [
    {
      label: "Total users",
      value: loading
        ? "..."
        : stats.totalUsers.toLocaleString(),
      icon: Users
    },
    {
      label: "Active providers",
      value: loading
        ? "..."
        : stats.activeProviders.toLocaleString(),
      icon: Briefcase
    },
    {
      label: "Bookings this month",
      value: loading
        ? "..."
        : stats.bookingsThisMonth.toLocaleString(),
      icon: Calendar
    },
    {
      label: "Platform revenue",
      value: loading
        ? "..."
        : `₹${Number(stats.revenue || 0).toLocaleString()}`,
      icon: DollarSign
    }
  ];

  


  // ============================================================
  // SIDEBAR
  // ============================================================


const handleUserStatus = async (userId, currentStatus) => {
  try {
    const newStatus =
      currentStatus === "active"
        ? "inactive"
        : "active";

    const response = await fetch(
      `http://localhost:5000/api/admin/users/${userId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: newStatus
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to update user status");
      return;
    }

    setAdminUsers(prev =>
      prev.map(user =>
        user.id === userId
          ? {
              ...user,
              status: newStatus
            }
          : user
      )
    );

  } catch (error) {
    console.error("User status error:", error);
    alert("Cannot connect to backend server.");
  }
};

const sidebarItems = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard
  },
  {
    id: "users",
    label: "Users & providers",
    icon: Users
  },
  {
    id: "categories",
    label: "Categories",
    icon: Settings
  },
  {
    id: "bookings",
    label: "All bookings",
    icon: Calendar
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: MessageSquare
  }
];

  // ============================================================
  // MAIN
  // ============================================================

  return (

    
    <div
      style={{
        display: "flex",
        minHeight: "calc(100vh - 73px)"
      }}
    >

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        style={{
          width: 230,
          background: "var(--navy)",
          padding: "1.6rem 1rem",
          flexShrink: 0
        }}
      >

        <div
          className="svc-muted"
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.03em",
            color: "#7C8580",
            padding: "0 0.9rem",
            marginBottom: "0.6rem"
          }}
        >
          ADMINISTRATION
        </div>


        {sidebarItems.map(item => (
          <div
            key={item.id}
            onClick={() => setAdminTab(item.id)}
            className={`svc-sidebar-link ${
              adminTab === item.id ? "active" : ""
            }`}
            style={{
              cursor: "pointer"
            }}
          >
            <item.icon size={16} />
            {item.label}
          </div>
        ))}

      </aside>


      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}
{adminTab === "reviews" && (
  <div>
    <SectionHeading
      eyebrow="Administration"
      title="Customer Reviews"
      sub="View ratings and feedback submitted by customers."
    />

    {reviewsLoading ? (
      <p style={{ marginTop: "2rem" }}>Loading reviews...</p>
    ) : adminReviews.length === 0 ? (
      <p style={{ marginTop: "2rem" }}>No reviews found.</p>
    ) : (
      <div
        style={{
          display: "grid",
          gap: "1rem",
          marginTop: "1.5rem"
        }}
      >
        {adminReviews.map((review) => (
          <div
            key={review.id}
            style={{
              background: "white",
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: "1.25rem"
            }}
          >
            <h3>{review.customer_name}</h3>

            <p>
              ⭐ {review.rating}/5
            </p>

            <p>
              {review.comment || "No comment"}
            </p>

            <p>
              <strong>Provider:</strong>{" "}
              {review.provider_name}
            </p>

            <p>
              <strong>Service:</strong>{" "}
              {review.service_name}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
)}
      <main

      
        style={{
          flex: 1,
          padding: "2.2rem 2rem 4rem",
          maxWidth: 1100
        }}
      >
{adminTab === "categories" && (
  <div>
    <SectionHeading
      eyebrow="Administration"
      title="Service Categories"
      sub="Manage the service categories available on the platform."
    />

    <div style={{ marginTop: "1.5rem" }}>

      {categoriesLoading ? (
        <p>Loading categories...</p>
      ) : categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1rem"
          }}
        >
          {categories.map((category) => (
            <div
              key={category.id}
              style={{
                background: "white",
                border: "1px solid var(--line)",
                borderRadius: 14,
                padding: "1.25rem"
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.1rem"
                }}
              >
                {category.name}
              </h3>

              <p
                style={{
                  color: "var(--muted)",
                  marginTop: "0.5rem"
                }}
              >
                {category.description || "No description available"}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginTop: "1rem"
                }}
              >
                <button
                  onClick={() => handleEditCategory(category)}
                  style={{
                    padding: "0.5rem 0.9rem",
                    borderRadius: 8,
                    border: "1px solid var(--line)",
                    cursor: "pointer"
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  style={{
                    padding: "0.5rem 0.9rem",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  </div>
)}

        {/* ====================================================
            OVERVIEW
        ==================================================== */}

        {adminTab === "overview" && (
          <>
            <SectionHeading
              eyebrow="Platform health"
              title="Admin overview"
            />


            {/* STATS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1rem",
                marginBottom: "2rem"
              }}
            >

              {statsCards.map(s => (
                <div
                  key={s.label}
                  className="svc-card"
                  style={{
                    padding: "1.1rem"
                  }}
                >

                  <s.icon
                    size={16}
                    className="svc-muted"
                  />

                  <div
                    className="svc-serif"
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 600,
                      marginTop: 10
                    }}
                  >
                    {s.value}
                  </div>

                  <div
                    className="svc-muted"
                    style={{
                      fontSize: "0.76rem",
                      marginTop: 3
                    }}
                  >
                    {s.label}
                  </div>

                </div>
              ))}

            </div>


            {/* CHARTS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.3fr 1fr",
                gap: "1rem"
              }}
            >

              {/* BOOKING VOLUME */}

              <div
                className="svc-card"
                style={{
                  padding: "1.4rem"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem"
                  }}
                >

                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.92rem"
                    }}
                  >
                    Booking volume
                  </div>

                  <span
                    className="svc-muted"
                    style={{
                      fontSize: "0.76rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 4
                    }}
                  >
                    <TrendingUp size={13} />
                    Last 6 weeks
                  </span>

                </div>


                <ResponsiveContainer
                  width="100%"
                  height={220}
                >

                  <LineChart data={bookingTrend}>

                    <CartesianGrid
                      stroke="#E1DACB"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="week"
                      tick={{
                        fontSize: 12,
                        fill: "#8D8577"
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{
                        fontSize: 12,
                        fill: "#8D8577"
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid #E1DACB",
                        fontSize: 12
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="bookings"
                      stroke="#1F6E5E"
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>


              {/* PROVIDERS BY CATEGORY */}

              <div
                className="svc-card"
                style={{
                  padding: "1.4rem"
                }}
              >

                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    marginBottom: "1rem"
                  }}
                >
                  Providers by category
                </div>


                <ResponsiveContainer
                  width="100%"
                  height={220}
                >

                  <BarChart
                    data={stats.categorySplit}
                    layout="vertical"
                    margin={{ left: 10 }}
                  >

                    <XAxis
                      type="number"
                      hide
                    />

                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{
                        fontSize: 11,
                        fill: "#8D8577"
                      }}
                      axisLine={false}
                      tickLine={false}
                      width={90}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: "1px solid #E1DACB",
                        fontSize: 12
                      }}
                    />

                    <Bar
                      dataKey="providers"
                      fill="#C1622F"
                      radius={[0, 6, 6, 0]}
                      barSize={14}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </div>


            {/* RECENT BOOKINGS */}

            <div
              style={{
                marginTop: "2rem"
              }}
            >

              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.92rem",
                  marginBottom: "0.9rem"
                }}
              >
                Recent bookings needing attention
              </div>


              <div
                className="svc-card"
                style={{
                  overflow: "hidden"
                }}
              >

                {recentPending.map((b, i) => (
                  <div
                    key={b.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.9rem 1.2rem",
                      borderTop:
                        i > 0
                          ? "1px solid var(--line)"
                          : "none"
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center"
                      }}
                    >

                      <Avatar
                        name={b.providerName}
                        size={32}
                        color="var(--accent)"
                      />

                      <div>

                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "0.85rem"
                          }}
                        >
                          {b.service}
                        </div>

                        <div
                          className="svc-muted"
                          style={{
                            fontSize: "0.76rem"
                          }}
                        >
                          {b.customerName} →{" "}
                          {b.providerName}
                        </div>

                      </div>

                    </div>

                    <StatusPill status={b.status} />

                  </div>
                ))}


                {recentPending.length === 0 && (
                  <div
                    className="svc-muted"
                    style={{
                      padding: "1.2rem",
                      fontSize: "0.85rem"
                    }}
                  >
                    Nothing pending review right now.
                  </div>
                )}

              </div>

            </div>

          </>
        )}


        {/* ====================================================
            USERS & PROVIDERS
        ==================================================== */}

        {adminTab === "users" && (
  <>

    <SectionHeading
      eyebrow="Administration"
      title="Users & providers"
      sub="View and manage registered customers, providers and their account details."
    />

    <div
      className="svc-card"
      style={{
        overflow: "hidden"
      }}
    >

      {usersLoading ? (

        <div
          className="svc-muted"
          style={{
            padding: "2rem",
            textAlign: "center"
          }}
        >
          Loading users...
        </div>

      ) : adminUsers.length === 0 ? (

        <div
          className="svc-muted"
          style={{
            padding: "2rem",
            textAlign: "center"
          }}
        >
          No users found.
        </div>

      ) : (

        <div
          style={{
            overflowX: "auto"
          }}
        >

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.84rem"
            }}
          >

            <thead>

              <tr
                style={{
                  borderBottom: "1px solid var(--line)"
                }}
              >

                <th style={{
                  padding: "1rem",
                  textAlign: "left"
                }}>
                  Name
                </th>

                <th style={{
                  padding: "1rem",
                  textAlign: "left"
                }}>
                  Email
                </th>

                <th style={{
                  padding: "1rem",
                  textAlign: "left"
                }}>
                  Role
                </th>

                <th style={{
                  padding: "1rem",
                  textAlign: "left"
                }}>
                  Category
                </th>

                <th style={{
                  padding: "1rem",
                  textAlign: "left"
                }}>
                  Rating
                </th>

                <th style={{
                  padding: "1rem",
                  textAlign: "left"
                }}>
                  Status
                </th>

                <th style={{
                  padding: "1rem",
                  textAlign: "left"
                }}>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {adminUsers.map((u, index) => (

                <tr
                  key={u.id}
                  style={{
                    borderTop:
                      index > 0
                        ? "1px solid var(--line)"
                        : "none"
                  }}
                >

                  {/* NAME */}

                  <td
                    style={{
                      padding: "1rem",
                      fontWeight: 600
                    }}
                  >
                    {u.name}
                  </td>


                  {/* EMAIL */}

                  <td
                    style={{
                      padding: "1rem"
                    }}
                  >
                    {u.email}
                  </td>


                  {/* ROLE */}

                  <td
                    style={{
                      padding: "1rem"
                    }}
                  >

                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.3rem 0.6rem",
                        borderRadius: 999,
                        background:
                          u.role === "provider"
                            ? "var(--accent-tint)"
                            : "#F1EEE7",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        textTransform: "capitalize"
                      }}
                    >
                      {u.role}
                    </span>

                  </td>


                  {/* CATEGORY */}

                  <td
                    style={{
                      padding: "1rem"
                    }}
                  >
                    {u.category_name || "—"}
                  </td>


                  {/* RATING */}

                  <td
                    style={{
                      padding: "1rem"
                    }}
                  >
                    {u.role === "provider"
                      ? `${Number(u.rating || 0).toFixed(1)} / 5`
                      : "—"}
                  </td>


                  {/* STATUS */}

                  <td
                    style={{
                      padding: "1rem"
                    }}
                  >

                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.3rem 0.65rem",
                        borderRadius: 999,
                        background:
                          u.status === "active"
                            ? "#DCFCE7"
                            : "#FEE2E2",
                        color:
                          u.status === "active"
                            ? "#166534"
                            : "#991B1B",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        textTransform: "capitalize"
                      }}
                    >
                      {u.status || "active"}
                    </span>

                  </td>


                  {/* ACTION */}

                  <td
                    style={{
                      padding: "1rem"
                    }}
                  >

                    <button
                      onClick={() =>
                        handleUserStatus(
                          u.id,
                          u.status || "active"
                        )
                      }
                      style={{
                        padding: "0.45rem 0.75rem",
                        borderRadius: "8px",
                        border: "1px solid var(--line)",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        background:
                          u.status === "inactive"
                            ? "#DCFCE7"
                            : "#FEE2E2",
                        color:
                          u.status === "inactive"
                            ? "#166534"
                            : "#991B1B"
                      }}
                    >

                      {u.status === "inactive"
                        ? "Activate"
                        : "Deactivate"}

                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>

  </>
)}


        {/* ====================================================
            CATEGORIES
        ==================================================== */}
{adminTab === "bookings" && (
  <>
    <SectionHeading
      eyebrow="Administration"
      title="All bookings"
      sub="View and manage all customer bookings."
    />

    {/* BOOKING FILTER */}
    <div
      className="svc-card"
      style={{
        padding: "1rem",
        marginBottom: "1rem"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
          flexWrap: "wrap"
        }}
      >
        <strong style={{ fontSize: "0.82rem" }}>
          Filter:
        </strong>

        <select
          value={bookingFilter}
          onChange={(e) =>
            setBookingFilter(e.target.value)
          }
          style={{
            padding: "0.55rem 0.75rem",
            borderRadius: "8px",
            border: "1px solid var(--line)",
            background: "var(--surface)"
          }}
        >
          <option value="all">All bookings</option>
          <option value="pending">Requested</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <span
          className="svc-muted"
          style={{
            fontSize: "0.78rem"
          }}
        >
          {filteredAdminBookings.length} booking(s)
        </span>
      </div>
    </div>

    {/* BOOKINGS TABLE */}
    <div
      className="svc-card"
      style={{
        overflow: "hidden"
      }}
    >
      {filteredAdminBookings.length === 0 ? (
        <div
          className="svc-muted"
          style={{
            padding: "2rem",
            textAlign: "center"
          }}
        >
          No bookings found.
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto"
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.82rem"
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom:
                    "1px solid var(--line)"
                }}
              >
                <th style={{ padding: "1rem", textAlign: "left" }}>
                  Customer
                </th>

                <th style={{ padding: "1rem", textAlign: "left" }}>
                  Provider
                </th>

                <th style={{ padding: "1rem", textAlign: "left" }}>
                  Service
                </th>

                <th style={{ padding: "1rem", textAlign: "left" }}>
                  Date
                </th>

                <th style={{ padding: "1rem", textAlign: "left" }}>
                  Time
                </th>

                <th style={{ padding: "1rem", textAlign: "left" }}>
                  Price
                </th>

                <th style={{ padding: "1rem", textAlign: "left" }}>
                  Status
                </th>

                <th style={{ padding: "1rem", textAlign: "left" }}>
                  Admin Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredAdminBookings.map((b, index) => (
                <tr
                  key={b.id}
                  style={{
                    borderTop:
                      index > 0
                        ? "1px solid var(--line)"
                        : "none"
                  }}
                >
                  <td
                    style={{
                      padding: "1rem",
                      fontWeight: 600
                    }}
                  >
                    {b.customerName || "Customer"}
                  </td>

                  <td style={{ padding: "1rem" }}>
                    {b.providerName || "Provider"}
                  </td>

                  <td style={{ padding: "1rem" }}>
                    {b.service || "—"}
                  </td>

                  <td style={{ padding: "1rem" }}>
                    {b.date || "—"}
                  </td>

                  <td style={{ padding: "1rem" }}>
                    {b.time || "—"}
                  </td>

                  <td
                    style={{
                      padding: "1rem",
                      fontWeight: 600
                    }}
                  >
                    ₹{Number(
                      b.price || 0
                    ).toLocaleString()}
                  </td>

                  <td style={{ padding: "1rem" }}>
                    <StatusPill status={b.status} />
                  </td>

                  <td style={{ padding: "1rem" }}>
                    <select
                      value={b.status}
                      onChange={(e) =>
                        onUpdateStatus(
                          b.id,
                          e.target.value
                        )
                      }
                      style={{
                        padding: "0.5rem",
                        borderRadius: "7px",
                        border:
                          "1px solid var(--line)",
                        background:
                          "var(--surface)",
                        cursor: "pointer",
                        fontSize: "0.75rem"
                      }}
                    >
                      <option value="pending">
                        Requested
                      </option>

                      <option value="confirmed">
                        Confirmed
                      </option>

                      <option value="in_progress">
                        In Progress
                      </option>

                      <option value="completed">
                        Completed
                      </option>

                      <option value="cancelled">
                        Cancelled
                      </option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </>
)}


        {/* ====================================================
            ALL BOOKINGS
        ==================================================== */}

        {adminTab === "bookings" && (
          <>

            <SectionHeading
              eyebrow="Administration"
              title="All bookings"
              sub="View all customer bookings and their current status."
            />


            <div
              className="svc-card"
              style={{
                overflow: "hidden"
              }}
            >

              {bookings.length === 0 ? (

                <div
                  className="svc-muted"
                  style={{
                    padding: "2rem",
                    textAlign: "center"
                  }}
                >
                  No bookings found.
                </div>

              ) : (

                <div
                  style={{
                    overflowX: "auto"
                  }}
                >

                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.82rem"
                    }}
                  >

                    <thead>

                      <tr
                        style={{
                          borderBottom:
                            "1px solid var(--line)"
                        }}
                      >

                        <th
                          style={{
                            padding: "1rem",
                            textAlign: "left"
                          }}
                        >
                          Customer
                        </th>

                        <th
                          style={{
                            padding: "1rem",
                            textAlign: "left"
                          }}
                        >
                          Provider
                        </th>

                        <th
                          style={{
                            padding: "1rem",
                            textAlign: "left"
                          }}
                        >
                          Service
                        </th>

                        <th
                          style={{
                            padding: "1rem",
                            textAlign: "left"
                          }}
                        >
                          Date
                        </th>

                        <th
                          style={{
                            padding: "1rem",
                            textAlign: "left"
                          }}
                        >
                          Time
                        </th>

                        <th
                          style={{
                            padding: "1rem",
                            textAlign: "left"
                          }}
                        >
                          Price
                        </th>

                        <th
                          style={{
                            padding: "1rem",
                            textAlign: "left"
                          }}
                        >
                          Status
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {bookings.map((b, index) => (

                        <tr
                          key={b.id}
                          style={{
                            borderTop:
                              index > 0
                                ? "1px solid var(--line)"
                                : "none"
                          }}
                        >

                          <td
                            style={{
                              padding: "1rem",
                              fontWeight: 600
                            }}
                          >
                            {b.customerName || "Customer"}
                          </td>

                          <td
                            style={{
                              padding: "1rem"
                            }}
                          >
                            {b.providerName || "Provider"}
                          </td>

                          <td
                            style={{
                              padding: "1rem"
                            }}
                          >
                            {b.service || "—"}
                          </td>

                          <td
                            style={{
                              padding: "1rem"
                            }}
                          >
                            {b.date || "—"}
                          </td>

                          <td
                            style={{
                              padding: "1rem"
                            }}
                          >
                            {b.time || "—"}
                          </td>

                          <td
                            style={{
                              padding: "1rem",
                              fontWeight: 600
                            }}
                          >
                            ₹{Number(b.price || 0).toLocaleString()}
                          </td>

                          <td
                            style={{
                              padding: "1rem"
                            }}
                          >
                            <StatusPill status={b.status} />
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          </>
        )}

      </main>

    </div>
  );
}
/* ============================================================
   ROOT APP
   ============================================================ */
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("browse");
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);

useEffect(() => {
  fetch("http://localhost:5000/api/categories")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        setCategories(data.categories);
      }
    })
    .catch((error) => {
      console.error("Error loading categories:", error);
    });
}, []);
  const [authMode, setAuthMode] = useState("login");
  useEffect(() => {
  fetch("http://localhost:5000/api/providers")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        setProviders(data.providers);
        console.log("PROVIDERS FROM API:", data.providers);
      }
    })
    .catch((error) => {
      console.error("Error loading providers:", error);
    });
}, []);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  useEffect(() => {
  fetch("http://localhost:5000/api/bookings")
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const formattedBookings = data.bookings.map(b => ({
          id: b.id,
          providerId: b.provider_id,
          providerName: b.provider_name || b.business_name || "Provider",
          customerName: b.customer_name,
          service: b.service_name,
          date: new Date(b.booking_date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short"
          }),
          time: b.start_time,
          price: b.price,
          status:
  b.status === "Requested"
    ? "pending"
    : b.status === "Confirmed"
    ? "confirmed"
    : b.status === "In Progress"
    ? "in_progress"
    : b.status === "Completed"
    ? "completed"
    : b.status === "Cancelled"
    ? "cancelled"
    : b.status,
        }));

        setBookings(formattedBookings);
      }
    })
    .catch(error => {
      console.error("Error loading bookings:", error);
    });
}, []);
  const selectedProvider = providers.find(
  p => p.id === selectedProviderId
);

const handleAuth = async ({ name, email, password, role, mode }) => {
  try {
    const endpoint =
      mode === "register"
        ? "http://localhost:5000/api/auth/register"
        : "http://localhost:5000/api/auth/login";

    const body =
      mode === "register"
        ? { name, email, password, role }
        : { email, password };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Authentication failed");
      return;
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    setUser(data.user);

    setView(
      data.user.role === "provider"
        ? "providerDashboard"
        : data.user.role === "admin"
        ? "adminDashboard"
        : "browse"
    );
  } catch (error) {
    console.error("Authentication error:", error);
    alert("Cannot connect to the backend server.");
  }
};

  const handleLogout = () => { setUser(null); setView("browse"); };

const handleConfirmBooking = async ({ provider, service, day, time }) => {
  console.log("BOOKING DATA:", {
    customer_id: user?.id,
    provider_id: provider?.id,
    service_id: service?.id,
    booking_date: day,
    start_time: time
  });

  try {
    if (!user?.id || !provider?.id || !service?.id || !day || !time) {
      alert("Please select service, date and time.");
      return;
    }

    const startTime = new Date(
      `1970-01-01 ${time}`
    ).toTimeString().slice(0, 8);

    const response = await fetch(
      "http://localhost:5000/api/bookings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customer_id: user.id,
          provider_id: provider.id,
          service_id: service.id,
          booking_date: day,
          start_time: startTime
        })
      }
    );

    const data = await response.json();

    console.log("BOOKING RESPONSE:", data);

    if (!response.ok) {
      alert(data.message || "Booking failed");
      return;
    }

    setBookings(prev => [
      {
        id: data.booking_id,
        providerId: provider.id,
        providerName:
          provider.provider_name ||
          provider.business_name ||
          "Provider",
        customerId: user.id,
        customerName: user.name || "You",
        service: service.name,
        date: day,
        time: time,
        price: service.price,
        status: "pending"
      },
      ...prev
    ]);

    setView("customerDashboard");

  } catch (error) {
    console.error("Booking error:", error);
    alert("Cannot connect to backend server.");
  }
};
  const handleCancel = (id) => setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
  
  const handleUpdateStatus = async (id, status) => {
  try {
    const dbStatus =
      status === "confirmed"
        ? "Confirmed"
        : status === "in_progress"
        ? "In Progress"
        : status === "completed"
        ? "Completed"
        : status === "cancelled"
        ? "Cancelled"
        : "Requested";

    const response = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: dbStatus,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to update booking");
      return;
    }

    setBookings(prev =>
      prev.map(b =>
        b.id === id
          ? { ...b, status }
          : b
      )
    );

  } catch (error) {
    console.error("Update booking error:", error);
    alert("Cannot connect to the backend server.");
  }
};
const handleReview = async (booking, rating, comment) => {
  try {
    const response = await fetch("http://localhost:5000/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booking_id: booking.id,
        customer_id: user?.id,
        provider_id: booking.providerId,
        rating: Number(rating),
        comment: comment,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to submit review");
      return;
    }

    alert("Review submitted successfully!");
    console.log("Review saved:", data);
    

  } catch (error) {
    console.error("Review error:", error);
    alert("Cannot connect to the backend server.");
  }
};
  const myBookings = user
    ? user.role === "provider"
      ? bookings.filter(b => b.providerName === "Meera Kulkarni")
      : bookings.filter(b => b.customerName === user.name || b.customerName === "Sanket Abhang")
    : [];

  let page;
  if (view === "login" || view === "register") {
    page = <AuthPage mode={authMode} onSubmit={handleAuth} onSwitch={setAuthMode} />;
  } else if (view === "provider" && selectedProvider) {
    page = <ProviderProfilePage provider={selectedProvider} onBack={() => setView("browse")} onBook={() => setView("booking")} />;
  } else if (view === "booking" && selectedProvider) {
    page = <BookingFlowPage provider={selectedProvider} onBack={() => setView("provider")} onConfirm={handleConfirmBooking} />;
  } else if (view === "customerDashboard") {
    page = <CustomerDashboard
  bookings={myBookings}
  onCancel={handleCancel}
  onReview={handleReview}
  user={user}
/>
  } else if (view === "providerDashboard") {
    page = <ProviderDashboard
  bookings={bookings}
  onUpdateStatus={handleUpdateStatus}
  user={user}
  providers={providers}
/>
  } else if (view === "adminDashboard") {
    page = <AdminDashboard
  bookings={bookings}
  onUpdateStatus={handleUpdateStatus}
/>
  } else {
    page = (


      <BrowsePage
  user={user}
  categories={categories}
  onSelectProvider={(id) => {
  console.log("Selected provider ID:", id);
  setSelectedProviderId(id);
  setView("provider");
}}
  onNavigate={setView}
/>
      
    );
  }

  return (
    <div className="svc-app">
      <GlobalStyle />
      <NavBar
        user={user}
        current={view}
        onNavigate={(v) => { if (v === "login" || v === "register") setAuthMode(v); setView(v); }}
        onLogout={handleLogout}
      />
      {page}
    </div>
  );
}
