# Senso (Byte Rush)

> **Senso emotivo + Sensazione = Senso ai tuoi acquisti.**

Senso e' un assistente conversazionale personale che si integra con i servizi quotidiani dell'utente (calendario, note, reminder) e, nel tempo, costruisce una comprensione genuina dei suoi interessi e bisogni.

Quando emerge un'intenzione d'acquisto **reale** nel contesto della conversazione, il chatbot propone prodotti in modo trasparente, non invasivo e sempre spiegato.

*Lo shopping non e' l'obiettivo dell'app — e' una conseguenza naturale di una relazione di fiducia tra utente e assistente.*

---

## Prerequisiti

- **Node.js** >= 18
- **npm** >= 9
- **PostgreSQL** (consigliato [Neon](https://neon.tech) per cloud gratuito, oppure locale)
- Una **Gemini API key** (gratuita su [Google AI Studio](https://aistudio.google.com/app/apikey))

---

## Setup completo (da zero)

### 1. Clona il repository

```bash
git clone https://github.com/CapoHHub/byte-rush.git
cd byte-rush
```

### 2. Configura le variabili d'ambiente

**Frontend** — crea `.env` nella root del progetto:

```bash
cp .env.example .env
```

Apri `.env` e inserisci la tua Gemini API key:

```env
VITE_GEMINI_API_KEY=AIzaSy...tua_chiave
```

**Backend** — crea `server/.env`:

```bash
cp server/.env.example server/.env
```

Apri `server/.env` e configura:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
AUTH_SECRET="una_stringa_casuale_lunga"
```

Per generare un `AUTH_SECRET` sicuro:

```bash
openssl rand -base64 32
```

### 3. Installa le dipendenze

```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

> `npm install` nel server esegue automaticamente `prisma generate` (postinstall).

### 4. Inizializza il database

```bash
cd server

# Genera il client Prisma (se non gia' fatto dal postinstall)
npx prisma generate

# Crea/sincronizza le tabelle sul DB
npx prisma db push

# (Opzionale) Popola con prodotti demo
npm run db:seed

cd ..
```

Oppure tutto in un comando:

```bash
cd server && npm run db:setup && cd ..
```

### 5. Avvia l'applicazione

Servono **due terminali** (o un tool come `concurrently`):

**Terminale 1 — Backend:**

```bash
cd server
npm run dev
```

Il server Express si avvia su `http://localhost:3001`.

**Terminale 2 — Frontend:**

```bash
npm run dev
```

Vite si avvia su `http://localhost:5173` (o la prima porta libera). Il proxy Vite inoltra automaticamente le chiamate `/api/*` al backend.

### 6. Apri il browser

Vai su `http://localhost:5173`. Puoi:

- **Registrarti come utente** e usare il chatbot
- **Saltare l'account** (modalita' ospite)
- **Registrarti come azienda** (pulsante "Sei un'azienda?") per caricare prodotti

---

## Struttura del progetto

```
byte-rush/
├── .env.example              # Template variabili frontend
├── index.html                # Entry point HTML
├── vite.config.ts            # Config Vite + proxy API
├── tsconfig.json             # Config TypeScript frontend
├── package.json              # Dipendenze frontend
│
├── src/
│   ├── main.tsx              # Bootstrap React
│   ├── vite-env.d.ts         # Tipi Vite/ImportMeta
│   ├── styles/index.css      # Stili globali (Tailwind)
│   └── app/
│       ├── App.tsx                    # Componente principale (routing, chat)
│       ├── components/
│       │   ├── AuthPage.tsx           # Login/registrazione utente e azienda
│       │   ├── ChatMessage.tsx        # Bolla singolo messaggio
│       │   ├── CompanyDashboard.tsx   # Dashboard gestione prodotti azienda
│       │   ├── EmotionalID.tsx        # Carta d'Identita (privacy dashboard)
│       │   ├── Onboarding.tsx         # Onboarding progressivo
│       │   ├── PopupStore.tsx         # Store etico in-app
│       │   └── ProductCardStrip.tsx   # Anteprima prodotti inline in chat
│       ├── context/
│       │   ├── AuthContext.tsx         # Stato autenticazione (user/company/guest)
│       │   └── ProductCatalogContext.tsx # Catalogo prodotti da DB
│       ├── domain/
│       │   ├── conversationEngine.ts  # Orchestratore turni conversazione
│       │   ├── ethicalGate.ts         # Soglia etica (blocca suggerimenti)
│       │   ├── geminiService.ts       # Client Gemini AI
│       │   ├── mockIntegrations.ts    # Dati mock integrazioni
│       │   └── types.ts              # Tipi condivisi
│       └── lib/
│           ├── apiService.ts          # Client API tipizzato
│           └── sensoStorage.ts        # Persistenza localStorage
│
└── server/
    ├── .env.example           # Template variabili backend
    ├── package.json           # Dipendenze + script backend
    ├── tsconfig.json          # Config TypeScript backend
    ├── prisma/
    │   ├── schema.prisma      # Schema database
    │   └── seed.ts            # Seed dati demo
    └── src/
        ├── index.ts           # Entry point Express
        ├── prisma.ts          # Istanza PrismaClient
        ├── middleware/auth.ts  # JWT + middleware ruoli
        └── routes/
            ├── auth.ts        # POST /api/auth/register, login, GET /me
            ├── company.ts     # POST /api/company/register, login, CRUD prodotti
            ├── products.ts    # GET /api/products (pubblico)
            ├── cart.ts        # CRUD carrello
            └── user.ts        # Interessi, acquisti, impostazioni utente
```

---

## Schema Database (Prisma)

| Modello | Descrizione |
| :--- | :--- |
| **User** | Utente chatbot con email/password, impostazioni JSON, interessi onboarding |
| **Company** | Azienda venditrice con auth separata |
| **Product** | Prodotto con categoria, immagine URL, motivazione, taglie |
| **Cart / CartItem** | Carrello utente |
| **UserInterest** | Interessi rilevati (onboarding o inferiti da AI) |
| **UserPurchase** | Storico acquisti per analytics etiche |

Per esplorare il DB visivamente:

```bash
cd server && npx prisma studio
```

---

## Script disponibili

### Frontend (root)

| Comando | Descrizione |
| :--- | :--- |
| `npm run dev` | Avvia Vite dev server |
| `npm run build` | Build di produzione |

### Backend (server/)

| Comando | Descrizione |
| :--- | :--- |
| `npm run dev` | Avvia server con hot-reload (tsx watch) |
| `npm run db:generate` | Rigenera Prisma Client |
| `npm run db:push` | Sincronizza schema con DB |
| `npm run db:seed` | Popola DB con prodotti demo |
| `npm run db:setup` | generate + push + seed in un comando |
| `npm run db:studio` | Apri Prisma Studio (GUI database) |

---

## Come funziona

### Soglia Etica

Il recommendation engine blocca automaticamente i suggerimenti commerciali se:

- L'utente esprime stress, ansia o tristezza
- E' attiva la protezione notturna (23:00-06:00, disattivabile)
- Ha acquistato prodotti nella stessa categoria negli ultimi 30 giorni
- Supererebbe il budget mensile impostato

### Flusso Commerciale

1. L'utente chatta con Senso (powered by Gemini AI)
2. Gemini rileva una categoria commerciale nel contesto
3. La soglia etica valuta se e' appropriato suggerire
4. Se approvato, appare un messaggio con anteprima prodotti e pulsante "Esplora"
5. Il Pop-up Store mostra i prodotti con badge "Perche' te lo mostriamo"

### Ruoli

- **Utente**: chatta, riceve suggerimenti, acquista, gestisce la Carta d'Identita'
- **Azienda**: accede alla dashboard, carica prodotti con nome/prezzo/categoria/immagine URL
- **Ospite**: usa la chat senza account, viene invitato a registrarsi solo al momento dell'acquisto

---

## Proposta di Valore

| Per l'Utente | Per il Brand |
| :--- | :--- |
| Un assistente che lo conosce davvero | Accesso a utenti con intenzione d'acquisto reale |
| Suggerimenti contestuali e spiegati | Nessun dark pattern — solo vendite in target |
| Controllo totale sui propri dati | Conversioni estremamente piu' qualificate |
| Shopping senza pressione | Brand equity visiva (stesso stile UI per tutti) |

---

## Archetipo

**Fiducia -> contesto -> gate -> invito -> store neutro -> follow-up.** Lo shopping e' la conseguenza di questo arco, non il suo centro.

| Fase | Cosa succede | Principio |
| :--- | :--- | :--- |
| Relazione | L'utente usa l'assistente per compiti quotidiani | La conversazione e' il prodotto primario |
| Contesto integrato | Calendario, note e altre fonti arricchiscono il contesto | Minimo necessario, spiegato, revocabile |
| Segnale d'intenzione | Conversazione + dati indicano un bisogno concreto | Nessun suggerimento "a freddo" |
| Soglia etica | Valutazione esplicita (stato emotivo, orario, acquisti) | Default: non proporre se c'e' ambiguita' |
| Invito contestuale | Messaggio naturale + azione discreta | Trasparenza e rispetto del rifiuto |
| Store normalizzato | UI identica per tutti i brand; badge di trasparenza | Equita' tra brand e autonomia utente |
| Post-acquisto | Ordine, spedizione, resi e feedback in chat | Fiducia come ciclo chiuso |

---

## Metriche di Successo (Etiche)

- **NPS dell'assistente**: la fiducia e' il KPI principale
- **% suggerimenti rifiutati**: spia di rilevanza reale
- **Tasso di reso**: misura della qualita' del suggerimento
- **Frequenza acquisti per utente**: monitorata per segnali compulsivi
