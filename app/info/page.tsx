import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const openingHours = [
  { day: "Lunedì", hours: "Chiuso", status: "" },
  { day: "Martedì", hours: "10:00 - 18:00", status: "" },
  { day: "Mercoledì", hours: "10:00 - 18:00", status: "" },
  { day: "Giovedì", hours: "10:00 - 20:00", status: "" },
  { day: "Venerdì", hours: "10:00 - 22:00", status: "today" },
  { day: "Sabato", hours: "10:00 - 22:00", status: "" },
  { day: "Domenica", hours: "10:00 - 18:00", status: "" },
]

const services = [
  {
    title: "Taglio Uomo",
    description: "Taglio e styling personalizzato per uomo.",
    details: ["Consulenza personalizzata", "Shampoo specifico", "Styling professionale"],
  },
  {
    title: "Taglio Donna",
    description: "Taglio e styling personalizzato per donna.",
    details: ["Consulenza personalizzata", "Shampoo specifico", "Piega inclusa"],
  },
  {
    title: "Barba",
    description: "Rasatura tradizionale e modellatura barba.",
    details: ["Panno caldo", "Olio pre-rasatura", "Balsamo idratante"],
  },
  {
    title: "Colore",
    description: "Colorazione professionale con prodotti di alta qualità.",
    details: ["Test allergologico", "Consulenza colore", "Trattamento post-colore"],
  },
]

const rules = [
  "Si prega di arrivare puntuali all'appuntamento.",
  "In caso di ritardo superiore a 15 minuti, l'appuntamento potrebbe essere cancellato.",
  "Si prega di avvisare in caso di impossibilità a presentarsi all'appuntamento con almeno 24 ore di anticipo.",
  "Non sono ammessi animali all'interno del salone.",
  "È vietato fumare all'interno del salone.",
]

const emergencyContacts = [
  {
    type: "Polizia",
    number: "112",
    description: "Numero unico di emergenza",
  },
  {
    type: "Vigili del Fuoco",
    number: "115",
    description: "Interventi in caso di incendio",
  },
  {
    type: "Emergenza Sanitaria",
    number: "118",
    description: "Assistenza medica urgente",
  },
]

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link href="/">← Torna alla Home</Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Informazioni & Orari</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Orari di Apertura */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Orari di Apertura</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">I nostri orari settimanali.</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <dl>
                {openingHours.map((schedule, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      schedule.status === "today"
                        ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                        : "bg-gray-50 dark:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className={`font-medium ${
                          schedule.status === "today"
                            ? "text-blue-900 dark:text-blue-100"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {schedule.day}
                      </span>
                      {schedule.status === "today" && (
                        <Badge
                          variant="outline"
                          className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                        >
                          Oggi
                        </Badge>
                      )}
                    </div>
                    <span
                      className={`font-mono ${
                        schedule.status === "today"
                          ? "text-blue-900 dark:text-blue-100 font-semibold"
                          : "text-gray-600 dark:text-gray-300"
                      }`}
                    >
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Servizi Offerti */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Servizi Offerti</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">I nostri servizi principali.</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <dl>
                {services.map((service, index) => (
                  <div key={index} className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{service.title}</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{service.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{service.description}</p>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-13">
                        {service.details.map((detail, i) => (
                          <li key={i}>{detail}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Regole del Salone */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Regole del Salone</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Alcune regole importanti da seguire.
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                {rules.map((rule, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-600 dark:text-red-400 text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{rule}</p>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Contatti Utili */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Contatti Utili</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Informazioni di contatto e indirizzo.
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:px-6">
                <div className="font-medium text-gray-900 dark:text-white">Indirizzo</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Via Roma, 123
                  <br />
                  00100 Roma (RM)
                </div>
                <div className="mt-4 font-medium text-gray-900 dark:text-white">Telefono</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">+39 06 12345678</div>
                <div className="mt-4 font-medium text-gray-900 dark:text-white">Email</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">info@example.com</div>
              </div>
            </div>
          </div>

          {/* Numeri di Emergenza */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Numeri di Emergenza</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Numeri utili in caso di emergenza.
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-5 sm:px-6">
                {emergencyContacts.map((contact, index) => (
                  <div
                    key={index}
                    className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg"
                  >
                    <div className="font-semibold text-red-800 dark:text-red-200">{contact.type}</div>
                    <div className="font-mono text-lg text-red-900 dark:text-red-100">{contact.number}</div>
                    <div className="text-sm text-red-600 dark:text-red-300">{contact.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Meteo */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Meteo</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Informazioni meteo locali.</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">22°C</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Soleggiato</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
