import { useEffect, useState } from "react";
import { Calendar, Clock, Users, CheckCircle, AlertCircle, X } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router";
import { cn } from "./ui/utils";

// ─── Tipus ─────────────────────────────────────────────────────
type ClasseAPI = {
  id_classe: number;
  nom: string;
  descripcio: string;
  dia_setmana: number;
  hora_inici: string;
  durada: number;
  aforament_max: number;
  places_ocupades: number;
  places_lliures: number;
  entrenador: string;
  sala: string;
};

type ReservationState = {
  classeId: number | null;
  date: string;
  loading: boolean;
  message: string;
  ok: boolean | null;
};

// ─── Constants ─────────────────────────────────────────────────
const DIES = ["", "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte", "Diumenge"];

const IMAGES: Record<string, string> = {
  Yoga: "https://images.unsplash.com/photo-1619781458519-5c6115c0ee98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  Spinning: "https://images.unsplash.com/photo-1760031670160-4da44e9596d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  CrossFit: "https://images.unsplash.com/photo-1632758243519-7140757e5618?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  Musculació: "https://images.unsplash.com/photo-1759572985980-c9af2f1ae4af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  Zumba: "https://images.unsplash.com/photo-1771586791190-97ed536c54af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
};
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800";

// Propera data de setmana per a dia_setmana (1=Dl…7=Dg)
function nextWeekdayDate(diaSetmana: number): string {
  const avui = new Date();
  const avuiDia = avui.getDay() === 0 ? 7 : avui.getDay(); // 1=Dl…7=Dg
  let diff = diaSetmana - avuiDia;
  if (diff <= 0) diff += 7;
  const d = new Date(avui);
  d.setDate(avui.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

// ─── Component ─────────────────────────────────────────────────
export function Classes() {
  const { isAuthenticated, apiFetch } = useAuth();
  const navigate = useNavigate();

  const [classes, setClasses] = useState<ClasseAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [reservation, setReservation] = useState<ReservationState>({
    classeId: null,
    date: "",
    loading: false,
    message: "",
    ok: null,
  });

  // Carregar classes de l'API
  useEffect(() => {
    apiFetch("/classes")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setClasses(data.data);
        else setFetchError("No s'han pogut carregar les classes.");
      })
      .catch(() => setFetchError("Error de connexió amb el servidor."))
      .finally(() => setLoading(false));
  }, [apiFetch]);

  // Obrir modal de reserva
  const handleReservar = (classe: ClasseAPI) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/classes" } });
      return;
    }
    setReservation({
      classeId: classe.id_classe,
      date: nextWeekdayDate(classe.dia_setmana),
      loading: false,
      message: "",
      ok: null,
    });
  };

  // Confirmar reserva
  const confirmarReserva = async () => {
    if (!reservation.classeId || !reservation.date) return;
    setReservation((prev) => ({ ...prev, loading: true, message: "", ok: null }));

    const res = await apiFetch("/reserves", {
      method: "POST",
      body: JSON.stringify({ id_classe: reservation.classeId, data_classe: reservation.date }),
    });
    const data = await res.json();

    if (res.ok && data.ok) {
      // Actualitzar places_lliures localment
      setClasses((prev) =>
        prev.map((c) =>
          c.id_classe === reservation.classeId
            ? { ...c, places_ocupades: c.places_ocupades + 1, places_lliures: c.places_lliures - 1 }
            : c
        )
      );
      setReservation((prev) => ({
        ...prev,
        loading: false,
        message: "Reserva confirmada!",
        ok: true,
      }));
    } else {
      setReservation((prev) => ({
        ...prev,
        loading: false,
        message: data.error || "No s'ha pogut fer la reserva.",
        ok: false,
      }));
    }
  };

  const tancarModal = () => setReservation({ classeId: null, date: "", loading: false, message: "", ok: null });

  const classeSeleccionada = classes.find((c) => c.id_classe === reservation.classeId);

  return (
    <div>
      {/* Hero Section */}
      <section className="text-white py-20" style={{ background: "linear-gradient(to right, #1B263B, #415A77)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Les nostres Classes</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Descobreix una àmplia varietat de classes dissenyades per a tots els nivells.
            Des de principiants fins a atletes experimentats.
          </p>
        </div>
      </section>

      {/* Classes Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="text-center py-16 text-gray-500">
              <div className="text-4xl mb-4">⏳</div>
              <p>Carregant classes...</p>
            </div>
          )}
          {fetchError && (
            <div className="text-center py-16 text-red-500">
              <p className="font-semibold">{fetchError}</p>
              <p className="text-sm text-gray-500 mt-2">Assegura't que el servidor backend està en marxa.</p>
            </div>
          )}
          {!loading && !fetchError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {classes.map((classItem) => {
                const nomBase = Object.keys(IMAGES).find((k) => classItem.nom.startsWith(k));
                const img = nomBase ? IMAGES[nomBase] : DEFAULT_IMAGE;

                return (
                  <div
                    key={classItem.id_classe}
                    className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
                  >
                    <div className="relative h-48">
                      <ImageWithFallback src={img} alt={classItem.nom} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-1">
                        {classItem.nom.replace("Entrenament Personal", "Entrenament personal")}
                      </h3>
                      {classItem.entrenador && (
                        <p className="text-sm text-gray-500 mb-3">{classItem.entrenador}</p>
                      )}
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">{classItem.descripcio}</p>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "#00B4D8" }} />
                          <span>{DIES[classItem.dia_setmana]} · {classItem.hora_inici.slice(0, 5)} h · {classItem.durada} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 flex-shrink-0" style={{ color: "#00B4D8" }} />
                          <span>Aforament: {classItem.places_ocupades}/{classItem.aforament_max}</span>
                        </div>
                        {classItem.sala && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: "#00B4D8" }} />
                            <span>{classItem.sala}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleReservar(classItem)}
                        disabled={classItem.places_lliures === 0}
                        className={cn(
                          "w-full mt-6 text-white py-3 rounded-md font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                          classItem.places_lliures === 0
                            ? "bg-gray-400"
                            : "bg-gymmaster-primary hover:bg-gymmaster-secondary hover:shadow-lg active:scale-95"
                        )}
                      >
                        {classItem.places_lliures === 0 ? "Classe completa" : "Reservar classe"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Modal de reserva */}
      {reservation.classeId !== null && classeSeleccionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => e.target === e.currentTarget && tancarModal()}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={tancarModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {reservation.ok === true ? (
              <div className="text-center py-4">
                <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "#22c55e" }} />
                <h2 className="text-2xl font-bold mb-2">Reserva confirmada!</h2>
                <p className="text-gray-600">
                  {classeSeleccionada.nom} · {reservation.date}
                </p>
                <button
                  onClick={tancarModal}
                  className="mt-6 w-full text-white py-3 rounded-md font-semibold"
                  style={{ backgroundColor: "#1B263B" }}
                >
                  Tancar
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-1">Reservar classe</h2>
                <p className="text-gray-500 mb-6">{classeSeleccionada.nom} · {classeSeleccionada.entrenador}</p>

                <div className="mb-4">
                  <label htmlFor="dataReserva" className="block text-sm font-semibold mb-2">
                    Selecciona la data
                  </label>
                  <input
                    id="dataReserva"
                    type="date"
                    value={reservation.date}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setReservation((prev) => ({ ...prev, date: e.target.value, message: "", ok: null }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gymmaster-accent focus:border-transparent transition-all duration-200"
                  />
                </div>

                {reservation.message && reservation.ok === false && (
                  <div className="flex items-center gap-2 mb-4 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{reservation.message}</span>
                  </div>
                )}

                <button
                  onClick={confirmarReserva}
                  disabled={reservation.loading || !reservation.date}
                  className="w-full text-white py-3 rounded-md font-semibold transition-all duration-200 bg-gymmaster-primary hover:bg-gymmaster-secondary hover:shadow-lg disabled:opacity-60 active:scale-[0.98]"
                >
                  {reservation.loading ? "Confirmant..." : "Confirmar reserva"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
