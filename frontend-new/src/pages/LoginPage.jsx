// src/pages/LoginPage.jsx — Cotton Candy Neumorphism Bento Login
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './LoginPage.css';

const DEST_CARDS = [
  { emoji:'🏔️', name:'Manali', type:'Mountain • Himachal', match:'94% Match', cls:'bento-lavender' },
  { emoji:'🏖️', name:'Goa', type:'Beach • Coastal', match:'87% Match', cls:'bento-pink' },
  { emoji:'⛵', name:'Kerala', type:'Nature • Backwaters', match:'82% Match', cls:'bento-mint' },
  { emoji:'🏯', name:'Varanasi', type:'Spiritual • Heritage', match:'78% Match', cls:'bento-sky' },
];

function PasswordStrength({ password }) {
  const getStrength = (p) => {
    let s = 0;
    if (p.length >= 6)            s++;
    if (p.length >= 10)           s++;
    if (/[A-Z]/.test(p))         s++;
    if (/[0-9]/.test(p))         s++;
    if (/[^A-Za-z0-9]/.test(p))  s++;
    return s;
  };
  const strength = getStrength(password);
  const labels   = ['', 'Weak 🥺', 'Okay 🌸', 'Good 💜', 'Strong 💪', 'Excellent 🌟'];
  const colors   = ['', '#f472b6', '#fdba74', '#6ee7b7', '#a78bfa', '#6ee7b7'];
  const widths   = ['0%', '20%', '40%', '65%', '85%', '100%'];

  if (!password) return null;
  return (
    <div className="pw-strength">
      <div className="pw-strength-bar">
        <div className="pw-strength-fill" style={{ width: widths[strength], background: colors[strength] }} />
      </div>
      <div className="pw-strength-label" style={{ color: colors[strength] }}>{labels[strength]}</div>
    </div>
  );
}

