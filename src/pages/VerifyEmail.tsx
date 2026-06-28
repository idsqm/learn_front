import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../features/auth/api/authApi';
import s from './VerifyEmail.module.css';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Токен подтверждения не найден в ссылке.');
      return;
    }

    authApi.verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Ваша почта успешно подтверждена!');
      })
      .catch((err) => {
        setStatus('error');
        const msg = err?.response?.data?.error?.message || err?.response?.data?.message || 'Не удалось подтвердить почту. Возможно, ссылка устарела.';
        setMessage(msg);
      });
  }, [token]);

  return (
    <div className={s.wrap}>
      <div className={s.card}>
        {status === 'loading' && (
          <>
            <div className={s.spinner} />
            <h2 className={s.title}>Подтверждение почты...</h2>
            <p className={s.text}>Пожалуйста, подождите.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className={s.iconSuccess}>✓</div>
            <h2 className={s.title}>Готово!</h2>
            <p className={s.text}>{message}</p>
            <button className={s.btn} onClick={() => navigate('/')}>
              На главную
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className={s.iconError}>✕</div>
            <h2 className={s.title}>Ошибка</h2>
            <p className={s.text}>{message}</p>
            <button className={s.btn} onClick={() => navigate('/')}>
              На главную
            </button>
          </>
        )}
      </div>
    </div>
  );
}
