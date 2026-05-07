import { useState, useEffect, FormEvent } from "react";
import { Plus, Edit2, Trash2, X, Check, Send } from "lucide-react";
import { fetchApi, getAuthHeaders } from "./admin/api";

type Soci = {
  id_soci: number;
  nom: string;
  cognoms: string;
  email: string;
  telefon: string;
  data_naixement: string;
  dni: string;
  data_alta: string;
  actiu: number;
};

export function AdminSocis() {
  const [socis, setSocis] = useState<Soci[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editSoci, setEditSoci] = useState<Soci | null>(null);

  // Formulari
  const [nom, setNom] = useState("");
  const [cognoms, setCognoms] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [dataNaixement, setDataNaixement] = useState("");
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  
  // Notificacions
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [notifSoci, setNotifSoci] = useState<Soci | null>(null);
  const [notifTitol, setNotifTitol] = useState("");
  const [notifMissatge, setNotifMissatge] = useState("");
  const [isSending, setIsSending] = useState(false);

  const fetchSocis = async () => {
    try {
      const response = await fetchApi("/socis", {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (response.ok) {
        setSocis(data.socis || []);
      } else {
        alert(data.error || "No s'han pogut carregar els socis");
      }
    } catch (error) {
      console.error("Error fetching socis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSocis();
  }, []);

  const resetForm = () => {
    setNom("");
    setCognoms("");
    setEmail("");
    setTelefon("");
    setDataNaixement("");
    setDni("");
    setPassword("");
    setEditSoci(null);
  };

  const handleOpenModal = (soci?: Soci) => {
    if (soci) {
      setEditSoci(soci);
      setNom(soci.nom || "");
      setCognoms(soci.cognoms || "");
      setEmail(soci.email || "");
      setTelefon(soci.telefon || "");
      setDataNaixement(soci.data_naixement ? soci.data_naixement.slice(0, 10) : "");
      setDni(soci.dni || "");
      setPassword("");
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

    const payload: Record<string, string> = {
      nom,
      cognoms,
      email,
      telefon,
      data_naixement: dataNaixement,
      dni,
    };

    if (!editSoci || password.trim()) {
      payload.password = password;
    }

    try {
      const url = editSoci ? `/socis/${editSoci.id_soci}` : "/socis";
      const method = editSoci ? "PUT" : "POST";

      const response = await fetchApi(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchSocis();
        handleCloseModal();
      } else {
        alert(data.error || "Error al desar el soci");
      }
    } catch (error) {
      console.error(error);
      alert("Error de connexió");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("N'estàs segur que vols donar de baixa aquest soci?")) {
      try {
        const response = await fetchApi(`/socis/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        const data = await response.json();

        if (response.ok) {
          await fetchSocis();
        } else {
          alert(data.error || "Error al eliminar el soci");
        }
      } catch (error) {
        console.error(error);
        alert("Error de connexió");
      }
    }
  };

  if (isLoading) return <div className="py-20 text-center font-bold text-gray-500">Carregant socis...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1B263B]">Gestió de Socis</h1>
            <p className="text-gray-600 mt-2">Crea, edita o dona de baixa socis de GymMaster.</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#00B4D8] hover:bg-[#0077A8] text-white px-5 py-3 rounded-lg font-semibold transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            Nou soci
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1B263B] text-white">
                <th className="p-4 font-semibold">Nom i Cognoms</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Telèfon</th>
                <th className="p-4 font-semibold">DNI</th>
                <th className="p-4 font-semibold text-center">Accions</th>
              </tr>
            </thead>
            <tbody>
              {socis.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No hi ha cap soci actiu registrat.
                  </td>
                </tr>
              ) : (
                socis.map((s) => (
                  <tr key={s.id_soci} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-900 border-r">{s.nom} {s.cognoms}</td>
                    <td className="p-4 text-sm text-gray-600 border-r">{s.email}</td>
                    <td className="p-4 text-sm text-gray-600 border-r">{s.telefon}</td>
                    <td className="p-4 text-sm text-gray-600 border-r">{s.dni}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => {
                            setNotifSoci(s);
                            setNotifTitol("");
                            setNotifMissatge("");
                            setIsNotifModalOpen(true);
                          }}
                          className="bg-green-50 text-green-600 p-2 rounded-md hover:bg-green-100 transition-colors"
                          title="Enviar notificació"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(s)}
                          className="bg-blue-50 text-blue-600 p-2 rounded-md hover:bg-blue-100 transition-colors"
                          title="Editar soci"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id_soci)}
                          className="bg-red-50 text-red-600 p-2 rounded-md hover:bg-red-100 transition-colors"
                          title="Eliminar soci"
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b p-6 sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-900">
                {editSoci ? "Editar soci" : "Afegir soci"}
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
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00B4D8] outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cognoms *</label>
                  <input
                    type="text"
                    required
                    value={cognoms}
                    onChange={(e) => setCognoms(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00B4D8] outline-none transition-shadow"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">DNI / NIE *</label>
                  <input
                    type="text"
                    required
                    value={dni}
                    onChange={(e) => setDni(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00B4D8] outline-none transition-shadow uppercase"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Data naixement *</label>
                  <input
                    type="date"
                    required
                    value={dataNaixement}
                    onChange={(e) => setDataNaixement(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00B4D8] outline-none transition-shadow"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00B4D8] outline-none transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Telèfon *</label>
                  <input
                    type="text"
                    required
                    value={telefon}
                    onChange={(e) => setTelefon(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00B4D8] outline-none transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {editSoci ? "Nova contrasenya (opcional)" : "Contrasenya *"}
                </label>
                <input
                  type="password"
                  required={!editSoci}
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editSoci ? "Deixa-ho en blanc per mantenir la contrasenya actual" : "Mínim 6 caràcters"}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00B4D8] outline-none transition-shadow"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  className="px-8 py-2 rounded-lg font-semibold text-white bg-[#00B4D8] hover:bg-[#0077A8] transition-colors flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {editSoci ? "Actualitzar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal de notificació */}
      {isNotifModalOpen && notifSoci && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b p-6 bg-white">
              <h3 className="text-xl font-bold text-gray-900">
                Enviar notificació a {notifSoci.nom}
              </h3>
              <button onClick={() => setIsNotifModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form 
              className="p-6 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSending(true);
                try {
                  const res = await fetchApi("/notificacions", {
                    method: "POST",
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                      id_soci: notifSoci.id_soci,
                      titol: notifTitol,
                      missatge: notifMissatge,
                      tipus: "informativa"
                    })
                  });
                  if (res.ok) {
                    setIsNotifModalOpen(false);
                    alert("Notificació enviada correctament!");
                  } else {
                    alert("Error al enviar la notificació.");
                  }
                } catch (error) {
                  console.error(error);
                  alert("Error de connexió.");
                } finally {
                  setIsSending(false);
                }
              }}
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Títol de l'avís</label>
                <input
                  type="text"
                  required
                  value={notifTitol}
                  onChange={(e) => setNotifTitol(e.target.value)}
                  placeholder="Ex: Reserva confirmada"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00B4D8] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Missatge</label>
                <textarea
                  required
                  rows={4}
                  value={notifMissatge}
                  onChange={(e) => setNotifMissatge(e.target.value)}
                  placeholder="Escriu el missatge aquí..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#00B4D8] outline-none resize-none"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNotifModalOpen(false)}
                  className="px-6 py-2 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-8 py-2 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSending ? "Enviant..." : "Enviar ara"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
