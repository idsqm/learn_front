import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { AuthApiError } from '../api/authApi';
import LogoIcon from '../../../shared/components/LogoIcon';
import s from './AuthModal.module.css';

interface Props {
  mode: 'login' | 'register';
  onClose: () => void;
  onSwitch: () => void;
}

export default function AuthModal({ mode, onClose, onSwitch }: Props) {
  const { login, register } = useAuthStore();
  const isLogin = mode === 'login';
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (isLogin) emailRef.current?.focus();
      else nameRef.current?.focus();
    });
  }, [mode]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async () => {
    setError('');
    setFieldErrors({});
    setSuccessMsg('');

    if (!email || !password) { setError('Заполните все обязательные поля'); return; }
    if (!isLogin && !name) { setError('Укажите имя'); return; }
    if (!isLogin && password !== confirmPassword) { setError('Пароли не совпадают'); return; }
    if (!isLogin && !agreed) { setError('Необходимо принять условия'); return; }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        onClose();
      } else {
        await register(name, email, password);
        setSuccessMsg('Регистрация прошла успешно! Проверьте почту для подтверждения.');
      }
    } catch (err) {
      if (err instanceof AuthApiError) {
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
        else if (err.code === 'EMAIL_NOT_VERIFIED') setError('Подтвердите email перед входом. Проверьте почту.');
        else if (err.code === 'INVALID_CREDENTIALS') setError('Неверный email или пароль');
        else setError(err.message);
      } else {
        setError('Ошибка сети. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderFieldError = (field: string) => {
    const errs = fieldErrors[field];
    if (!errs?.length) return null;
    return (
      <div className={s.fieldError}>
        {errs.map(e => {
          if (e === 'required') return 'Обязательное поле';
          if (e === 'unique') return 'Уже используется';
          if (e.startsWith('min:')) return `Минимум ${e.split(':')[1]} символов`;
          return e;
        }).join(', ')}
      </div>
    );
  };

  const handleSwitch = () => {
    setName(''); setEmail(''); setPassword(''); setConfirmPassword(''); setAgreed(true);
    setError(''); setFieldErrors({}); setSuccessMsg('');
    onSwitch();
  };

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={e => e.stopPropagation()}>
        <button className={s.closeBtn} onClick={onClose}>✕</button>

        <div className={s.logo}>
          <LogoIcon size={36} />
          <span style={{ font: "700 18px/1 'Geist', sans-serif", letterSpacing: '-.02em' }}>LearnQuest</span>
        </div>

        <h2 className={s.title}>{isLogin ? 'С возвращением' : 'Создайте аккаунт'}</h2>
        <p className={s.subtitle}>
          {isLogin ? 'Войдите, чтобы продолжить обучение' : 'Бесплатно. Учитесь или преподавайте — выбор за вами.'}
        </p>

        {successMsg && <div className={s.alertSuccess}>{successMsg}</div>}
        {error && <div className={s.alertError}>{error}</div>}

        {!successMsg && (
          <>
            <div className={s.fields}>
              {!isLogin && (
                <div>
                  <label className={s.label}>Имя</label>
                  <input ref={nameRef} tabIndex={1} className={fieldErrors.username ? s.inputError : s.input} placeholder="Как вас зовут?" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                  {renderFieldError('username')}
                </div>
              )}
              <div>
                <label className={s.label}>Электронная почта</label>
                <input ref={emailRef} tabIndex={2} className={fieldErrors.email ? s.inputError : s.input} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
                {renderFieldError('email')}
              </div>
              <div>
                <div className={s.passwordRow}>
                  <label className={s.label} style={{ marginBottom: 0 }}>Пароль</label>
                  {isLogin && <a className={s.forgotLink}>Забыли?</a>}
                </div>
                <input
                  tabIndex={3}
                  type="password"
                  className={fieldErrors.password ? s.inputError : s.input}
                  placeholder={isLogin ? 'Ваш пароль' : 'Минимум 8 символов'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
                {renderFieldError('password')}
              </div>
              {!isLogin && (
                <div>
                  <label className={s.label}>Подтвердите пароль</label>
                  <input
                    tabIndex={4}
                    type="password"
                    className={s.input}
                    placeholder="Повторите пароль"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  />
                </div>
              )}
              {!isLogin && (
                <label className={s.checkbox} onClick={() => setAgreed(!agreed)}>
                  <span className={agreed ? s.checkboxChecked : s.checkboxUnchecked}>{agreed ? '✓' : ''}</span>
                  <span>Я принимаю <a className={s.accentLink}>условия использования</a> и <a className={s.accentLink}>политику конфиденциальности</a></span>
                </label>
              )}
            </div>

            <button tabIndex={5} className={s.submitBtn} disabled={loading} onClick={handleSubmit}>
              {loading ? 'Подождите…' : (isLogin ? 'Войти' : 'Создать аккаунт')}
            </button>
          </>
        )}

        <div className={s.switchRow}>
          {isLogin ? 'Ещё нет аккаунта? ' : 'Уже есть аккаунт? '}
          <a className={s.switchLink} onClick={handleSwitch}>{isLogin ? 'Зарегистрироваться' : 'Войти'}</a>
        </div>
      </div>
    </div>
  );
}
