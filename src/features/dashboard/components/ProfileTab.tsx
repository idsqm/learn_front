import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { authApi } from '../../auth/api/authApi';
import { uploadFile } from '../../../shared/api/filesApi';
import s from './ProfileTab.module.css';

export default function ProfileTab() {
  const user = useAuthStore(st => st.user);
  const fetchUser = useAuthStore(st => st.fetchUser);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : 'АП';

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const { downloadUrl } = await uploadFile(file, 'image');
      await authApi.updateAvatar(downloadUrl);
      await fetchUser();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={s.card}>
      <h2 className={s.title}>Профиль</h2>
      <div className={s.row}>
        {user?.avatarUrl
          ? <img className={s.avatarImg} src={user.avatarUrl} alt="Аватар" />
          : <div className={s.avatarPlaceholder}>{initials}</div>}
        <div>
          <div className={s.name}>{user?.username || 'Пользователь'}</div>
          <div className={s.email}>{user?.email || ''}</div>
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleChange} />
          <button className={s.uploadBtn} onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Загрузка…' : 'Изменить фото'}
          </button>
        </div>
      </div>
    </div>
  );
}
