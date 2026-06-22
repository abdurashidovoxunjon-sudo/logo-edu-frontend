import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { adminLogin } from '../api/auth'
import { setToken, setUser } from '../lib/auth'

type Role = 'admin' | 'parent'

const creds: Record<Role, { id: string; pw: string; name: string }> = {
  admin: { id: 'admin@example.com', pw: 'secret123', name: 'Admin' },
  parent: { id: '+998 90 123 45 67', pw: '1234', name: 'Karim Karimov' },
}

export default function Login() {
  const navigate = useNavigate()
  const [role, setRole] = useState<Role>('admin')
  const [idValue, setIdValue] = useState('')
  const [pwValue, setPwValue] = useState('')
  const [pwHidden, setPwHidden] = useState(true)
  const [loading, setLoading] = useState(false)
  const [idError, setIdError] = useState<string | null>(null)
  const [pwError, setPwError] = useState<string | null>(null)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [success, setSuccess] = useState<Role | null>(null)

  const isAdmin = role === 'admin'
  const isParent = role === 'parent'
  const c = creds[role]

  function pickRole(next: Role) {
    setRole(next)
    setIdValue('')
    setPwValue('')
    setIdError(null)
    setPwError(null)
  }
    async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    let nextIdErr: string | null = null
    let nextPwErr: string | null = null
    if (!idValue.trim())
      nextIdErr = isAdmin ? 'Email kiriting' : 'Telefon raqamini kiriting'
    if (!pwValue) nextPwErr = 'Parolni kiriting'
    if (nextIdErr || nextPwErr) {
      setIdError(nextIdErr)
      setPwError(nextPwErr)
      return
    }
    setLoading(true)
    setIdError(null)
    setPwError(null)

    if (isAdmin) {
      try {
        const { token, user } = await adminLogin({
          email: idValue.trim(),
          password: pwValue,
        })
        setToken(token)
        setUser(user)
        setLoading(false)
        setSuccess(role)
      } catch (err) {
        setLoading(false)
        if (axios.isAxiosError(err)) {
          const status = err.response?.status
          const data = err.response?.data as
            | {
                message?: string
                errors?: { email?: string[]; password?: string[] }
              }
            | undefined

          if (data?.errors?.email?.[0]) {
            setIdError(data.errors.email[0])
          } else if (status === 401) {
            setIdError(data?.message ?? "Email yoki parol noto'g'ri")
          } else if (!err.response) {
            setIdError("Server bilan bog'lanib bo'lmadi")
          } else {
            setIdError(data?.message ?? 'Kutilmagan xatolik')
          }

          if (data?.errors?.password?.[0]) {
            setPwError(data.errors.password[0])
          }
        } else {
          setIdError('Kutilmagan xatolik')
        }
      }
      return
    }

    // parent: keep existing fake-login flow until backend is ready
    setTimeout(() => {
      const idOk = idValue.trim().toLowerCase() === c.id.toLowerCase()
      const pwOk = pwValue === c.pw
      if (!idOk || !pwOk) {
        setLoading(false)
        setIdError(
          idOk ? null : "Telefon raqami noto'g'ri",
        )
        setPwError(pwOk ? null : "Parol noto'g'ri")
        return
      }
      setLoading(false)
      setSuccess(role)
    }, 900)
  }

  // ── palette ──
  const pageBg = isAdmin
    ? 'linear-gradient(135deg, #eaf6ef 0%, #f7faf3 50%, #e0f2fe 100%)'
    : 'linear-gradient(135deg, #fef3e7 0%, #fff7ed 50%, #fce7f3 100%)'
  const blob1 = isAdmin ? '#bce6cf' : '#fcd9b6'
  const blob2 = isAdmin ? '#bfe0fb' : '#f6c6dc'
  const leftBg = isAdmin
    ? 'linear-gradient(160deg, #d8eedf 0%, #f0faf4 60%, #ffffff 100%)'
    : 'linear-gradient(160deg, #fde6c8 0%, #fff5e6 60%, #ffffff 100%)'

  const heroTag = isAdmin ? 'LOGOEDU' : 'Ota-ona kabineti'
  const heroTitle = isAdmin
    ? "Bog'cha jarayonlarini bir tizimdan boshqaring"
    : "Bolangizning rivojlanishini kuzating"
  const heroSubtitle = isAdmin
    ? "O'qituvchilar, o'quvchilar, darslar va to'lovlar — barchasi yagona tizimda."
    : "Darslar, baholar va to'lovlar bo'yicha to'liq ma'lumot — istalgan vaqtda telefoningizda."
  const heroPoints = isAdmin
    ? ['6 ta modul, real-time hisobotlar', 'Avtomatik maosh hisob-kitobi', "Ko'nikma baholash tarixi"]
    : ['Har bir darsdan keyin hisobot', "Qarz va to'lov tarixi", "Bevosita o'qituvchi bilan aloqa"]

  const chipAvatarBg = isAdmin ? '#e8f6ef' : '#fce7f3'
  const chipAvatarColor = isAdmin ? '#21764e' : '#9d174d'
  const chipInit = isAdmin ? 'ME' : 'AK'
  const chipTitle = isAdmin ? 'Madina Ergasheva' : 'Ali Karimov · 5 yosh'
  const chipSubtitle = isAdmin ? 'Logoped · bugun 4 ta dars' : 'Tovush talaffuzi · S tovushi'
  const chipMetaLabel = isAdmin ? 'Maosh' : 'Joriy'
  const chipMetaValue = isAdmin ? '1 240 000' : '75%'

  const formSubtitle = isAdmin
    ? 'Email va parolingizni kiriting'
    : 'Telefon raqami va parolingizni kiriting'
  const idLabel = isAdmin ? 'Email' : 'Telefon raqami'
  const idType = isAdmin ? 'email' : 'tel'
  const idPlaceholder = isAdmin ? 'ism@bogchamiz.uz' : '+998 __ ___ __ __'

  const footerText = isAdmin
    ? '© 2026 · LOGOEDU'
    : "Parolni bog'cha administratoridan oling"

  // ── styles ──
  const tabBtn = (active: boolean): CSSProperties => ({
    position: 'relative',
    zIndex: 1,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    padding: 10,
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    color: active ? '#0f1e16' : '#6b7280',
    transition: 'color .28s ease',
    background: 'transparent',
    border: 'none',
    fontFamily: 'inherit',
  })

  const fieldBase: CSSProperties = {
    width: '100%',
    fontFamily: 'inherit',
    padding: '13px 16px 13px 42px',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
    color: '#1f2937',
    background: '#fff',
    outline: 'none',
    transition: 'border-color .15s, box-shadow .15s',
  }
  const idInputStyle: CSSProperties = {
    ...fieldBase,
    border: `1.5px solid ${idError ? '#ef4444' : '#e9ecf1'}`,
    boxShadow: idError ? '0 0 0 4px rgba(239,68,68,0.08)' : undefined,
  }
  const pwInputStyle: CSSProperties = {
    ...fieldBase,
    paddingRight: 44,
    border: `1.5px solid ${pwError ? '#ef4444' : '#e9ecf1'}`,
    boxShadow: pwError ? '0 0 0 4px rgba(239,68,68,0.08)' : undefined,
  }

  const submitBase: CSSProperties = {
    background: '#32a86f',
    color: '#fff',
    border: 'none',
    padding: 14,
    borderRadius: 13,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    boxShadow: '0 8px 22px -8px rgba(50,168,111,0.55)',
    transition: 'transform .12s',
  }
  const submitStyle: CSSProperties = loading
    ? { ...submitBase, opacity: 0.85, cursor: 'default' }
    : submitBase

  const successName = success ? creds[success].name : ''

  return (
    <div
      style={{
        minHeight: '100vh',
        background: pageBg,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        transition: 'background .6s ease',
      }}
    >
      {/* ─── playful background ─── */}
      {/* soft blurred backdrop blobs */}
      <div
        style={{
          position: 'absolute',
          top: -160,
          left: -120,
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: blob1,
          filter: 'blur(60px)',
          opacity: 0.5,
          animation: 'lp-blob 14s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -180,
          right: -140,
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: blob2,
          filter: 'blur(70px)',
          opacity: 0.4,
          animation: 'lp-blob 18s ease-in-out infinite reverse',
        }}
      />

      {/* big soft circle (top-left) */}
      <div
        style={{
          position: 'absolute',
          top: 70,
          left: 80,
          width: 130,
          height: 130,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #fef3c7, #fde68a)',
          opacity: 0.7,
          animation: 'lp-bob 9s ease-in-out infinite',
        }}
      />

      {/* big radial circle (bottom-right) */}
      <div
        style={{
          position: 'absolute',
          bottom: 90,
          right: 90,
          width: 150,
          height: 150,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #e0f2fe, #bae6fd)',
          opacity: 0.75,
          animation: 'lp-bob 11s ease-in-out infinite reverse',
        }}
      />

      {/* rotated rounded square (bottom-left, pink) */}
      <div
        style={{
          position: 'absolute',
          bottom: 130,
          left: 110,
          width: 90,
          height: 90,
          borderRadius: 26,
          background: '#fce7f3',
          opacity: 0.85,
          animation: 'lp-float-c 8s ease-in-out infinite',
        }}
      />

      {/* rotated rounded square (top-right, mint) */}
      <div
        style={{
          position: 'absolute',
          top: 130,
          right: 160,
          width: 78,
          height: 78,
          borderRadius: 22,
          background: '#e8f6ef',
          opacity: 0.9,
          animation: 'lp-float-b 10s ease-in-out infinite',
        }}
      />

      {/* yellow star */}
      <div
        style={{
          position: 'absolute',
          top: 160,
          right: 64,
          animation: 'lp-float-a 7s ease-in-out infinite',
        }}
      >
        <svg width="46" height="46" viewBox="0 0 24 24" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.4" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </div>

      {/* pink heart */}
      <div
        style={{
          position: 'absolute',
          bottom: 200,
          right: 240,
          animation: 'lp-float-c 9s ease-in-out infinite',
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="#f472b6" stroke="#db2777" strokeWidth="1.4" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>

      {/* mint cloud */}
      <div
        style={{
          position: 'absolute',
          top: 280,
          left: 40,
          animation: 'lp-bob 8s ease-in-out infinite',
        }}
      >
        <svg width="64" height="40" viewBox="0 0 64 40" fill="none">
          <ellipse cx="20" cy="26" rx="16" ry="13" fill="#bce6cf" />
          <ellipse cx="36" cy="22" rx="18" ry="16" fill="#bce6cf" />
          <ellipse cx="50" cy="28" rx="13" ry="11" fill="#bce6cf" />
        </svg>
      </div>

      {/* little balloon (top-center) */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'lp-bob 6s ease-in-out infinite',
        }}
      >
        <svg width="40" height="56" viewBox="0 0 40 56" fill="none">
          <ellipse cx="20" cy="20" rx="16" ry="18" fill="#fda4af" />
          <path d="M20 38 L18 42 L22 42 Z" fill="#fda4af" />
          <line x1="20" y1="42" x2="20" y2="55" stroke="#9ca3af" strokeWidth="0.8" />
        </svg>
      </div>

      {/* little dots */}
      <div style={{ position: 'absolute', bottom: 220, left: 70, width: 16, height: 16, borderRadius: '50%', background: '#38bdf8', animation: 'lp-pulse-dot 4s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: 320, left: 220, width: 10, height: 10, borderRadius: '50%', background: '#32a86f', animation: 'lp-pulse-dot 5s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: 240, right: 320, width: 12, height: 12, borderRadius: '50%', background: '#fbbf24', animation: 'lp-pulse-dot 6s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: 80, right: 280, width: 14, height: 14, borderRadius: '50%', background: '#c084fc', animation: 'lp-pulse-dot 4.5s ease-in-out infinite' }} />

      {/* tiny twinkles */}
      <div style={{ position: 'absolute', top: 100, right: 280, animation: 'lp-twinkle 3s ease-in-out infinite' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#a78bfa">
          <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
        </svg>
      </div>
      <div style={{ position: 'absolute', bottom: 280, left: 290, animation: 'lp-twinkle 4s ease-in-out infinite' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#34d399">
          <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
        </svg>
      </div>

      {/* ABC letters */}
      <div style={{ position: 'absolute', top: 380, right: 50, fontSize: 38, fontWeight: 800, color: '#fbbf24', opacity: 0.35, transform: 'rotate(-15deg)', animation: 'lp-bob 7s ease-in-out infinite' }}>A</div>
      <div style={{ position: 'absolute', bottom: 50, left: 240, fontSize: 32, fontWeight: 800, color: '#38bdf8', opacity: 0.35, transform: 'rotate(10deg)', animation: 'lp-bob 8s ease-in-out infinite' }}>B</div>
      <div style={{ position: 'absolute', top: 420, left: 100, fontSize: 30, fontWeight: 800, color: '#f472b6', opacity: 0.35, transform: 'rotate(-8deg)', animation: 'lp-bob 9s ease-in-out infinite' }}>1</div>

      {/* ─── CARD ─── */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 940,
          background: '#ffffff',
          borderRadius: 28,
          boxShadow: '0 1px 2px rgba(15,30,22,0.04), 0 30px 80px -30px rgba(15,30,22,0.25)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '1.05fr 1fr',
          minHeight: 580,
        }}
      >
        {/* LEFT: marketing */}
        <div
          style={{
            background: leftBg,
            padding: '44px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: '#0f1e16',
            position: 'relative',
            overflow: 'hidden',
            transition: 'background .5s ease',
          }}
        >
          <div
            key={`hero-${role}`}
            style={{ animation: 'lp-fade-up .45s cubic-bezier(.16,1,.3,1) both' }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 11px',
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(8px)',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                color: '#21764e',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                marginBottom: 24,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#32a86f' }} />
              {heroTag}
            </div>
            <h1 style={{ margin: '0 0 14px', fontSize: 32, fontWeight: 800, letterSpacing: '-0.8px', lineHeight: 1.15, color: '#0f1e16' }}>
              {heroTitle}
            </h1>
            <p style={{ margin: '0 0 28px', fontSize: 14, lineHeight: 1.55, color: '#4b5563', maxWidth: 320 }}>
              {heroSubtitle}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {heroPoints.map((p, i) => (
                <div
                  key={p}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#1f2937',
                    animation: 'lp-fade-up .5s cubic-bezier(.16,1,.3,1) both',
                    animationDelay: `${0.08 + i * 0.06}s`,
                  }}
                >
                  <span style={{ width: 22, height: 22, borderRadius: 7, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#21764e', flexShrink: 0, boxShadow: '0 4px 10px -4px rgba(33,118,78,0.3)' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* preview chip */}
          <div
            key={`chip-${role}`}
            style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: 16,
              boxShadow: '0 10px 30px -12px rgba(15,30,22,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginTop: 32,
              animation: 'lp-fade-up .55s cubic-bezier(.16,1,.3,1) both',
              animationDelay: '.18s',
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 13, background: chipAvatarBg, color: chipAvatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>
              {chipInit}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f1e16' }}>{chipTitle}</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{chipSubtitle}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase' }}>{chipMetaLabel}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#21764e' }}>{chipMetaValue}</div>
            </div>
          </div>
        </div>

        {/* RIGHT: form */}
        <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column' }}>
          {/* tab switch */}
          <div
            style={{
              position: 'relative',
              background: '#f1f3f6',
              borderRadius: 12,
              padding: 4,
              display: 'flex',
              gap: 2,
              marginBottom: 28,
              overflow: 'hidden',
            }}
          >
            {/* sliding pill indicator */}
            <span
              aria-hidden
              style={{
                position: 'absolute',
                top: 4,
                bottom: 4,
                left: 4,
                width: 'calc(50% - 4px)',
                background: '#ffffff',
                borderRadius: 9,
                boxShadow: '0 2px 6px -2px rgba(15,30,22,0.12), 0 1px 2px rgba(15,30,22,0.04)',
                transform: isAdmin ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform .42s cubic-bezier(.65,.05,.36,1)',
                zIndex: 0,
              }}
            />
            <button type="button" onClick={() => pickRole('admin')} style={tabBtn(isAdmin)}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: isAdmin ? 'scale(1.08) rotate(0deg)' : 'scale(1) rotate(-6deg)',
                  transition: 'transform .35s cubic-bezier(.65,.05,.36,1)',
                }}
              >
                <rect x="3" y="3" width="7" height="9" />
                <rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" />
                <rect x="3" y="16" width="7" height="5" />
              </svg>
              Admin
            </button>
            <button type="button" onClick={() => pickRole('parent')} style={tabBtn(isParent)}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: isParent ? 'scale(1.08) rotate(0deg)' : 'scale(1) rotate(6deg)',
                  transition: 'transform .35s cubic-bezier(.65,.05,.36,1)',
                }}
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              </svg>
              Ota-ona
            </button>
          </div>

          <div style={{ marginBottom: 22 }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#0f1e16', letterSpacing: '-0.5px' }}>
              Tizimga kirish
            </h2>
            <p
              key={`sub-${role}`}
              style={{
                margin: 0,
                fontSize: 13,
                color: '#6b7280',
                animation: 'lp-fade-side .35s ease both',
              }}
            >
              {formSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
            {/* identifier */}
            <div key={`id-${role}`} style={{ animation: 'lp-fade-side .4s ease both' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 6, letterSpacing: 0.3 }}>
                {idLabel}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={idType}
                  value={idValue}
                  onChange={(e) => { setIdValue(e.target.value); setIdError(null) }}
                  placeholder={idPlaceholder}
                  style={idInputStyle}
                />
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: idError ? '#ef4444' : '#9ca3af', display: 'flex' }}>
                  {isAdmin ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  )}
                </span>
              </div>
              {idError && (
                <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {idError}
                </div>
              )}
            </div>

            {/* password */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', letterSpacing: 0.3 }}>Parol</label>
                <span onClick={(e) => { e.preventDefault(); setForgotOpen(true) }} style={{ fontSize: 12, color: '#32a86f', fontWeight: 700, cursor: 'pointer' }}>
                  Unutdingizmi?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={pwHidden ? 'password' : 'text'}
                  value={pwValue}
                  onChange={(e) => { setPwValue(e.target.value); setPwError(null) }}
                  placeholder="••••••••"
                  style={pwInputStyle}
                />
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: pwError ? '#ef4444' : '#9ca3af', display: 'flex' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <span onClick={() => setPwHidden((v) => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', cursor: 'pointer', padding: 4, display: 'flex' }}>
                  {pwHidden ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </span>
              </div>
              {pwError && (
                <div style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {pwError}
                </div>
              )}
            </div>

            {/* submit */}
            <button type="submit" disabled={loading} style={submitStyle}>
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.35)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'lp-spin .8s linear infinite', display: 'inline-block' }} />
                  Tekshirilmoqda...
                </>
              ) : (
                <>
                  Kirish
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
            <div
              key={`footer-${role}`}
              style={{
                textAlign: 'center',
                fontSize: 12,
                color: '#9ca3af',
                marginTop: 'auto',
                paddingTop: 8,
                animation: 'lp-fade-side .35s ease both',
              }}
            >
              {footerText}
            </div>
          </form>
        </div>
      </div>

      {/* forgot modal */}
      {forgotOpen && (
        <div
          onClick={() => setForgotOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(15,30,22,0.4)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 380, padding: 28, animation: 'lp-pop .25s cubic-bezier(.16,1,.3,1)' }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#e8f6ef', color: '#21764e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f1e16', marginBottom: 6 }}>Parol unutildimi?</div>
            <p style={{ margin: '0 0 20px', fontSize: 13, lineHeight: 1.55, color: '#6b7280' }}>
              Parolingizni tiklash uchun bog'cha administratoriga murojaat qiling — yangi parol sizning telefoningizga yuboriladi.
            </p>
            <button
              onClick={() => setForgotOpen(false)}
              style={{ width: '100%', background: '#32a86f', color: '#fff', border: 'none', padding: 12, borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              Tushunarli
            </button>
          </div>
        </div>
      )}

      {/* success splash */}
      {success && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(15,30,22,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 22, padding: '38px 36px', maxWidth: 380, width: '100%', textAlign: 'center', animation: 'lp-pop .35s cubic-bezier(.16,1,.3,1)' }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#e8f6ef', color: '#21764e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f1e16', marginBottom: 6 }}>
              Xush kelibsiz, {successName}!
            </div>
            <p style={{ margin: '0 0 22px', fontSize: 13, lineHeight: 1.55, color: '#6b7280' }}>
              {success === 'admin'
                ? "Admin paneliga yo'naltirilmoqda — bir lahza..."
                : "Ota-ona kabinetiga yo'naltirilmoqda..."}
            </p>
            <button
              onClick={() => {
                setSuccess(null)
                navigate('/')
              }}
              style={{ display: 'inline-block', background: '#32a86f', color: '#fff', border: 'none', padding: '12px 22px', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              {success === 'admin' ? "Admin panelga o'tish" : 'Kabinetga kirish'} →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
