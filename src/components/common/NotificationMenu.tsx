import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';

interface UserNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  readAt: string | null;
}

interface NotificationMenuProps {
  userId: string;
}

export const NotificationMenu: React.FC<NotificationMenuProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    let isLoading = false;
    const refreshNotifications = async () => {
      if (isLoading) return;
      isLoading = true;
      try {
        const response = await fetch('/api/notifications', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (!response.ok) throw new Error('Notifications indisponibles.');
        const result = await response.json() as {
          notifications: UserNotification[];
          unreadCount: number;
        };
        if (!active) return;
        setNotifications(result.notifications);
        setUnreadCount(result.unreadCount);
        setHasLoadError(false);
      } catch {
        if (active) setHasLoadError(true);
      } finally {
        isLoading = false;
      }
    };

    void refreshNotifications();
    const intervalId = window.setInterval(() => void refreshNotifications(), 30_000);
    window.addEventListener('focus', refreshNotifications);
    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refreshNotifications);
    };
  }, [userId]);

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read', {
        method: 'PUT',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Impossible de marquer les notifications comme lues.');
      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((notification) => ({ ...notification, readAt })));
      setUnreadCount(0);
    } catch {
      setHasLoadError(true);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} non lues` : ''}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-[#0A2540] hover:bg-slate-50"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-600 px-1 text-center text-[10px] font-bold leading-5 text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section aria-label="Notifications" className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-bold text-slate-900">Notifications</h2>
            {unreadCount > 0 && (
              <button type="button" onClick={() => void markAllAsRead()} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0A3B8C] hover:underline">
                <CheckCheck className="h-3.5 w-3.5" /> Tout lire
              </button>
            )}
          </header>
          <div className="max-h-[min(65vh,28rem)] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-slate-500">
                {hasLoadError ? 'Notifications indisponibles pour le moment.' : 'Aucune notification pour le moment.'}
              </p>
            ) : (
              notifications.map((notification) => (
                <article key={notification.id} className={`border-b border-slate-100 px-4 py-3 last:border-0 ${notification.readAt ? '' : 'bg-blue-50/60'}`}>
                  <div className="flex items-start gap-2">
                    {!notification.readAt && <span aria-label="Non lue" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#0A3B8C]" />}
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-slate-900">{notification.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">{notification.message}</p>
                      <time className="mt-1.5 block text-[10px] text-slate-400" dateTime={notification.createdAt}>
                        {new Date(notification.createdAt).toLocaleString('fr-FR')}
                      </time>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
};