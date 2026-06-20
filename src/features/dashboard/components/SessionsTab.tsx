import { useState } from 'react';
import { useSessions, useEndSession } from '../../auth/api/useSessionsQuery';
import { authApi } from '../../auth/api/authApi';
import { useAuthStore } from '../../auth/store/authStore';
import type { Session } from '../../auth/api/authApi';
import s from './SessionsTab.module.css';

function deviceIcon(ua: string): { tag: string; color: string } {
  const l = ua.toLowerCase();
  if (l.includes('iphone') || l.includes('ios')) return { tag: 'iOS', color: '#149c95' };
  if (l.includes('ipad')) return { tag: 'iPad', color: '#e0568f' };
  if (l.includes('mac')) return { tag: 'Mac', color: '#5d4ee6' };
  if (l.includes('windows')) return { tag: 'Win', color: '#4f5b76' };
  if (l.includes('android')) return { tag: 'And', color: '#3f9b5e' };
  if (l.includes('linux')) return { tag: 'Lin', color: '#7b5cf0' };
  return { tag: 'Web', color: '#8e8d99' };
}

function parseDevice(ua: string): { device: string; browser: string } {
  if (ua.includes('Chrome')) return { device: ua.includes('Mac') ? 'MacBook' : ua.includes('Windows') ? 'Windows ПК' : 'Браузер', browser: 'Chrome' };
  if (ua.includes('Firefox')) return { device: ua.includes('Windows') ? 'Windows ПК' : 'Браузер', browser: 'Firefox' };
  if (ua.includes('Safari') && !ua.includes('Chrome')) return { device: ua.includes('iPhone') ? 'iPhone' : ua.includes('iPad') ? 'iPad' : 'Mac', browser: 'Safari' };
  return { device: 'Устройство', browser: ua.slice(0, 30) || 'Браузер' };
}

function formatDate(dateStr: string): string {
  const diffMin = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diffMin < 5) return 'Активна сейчас';
  if (diffMin < 60) return `${diffMin} мин назад`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH} ч назад`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'Вчера';
  return `${diffD} дней назад`;
}

export default function SessionsTab() {
  const { data, isLoading } = useSessions();
  const endSession = useEndSession();
  const getAccessToken = useAuthStore(st => st.getAccessToken);
  const [endingAll, setEndingAll] = useState(false);
  const sessions = data?.sessions ?? [];

  const endAllOthers = async () => {
    setEndingAll(true);
    const token = await getAccessToken();
    if (!token) return;
    const others = sessions.slice(1);
    for (const sess of others) {
      try { await authApi.logout(sess.id); } catch { /* skip */ }
    }
    endSession.reset();
    setEndingAll(false);
    // refetch handled by invalidation inside useEndSession, trigger manual
    window.location.reload();
  };

  if (isLoading) return <div className={s.loading}>Загрузка сессий…</div>;

  if (!sessions.length) {
    return (
      <div className={s.empty}>
        <div className={s.emptyTitle}>Нет активных сессий</div>
        <p className={s.emptyText}>Информация о сессиях временно недоступна.</p>
      </div>
    );
  }

  return (
    <>
      <div className={`${s.header} lq-sess-head`}>
        <div>
          <h2 className={s.title}>Активные сессии</h2>
          <p className={s.description}>Устройства, на которых выполнен вход в ваш аккаунт. Если узнаёте не всё — завершите лишние сессии.</p>
        </div>
        {sessions.length > 1 && (
          <button className={s.endAllBtn} onClick={endAllOthers} disabled={endingAll}>
            {endingAll ? 'Завершение…' : 'Завершить все остальные'}
          </button>
        )}
      </div>

      <div className={s.list}>
        {sessions.map((sess: Session, i: number) => {
          const current = i === 0;
          const { tag, color } = deviceIcon(sess.user_agent);
          const { device, browser } = parseDevice(sess.user_agent);
          const lastActive = formatDate(sess.created_at);

          return (
            <div key={sess.id} className={i === 0 ? s.row : s.rowBorder}>
              <div className={s.icon} style={{ background: color + '1f', color }}>{tag}</div>
              <div className={s.info}>
                <div className={s.deviceRow}>
                  <span className={s.deviceName}>{device}</span>
                  {current && <span className={s.currentBadge}>Это устройство</span>}
                </div>
                <div className={s.browser}>{browser}</div>
                <div className={s.meta}>
                  <span className={current ? s.dotOnline : s.dotOffline} />
                  <span className={current ? s.lastOnline : s.lastOffline}>{lastActive}</span>
                  <span>·</span>
                  <span>IP {sess.ip_address}</span>
                </div>
              </div>
              {current ? (
                <span className={s.placeholder}>—</span>
              ) : (
                <button
                  className={s.endBtn}
                  disabled={endSession.isPending}
                  onClick={() => endSession.mutate(sess.id)}
                >{endSession.isPending ? '…' : 'Завершить'}</button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
