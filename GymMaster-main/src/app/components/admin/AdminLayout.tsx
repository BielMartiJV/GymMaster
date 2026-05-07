import { NavLink, Outlet } from "react-router";
import { LayoutDashboard, Users, UserCog, CalendarClock, ClipboardList } from "lucide-react";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/socis", label: "Socis", icon: Users },
  { to: "/admin/entrenadors", label: "Entrenadors", icon: UserCog },
  { to: "/admin/classes", label: "Classes", icon: CalendarClock },
  { to: "/admin/reserves", label: "Reserves", icon: ClipboardList },
];

export function AdminLayout() {
  return (
    <section className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Panell d'administracio</h1>
          <p className="text-slate-600 mt-2">Gestio centralitzada de socis, entrenadors, classes i reserves.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <aside className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-3 h-fit">
            <nav className="space-y-1">
              {adminLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-sky-100 text-sky-700"
                          : "text-slate-700 hover:bg-slate-100"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </aside>

          <div className="lg:col-span-4">
            <Outlet />
          </div>
        </div>
      </div>
    </section>
  );
}
