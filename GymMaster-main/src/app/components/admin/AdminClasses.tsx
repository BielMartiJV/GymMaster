import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, Edit2, Plus, Trash2, X } from "lucide-react";
import { fetchApi, getAuthHeaders } from "./api";

type TrainerOption = {
  id_entrenador: number;
  nom: string;
  cognoms: string;
};

type Classe = {
  id_classe: number;
  nom: string;
  descripcio: string | null;
  id_entrenador: number;
  entrenador_nom: string;
  entrenador_cognoms: string;
  dia_setmana: string;
  hora_inici: string;
  data_classe: string | null;
  durada: number;
  aforament_max: number;
  places_ocupades: number;
  sala: string;
};

const weekDays = ["Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte", "Diumenge"];

export function AdminClasses() {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [trainers, setTrainers] = useState<TrainerOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Classe | null>(null);

  const [nom, setNom] = useState("");
  const [descripcio, setDescripcio] = useState("");
  const [idEntrenador, setIdEntrenador] = useState("");
  const [diaSetmana, setDiaSetmana] = useState(weekDays[0]);
  const [horaInici, setHoraInici] = useState("18:00");
  const [dataClasse, setDataClasse] = useState("");
  const [durada, setDurada] = useState("60");
  const [aforament, setAforament] = useState("20");
  const [placesOcupades, setPlacesOcupades] = useState("0");
  const [sala, setSala] = useState("");

  const trainerMap = useMemo(
    () => new Map(trainers.map((t) => [String(t.id_entrenador), `${t.nom} ${t.cognoms}`])),
    [trainers]
  );

  const resetForm = () => {
    setNom("");
    setDescripcio("");
    setIdEntrenador("");
    setDiaSetmana(weekDays[0]);
    setHoraInici("18:00");
    setDataClasse("");
    setDurada("60");
    setAforament("20");
    setPlacesOcupades("0");
    setSala("");
    setEditing(null);
  };

  const loadData = async () => {
    try {
      const [classesResponse, trainersResponse] = await Promise.all([
        fetchApi("/classes", { headers: getAuthHeaders() }),
        fetchApi("/entrenadors"),
      ]);

      const classesData = await classesResponse.json();
      const trainersData = await trainersResponse.json();

      if (!classesResponse.ok) {
        throw new Error(classesData.error || "No s'han pogut carregar les classes");
      }

      if (!trainersResponse.ok) {
        throw new Error(trainersData.error || "No s'han pogut carregar els entrenadors");
      }

      setClasses(classesData.classes || []);
      setTrainers(trainersData.entrenadors || []);
    } catch (error) {
      console.error(error);
      alert("No s'han pogut carregar les dades de classes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openModal = (classe?: Classe) => {
    if (classe) {
      setEditing(classe);
      setNom(classe.nom || "");
      setDescripcio(classe.descripcio || "");
      setIdEntrenador(String(classe.id_entrenador));
      setDiaSetmana(classe.dia_setmana || weekDays[0]);
      setHoraInici((classe.hora_inici || "18:00:00").slice(0, 5));
      setDataClasse(classe.data_classe ? classe.data_classe.slice(0, 10) : "");
      setDurada(String(classe.durada || 60));
      setAforament(String(classe.aforament_max || 20));
      setPlacesOcupades(String(classe.places_ocupades || 0));
      setSala(classe.sala || "");
    } else {
      resetForm();
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const saveClasse = async (event: FormEvent) => {
    event.preventDefault();

    const payload = {
      nom,
      descripcio,
      id_entrenador: Number(idEntrenador),
      dia_setmana: diaSetmana,
      hora_inici: `${horaInici}:00`,
      data_classe: dataClasse || null,
      durada: Number(durada),
      aforament_max: Number(aforament),
      places_ocupades: Number(placesOcupades),
      sala,
    };

    try {
      const response = await fetchApi(
        editing ? `/classes/${editing.id_classe}` : "/classes",
        {
          method: editing ? "PUT" : "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "No s'ha pogut desar la classe");
        return;
      }

      await loadData();
      closeModal();
    } catch (error) {
      console.error(error);
      alert("Error de connexio");
    }
  };

  const removeClasse = async (id: number) => {
    if (!window.confirm("Vols desactivar aquesta classe?")) {
      return;
    }

    try {
      const response = await fetchApi(`/classes/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "No s'ha pogut eliminar la classe");
        return;
      }

      await loadData();
    } catch (error) {
      console.error(error);
      alert("Error de connexio");
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-slate-500 font-semibold">Carregant classes...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestio de classes</h2>
          <p className="text-slate-600">Configuracio de sessions, horaris i aforament.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-sky-700"
        >
          <Plus className="w-4 h-4" />
          Nova classe
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-slate-100">
              <tr>
                <th className="p-3 text-left">Classe</th>
                <th className="p-3 text-left">Entrenador</th>
                <th className="p-3 text-left">Data/Hora</th>
                <th className="p-3 text-left">Aforament</th>
                <th className="p-3 text-left">Sala</th>
                <th className="p-3 text-center">Accions</th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">No hi ha classes actives</td>
                </tr>
              ) : (
                classes.map((item) => (
                  <tr key={item.id_classe} className="border-t border-slate-100">
                    <td className="p-3 font-semibold text-slate-900">{item.nom}</td>
                    <td className="p-3 text-slate-600">{item.entrenador_nom} {item.entrenador_cognoms}</td>
                    <td className="p-3 text-slate-600">{item.data_classe?.slice(0, 10) || item.dia_setmana} {item.hora_inici?.slice(0, 5)}</td>
                    <td className="p-3 text-slate-600">{item.places_ocupades}/{item.aforament_max}</td>
                    <td className="p-3 text-slate-600">{item.sala}</td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <button
                          className="p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                          onClick={() => openModal(item)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                          onClick={() => removeClasse(item.id_classe)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-slate-900">{editing ? "Editar classe" : "Crear classe"}</h3>
              <button onClick={closeModal} className="text-slate-500 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveClasse} className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Nom *</label>
                  <input className="w-full border rounded-lg px-3 py-2" value={nom} onChange={(e) => setNom(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Entrenador *</label>
                  <select className="w-full border rounded-lg px-3 py-2" value={idEntrenador} onChange={(e) => setIdEntrenador(e.target.value)} required>
                    <option value="">Selecciona entrenador</option>
                    {trainers.map((trainer) => (
                      <option key={trainer.id_entrenador} value={trainer.id_entrenador}>
                        {trainer.nom} {trainer.cognoms}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Descripcio</label>
                <textarea className="w-full border rounded-lg px-3 py-2" rows={3} value={descripcio} onChange={(e) => setDescripcio(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Dia setmana *</label>
                  <select className="w-full border rounded-lg px-3 py-2" value={diaSetmana} onChange={(e) => setDiaSetmana(e.target.value)} required>
                    {weekDays.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Hora inici *</label>
                  <input type="time" className="w-full border rounded-lg px-3 py-2" value={horaInici} onChange={(e) => setHoraInici(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Data concreta</label>
                  <input type="date" className="w-full border rounded-lg px-3 py-2" value={dataClasse} onChange={(e) => setDataClasse(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Durada (min) *</label>
                  <input type="number" min={1} className="w-full border rounded-lg px-3 py-2" value={durada} onChange={(e) => setDurada(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Aforament *</label>
                  <input type="number" min={1} className="w-full border rounded-lg px-3 py-2" value={aforament} onChange={(e) => setAforament(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Places ocupades *</label>
                  <input type="number" min={0} className="w-full border rounded-lg px-3 py-2" value={placesOcupades} onChange={(e) => setPlacesOcupades(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Sala *</label>
                  <input className="w-full border rounded-lg px-3 py-2" value={sala} onChange={(e) => setSala(e.target.value)} required />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold inline-flex items-center gap-2 hover:bg-sky-700">
                  <Check className="w-4 h-4" />
                  {editing ? "Actualitzar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
