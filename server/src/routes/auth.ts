import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../prisma.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, nome, cognome } = req.body;

    if (!email || !password || !nome || !cognome) {
      res.status(400).json({ error: "Tutti i campi sono obbligatori: email, password, nome, cognome" });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email già registrata" });
      return;
    }

    const existingCompany = await prisma.company.findUnique({ where: { email } });
    if (existingCompany) {
      res.status(409).json({ error: "Questa email è già associata a un account aziendale" });
      return;
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hash, nome, cognome },
    });

    const token = signToken({ userId: user.id, email: user.email, role: "user" });

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, nome: user.nome, cognome: user.cognome, role: "user" },
    });
  } catch (err) {
    console.error("Register error:", err);
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

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Credenziali non valide" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Credenziali non valide" });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: "user" });

    res.json({
      token,
      user: { id: user.id, email: user.email, nome: user.nome, cognome: user.cognome, role: "user" },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Errore durante il login" });
  }
});

router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, nome: true, cognome: true, dataNascita: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({ error: "Utente non trovato" });
      return;
    }

    res.json({ user: { ...user, role: "user" } });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ error: "Errore nel recupero profilo" });
  }
});

export default router;
