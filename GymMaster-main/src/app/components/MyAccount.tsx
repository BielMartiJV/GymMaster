import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router";
import { CalendarDays, CreditCard, Trash2, AlertCircle, CheckCircle, Edit3, LogOut } from "lucide-react";

type Reserva = {
  id_reserva: number;
  nom_classe: string;
  data_classe: string;
  hora_inici: string;
  durada: number;
  sala: string;
  entrenador: string;
  activa: number;
};

type Subscripcio = {
  id_soci_sub: number;
  nom_pla: string;
  descripcio_pla: string;
  preu: number;
  data_inici: string;
  data_fi: string;
  dies_restants: number;
};

export function MyAccount() {
  const { user, logout, apiFetch, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [reserves, setReserves] = useState<Reserva[]>([]);
  const [subscripcio, setSubscripcio] = useState<Subscripcio | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [cancelMsg, setCancelMsg] = useState<{ id: number; ok: boolean; text: string } | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [profileForm, setProfileForm] = useState({
    nom: "",
    cognoms: "",
    email: "",
    telefon: "",
    password: "",
  });

  useEffect(() => {
    if (!user) return;

    setLoadingData(true);
    Promise.all([
      apiFetch("/reserves").then((r) => r.json()),
      apiFetch("/subscripcions/meva").then((r) => r.json()),
    ])
      .then(([resReserves, resSub]) => {
        if (resReserves.ok) setReserves(resReserves.data);
        if (resSub.ok) setSubscripcio(resSub.data);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [user, apiFetch]);

  useEffect(() => {
    if (!user) return;

    setProfileForm({
      nom: user.nom || user.name || "",
      cognoms: user.cognoms || "",
      email: user.email || "",
      telefon: user.telefon || "",
      password: "",
    });
  }, [user]);

  const cancellarReserva = async (id_reserva: number) => {
    setCancelMsg(null);
    const res = await apiFetch(`/reserves/${id_reserva}`, { method: "DELETE" });
    const data = await res.json();

    if (res.ok && data.ok) {
      setReserves((prev) => prev.filter((r) => r.id_reserva !== id_reserva));
      setCancelMsg({ id: id_reserva, ok: true, text: "Reserva cancel·lada correctament." });
    } else {
      setCancelMsg({ id: id_reserva, ok: false, text: data.error || "No s'ha pogut cancel·lar." });
    }
    setTimeout(() => setCancelMsg(null), 4000);
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleProfileChange = (field: keyof typeof profileForm, value: string) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const cancelProfileEdit = () => {
    if (!user) return;

    setProfileForm({
      nom: user.nom || user.name || "",
      cognoms: user.cognoms || "",
      email: user.email || "",
      telefon: user.telefon || "",
      password: "",
    });
    setProfileMsg(null);
    setIsEditingProfile(false);
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileMsg(null);

    if (!profileForm.nom.trim() || !profileForm.cognoms.trim() || !profileForm.email.trim() || !profileForm.telefon.trim()) {
      setProfileMsg({ ok: false, text: "Nom, cognoms, email i telèfon són obligatoris." });
      return;
    }

    if (profileForm.password && profileForm.password.length < 6) {
      setProfileMsg({ ok: false, text: "La contrasenya nova ha de tenir almenys 6 caràcters." });
      return;
    }

    setSavingProfile(true);
    const result = await updateProfile({
      nom: profileForm.nom,
      cognoms: profileForm.cognoms,
      email: profileForm.email,
      telefon: profileForm.telefon,
      password: profileForm.password || undefined,
    });
    setSavingProfile(false);

    if (!result.ok) {
      setProfileMsg({ ok: false, text: result.message || "No s'ha pogut actualitzar el perfil." });
      return;
    }

    setProfileForm((prev) => ({ ...prev, password: "" }));
    setIsEditingProfile(false);
    setProfileMsg({ ok: true, text: result.message || "Perfil actualitzat correctament." });
    setTimeout(() => setProfileMsg(null), 4000);
  };

  if (!user) return null;

  return (
    <section className="py-20 min-h-[70vh]" style={{ backgroundColor: "#f8fafc" }}>
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">El meu compte</h1>
              <p className="text-gray-500 text-sm mt-1">Àrea privada de soci</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {!user.isAdmin && (
                <button
                  onClick={() => {
                    setProfileMsg(null);
                    setIsEditingProfile((prev) => !prev);
                  }}
                  className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-md border border-gymmaster-primary text-gymmaster-primary hover:bg-gymmaster-primary hover:text-white hover:shadow-sm transition-all duration-200 active:scale-95"
                >
                  <Edit3 className="w-4 h-4" />
                  {isEditingProfile ? "Tancar edició" : "Editar perfil"}
                </button>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 hover:shadow-sm transition-all duration-200 active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                Tancar sessió
              </button>
            </div>
          </div>

          {profileMsg && (
            <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg text-sm ${profileMsg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {profileMsg.ok
                ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                : <AlertCircle className="w-4 h-4 flex-shrink-0" />
              }
              <span>{profileMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Nom</p>
              <p className="font-semibold">{user.nom || user.name}</p>
            </div>
            <div className="p-4 rounded-lg border bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Cognoms</p>
              <p className="font-semibold">{user.cognoms}</p>
            </div>
            <div className="p-4 rounded-lg border bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="font-semibold break-words">{user.email}</p>
            </div>
            <div className="p-4 rounded-lg border bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Telèfon</p>
              <p className="font-semibold">{user.telefon || "No informat"}</p>
            </div>
          </div>

          {isEditingProfile && !user.isAdmin && (
            <form onSubmit={handleProfileSubmit} className="mt-6 p-4 rounded-lg border border-gray-200 bg-gray-50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-nom" className="block text-sm font-semibold mb-2">Nom</label>
                  <input
                    id="profile-nom"
                    type="text"
                    value={profileForm.nom}
                    onChange={(e) => handleProfileChange("nom", e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gymmaster-accent focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="profile-cognoms" className="block text-sm font-semibold mb-2">Cognoms</label>
                  <input
                    id="profile-cognoms"
                    type="text"
                    value={profileForm.cognoms}
                    onChange={(e) => handleProfileChange("cognoms", e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gymmaster-accent focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="profile-email" className="block text-sm font-semibold mb-2">Email</label>
                  <input
                    id="profile-email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => handleProfileChange("email", e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gymmaster-accent focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="profile-telefon" className="block text-sm font-semibold mb-2">Telèfon</label>
                  <input
                    id="profile-telefon"
                    type="tel"
                    value={profileForm.telefon}
                    onChange={(e) => handleProfileChange("telefon", e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gymmaster-accent focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="profile-password" className="block text-sm font-semibold mb-2">Contrasenya nova</label>
                <input
                  id="profile-password"
                  type="password"
                  minLength={6}
                  value={profileForm.password}
                  onChange={(e) => handleProfileChange("password", e.target.value)}
                  placeholder="Deixa-ho buit per mantenir l'actual"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gymmaster-accent focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={cancelProfileEdit}
                  className="px-5 py-2 rounded-md border border-gray-300 text-gray-600 font-semibold hover:bg-gray-100 transition-all duration-200"
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 rounded-md bg-gymmaster-primary text-white font-semibold hover:bg-gymmaster-secondary disabled:opacity-60 transition-all duration-200"
                >
                  {savingProfile ? "Guardant..." : "Guardar canvis"}
                </button>
              </div>
            </form>
          )}
        </div>

        {loadingData ? (
          <div className="text-center py-8 text-gray-400">Carregant dades...</div>
        ) : (
          <>
            <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6" style={{ color: "#00B4D8" }} />
                <h2 className="text-2xl font-bold">Subscripció</h2>
              </div>

              {subscripcio ? (
                <div className="rounded-lg p-6 text-white" style={{ background: "linear-gradient(135deg, #1B263B, #415A77)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">{subscripcio.nom_pla}</span>
                    <span className="text-xl font-semibold">{subscripcio.preu}€/mes</span>
                  </div>
                  <p className="text-blue-200 text-sm mb-4">{subscripcio.descripcio_pla}</p>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <p className="text-blue-300">Inici</p>
                      <p className="font-medium">{subscripcio.data_inici}</p>
                    </div>
                    <div>
                      <p className="text-blue-300">Venciment</p>
                      <p className="font-medium">{subscripcio.data_fi}</p>
                    </div>
                    <div>
                      <p className="text-blue-300">Dies restants</p>
                      <p className="font-medium">{subscripcio.dies_restants} dies</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">No tens cap subscripció activa.</p>
                  <button
                    onClick={() => navigate("/pricing")}
                    className="text-white px-6 py-2 rounded-md font-semibold transition-all duration-200 bg-gymmaster-primary hover:bg-gymmaster-secondary hover:shadow-lg active:scale-95"
                  >
                    Veure plans
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <CalendarDays className="w-6 h-6" style={{ color: "#00B4D8" }} />
                <h2 className="text-2xl font-bold">Les meves reserves</h2>
              </div>

              {cancelMsg && (
                <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg text-sm ${cancelMsg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {cancelMsg.ok
                    ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    : <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  }
                  <span>{cancelMsg.text}</span>
                </div>
              )}

              {reserves.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">No tens cap reserva activa.</p>
                  <button
                    onClick={() => navigate("/classes")}
                    className="text-white px-6 py-2 rounded-md font-semibold transition-all duration-200 bg-gymmaster-primary hover:bg-gymmaster-secondary hover:shadow-lg active:scale-95"
                  >
                    Veure classes
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {reserves.map((r) => (
                    <div
                      key={r.id_reserva}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div>
                        <p className="font-semibold">{r.nom_classe}</p>
                        <p className="text-sm text-gray-500">
                          {r.data_classe} · {r.hora_inici?.slice(0, 5)} h · {r.sala}
                        </p>
                        <p className="text-xs text-gray-400">{r.entrenador}</p>
                      </div>
                      <button
                        onClick={() => cancellarReserva(r.id_reserva)}
                        title="Cancel·lar reserva"
                        className="p-2 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
