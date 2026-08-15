import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Bell, CheckCircle2, Wallet, Building2, TrendingUp, ShieldAlert } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
      <div className="bg-[#0B1528] text-white w-full max-w-sm h-full shadow-2xl border-l border-[#D4AF37]/30 p-5 flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/30">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-extrabold text-white tracking-wide uppercase">
                Notifications ({notifications.filter(n => !n.read).length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-[#070D1B] border border-[#D4AF37]/30 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-[#D4AF37]/20 overflow-y-auto max-h-[calc(100vh-120px)] mt-2">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`py-3.5 px-2 rounded-xl cursor-pointer transition ${
                  !n.read ? 'bg-[#112244] border border-[#D4AF37]/30' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 border border-[#D4AF37]/30 ${
                    n.type === 'deposit' ? 'bg-blue-500/20 text-blue-300' :
                    n.type === 'profit' ? 'bg-amber-500/20 text-amber-300' :
                    n.type === 'project' ? 'bg-purple-500/20 text-purple-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {n.type === 'deposit' && <Wallet className="w-4 h-4" />}
                    {n.type === 'profit' && <TrendingUp className="w-4 h-4" />}
                    {n.type === 'project' && <Building2 className="w-4 h-4" />}
                    {n.type === 'system' && <ShieldAlert className="w-4 h-4" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-amber-300">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-200 mt-1 leading-snug">
                      {n.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#070D1B] border border-[#D4AF37]/30 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
};
