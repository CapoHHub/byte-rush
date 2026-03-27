# Senso

doppio significato: senso emotivo + sensazione, senso ai tuoi acquisti 

https://github.com/CapoHHub/byte-rush

è un assistente conversazionale personale che si integra con i servizi quotidiani dell'utente (calendario, note, reminder) e, nel tempo, costruisce una comprensione genuina dei suoi interessi e bisogni. Quando emerge un'intenzione d'acquisto reale nel contesto della conversazione, il chatbot propone prodotti in modo trasparente, non invasivo e sempre spiegato.

Lo shopping non è l'obiettivo dell'app — è una conseguenza naturale di una relazione di fiducia tra utente e assistente.

## Proposta di valore

| Per l'utente | Per il brand |
| --- | --- |
| Un assistente che lo conosce davvero | Accesso a utenti con intenzione d'acquisto reale |
| Suggerimenti contestuali e spiegati | Nessun dark pattern — solo prodotto |
| Controllo totale sui propri dati | Conversioni più qualificate |
| Shopping senza pressione | Brand equità visiva (stesso stile per tutti) |

## Architettura

```jsx
┌─────────────────────────────────────┐
│            UTENTE                   │
│         (Chat UI)                   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│         LLM Core                    │
│  (es. Claude API / GPT-4)           │
│  + memoria conversazionale          │
│  + profilo utente                   │
└────┬──────────────┬─────────────────┘
     │              │
     ▼              ▼
┌─────────┐   ┌─────────────────────┐
│Integrazi│   │  Recommendation     │
│oni      │   │  Engine             │
│Calendar │   │  (soglia etica      │
│Notes    │   │   inclusa)          │
│Reminder │   └──────────┬──────────┘
└─────────┘              │
                         ▼
              ┌─────────────────────┐
              │   Product Catalog   │
              │   API (Shopify /    │
              │   custom)           │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   Pop-up Store      │
              │   (UI normalizzata) │
              └─────────────────────┘
```

## Criticità e come affrontarle

### Manipolazione emotiva

**Rischio:** il sistema potrebbe sfruttare stati emotivi negativi per spingere acquisti consolatori. **Soluzione:** la soglia etica del recommendation engine blocca i suggerimenti se:

- L'utente esprime stress, tristezza o ansia nella conversazione
- Sono le 23:00–06:00
- Ha già acquistato prodotti simili negli ultimi 30 giorni

---

### Profiling opaco

**Rischio:** l'utente non sa cosa sa di lui il sistema. **Soluzione:** **Carta d'Identità** — dashboard sempre accessibile che mostra:

- Interessi rilevati e da quali conversazioni
- Storico suggerimenti ricevuti e cliccati
- Bottone "Dimentica questo dato" per ogni voce
- Export completo dati (GDPR)

---

### Shopping compulsivo

**Rischio:** la comodità del chatbot può aumentare la frequenza d'acquisto. **Soluzione:**

- **Budget tracker** opzionale: l'utente imposta un limite mensile, il chatbot lo rispetta
- Il chatbot non mostra mai due suggerimenti commerciali nella stessa sessione
- Dopo 3 acquisti in 30 giorni, appare un messaggio di riflessione (non bloccante)

---

### Fiducia vs monetizzazione

**Rischio:** l'utente percepisce il chatbot come uno strumento di vendita travestito da assistente. **Soluzione:** ogni suggerimento mostra un badge **"Perché te lo mostriamo"** con la spiegazione in linguaggio naturale. I brand non possono pagare per apparire prima — solo la rilevanza contestuale determina l'ordine.

---

### Integrazione dati di terze parti

**Rischio:** accesso a calendario e note è invasivo e tecnicamente complesso. **Soluzione per il prototipo:** simulare i dati con un profilo utente mock. Per la produzione: OAuth2 per ogni servizio, con scope minimi richiesti (read-only, solo eventi futuri).

## Metriche di successo etiche

- % di suggerimenti rifiutati con "Non ora" → spia di rilevanza reale
- Tasso di reso post-acquisto → misura la qualità del suggerimento
- Frequenza d'acquisto per utente → monitorata per segnali compulsivi
- NPS dell'assistente (non del negozio) → la fiducia è il KPI principale

## Flusso

### 1. Onboarding progressivo *(zero friction)*

L'utente può iniziare a usare EmoCart **senza account e senza connessioni** — basta aprire la chat e parlare.

