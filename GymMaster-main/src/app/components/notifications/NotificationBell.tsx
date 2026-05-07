import { useState, useRef, useEffect } from "react";
import { Bell, X, Trash2, MailOpen, Mail } from "lucide-react";
import { useNotifications } from "../../notifications/NotificationContext";
import { cn } from "../ui/utils";
import { formatDistanceToNow } from "date-fns";
import { ca } from "date-fns/locale";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full transition-all duration-200 hover:bg-white/10 active:scale-95"
        title="Notificacions"
      >
        <Bell className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-[#1B263B]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden z-[60] animate-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Notificacions</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-xs text-gymmaster-accent hover:text-gymmaster-accent-dark font-medium"
                >
                  Llegir totes
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 italic">
                No tens cap notificació.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((n) => (
                  <div
                    key={n.id_notificacio}
                    className={cn(
                      "p-4 transition-colors hover:bg-gray-50 flex gap-3 group relative",
                      n.llegida === 0 ? "bg-blue-50/50" : "bg-white"
                    )}
                    onClick={() => n.llegida === 0 && markAsRead(n.id_notificacio)}
                  >
                    <div className={cn(
                      "mt-1 h-2 w-2 rounded-full flex-shrink-0",
                      n.llegida === 0 ? "bg-gymmaster-accent" : "bg-transparent"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 mb-0.5">{n.titol}</p>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-2">{n.missatge}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                        {formatDistanceToNow(new Date(n.data_enviament), { addSuffix: true, locale: ca })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id_notificacio);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all duration-200"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t bg-gray-50 text-center">
            <button 
              className="text-xs font-bold text-gray-500 hover:text-gymmaster-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Tancar notificacions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
