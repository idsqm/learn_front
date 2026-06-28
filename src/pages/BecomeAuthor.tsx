import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import { authApi } from '../features/auth/api/authApi';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  fontSize: 15,
  border: '1.5px solid #e5e5ea',
  borderRadius: 10,
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#1a1a2e',
  marginBottom: 6,
  display: 'block',
};

export default function BecomeAuthor() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, user } = useAuthStore();
  const fetchUser = useAuthStore(s => s.fetchUser);

  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [bio, setBio] = useState('');
  const [years, setYears] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/');
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === 'author') navigate('/studio');
  }, [authLoading, isAuthenticated, user?.role, navigate]);

  if (authLoading || !isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await authApi.applyAsAuthor({
        name: name.trim(),
        subtitle: subtitle.trim(),
        bio: bio.trim(),
        years_experience: parseInt(years) || 0,
      });
      await fetchUser();
      navigate('/studio');
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Не удалось создать профиль. Попробуйте позже.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fbfbfd', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', maxWidth: 520, width: '100%', padding: '48px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #6a5cf0, #9183f7)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10 12 5 2 10l10 5 10-5Z" />
              <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', margin: '0 0 8px' }}>Станьте автором</h1>
          <p style={{ fontSize: 15, color: '#6b6a76', margin: 0, lineHeight: 1.5 }}>Расскажите о себе — эта информация будет видна на страницах ваших курсов.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={labelStyle}>Имя и фамилия *</label>
            <input style={inputStyle} placeholder="Алексей Петров" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Специализация</label>
            <input style={inputStyle} placeholder="Профессиональный фотограф" value={subtitle} onChange={e => setSubtitle(e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>О себе</label>
            <textarea
              style={{ ...inputStyle, minHeight: 100, resize: 'vertical', fontFamily: 'inherit' }}
              placeholder="Расскажите о своём опыте и чему вы хотите учить..."
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Лет опыта</label>
            <input style={{ ...inputStyle, maxWidth: 120 }} type="number" min="0" max="50" placeholder="5" value={years} onChange={e => setYears(e.target.value)} />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#dc2626' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            style={{
              width: '100%', padding: '14px 24px', fontSize: 15, fontWeight: 600, color: '#fff',
              background: submitting || !name.trim() ? '#a5a0e4' : 'linear-gradient(135deg, #6a5cf0, #7c6ef7)',
              border: 'none', borderRadius: 10, cursor: submitting || !name.trim() ? 'not-allowed' : 'pointer',
              marginTop: 4,
            }}
          >
            {submitting ? 'Создание профиля...' : 'Стать автором'}
          </button>

          <button type="button" onClick={() => navigate('/')} style={{ width: '100%', padding: '12px 24px', fontSize: 14, fontWeight: 500, color: '#6b6a76', background: 'transparent', border: 'none', borderRadius: 10, cursor: 'pointer' }}>
            Вернуться на главную
          </button>
        </form>
      </div>
    </div>
  );
}
