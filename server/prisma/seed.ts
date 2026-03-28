import { PrismaClient } from "../src/generated/prisma/index.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_COMPANY = {
  ragioneSociale: "Senso Demo Store",
  email: "demo@senso.app",
  password: "demo1234",
  partitaIva: "IT00000000000",
};

const PRODUCTS = [
  {
    nome: "Age Serum Anti-Aging",
    descrizione: "Siero anti-aging con ingredienti naturali certificati e cruelty-free.",
    prezzo: 42.0,
    categoria: "skincare",
    immagine: "https://images.unsplash.com/photo-1766940095250-5c7715ab57ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza2luY2FyZSUyMHNlcnVtJTIwYm90dGxlJTIwbWluaW1hbHxlbnwxfHx8fDE3NzQ2MTIxNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    motivazione: "Hai menzionato di cercare prodotti anti-aging sostenibili. Questo siero ha ingredienti naturali certificati e ottime recensioni sulla durata.",
  },
  {
    nome: "Brightening Mask",
    descrizione: "Maschera illuminante per una pelle più luminosa e uniforme.",
    prezzo: 28.0,
    categoria: "skincare",
    immagine: "https://images.unsplash.com/photo-1764694071508-e4b1efcd39bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWNlJTIwY3JlYW0lMjBqYXIlMjBtaW5pbWFsfGVufDF8fHx8MTc3NDY0NzU4MHww&ixlib=rb-4.1.0&q=80&w=1080",
    motivazione: "Complementa il siero anti-aging che stavi cercando. Ideale per la tua routine settimanale.",
  },
  {
    nome: "CloudRunner Pro",
    descrizione: "Scarpe da corsa con ammortizzamento avanzato per lunghe distanze.",
    prezzo: 135.0,
    categoria: "running",
    immagine: "https://images.unsplash.com/photo-1742132622359-e360924a3567?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwc2hvZXMlMjBhdGhsZXRpYyUyMG1pbmltYWx8ZW58MXx8fHwxNzc0NjQ3ODU0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    motivazione: "Hai una gara in arrivo e hai aumentato il chilometraggio. Queste scarpe offrono ottimo ammortizzamento per le lunghe distanze.",
    taglie: ["39", "40", "41", "42", "43", "44", "45"],
  },
  {
    nome: "SoundPods Air",
    descrizione: "Auricolari wireless resistenti al sudore, ideali per la corsa.",
    prezzo: 79.0,
    categoria: "running",
    immagine: "https://images.unsplash.com/photo-1635862634193-dae77d05fea4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aXJlbGVzcyUyMGVhcmJ1ZHMlMjBzcG9ydCUyMGJsYWNrfGVufDF8fHx8MTc3NDY0Nzg1NXww&ixlib=rb-4.1.0&q=80&w=1080",
    motivazione: "Ideali per la corsa: resistenti al sudore, leggeri e con buona tenuta.",
  },
  {
    nome: "Atomic Habits",
    descrizione: "Il libro definitivo sulla scienza delle abitudini.",
    prezzo: 18.5,
    categoria: "books",
    immagine: "https://images.unsplash.com/photo-1621944190272-ec775aad58d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwbWluaW1hbCUyMGNvdmVyJTIwcmVhZGluZ3xlbnwxfHx8fDE3NzQ2NDgwOTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    motivazione: "Hai mostrato interesse per il miglioramento personale. Questo libro ti aiuterà a costruire abitudini efficaci.",
  },
  {
    nome: "Il Potere delle Abitudini",
    descrizione: "Un viaggio nella scienza delle abitudini e come cambiarle.",
    prezzo: 16.0,
    categoria: "books",
    immagine: "https://images.unsplash.com/photo-1461902492714-c655fb137f7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub3ZlbCUyMGJvb2slMjBoYXJkY292ZXJ8ZW58MXx8fHwxNzc0NjQ4MTAyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    motivazione: "Perfetto complemento per approfondire la scienza delle abitudini.",
  },
  {
    nome: "Premium Yoga Mat",
    descrizione: "Tappetino yoga con ottimo grip e ammortizzamento.",
    prezzo: 45.0,
    categoria: "fitness",
    immagine: "https://images.unsplash.com/photo-1767605545968-a102fc151b08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwbWF0JTIwZml0bmVzcyUyMGVxdWlwbWVudHxlbnwxfHx8fDE3NzQ2NDgxMDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    motivazione: "Hai menzionato di voler iniziare yoga. Questo tappetino offre ottimo grip e ammortizzamento.",
  },
  {
    nome: "Resistance Bands Set",
    descrizione: "Set di bande elastiche per rafforzamento muscolare e mobilità.",
    prezzo: 24.99,
    categoria: "fitness",
    immagine: "https://images.unsplash.com/photo-1584827386916-b5351d3ba34b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpc3RhbmNlJTIwYmFuZHMlMjBmaXRuZXNzfGVufDF8fHx8MTc3NDYxMzk4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    motivazione: "Ideali per il rafforzamento muscolare e la mobilità. Perfetti per allenarti ovunque.",
  },
  {
    nome: "ProBook Air 14",
    descrizione: "Laptop ultrasottile per produttività e creatività.",
    prezzo: 899.0,
    categoria: "tech",
    immagine: "https://images.unsplash.com/photo-1641247530898-ed6b1b5215eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXB0b3AlMjBjb21wdXRlciUyMG1pbmltYWwlMjBkZXNrfGVufDF8fHx8MTc3NDY0ODEwMHww&ixlib=rb-4.1.0&q=80&w=1080",
    motivazione: "Hai bisogno di un laptop per lavorare in mobilità. Leggero, potente e grande autonomia.",
  },
  {
    nome: "Wireless Headphones Pro",
    descrizione: "Cuffie con cancellazione del rumore attiva.",
    prezzo: 199.0,
    categoria: "tech",
    immagine: "https://images.unsplash.com/photo-1600086827875-a63b01f1335c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVldG9vdGglMjBoZWFkcGhvbmVzJTIwYmxhY2t8ZW58MXx8fHwxNzc0NjQ4MTAxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    motivazione: "Cancellazione del rumore attiva per lavoro e musica.",
  },
  {
    nome: "Ricette Mediterranee",
    descrizione: "Ricette mediterranee equilibrate e facili da preparare.",
    prezzo: 22.0,
    categoria: "cooking",
    immagine: "https://images.unsplash.com/photo-1665110180279-ee5372bb96bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb29rYm9vayUyMGtpdGNoZW4lMjBtaW5pbWFsfGVufDF8fHx8MTc3NDY0ODEwMHww&ixlib=rb-4.1.0&q=80&w=1080",
    motivazione: "Ricette mediterranee equilibrate e facili da preparare per una dieta più sana.",
  },
  {
    nome: "Set Coltelli Chef Pro",
    descrizione: "Set professionale di coltelli da cucina affilati e bilanciati.",
    prezzo: 89.0,
    categoria: "cooking",
    immagine: "https://images.unsplash.com/photo-1705917893262-51fec4cd3e29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraXRjaGVuJTIwa25pZmUlMjBzZXQlMjBjaGVmfGVufDF8fHx8MTc3NDY0ODEwMXww&ixlib=rb-4.1.0&q=80&w=1080",
    motivazione: "Affilati, bilanciati e duraturi — essenziali per cucinare bene.",
  },
];

async function main() {
  console.log("Seeding database...");

  const hash = await bcrypt.hash(DEMO_COMPANY.password, 12);
  const company = await prisma.company.upsert({
    where: { email: DEMO_COMPANY.email },
    update: {},
    create: {
      ragioneSociale: DEMO_COMPANY.ragioneSociale,
      email: DEMO_COMPANY.email,
      password: hash,
      partitaIva: DEMO_COMPANY.partitaIva,
    },
  });
  console.log(`Company created: ${company.ragioneSociale} (id=${company.id})`);

  for (const p of PRODUCTS) {
    await prisma.product.create({
      data: {
        companyId: company.id,
        nome: p.nome,
        descrizione: p.descrizione,
        prezzo: p.prezzo,
        categoria: p.categoria,
        immagine: p.immagine,
        motivazione: p.motivazione,
        taglie: p.taglie ?? undefined,
        attivo: true,
      },
    });
  }
  console.log(`${PRODUCTS.length} products seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
