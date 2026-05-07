import { Link } from "react-router";
import { Calendar, HeartPulse, Users, Dumbbell, Phone, MapPin } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Home() {
  const features = [
    {
      icon: <Dumbbell className="w-8 h-8" />,
      title: "Sala de força completa",
      description: "Zona de pes lliure, màquines guiades i material funcional per a tots els nivells.",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Classes dirigides cada dia",
      description: "Yoga, Spinning, CrossFit, HIIT i sessions de mobilitat amb horaris amplis.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Entrenadors propers",
      description: "Equip tècnic especialitzat que t'acompanya en objectius de salut i rendiment.",
    },
    {
      icon: <HeartPulse className="w-8 h-8" />,
      title: "Benestar integral",
      description: "Entrenament, recuperació i hàbits saludables per millorar la teva qualitat de vida.",
    },
  ];

  const stats = [
    { number: "2.500+", label: "Socis actius" },
    { number: "80+", label: "Classes setmanals" },
    { number: "18", label: "Entrenadors" },
    { number: "10", label: "Anys oberts" },
  ];

  return (
    <div>
      <section className="relative h-[600px] flex items-center justify-center text-white">
        <div className="absolute inset-0 z-10" style={{ backgroundColor: "rgba(27,38,59,0.75)" }}></div>
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1771586791190-97ed536c54af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxneW0lMjBmaXRuZXNzJTIwZXF1aXBtZW50JTIwbW9kZXJufGVufDF8fHx8MTc3MzA2NTM2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Instal·lacions de GymMaster"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span style={{ color: "#00B4D8" }}>Entrena com vols, creix com mai.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Gimnàs obert tot el dia amb classes dirigides, entrenament personal i una comunitat que suma.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="px-8 py-4 rounded-md text-lg font-semibold text-white transition-all duration-200 bg-gymmaster-accent hover:bg-gymmaster-accent-dark hover:shadow-lg hover:shadow-gymmaster-accent/20 active:scale-95"
            >
              Demana informació
            </Link>
            <Link
              to="/classes"
              className="bg-white text-black hover:bg-gray-100 hover:shadow-md px-8 py-4 rounded-md text-lg transition-all duration-200 font-semibold active:scale-95"
            >
              Veure classes
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 text-white" style={{ backgroundColor: "#1B263B" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: "#00B4D8" }}>
                  {stat.number}
                </div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Per què entrenar a GymMaster?</h2>
            <p className="text-xl text-gray-600">
              Instal·lacions modernes, seguiment real i ambient motivador cada setmana.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                  style={{ backgroundColor: "#CAF0F8", color: "#00B4D8" }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">El teu progrés, el nostre compromís</h2>
            <p className="text-xl text-gray-600">
              Tant si comences de zero com si busques rendiment, adaptem l'entrenament al teu punt de partida.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold mb-2">Avaluació inicial</h3>
              <p className="text-gray-600 text-sm">
                Reunió amb entrenador per definir objectius realistes i pla d'acció.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold mb-2">Pla personalitzat</h3>
              <p className="text-gray-600 text-sm">
                Recomanacions de rutina, càrregues i classes segons disponibilitat i nivell.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold mb-2">Seguiment continu</h3>
              <p className="text-gray-600 text-sm">
                Revisió periòdica per mantenir constància, tècnica i resultats.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 text-white" style={{ backgroundColor: "#1B263B" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Comencem avui?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Vine a conèixer el centre, l'equip i les classes. T'ajudem a trobar la quota ideal per a tu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5" style={{ color: "#00B4D8" }} />
              <span className="text-lg">+34 900 123 456</span>
            </div>
            <span className="hidden sm:inline text-gray-500">|</span>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" style={{ color: "#00B4D8" }} />
              <span className="text-lg">Carrer Principal 123, Barcelona</span>
            </div>
          </div>
          <Link
            to="/contact"
            className="inline-block px-8 py-4 rounded-md text-lg font-semibold text-white transition-all duration-200 bg-gymmaster-accent hover:bg-gymmaster-accent-dark hover:shadow-lg hover:shadow-gymmaster-accent/20 active:scale-95"
          >
            Reserva una visita
          </Link>
        </div>
      </section>
    </div>
  );
}
