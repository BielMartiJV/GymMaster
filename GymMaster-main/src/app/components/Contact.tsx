import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { AuthRequiredModal } from "./AuthRequiredModal";

export function Contact() {
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    interest: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setIsModalOpen(true);
      return;
    }

    alert("Gràcies! Et contactarem al més aviat possible.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      interest: "",
      message: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <section className="text-white py-20" style={{ background: "linear-gradient(to right, #1B263B, #415A77)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Contacta amb GymMaster</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Estem aquí per ajudar-te a començar. Escriu-nos i et recomanarem la millor opció per a tu.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-8">Informació de contacte</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#CAF0F8" }}>
                    <MapPin className="w-6 h-6" style={{ color: "#00B4D8" }} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Adreça</h3>
                    <p className="text-gray-600">Carrer Principal 123<br />28001 Barcelona, Espanya</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#CAF0F8" }}>
                    <Phone className="w-6 h-6" style={{ color: "#00B4D8" }} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Telèfon</h3>
                    <p className="text-gray-600">+34 900 123 456</p>
                    <p className="text-gray-600">+34 900 123 457</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#CAF0F8" }}>
                    <Mail className="w-6 h-6" style={{ color: "#00B4D8" }} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Email</h3>
                    <p className="text-gray-600">info@gymmaster.com</p>
                    <p className="text-gray-600">atencio@gymmaster.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#CAF0F8" }}>
                    <Clock className="w-6 h-6" style={{ color: "#00B4D8" }} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Horaris</h3>
                    <div className="text-gray-600 space-y-1">
                      <p>Dilluns - Divendres: 6:00 - 22:00</p>
                      <p>Dissabte: 8:00 - 20:00</p>
                      <p>Diumenge: 9:00 - 18:00</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-8">Envia'ns un missatge</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold mb-2">Nom complet *</label>
                  <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gymmaster-accent focus:border-transparent transition-all duration-200" placeholder="El teu nom" />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-2">Email *</label>
                  <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gymmaster-accent focus:border-transparent transition-all duration-200" placeholder="tu@email.com" />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold mb-2">Telèfon</label>
                  <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gymmaster-accent focus:border-transparent transition-all duration-200" placeholder="+34 600 000 000" />
                </div>

                <div>
                  <label htmlFor="interest" className="block text-sm font-semibold mb-2">M'interessa *</label>
                  <select id="interest" name="interest" required value={formData.interest} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gymmaster-accent focus:border-transparent transition-all duration-200">
                    <option value="">Selecciona una opció</option>
                    <option value="basic">Quota Basic</option>
                    <option value="premium">Quota Premium</option>
                    <option value="elite">Quota Elite</option>
                    <option value="trial">Entrenament de prova</option>
                    <option value="other">Altra consulta</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold mb-2">Missatge</label>
                  <textarea id="message" name="message" rows={5} value={formData.message} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gymmaster-accent focus:border-transparent transition-all duration-200" placeholder="Explica'ns els teus objectius i t'assessorarem." />
                </div>

                <button type="submit" className="w-full text-white py-4 rounded-md font-semibold bg-gymmaster-primary hover:bg-gymmaster-secondary hover:shadow-lg transition-all duration-200 active:scale-[0.98]">
                  Enviar missatge
                </button>
                <p className="text-sm text-gray-600 text-center">* Camps obligatoris</p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Entrenament de prova gratuït</h2>
          <p className="text-xl text-gray-600 mb-8">
            Vine un dia, coneix les instal·lacions i entrena amb nosaltres sense compromís.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl font-bold mb-2" style={{ color: "#00B4D8" }}>1</div>
              <h3 className="font-bold mb-2">Contacta'ns</h3>
              <p className="text-gray-600 text-sm">Omple el formulari o truca'ns</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl font-bold mb-2" style={{ color: "#00B4D8" }}>2</div>
              <h3 className="font-bold mb-2">Reserva visita</h3>
              <p className="text-gray-600 text-sm">T'assignem dia i hora segons disponibilitat</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-4xl font-bold mb-2" style={{ color: "#00B4D8" }}>3</div>
              <h3 className="font-bold mb-2">Entrena</h3>
              <p className="text-gray-600 text-sm">Prova la sala i classes amb suport de l'equip</p>
            </div>
          </div>
        </div>
      </section>

      <AuthRequiredModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Enviar missatge"
        message="Només els socis registrats poden enviar consultes a través del formulari."
      />
    </div>
  );
}
