import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

type LocationState = {
  from?: string;
};

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;
  const redirectTo = state.from || "/el-meu-compte";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.message || "No s'ha pogut iniciar sessió");
      return;
    }
    navigate(redirectTo, { replace: true });
  };

  return (
    <section className="py-20 min-h-[70vh]" style={{ backgroundColor: "#f8fafc" }}>
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold mb-2">Iniciar sessió</h1>
          <p className="text-gray-600 mb-6">Accedeix al teu compte de soci.</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gymmaster-accent focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2">
                Contrasenya
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gymmaster-accent focus:border-transparent transition-all duration-200"
              />
            </div>
            {error ? <p className="text-sm text-red-600 font-medium">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-md transition-all duration-200 font-semibold disabled:opacity-60 bg-gymmaster-primary hover:bg-gymmaster-secondary hover:shadow-lg active:scale-[0.98]"
            >
              {loading ? "Accedint..." : "Accedir"}
            </button>
          </form>
          <p className="text-sm text-gray-600 mt-6">
            No tens compte?{" "}
            <Link to="/register" className="font-semibold text-[#0077A8] hover:underline">
              Registra't
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
