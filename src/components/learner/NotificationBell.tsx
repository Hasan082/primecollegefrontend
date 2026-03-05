import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle2, AlertTriangle, MessageSquare, Info, FileText, Timer, AlertCircle } from "lucide-react";
import { mockNotifications, NotificationData } from "@/data/notificationsMockData";
import { useNavigate } from "react-router-dom";

const typeIcon: Record<NotificationData["type"], typeof Bell> = {
  feedback: MessageSquare,
  resubmission: AlertTriangle,
  competent: CheckCircle2,
  system: Info,
  resource: FileText,
  deadline_warning: Timer,
  deadline_urgent: AlertCircle,
  deadline_overdue: AlertTriangle,
};

const typeColor: Record<NotificationData["type"], string> = {
  feedback: "text-blue-500",
  resubmission: "text-orange-500",
  competent: "text-green-500",
  system: "text-muted-foreground",
  resource: "text-purple-500",
  deadline_warning: "text-amber-500",
  deadline_urgent: "text-destructive",
  deadline_overdue: "text-destructive",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = (n: NotificationData) => {
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    if (n.link) {
      setOpen(false);
      navigate(n.link);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-sidebar-accent transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-[28rem] bg-card border border-border rounded-xl shadow-xl z-50 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No notifications yet</p>
            ) : (
              notifications.map((n) => {
                const Icon = typeIcon[n.type];
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left flex gap-3 px-4 py-3 hover:bg-muted/60 transition-colors border-b border-border/50 last:border-0 ${!n.read ? "bg-primary/5" : ""}`}
                  >
                    <div className={`mt-0.5 flex-shrink-0 ${typeColor[n.type]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                          {n.title}
                        </span>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <span className="text-[11px] text-muted-foreground/70 mt-1 block">{timeAgo(n.timestamp)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
