import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, ExternalLink, Clock } from 'lucide-react';
import { Notification } from '../types';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';

interface NotificationPopoverProps {
  onNavigateToTeam?: (teamId: string) => void;
  onNavigateToOpportunity?: (oppId: string) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  onNavigateToTeam,
  onNavigateToOpportunity,
}) => {
  const navigate = useNavigate();
  const { currentProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!currentProfile) return;
    const list = await db.getNotifications(currentProfile.id);
    setNotifications(list);
    setUnreadCount(list.filter((n) => !n.is_read).length);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [currentProfile]);

  const handleMarkAsRead = async (notif: Notification) => {
    await db.markNotificationAsRead(notif.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    if (notif.related_entity_type === 'team' && notif.related_entity_id) {
      setIsOpen(false);
      if (onNavigateToTeam) onNavigateToTeam(notif.related_entity_id);
      navigate(`/teams/${notif.related_entity_id}`);
    } else if (
      notif.related_entity_type === 'opportunity' &&
      notif.related_entity_id
    ) {
      setIsOpen(false);
      if (onNavigateToOpportunity) onNavigateToOpportunity(notif.related_entity_id);
      navigate(`/opportunities/${notif.related_entity_id}`);
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentProfile) return;
    await db.markAllNotificationsAsRead(currentProfile.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#22e873] rounded-full ring-2 ring-black shadow-[0_0_8px_rgba(34,232,115,0.8)] animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            id="notification-dropdown-panel"
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-800 z-50 overflow-hidden backdrop-blur-xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/60">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#22e873]/10 text-[#22e873] border border-[#22e873]/30">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-zinc-400 hover:text-[#22e873] flex items-center gap-1 font-medium transition-colors"
                >
                  <Check className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-zinc-800/60">
              {notifications.length === 0 ? (
                <div className="py-8 text-center px-4">
                  <Bell className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">
                    You're all caught up
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Team requests, invitations, and updates will show here.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkAsRead(notif)}
                    className={`p-4 transition-colors cursor-pointer hover:bg-zinc-900/80 ${
                      !notif.is_read ? 'bg-[#22e873]/5' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-white">
                        {notif.title}
                      </h4>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-[#22e873] shrink-0 mt-1 shadow-[0_0_6px_rgba(34,232,115,0.6)]" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between mt-2.5 pt-1.5 text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {notif.created_at
                          ? new Date(notif.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Just now'}
                      </span>
                      {notif.related_entity_id && (
                        <span className="text-[#22e873] font-medium hover:underline flex items-center gap-0.5">
                          View details <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
