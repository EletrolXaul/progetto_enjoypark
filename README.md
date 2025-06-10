# 🎢 EnjoyPark - Frontend Application

Un'applicazione web moderna per la gestione di un parco divertimenti con sistema di biglietteria, QR code personalizzati, autenticazione utenti e pannello amministrativo.

## 🚀 Caratteristiche Principali

### 🎫 Sistema Biglietteria
- **Acquisto Online** con carrello avanzato
- **Generazione QR Code** automatica per ogni biglietto
- **Codici Promozionali** con validazione in tempo reale
- **Pagamenti Simulati** con diverse carte di test
- **Gestione Date** con calendario interattivo

### 👤 Gestione Utenti
- **Autenticazione Completa** (login/registrazione)
- **Profili Utente** personalizzabili
- **Cronologia Acquisti** dettagliata
- **Sistema Ruoli** (utente/amministratore)

### 🗺️ Esperienza Parco
- **Mappa Interattiva** con attrazioni e servizi
- **Planner Giornaliero** per organizzare la visita
- **Informazioni Dettagliate** su attrazioni e spettacoli
- **Tempi di Attesa** in tempo reale

### 🔧 Funzionalità Avanzate
- **Tema Scuro/Chiaro** con persistenza preferenze
- **Supporto Multilingua** (Italiano/Inglese)
- **Notifiche Toast** per feedback utente
- **Responsive Design** ottimizzato mobile
- **PWA Ready** per installazione app-like

### 👨‍💼 Pannello Amministrativo
- **Dashboard Completa** con statistiche
- **Gestione Ordini** e biglietti
- **Validatore QR Code** per controllo accessi
- **Analytics** vendite e utilizzo

## 🛠️ Stack Tecnologico

### Core Framework
- **Next.js 14** con App Router
- **TypeScript** per type safety completo
- **React 18** con Server Components

### Styling & UI
- **Tailwind CSS** per styling utility-first
- **Shadcn/UI** componenti accessibili
- **Lucide React** per iconografia
- **CSS Modules** per stili componenti

### State Management
- **React Context** per stato globale
- **LocalStorage** per persistenza dati
- **Custom Hooks** per logica riutilizzabile

### Sviluppo & Build
- **ESLint** per code quality
- **Prettier** per code formatting
- **TypeScript** per type checking

## 📋 Prerequisiti

- **Node.js** 18.0.0 o superiore
- **npm** 8.0.0 o superiore (o yarn/pnpm)
- **Browser moderno** con supporto ES2022

## 🚀 Installazione e Setup

### 1. Clona il Repository
```bash
git clone [repository-url]
cd progetto_enjoypark
```
### 2. Installa le Dipendenze
```bash
npm install
```
# oppure
```bash
yarn install
```
# oppure
```bash
pnpm install
```
### 3. Configura l'Ambiente
```bash
cp .env.example .env.local
```
Modifica .env.local con le tue configurazioni:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=EnjoyPark
NEXT_PUBLIC_APP_VERSION=1.0.0
```
### 4. Avvia il Server di Sviluppo
```bash
npm run dev
```
# oppure
```bash
yarn dev
```
# oppure
```bash
pnpm dev
```
### 5. Apri l'Applicazione
```bash
http://localhost:3000
```
## 🔐 Credenziali di Test
### Account Demo
Tipo Email Password Descrizione Utente Standard demo@enjoypark.it demo123 Account con cronologia visite Amministratore admin admin Accesso pannello admin

### Carte di Credito Simulate
Numero Tipo CVV Scadenza Risultato 4111111111111111 Visa 123 12/25 ✅ Successo 4000000000000002 Visa 123 12/25 ❌ Rifiutata 4000000000000119 Visa 123 12/25 💰 Fondi Insufficienti 5555555555554444 Mastercard 123 12/25 ✅ Successo

### Codici Promozionali
Codice Sconto Tipo Importo Minimo WELCOME10 10% Percentuale €50 FAMILY20 €20 Fisso €150 SUMMER15 15% Percentuale €80

## 📁 Struttura del Progetto
```bash
progetto_enjoypark/
├── app/                     # Next.js App Router
│   ├── (pages)/            # Pagine pubbliche
│   │   ├── attractions/    # Attrazioni
│   │   ├── shows/         # Spettacoli
│   │   ├── map/           # Mappa interattiva
│   │   ├── planner/       # Planner giornaliero
│   │   ├── tickets/       # Sistema biglietteria
│   │   └── info/          # Informazioni parco
│   ├── account/           # Area utente
│   ├── admin/             # Pannello 
amministrativo
│   ├── globals.css        # Stili globali
│   ├── layout.tsx         # Layout root
│   └── page.tsx           # Homepage
├── components/             # Componenti 
riutilizzabili
│   ├── auth/              # Autenticazione
│   ├── layout/            # Layout components
│   ├── notifications/     # Sistema notifiche
│   └── ui/                # UI base (shadcn)
├── lib/                   # Utilities e 
configurazioni
│   ├── contexts/          # React Contexts
│   ├── services/          # API services
│   └── utils.ts           # Utility functions
├── hooks/                 # Custom React hooks
├── public/                # Asset statici
└── styles/                # Stili aggiuntivi
```
## 🧪 Testing e Sviluppo
### Script Disponibili
```bash
npm run dev          # Server di sviluppo
npm run build        # Build di produzione
npm run start        # Server di produzione
npm run lint         # Linting del codice
npm run type-check   # Controllo TypeScript
```
### Test Funzionalità 1. Test Acquisto Biglietti
1. Vai su /tickets
2. Seleziona data e tipologia biglietti
3. Applica codice promozionale
4. Usa carta di test per pagamento
5. Verifica generazione QR codes 2. Test Pannello Admin
1. Login con credenziali admin
2. Accedi al Dashboard Admin
3. Visualizza statistiche e ordini
4. Testa validatore QR code
## 🔧 Configurazione Avanzata
### Personalizzazione Tema
Modifica tailwind.config.ts per personalizzare colori e stili:

```bash
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f0f9ff',
        500: '#3b82f6',
        900: '#1e3a8a',
      }
    }
  }
}
```
### Aggiunta Nuove Pagine
1. Crea file in app/(pages)/nuova-pagina/page.tsx
2. Aggiungi navigazione in components/layout/navbar.tsx
3. Aggiorna routing se necessario
## 🚀 Deploy in Produzione
### Vercel (Raccomandato)
```bash
npm i -g vercel
vercel
```
### Build Manuale
```bash
npm run build
npm run start
```
### Docker
```bash
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```
## 🐛 Troubleshooting
### Problemi Comuni
Dati non persistenti

- I dati sono in localStorage
- Cancella cache browser per reset
Build fallisce

- Verifica versione Node.js
- Pulisci node_modules e reinstalla
Errori TypeScript

- Esegui npm run type-check
- Verifica importazioni e tipi
## 📈 Roadmap Future
- Integrazione Backend Laravel API
- Pagamenti Reali Stripe/PayPal
- Notifiche Push Service Worker
- App Mobile React Native
- Analytics Avanzate Google Analytics
- Testing Jest + Testing Library
- Storybook per componenti
- Internazionalizzazione i18n completa
## 🤝 Contribuire
1. Fork del progetto
2. Crea feature branch ( git checkout -b feature/nuova-funzionalita )
3. Commit delle modifiche ( git commit -m 'Aggiunge nuova funzionalità' )
4. Push al branch ( git push origin feature/nuova-funzionalita )
5. Apri Pull Request
## 📄 Licenza
Questo progetto è sotto licenza MIT. Vedi LICENSE per dettagli.

Sviluppato con ❤️ per EnjoyPark