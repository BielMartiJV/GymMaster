import { Award, Star, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { fetchApi } from "../api";

type Trainer = {
  id_entrenador: number;
  nom: string;
  cognoms: string;
  email?: string | null;
  telefon?: string | null;
  especialitats?: string | null;
  biografia?: string | null;
  foto?: string | null;
};

export function Trainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telefon: "",
    missatge: "",
  });

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await fetchApi("/entrenadors");
        const data = await response.json();
        if (response.ok) setTrainers(data.entrenadors);
      } catch (fetchError) {
        console.error("Error carregant entrenadors:", fetchError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  const openContactModal = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    setError("");
    setSuccess("");
    setFormData({ nom: "", email: "", telefon: "", missatge: "" });
  };

  const closeContactModal = () => {
    if (isSubmitting) return;
    setSelectedTrainer(null);
  };

  const handleSubmitContact = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedTrainer) return;

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetchApi(`/entrenadors/${selectedTrainer.id_entrenador}/contacte`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "No s'ha pogut enviar la sol·licitud");
        return;
      }

      setSuccess(data.message || "Missatge enviat correctament. L'entrenador et contactarà aviat.");
      setFormData({ nom: "", email: "", telefon: "", missatge: "" });
    } catch (submitError) {
      console.error(submitError);
      setError("Error de connexió. Torna-ho a provar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <section className="text-white py-20" style={{ background: "linear-gradient(to right, #1B263B, #415A77)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Els nostres entrenadors</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Coneix l'equip de professionals certificats que t'ajudaran a assolir els teus objectius de fitness i benestar.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <div className="col-span-full py-20 text-center text-gray-500 font-bold text-lg">Carregant entrenadors...</div>
            ) : trainers.length === 0 ? (
              <div className="col-span-full py-16 text-center text-gray-400">Encara no hi ha entrenadors actius al sistema.</div>
            ) : (
              trainers.map((trainer) => (
                <div key={trainer.id_entrenador || trainer.nom} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow flex flex-col">
                  <div className="relative h-80 bg-gray-100 flex-shrink-0">
                    <ImageWithFallback
                      src={trainer.foto || "https://images.unsplash.com/photo-1632758243519-7140757e5618?w=800&q=80"}
                      alt={trainer.nom}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>5.0</span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold mb-2">{trainer.nom} {trainer.cognoms}</h3>
                    <div className="flex items-center gap-2 text-sm mb-4" style={{ color: "#00B4D8" }}>
                      <Award className="w-4 h-4" />
                      <span>Entrenador personal</span>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm flex-grow">{trainer.biografia || "Especialista dedicat al teu benestar."}</p>

                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-2">Especialitats:</h4>
                      <div className="flex flex-wrap gap-2">
                        {trainer.especialitats ? (
                          trainer.especialitats.split(",").map((specialty, i) => (
                            <span key={i} className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "#CAF0F8", color: "#0077A8" }}>
                              {specialty.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Fitness general</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => openContactModal(trainer)}
                      className="w-full text-center text-white py-3 rounded-md transition-colors font-semibold"
                      style={{ backgroundColor: "#1B263B" }}
                    >
                      Sol·licitar servei
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Per què els nostres entrenadors?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Tots els nostres entrenadors estan altament qualificats i compromesos amb el teu èxit</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Award className="w-8 h-8" />, title: "Certificats", desc: "Tots posseeixen certificacions internacionals reconegudes" },
              { icon: <Star className="w-8 h-8" />, title: "Experiència", desc: "Més de 8 anys d'experiència de mitjana" },
              { icon: <Award className="w-8 h-8" />, title: "Especialitzats", desc: "Àrees específiques d'expertesa per a les teves necessitats" },
              { icon: <Star className="w-8 h-8" />, title: "Motivadors", desc: "T'inspiraran a superar els teus límits cada dia" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: "#CAF0F8", color: "#00B4D8" }}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {selectedTrainer && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-slate-900">
                Contactar amb {selectedTrainer.nom} {selectedTrainer.cognoms}
              </h3>
              <button onClick={closeContactModal} className="text-slate-500 hover:text-slate-900" disabled={isSubmitting}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitContact} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">El teu nom *</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.nom}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nom: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">El teu email *</label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Telèfon</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.telefon}
                  onChange={(e) => setFormData((prev) => ({ ...prev, telefon: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Missatge *</label>
                <textarea
                  rows={4}
                  className="w-full border rounded-lg px-3 py-2"
                  value={formData.missatge}
                  onChange={(e) => setFormData((prev) => ({ ...prev, missatge: e.target.value }))}
                  required
                />
              </div>

              {error ? <p className="text-sm text-red-600 font-medium">{error}</p> : null}
              {success ? <p className="text-sm text-emerald-600 font-medium">{success}</p> : null}

              <div className="border-t border-slate-200 pt-4 flex justify-end gap-2">
                <button type="button" onClick={closeContactModal} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold" disabled={isSubmitting}>
                  Cancel·lar
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:opacity-60" disabled={isSubmitting}>
                  {isSubmitting ? "Enviant..." : "Enviar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
