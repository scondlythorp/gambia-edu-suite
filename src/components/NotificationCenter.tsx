import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Notification } from '../types';
import { Bell, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface NotificationCenterProps {
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNotifications()
      .then(res => setNotifications(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 overflow-hidden">
      <div className="px-4 pb-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Notifications Center
          </h4>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {loading ? (
          <div className="p-4 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 font-medium">
            No notifications at this time.
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={`p-3.5 transition-colors ${
                n.read ? 'bg-white opacity-70' : 'bg-blue-50/40'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {n.type === 'FEE_DUE' ? (
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  ) : n.type === 'RESULT_PUBLISHED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>{n.title}</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">{n.message}</p>
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="mt-2 text-[10px] font-semibold text-blue-600 hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
