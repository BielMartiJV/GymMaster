import { Link } from "react-router";

export function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-xl w-full bg-white border border-gray-100 rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-4xl font-bold mb-3">404</h1>
        <p className="text-gray-600 mb-6">La pàgina que busques no existeix.</p>
        <Link
          to="/"
          className="inline-block px-6 py-3 rounded-md text-white font-semibold"
          style={{ backgroundColor: "#1B263B" }}
        >
          Tornar a inici
        </Link>
      </div>
    </section>
  );
}
