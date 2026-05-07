import { useState, useEffect, FormEvent } from "react";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { fetchApi, getAuthHeaders } from "./admin/api";

type Trainer = {
  id_entrenador: number;
  nom: string;
  cognoms: string;
  email: string;
  telefon: string;
  especialitats: string;
  biografia: string;
  foto: string;
};

export function AdminTrainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTrainer, setEditTrainer] = useState<Trainer | null>(null);

  // Form state
  const [nom, setNom] = useState("");
  const [cognoms, setCognoms] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [especialitats, setEspecialitats] = useState("");
  const [biografia, setBiografia] = useState("");
  const [foto, setFoto] = useState("");

  const fetchTrainers = async () => {
    try {
      const response = await fetchApi("/entrenadors");
      const data = await response.json();
      if (response.ok) {
        setTrainers(data.entrenadors);
      }
    } catch (error) {
      console.error("Error fetching trainers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const resetForm = () => {
    setNom("");
    setCognoms("");
    setEmail("");
    setTelefon("");
    setEspecialitats("");
    setBiografia("");
    setFoto("");
    setEditTrainer(null);
  };

  const handleOpenModal = (trainer?: Trainer) => {
    if (trainer) {
      setEditTrainer(trainer);
      setNom(trainer.nom || "");
      setCognoms(trainer.cognoms || "");
      setEmail(trainer.email || "");
      setTelefon(trainer.telefon || "");
      setEspecialitats(trainer.especialitats || "");
      setBiografia(trainer.biografia || "");
      setFoto(trainer.foto || "");
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      nom,
      cognoms,
      email,
      telefon,
      especialitats,
      biografia,
      foto,
    };

    try {
      const url = editTrainer ? `/entrenadors/${editTrainer.id_entrenador}` : "/entrenadors";
      const method = editTrainer ? "PUT" : "POST";

      const response = await fetchApi(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchTrainers();
        handleCloseModal();
      } else {
        alert("Error al desar l'entrenador");
      }
    } catch (error) {
      console.error(error);
      alert("Error de connexió");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("N'estàs segur que vols eliminar aquest entrenador?")) {
      try {
        const response = await fetchApi(`/entrenadors/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        if (response.ok) {
          await fetchTrainers();
        } else {
          alert("Error al eliminar l'entrenador");
        }
      } catch (error) {
        console.error(error);
        alert("Error de connexió");
      }
    }
  };

  if (isLoading) return <div className="py-20 text-center font-bold text-gray-500">Carregant entrenadors...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1B263B]">Gestió d'Entrenadors</h1>
            <p className="text-gray-600 mt-2">Crea, edita o elimina entrenadors de l'equip de GymMaster.</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#00B4D8] hover:bg-[#0077A8] text-white px-5 py-3 rounded-lg font-semibold transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Nou entrenador
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1B263B] text-white">
                <th className="p-4 font-semibold">Nom i Cognoms</th>
                <th className="p-4 font-semibold">Especialitats</th>
                <th className="p-4 font-semibold text-center">Accions</th>
              </tr>
            </thead>
            <tbody>
              {trainers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">
                    No hi ha cap entrenador registrat.
                  </td>
                </tr>
              ) : (
                trainers.map((t) => (
                  <tr key={t.id_entrenador} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-900 border-r">{t.nom} {t.cognoms}</td>
                    <td className="p-4 text-sm text-gray-600 border-r">{t.especialitats}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleOpenModal(t)}
                          className="bg-blue-50 text-blue-600 p-2 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id_entrenador)}
                          className="bg-red-50 text-red-600 p-2 rounded-md hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
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

      {/* Modal Formulari */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b p-6 sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-900">
                {editTrainer ? "Editar entrenador" : "Afegir entrenador"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
                  <input
                    type="text" required value={nom} onChange={(e) => setNom(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00B4D8] outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cognoms *</label>
                  <input
                    type="text" required value={cognoms} onChange={(e) => setCognoms(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00B4D8] outline-none transition-shadow"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00B4D8] outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Telèfon</label>
                  <input
                    type="text" value={telefon} onChange={(e) => setTelefon(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00B4D8] outline-none transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">URL Foto (Opcional)</label>
                <input
                  type="url" value={foto} onChange={(e) => setFoto(e.target.value)}
                  placeholder="https://imatge.com/foto.jpg"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00B4D8] outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Especialitats (separades per comes)</label>
                <input
                  type="text" value={especialitats} onChange={(e) => setEspecialitats(e.target.value)}
                  placeholder="Crossfit, Ioga, Pilates"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00B4D8] outline-none transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Biografia / Descripció</label>
                <textarea
                  rows={4} value={biografia} onChange={(e) => setBiografia(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00B4D8] outline-none transition-shadow resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t mt-6">
                <button
                  type="button" onClick={handleCloseModal}
                  className="px-6 py-2 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 rounded-lg font-semibold text-white bg-[#00B4D8] hover:bg-[#0077A8] transition-colors flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {editTrainer ? "Actualitzar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
