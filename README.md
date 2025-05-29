# 🎢 EnjoyPark - Sistema di Gestione Parco Divertimenti

Un'applicazione web completa per la gestione di un parco divertimenti con sistema di biglietteria, QR code personalizzati, autenticazione utenti e pannello amministrativo.

## 🚀 Caratteristiche Principali

- **Sistema di Autenticazione** completo con account utente e admin
- **Biglietteria Online** con pagamenti simulati
- **Generazione QR Code** personalizzati per l'ingresso
- **Mappa Interattiva** del parco con attrazioni e servizi
- **Planner Giornaliero** per organizzare la visita
- **Sistema di Notifiche** in tempo reale
- **Supporto Multilingua** (Italiano/Inglese)
- **Tema Scuro/Chiaro** con preferenze utente
- **Dashboard Amministrativo** per gestione ordini
- **Validatore QR Code** per controllo accessi

## 🛠️ Tecnologie Utilizzate

- **Next.js 14** con App Router
- **TypeScript** per type safety
- **Tailwind CSS** per lo styling
- **Shadcn/UI** per i componenti
- **React Context** per state management
- **LocalStorage** per persistenza dati (simulazione database)

## 📋 Prerequisiti

- Node.js 18+ 
- npm o yarn
- Browser moderno con supporto ES6+

## 🔧 Installazione

