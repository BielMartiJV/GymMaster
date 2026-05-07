import { Link } from "react-router";

export function Unauthorized() {
  return (
    <section className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-lg text-center bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Acces denegat</h1>
        <p className="text-slate-600 mb-6">Aquest apartat es exclusiu per comptes amb permisos d'administrador.</p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700"
        >
          Tornar a l'inici
        </Link>
      </div>
    </section>
  );
}
