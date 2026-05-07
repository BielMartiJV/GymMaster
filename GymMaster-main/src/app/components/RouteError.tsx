import { Link, isRouteErrorResponse, useRouteError } from "react-router";

export function RouteError() {
  const error = useRouteError();

  let title = "Ha passat un error inesperat";
  let description = "Torna a l'inici o prova una altra secció del web.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    description =
      error.status === 404
        ? "La pàgina que busques no existeix."
        : "No hem pogut carregar aquesta pàgina.";
  }

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-xl w-full bg-white border border-gray-100 rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold mb-3">{title}</h1>
        <p className="text-gray-600 mb-6">{description}</p>
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
