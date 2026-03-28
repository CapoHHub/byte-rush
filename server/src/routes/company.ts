import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../prisma.js";
import { signToken, requireCompanyAuth } from "../middleware/auth.js";

const router = Router();

const VALID_CATEGORIES = ["running", "skincare", "books", "fitness", "tech", "cooking"];

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { ragioneSociale, email, password, partitaIva } = req.body;

    if (!ragioneSociale || !email || !password) {
      res.status(400).json({ error: "Ragione sociale, email e password sono obbligatori" });
      return;
    }

    const existing = await prisma.company.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email già registrata" });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: "Questa email è già associata a un account utente" });
      return;
    }

    const hash = await bcrypt.hash(password, 12);
    const company = await prisma.company.create({
      data: { ragioneSociale, email, password: hash, partitaIva: partitaIva || null },
    });

    const token = signToken({ userId: company.id, email: company.email, role: "company" });

    res.status(201).json({
      token,
      user: { id: company.id, email: company.email, ragioneSociale: company.ragioneSociale, role: "company" },
    });
  } catch (err) {
    console.error("Company register error:", err);
    res.status(500).json({ error: "Errore durante la registrazione" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email e password sono obbligatori" });
      return;
    }

    const company = await prisma.company.findUnique({ where: { email } });
    if (!company) {
      res.status(401).json({ error: "Credenziali non valide" });
      return;
    }

    const valid = await bcrypt.compare(password, company.password);
    if (!valid) {
      res.status(401).json({ error: "Credenziali non valide" });
      return;
    }

    const token = signToken({ userId: company.id, email: company.email, role: "company" });

    res.json({
      token,
      user: { id: company.id, email: company.email, ragioneSociale: company.ragioneSociale, role: "company" },
    });
  } catch (err) {
    console.error("Company login error:", err);
    res.status(500).json({ error: "Errore durante il login" });
  }
});

router.get("/me", requireCompanyAuth, async (req: Request, res: Response) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, ragioneSociale: true, partitaIva: true, createdAt: true },
    });
    if (!company) {
      res.status(404).json({ error: "Azienda non trovata" });
      return;
    }
    res.json({ user: { ...company, role: "company" } });
  } catch (err) {
    console.error("Company me error:", err);
    res.status(500).json({ error: "Errore nel recupero profilo" });
  }
});

router.get("/products", requireCompanyAuth, async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { companyId: req.user!.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ products });
  } catch (err) {
    console.error("Company products list error:", err);
    res.status(500).json({ error: "Errore nel recupero prodotti" });
  }
});

router.post("/products", requireCompanyAuth, async (req: Request, res: Response) => {
  try {
    const { nome, descrizione, prezzo, immagine, categoria, motivazione, taglie } = req.body;

    if (!nome || prezzo == null) {
      res.status(400).json({ error: "Nome e prezzo sono obbligatori" });
      return;
    }

    if (categoria && !VALID_CATEGORIES.includes(categoria)) {
      res.status(400).json({ error: `Categoria non valida. Valide: ${VALID_CATEGORIES.join(", ")}` });
      return;
    }

    const product = await prisma.product.create({
      data: {
        companyId: req.user!.userId,
        nome,
        descrizione: descrizione || null,
        prezzo: Number(prezzo),
        immagine: immagine || null,
        categoria: categoria || null,
        motivazione: motivazione || null,
        taglie: taglie || null,
        attivo: true,
      },
    });

    res.status(201).json({ product });
  } catch (err) {
    console.error("Company product create error:", err);
    res.status(500).json({ error: "Errore nella creazione del prodotto" });
  }
});

router.put("/products/:id", requireCompanyAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "ID non valido" });
      return;
    }

    const existing = await prisma.product.findFirst({
      where: { id, companyId: req.user!.userId },
    });
    if (!existing) {
      res.status(404).json({ error: "Prodotto non trovato" });
      return;
    }

    const { nome, descrizione, prezzo, immagine, categoria, motivazione, taglie, attivo } = req.body;

    if (categoria && !VALID_CATEGORIES.includes(categoria)) {
      res.status(400).json({ error: `Categoria non valida. Valide: ${VALID_CATEGORIES.join(", ")}` });
      return;
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(descrizione !== undefined && { descrizione }),
        ...(prezzo !== undefined && { prezzo: Number(prezzo) }),
        ...(immagine !== undefined && { immagine }),
        ...(categoria !== undefined && { categoria }),
        ...(motivazione !== undefined && { motivazione }),
        ...(taglie !== undefined && { taglie }),
        ...(attivo !== undefined && { attivo }),
      },
    });

    res.json({ product });
  } catch (err) {
    console.error("Company product update error:", err);
    res.status(500).json({ error: "Errore nell'aggiornamento del prodotto" });
  }
});

router.delete("/products/:id", requireCompanyAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "ID non valido" });
      return;
    }

    const existing = await prisma.product.findFirst({
      where: { id, companyId: req.user!.userId },
    });
    if (!existing) {
      res.status(404).json({ error: "Prodotto non trovato" });
      return;
    }

    await prisma.product.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error("Company product delete error:", err);
    res.status(500).json({ error: "Errore nell'eliminazione del prodotto" });
  }
});

export default router;
