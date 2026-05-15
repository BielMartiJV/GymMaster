import { Check } from "lucide-react";
import { Link } from "react-router";
import { cn } from "./ui/utils";

export function Pricing() {
  const plans = [
    {
      name: "Bàsic",
      price: "29",
      period: "mes",
      description: "Ideal per començar a entrenar amb constància",
      features: [
        "Accés a sala de fitness",
        "Horari de 9:00 a 17:00",
        "1 sessió d'avaluació inicial",
        "Accés a vestidors",
      ],
      cta: "Apunta'm",
      popular: false,
    },
    {
      name: "Premium",
      price: "49",
      period: "mes",
      description: "La quota més escollida pels nostres socis",
      features: [
        "Accés complet 6:00 - 22:00",
        "Totes les classes dirigides",
        "2 seguiments mensuals amb entrenador",
        "Zona funcional i musculació",
        "Invitació mensual per a un amic",
      ],
      cta: "Més popular",
      popular: true,
    },
    {
      name: "Elite",
      price: "79",
      period: "mes",
      description: "Per qui vol el màxim rendiment i atenció personal",
      features: [
        "Tot l'inclòs al Premium",
        "4 sessions de personal training/mes",
        "Pla d'entrenament personalitzat",
        "Assessorament nutricional",
        "Prioritat en reserva de classes",
      ],
      cta: "Vull Elite",
      popular: false,
    },
  ];

  const additionalServices = [
    {
      name: "Entrenament personal",
      description: "Sessió 1:1 amb entrenador titulat",
      price: "35",
    },
    {
      name: "Pack nutrició",
      description: "Valoració + pauta inicial",
      price: "45",
    },
    {
      name: "Bono 10 classes",
      description: "Per a no socis o ús puntual",
      price: "70",
    },
    {
      name: "Massatge esportiu",
      description: "Recuperació muscular (45 min)",
      price: "30",
    },
  ];

  return (
    <div>
      <section className="text-white py-20" style={{ background: "linear-gradient(to right, #1B263B, #415A77)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Tarifes i quotes</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Escull la quota que millor encaixa amb el teu ritme de vida i objectius.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-lg overflow-hidden ${plan.popular
                    ? "text-white shadow-2xl scale-105 md:scale-110"
                    : "bg-white shadow-lg"
                  }`}
                style={plan.popular ? { backgroundColor: "#1B263B" } : {}}
              >
                {plan.popular && (
                  <div
                    className="text-center py-2 text-sm font-semibold text-white"
                    style={{ backgroundColor: "#00B4D8" }}
                  >
                    MÉS POPULAR
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className={`mb-6 ${plan.popular ? "text-gray-300" : "text-gray-600"}`}>
                    {plan.description}
                  </p>
                  <div className="mb-6">
                    <span className="text-5xl font-bold">€{plan.price}</span>
                    <span className={`${plan.popular ? "text-gray-300" : "text-gray-600"}`}>
                      /{plan.period}
                    </span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#00B4D8" }} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/contact"
                    className={cn(
                      "block w-full py-3 rounded-md text-center transition-all duration-200 font-semibold text-white active:scale-95",
                      plan.popular
                        ? "bg-gymmaster-accent hover:bg-gymmaster-accent-dark hover:shadow-lg hover:shadow-gymmaster-accent/20"
                        : "bg-gymmaster-primary hover:bg-gymmaster-secondary hover:shadow-lg"
                    )}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center text-gray-600">
            <p className="text-lg">
              <strong>Matrícula 0€</strong> durant aquest mes
            </p>
            <p className="mt-2">Sense permanència anual obligatòria</p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Serveis addicionals</h2>
            <p className="text-xl text-gray-600">
              Complementa la teva quota amb serveis especialitzats
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalServices.map((service, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                <div className="mb-4">
                  <span className="text-3xl font-bold" style={{ color: "#00B4D8" }}>
                    €{service.price}
                  </span>
                </div>
                <Link
                  to="/contact"
                  className="block w-full text-white py-2 rounded-md text-center transition-all duration-200 text-sm font-semibold bg-gymmaster-primary hover:bg-gymmaster-secondary hover:shadow-md active:scale-95"
                >
                  Sol·licitar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Preguntes freqüents</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-lg mb-2">Hi ha permanència?</h3>
              <p className="text-gray-600">
                No. Pots donar-te de baixa quan vulguis avisant amb 15 dies.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-lg mb-2">Puc congelar la quota?</h3>
              <p className="text-gray-600">
                Sí, oferim congelació temporal en períodes de vacances o lesió.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-lg mb-2">Hi ha tarifa d'estudiant?</h3>
              <p className="text-gray-600">
                Sí, tenim descomptes per a estudiants i col·lectius específics.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold text-lg mb-2">Puc provar el gimnàs abans d'apuntar-me?</h3>
              <p className="text-gray-600">
                Sí, pots reservar una visita i entrenament de prova gratuït.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