export default function LoginPage() {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [tab, setTab]       = useState('login');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert]   = useState(null);      // { msg, type }
  const [showPw, setShowPw] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPw, setLoginPw]       = useState('');

  // Register fields
  const [regFN, setRegFN] = useState('');
  const [regLN, setRegLN] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPw, setRegPw]     = useState('');
  const [regConf, setRegConf] = useState('');

  const showAlertMsg = (msg, type = 'error') => setAlert({ msg, type });
  const clearAlert = () => setAlert(null);

  // ── Login handler ───────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    clearAlert();
    if (!loginEmail || !loginPw) { showAlertMsg('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(loginEmail, loginPw);
      navigate('/');
    } catch (err) {
      showAlertMsg(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // ── Register handler ────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    clearAlert();
    if (!regFN || !regEmail || !regPw) { showAlertMsg('Please fill required fields'); return; }
    if (regPw.length < 6) { showAlertMsg('Password must be at least 6 characters'); return; }
    if (regPw !== regConf) { showAlertMsg('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(regEmail, regPw, regFN, regLN);
      navigate('/');
    } catch (err) {
      showAlertMsg(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (field) => {
    if (field === 'email')    setLoginEmail('demo@voyager.ai');
    if (field === 'password') setLoginPw('voyager123');
  };

  const switchTab = (t) => { setTab(t); clearAlert(); };

  return (
    <div className="login-root">
      {/* Floating orbs */}
      <div className="login-orbs">
        <div className="orb orb-1" /><div className="orb orb-2" />
        <div className="orb orb-3" /><div className="orb orb-4" />
      </div>

      {/* ── LEFT PANEL ── */}
      <div className="login-left">
        <div className="login-brand">
          <span className="login-brand-logo">✈️</span>
          <h1 className="login-brand-title">Voyager AI</h1>
          <p className="login-brand-sub">Plan your perfect trip powered by Bayesian probabilistic intelligence — personalized just for you.</p>
        </div>

        <div className="login-bento bento-grid bento-2">
          {DEST_CARDS.map((c, i) => (
            <div key={i} className={`login-bento-card bento-card ${c.cls}`}>
              <div className="lbc-emoji">{c.emoji}</div>
              <div className="lbc-name">{c.name}</div>
              <div className="lbc-type">{c.type}</div>
              <div className="lbc-badge"><span className="badge badge-lav">⭐ {c.match}</span></div>
            </div>
          ))}
        </div>

        <div className="login-stats">
          {[['8+','Destinations'],['95%','AI Accuracy'],['∞','Unique Plans']].map(([v,l],i)=>(
            <div className="login-stat" key={i}>
              <div className="login-stat-val">{v}</div>
              <div className="login-stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-right">
        <button onClick={toggleTheme} className="theme-toggle-floating" title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <div className="auth-box">

          {/* Brand mini */}
          <div className="auth-brand">
            <div className="auth-brand-icon">✈️</div>
            <span className="auth-brand-name">Voyager AI</span>
          </div>

          {/* Title */}
          <div className="auth-title">{tab === 'login' ? 'Welcome back 👋' : 'Join Voyager 🚀'}</div>
          <div className="auth-subtitle">
            {tab === 'login' ? 'Sign in to continue your travel journey' : 'Create your account and start exploring'}
          </div>

          {/* Tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab ${tab==='login'?'active':''}`} onClick={() => switchTab('login')}>Sign In</button>
            <button className={`auth-tab ${tab==='register'?'active':''}`} onClick={() => switchTab('register')}>Create Account</button>
          </div>

          {/* Alert */}
          {alert && (
            <div className={`alert alert-${alert.type}`}>
              <span>{alert.type === 'error' ? '⚠️' : '✅'}</span>
              {alert.msg}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          <form className={`auth-form ${tab==='login'?'active':''}`} onSubmit={handleLogin}>
            <div className="field-group">
              <label className="field-label">Email Address</label>
              <div className="field-wrapper">
                <span className="field-icon">📧</span>
                <input className="neu-input" type="email" placeholder="you@example.com"
                  value={loginEmail} onChange={e => setLoginEmail(e.target.value)} autoComplete="email" />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-wrapper">
                <span className="field-icon">🔒</span>
                <input className="neu-input" type={showPw ? 'text' : 'password'} placeholder="Enter your password"
                  value={loginPw} onChange={e => setLoginPw(e.target.value)} autoComplete="current-password" />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(p => !p)}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="options-row">
              <label className="remember-label">
                <input type="checkbox" className="remember-check" />
                Remember me
              </label>
              <a href="#" className="forgot-link" onClick={(e) => { e.preventDefault(); alert('✨ Password reset is coming soon!'); }}>Forgot password?</a>
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : null}
              <span>Sign In ✈️</span>
            </button>

            <div className="divider"><span className="divider-text">or continue with</span></div>
            <div className="social-btns">
              <button type="button" className="btn-social" onClick={() => alert('✨ Google login is coming soon!')}>🌐 Google</button>
              <button type="button" className="btn-social" onClick={() => alert('✨ GitHub login is coming soon!')}>🐱 GitHub</button>
            </div>

            <div className="demo-hint">
              <div className="demo-hint-title">🎯 Try Demo Account</div>
              <div className="demo-hint-row">Email: <code onClick={() => fillDemo('email')}>demo@voyager.ai</code></div>
              <div className="demo-hint-row">Password: <code onClick={() => fillDemo('password')}>voyager123</code></div>
            </div>
          </form>

          {/* ── REGISTER FORM ── */}
          <form className={`auth-form ${tab==='register'?'active':''}`} onSubmit={handleRegister}>
            <div className="name-row">
              <div className="field-group">
                <label className="field-label">First Name</label>
                <div className="field-wrapper">
                  <span className="field-icon">👤</span>
                  <input className="neu-input" type="text" placeholder="Alex"
                    value={regFN} onChange={e => setRegFN(e.target.value)} />
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Last Name</label>
                <div className="field-wrapper">
                  <span className="field-icon">👤</span>
                  <input className="neu-input" type="text" placeholder="Smith"
                    value={regLN} onChange={e => setRegLN(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Email Address</label>
              <div className="field-wrapper">
                <span className="field-icon">📧</span>
                <input className="neu-input" type="email" placeholder="you@example.com"
                  value={regEmail} onChange={e => setRegEmail(e.target.value)} />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-wrapper">
                <span className="field-icon">🔒</span>
                <input className="neu-input" type={showRegPw ? 'text' : 'password'} placeholder="Create a strong password"
                  value={regPw} onChange={e => setRegPw(e.target.value)} />
                <button type="button" className="pw-toggle" onClick={() => setShowRegPw(p => !p)}>
                  {showRegPw ? '🙈' : '👁️'}
                </button>
              </div>
              <PasswordStrength password={regPw} />
            </div>

            <div className="field-group">
              <label className="field-label">Confirm Password</label>
              <div className="field-wrapper">
                <span className="field-icon">🔒</span>
                <input className="neu-input" type="password" placeholder="Repeat password"
                  value={regConf} onChange={e => setRegConf(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : null}
              <span>Create Account 🌸</span>
            </button>

            <p className="terms-text">
              By creating an account you agree to our <a href="#" onClick={(e) => { e.preventDefault(); alert('✨ Terms of Service coming soon!'); }}>Terms</a> and <a href="#" onClick={(e) => { e.preventDefault(); alert('✨ Privacy Policy coming soon!'); }}>Privacy Policy</a>.
            </p>
          </form>

        </div>
      </div>
    </div>
  );
}