Il sistema raccoglie contesto in modo conversazionale e, solo quando ha senso, chiede consensi specifici:

> *"Hai menzionato una gara — vuoi che controlli il tuo calendario per aiutarti a pianificare?"* *"Per ricordarmi le tue preferenze tra una sessione e l'altra, vuoi creare un account?"*
> 

I consensi sono **contestuali, graduali e sempre spiegati** — mai un muro di permessi all'avvio.

Una volta creato l'account, l'utente:

- Connette i servizi che vuole (Google Calendar, Apple Notes, Todoist, Apple Salute…)
- Sceglie la granularità della condivisione per ogni servizio (es. *"solo eventi futuri, non quelli passati"*)
- Vede la sua **Carta d'Identità** — vuota, con la promessa di costruirla insieme

---

### 2. Uso quotidiano del chatbot

L'utente interagisce liberamente: pianifica la settimana, prende appunti, chiede consigli su qualsiasi cosa.

Il modello legge il contesto integrato in modo proattivo:

- 📅 **Calendario** → *"Hai una gara tra 18 giorni"*
- 🍎 **Apple Salute** → *"Nelle ultime 2 settimane hai corso mediamente 4km a sessione — stai aumentando il volume"*
- 📝 **Note** → *"Hai scritto 'comprare scarpe nuove' il 3 marzo"*

Incrociando queste fonti, l'assistente può dare consigli genuinamente utili anche senza intenzione d'acquisto: ritmo di allenamento, recupero, preparazione alla gara.

> ⚠️ **Regola ferma:** nessun suggerimento commerciale nelle prime interazioni. Prima si costruisce fiducia, poi — e solo se ha senso — si propone un prodotto.
> 

---

### 3. Rilevamento dell'intenzione

Il motore di raccomandazione incrocia tre livelli:

| Segnale | Esempio |
| --- | --- |
| **Pattern conversazionale** | Ha parlato di running 3 volte questa settimana |
| **Contesto integrato** | Gara in calendario, aumento km su Apple Salute |
| **Storico acquisti** | Non ha comprato scarpe da running negli ultimi 6 mesi |

Prima di procedere, viene valutata la **soglia etica**:

- 🔴 Stop se l'utente esprime stress, ansia o tristezza nella sessione
- 🔴 Stop se sono le 23:00–06:00
- 🔴 Stop se ha già acquistato prodotti simili negli ultimi 30 giorni
- 🟢 Procedi solo se il suggerimento risponde a un bisogno reale e contestuale

---

### 4. Suggerimento contestuale

Se la soglia etica è verde, nella chat appare un **messaggio naturale con pulsante discreto**:

> *"Noto che ti stai preparando per la gara del 14 aprile 🏃 e nelle ultime settimane hai aumentato il chilometraggio. Le tue scarpe reggono? Vuoi esplorare alcune opzioni?"*
> 

Il pulsante non è una pubblicità — è una risposta alla conversazione. L'utente può ignorarlo, rispondere "no grazie" o cliccare. Tutte e tre le opzioni sono ugualmente valorizzate dall'interfaccia.

---

### 5. Il pop-up store *(etico by design)*

Un ambiente visivo neutro e uguale per tutti i brand — nessun vantaggio per chi spende di più in advertising.

Ogni scheda prodotto contiene:

- Immagine e prezzo
- Descrizione essenziale (no superlative, no urgenza)
- **Badge "Perché te lo mostriamo"** — spiegazione in linguaggio naturale
- Due CTA visivamente equivalenti: **Acquista** / **Non ora**

Sono esplicitamente assenti:

- ❌ Countdown e offerte a scadenza
- ❌ *"Altri 3 utenti stanno guardando"*
- ❌ Scarcity artificiale
- ❌ Upsell e cross-sell aggressivi

---

### 6. Post-acquisto nel chatbot

Lo shopping non finisce al pagamento — il chatbot rimane il punto di riferimento:

- 📦 Tracciamento spedizione direttamente in chat
- 🔄 Gestione resi senza uscire dall'app
- 💬 Follow-up naturale: *"Le scarpe sono arrivate? Come ti trovi dopo la prima uscita?"*

Il feedback dell'utente alimenta la **Carta d'Identità** in modo visibile e trasparente — l'utente vede cosa è cambiato nel suo profilo e può correggere o eliminare qualsiasi dato.

*aggiungere architetipo.