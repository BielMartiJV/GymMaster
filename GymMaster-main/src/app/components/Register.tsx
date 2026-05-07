import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [cognoms, setCognoms] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dataNaixement, setDataNaixement] = useState("");
  const [dni, setDni] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    console.log("DEBUG: Intentant registre amb:", { nom, cognoms, email, dataNaixement, dni });
    
    if (!nom || !cognoms || !email || !password || !dataNaixement || !dni) {
      setError("Tots els camps són obligatoris (incloent DNI)");
      setLoading(false);
      return;
    }

    const result = await register(nom, cognoms, email, password, dataNaixement, dni);
    setLoading(false);
    if (!result.ok) {
      setError(result.message || "No s'ha pogut crear el compte");
      return;
    }
    navigate("/el-meu-compte", { replace: true });
  };

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gymmaster-accent focus:border-transparent transition-all duration-200";

  return (
    <section className="py-20 min-h-[70vh]" style={{ backgroundColor: "#f8fafc" }}>
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold mb-2">Crear compte</h1>
          <p className="text-gray-600 mb-6">Registra't com a soci de GymMaster.</p>
          <form onSubmit={onSubmit} className="space-y-4">

            {/* Nom */}
            <div>
              <label htmlFor="nom" className="block text-sm font-semibold mb-2">Nom</label>
              <input
                id="nom"
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            {/* Cognoms */}
            <div>
              <label htmlFor="cognoms" className="block text-sm font-semibold mb-2">Cognoms</label>
              <input
                id="cognoms"
                type="text"
                value={cognoms}
                onChange={(e) => setCognoms(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            {/* Data de naixement */}
            <div>
              <label htmlFor="dataNaixement" className="block text-sm font-semibold mb-2">
                Data de naixement
              </label>
              <input
                id="dataNaixement"
                type="date"
                value={dataNaixement}
                onChange={(e) => setDataNaixement(e.target.value)}
                required
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 14))
                  .toISOString()
                  .slice(0, 10)}
                className={inputClass}
              />
            </div>

            {/* DNI / NIE */}
            <div>
              <label htmlFor="dni" className="block text-sm font-semibold mb-2">DNI / NIE</label>
              <input
                id="dni"
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value.toUpperCase())}
                placeholder="Ex: 12345678Z"
                required
                className={inputClass}
              />
            </div>

            {/* Contrasenya */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2">
                Contrasenya
              </label>
              <input
                id="password"
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClass}
              />
              <p className="text-xs text-gray-400 mt-1">Mínim 6 caràcters</p>
            </div>

            {error ? <p className="text-sm text-red-600 font-medium">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-md transition-all duration-200 font-semibold disabled:opacity-60 bg-gymmaster-primary hover:bg-gymmaster-secondary hover:shadow-lg active:scale-[0.98]"
            >
              {loading ? "Registrant..." : "Registrar-me"}
            </button>
          </form>
          <p className="text-sm text-gray-600 mt-6">
            Ja tens compte?{" "}
            <Link to="/login" className="font-semibold text-[#0077A8] hover:underline">
              Inicia sessió
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
