import { Outlet, Link, useLocation } from "react-router";
import { Dumbbell, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { cn } from "./ui/utils";
import { NotificationBell } from "./notifications/NotificationBell";
import { DownloadApp } from "./DownloadApp";


export function Root() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  const navItems = [
    { path: "/", label: "Inici" },
    { path: "/classes", label: "Classes" },
    { path: "/pricing", label: "Tarifes" },
    { path: "/trainers", label: "Entrenadors" },
    { path: "/contact", label: "Contacte" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="text-white sticky top-0 z-50" style={{ backgroundColor: "#1B263B" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Dumbbell className="w-8 h-8" style={{ color: "#00B4D8" }} />
              <span className="text-xl">Gym<strong>Master</strong></span>
            </Link>

            <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "transition-all duration-200 hover:text-gymmaster-accent",
                    isActive(item.path) ? "text-gymmaster-accent" : "text-white"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated && <NotificationBell />}
              {isAuthenticated ? (
                <>
                  {isAdmin ? (
                    <Link to="/admin" className="transition-colors" style={{ color: isActive("/admin") ? "#00B4D8" : "white" }}>
                      Administració
                    </Link>
                  ) : null}
                  {!isAdmin ? (
                    <Link to="/el-meu-compte" className="transition-colors" style={{ color: isActive("/el-meu-compte") ? "#00B4D8" : "white" }}>
                      El meu compte
                    </Link>
                  ) : null}
                  <span className="text-sm text-gray-200">{user?.name}</span>
                  <button
                    className="px-6 py-2 rounded-md transition-all duration-200 text-white font-semibold bg-gymmaster-accent hover:bg-gymmaster-accent-dark hover:shadow-lg hover:shadow-gymmaster-accent/20 active:scale-95"
                    onClick={logout}
                  >
                    Tancar sessió
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className={cn(
                      "px-6 py-2 rounded-md border border-white transition-all duration-200 text-white font-semibold hover:bg-white/12 active:scale-95",
                      isActive("/register") ? "bg-white/10" : "bg-transparent"
                    )}
                  >
                    Registre
                  </Link>
                  <Link
                    to="/login"
                    className="px-6 py-2 rounded-md transition-all duration-200 text-white font-semibold bg-gymmaster-accent hover:bg-gymmaster-accent-dark hover:shadow-lg hover:shadow-gymmaster-accent/20 active:scale-95"
                  >
                    Iniciar sessió
                  </Link>
                </>
              )}
            </div>

            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/20">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} className="block py-2 transition-colors" style={{ color: isActive(item.path) ? "#00B4D8" : "white" }} onClick={() => setMobileMenuOpen(false)}>
                  {item.label}
                </Link>
              ))}

              <div className="flex items-center gap-4 px-4 py-3 border-b border-white/10">
                {isAuthenticated && <NotificationBell />}
                <span className="text-sm font-semibold text-gymmaster-accent">Notificacions</span>
              </div>

              {isAuthenticated ? (
                <>
                  {isAdmin ? (
                    <Link to="/admin" className="block py-2 transition-colors" style={{ color: isActive("/admin") ? "#00B4D8" : "white" }} onClick={() => setMobileMenuOpen(false)}>
                      Administració
                    </Link>
                  ) : null}
                  {!isAdmin ? (
                    <Link to="/el-meu-compte" className="block py-2 transition-colors" style={{ color: isActive("/el-meu-compte") ? "#00B4D8" : "white" }} onClick={() => setMobileMenuOpen(false)}>
                      El meu compte
                    </Link>
                  ) : null}
                  <button
                    className="block mt-4 w-full px-6 py-2 rounded-md transition-colors text-center text-white font-semibold"
                    style={{ backgroundColor: "#00B4D8" }}
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Tancar sessió
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className={cn(
                      "block mt-4 px-6 py-2 rounded-md border border-white transition-all duration-200 text-center text-white font-semibold hover:bg-white/12 active:scale-[0.98]",
                      isActive("/register") ? "bg-white/10" : "bg-transparent"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Registre
                  </Link>
                  <Link
                    to="/login"
                    className="block mt-4 px-6 py-2 rounded-md transition-all duration-200 text-center text-white font-semibold bg-gymmaster-accent hover:bg-gymmaster-accent-dark hover:shadow-lg active:scale-[0.98]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Iniciar sessió
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="text-white py-12" style={{ backgroundColor: "#1B263B" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Dumbbell className="w-6 h-6" style={{ color: "#00B4D8" }} />
                <span className="font-bold text-lg">Gym<strong>Master</strong></span>
              </div>
              <p className="text-gray-300 text-sm">Gimnas a Barcelona especialitzat en forca, condicionament i benestar.</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Navegació</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/" className="hover:text-[#00B4D8] transition-colors">Inici</Link></li>
                <li><Link to="/classes" className="hover:text-[#00B4D8] transition-colors">Classes</Link></li>
                <li><Link to="/pricing" className="hover:text-[#00B4D8] transition-colors">Tarifes</Link></li>
                <li><Link to="/trainers" className="hover:text-[#00B4D8] transition-colors">Entrenadors</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Horaris</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Dilluns - Divendres: 6:00 - 22:00</li>
                <li>Dissabte: 8:00 - 20:00</li>
                <li>Diumenge: 9:00 - 18:00</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contacte</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Tel: +34 900 123 456</li>
                <li>Email: info@gymmaster.com</li>
                <li>Carrer Principal 123, Barcelona</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 GymMaster Barcelona · <Link to="/contact" className="hover:text-[#00B4D8] transition-colors">Avís legal</Link></p>
          </div>
        </div>
      </footer>
      <DownloadApp />
    </div>
  );
}