1. **Clona il repository**
\`\`\`bash
git clone [repository-url]
cd enjoypark-app
\`\`\`

2. **Installa le dipendenze**
\`\`\`bash
npm install
# oppure
yarn install
\`\`\`

3. **Avvia il server di sviluppo**
\`\`\`bash
npm run dev
# oppure
yarn dev
\`\`\`

4. **Apri il browser**
\`\`\`
http://localhost:3000
\`\`\`

## 🔐 Credenziali di Test

### Account Utenti
| Tipo | Email | Password | Descrizione |
|------|-------|----------|-------------|
| **Utente Standard** | `demo@enjoypark.it` | `demo123` | Account demo con cronologia visite |
| **Amministratore** | `admin` | `admin` | Accesso completo al pannello admin |

### Carte di Credito Simulate

| Numero Carta | Tipo | CVV | Scadenza | Risultato |
|--------------|------|-----|----------|-----------|
| `4111111111111111` | Visa | 123 | 12/25 | ✅ **Successo** |
| `4000000000000002` | Visa | 123 | 12/25 | ❌ **Rifiutata** |
| `4000000000000119` | Visa | 123 | 12/25 | 💰 **Fondi Insufficienti** |
| `4000000000000069` | Visa | 123 | 12/20 | ⏰ **Carta Scaduta** |
| `5555555555554444` | Mastercard | 123 | 12/25 | ✅ **Successo** |
| `378282246310005` | American Express | 1234 | 12/25 | ✅ **Successo** |

### Codici Promozionali

| Codice | Sconto | Tipo | Importo Minimo | Descrizione |
|--------|--------|------|----------------|-------------|
| `WELCOME10` | 10% | Percentuale | €50 | Sconto benvenuto nuovi clienti |
| `FAMILY20` | €20 | Fisso | €150 | Sconto pacchetti famiglia |
| `SUMMER15` | 15% | Percentuale | €80 | Promozione estiva |

## 🎯 Come Testare il Sistema

### 1. **Test Acquisto Biglietti**
\`\`\`bash
1. Vai su /tickets
2. Seleziona data e biglietti
3. Usa una carta di prova
4. Verifica generazione QR codes
\`\`\`

### 2. **Test Pannello Admin**
\`\`\`bash
1. Login con admin/admin
2. Accedi al Dashboard Admin dal menu
3. Visualizza statistiche e ordini
4. Usa il Validatore QR
\`\`\`

### 3. **Test Validazione QR**
\`\`\`bash
1. Vai su /admin/qr-validator
2. Inserisci un QR code generato
3. Verifica stato biglietto
4. Testa diversi scenari (valido/scaduto/usato)
\`\`\`

### 4. **Test Codici Promo**
\`\`\`bash
1. Aggiungi biglietti al carrello
2. Inserisci codice promo
3. Verifica applicazione sconto
4. Completa acquisto
\`\`\`

## 📁 Struttura del Progetto

\`\`\`
enjoypark-app/
├── app/                          # Next.js App Router
│   ├── (pages)/                  # Pagine principali
│   │   ├── attractions/          # Pagina attrazioni
│   │   ├── shows/               # Pagina spettacoli
│   │   ├── map/                 # Mappa interattiva
│   │   ├── planner/             # Planner giornaliero
│   │   ├── tickets/             # Sistema biglietteria
│   │   └── info/                # Informazioni parco
│   ├── account/                 # Area utente
│   │   ├── profile/             # Profilo utente
│   │   └── settings/            # Impostazioni
│   ├── admin/                   # Area amministrativa
│   │   ├── dashboard/           # Dashboard admin
│   │   └── qr-validator/        # Validatore QR
│   ├── globals.css              # Stili globali
│   ├── layout.tsx               # Layout principale
│   └── page.tsx                 # Homepage
├── components/                   # Componenti riutilizzabili
│   ├── auth/                    # Componenti autenticazione
│   ├── layout/                  # Componenti layout
│   ├── notifications/           # Sistema notifiche
│   └── ui/                      # Componenti UI base
├── lib/                         # Utilities e configurazioni
│   ├── contexts/                # React Contexts
│   │   ├── auth-context.tsx     # Gestione autenticazione
│   │   ├── theme-context.tsx    # Gestione tema
│   │   └── language-context.tsx # Gestione lingua
│   ├── mock-data.ts            # Dati di prova
│   └── utils.ts                # Utility functions
└── hooks/                       # Custom React Hooks
\`\`\`

## 🔄 Flusso di Lavoro

### Acquisto Biglietti
1. **Selezione**: Utente sceglie data e tipologia biglietti
2. **Checkout**: Inserimento dati cliente e pagamento
3. **Validazione**: Controllo carta di credito simulata
4. **Generazione**: Creazione QR codes univoci
5. **Conferma**: Salvataggio ordine e invio conferma

### Validazione Ingresso
1. **Scansione**: Lettura QR code all'ingresso
2. **Verifica**: Controllo validità e stato biglietto
3. **Autorizzazione**: Conferma o rifiuto accesso
4. **Logging**: Registrazione evento per analytics

## 🎨 Personalizzazione

### Temi
- **Tema Chiaro**: Design pulito e moderno
- **Tema Scuro**: Interfaccia dark-friendly
- **Responsive**: Ottimizzato per mobile e desktop

### Lingue Supportate
- 🇮🇹 **Italiano** (predefinito)
- 🇬🇧 **Inglese**

## 📊 Dati di Prova Precaricati

Il sistema include dati di esempio per:
- **4 ordini** con diversi stati (confermato, utilizzato, scaduto)
- **12 QR codes** di test
- **3 codici promozionali** attivi
- **Cronologia visite** per account demo

## 🔧 Configurazione Avanzata

### Variabili d'Ambiente
\`\`\`env
# Non necessarie per la demo - tutto funziona in locale
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### Personalizzazione Prezzi
Modifica i prezzi in `app/tickets/page.tsx`:
\`\`\`typescript
const ticketTypes = [
  {
    id: "standard",
    name: "Biglietto Standard",
    price: 45, // Modifica qui
    // ...
  }
]
\`\`\`

### Aggiunta Nuove Carte di Prova
Modifica `lib/mock-data.ts`:
\`\`\`typescript
export const mockCreditCards: MockCreditCard[] = [
  {
    number: "4111111111111111",
    result: "success",
    message: "Pagamento completato"
  }
  // Aggiungi nuove carte qui
]
\`\`\`

## 🐛 Risoluzione Problemi

### Problemi Comuni

**1. Dati non persistenti**
- I dati sono salvati in localStorage
- Cancellare cache browser per reset completo

**2. QR Code non validi**
- Usa solo QR codes generati dall'app
- Formato: `EP-[timestamp]-[random]`

**3. Pagamenti sempre rifiutati**
- Verifica di usare carte di prova corrette
- Controlla formato numero carta

**4. Accesso admin negato**
- Usa esattamente `admin` / `admin`
- Logout e login se necessario

## 📈 Funzionalità Future

- [ ] **Database reale** (PostgreSQL/MongoDB)
- [ ] **Pagamenti reali** (Stripe/PayPal)
- [ ] **Notifiche push** via service worker
- [ ] **App mobile** React Native
- [ ] **Analytics avanzate** con grafici
- [ ] **Sistema recensioni** attrazioni
- [ ] **Chat support** in tempo reale
- [ ] **Geolocalizzazione** per navigazione
- [ ] **Social features** condivisione esperienze

## 🤝 Contribuire

1. Fork del progetto
2. Crea feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit modifiche (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

## 📄 Licenza

Questo progetto è sotto licenza MIT. Vedi `LICENSE` per dettagli.

## 📞 Supporto

Per supporto o domande:
- 📧 Email: support@enjoypark.it
- 💬 Issues: [GitHub Issues](link-to-issues)
- 📖 Docs: [Documentazione completa](link-to-docs)

---

**Sviluppato con ❤️ per EnjoyPark**
\`\`\`

Ora aggiungo commenti dettagliati nel codice per spiegare le varie funzionalità:
