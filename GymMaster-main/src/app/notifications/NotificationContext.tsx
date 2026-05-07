import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../auth/AuthContext";

export type Notification = {
  id_notificacio: number;
  id_soci: number;
  id_admin: number | null;
  titol: string;
  missatge: string;
  data_enviament: string;
  llegida: number; // 0 or 1
  tipus: "informativa" | "reserva" | "pagament" | "urgent";
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, apiFetch, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await apiFetch("/notificacions");
      const data = await res.json();
      if (data.ok) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error("Error refreshing notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshNotifications();
      // Polling every 2 minutes
      const interval = setInterval(refreshNotifications, 120000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, refreshNotifications]);

  const markAsRead = async (id: number) => {
    try {
      const res = await apiFetch(`/notificacions/${id}/read`, { method: "PATCH" });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id_notificacio === id ? { ...n, llegida: 1 } : n))
        );
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await apiFetch("/notificacions/read-all", { method: "PATCH" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, llegida: 1 })));
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const res = await apiFetch(`/notificacions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id_notificacio !== id));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.llegida === 0).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
    }),
    [notifications, unreadCount, loading, refreshNotifications]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications s'ha d'utilitzar dins de NotificationProvider");
  }
  return ctx;
}
