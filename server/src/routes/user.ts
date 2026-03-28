import { Router, Request, Response } from "express";
import prisma from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// --- Interests ---

router.get("/interests", requireAuth, async (req: Request, res: Response) => {
  try {
    const interests = await prisma.userInterest.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ interests });
  } catch (err) {
    console.error("Interests list error:", err);
    res.status(500).json({ error: "Errore nel recupero interessi" });
  }
});

router.put("/interests", requireAuth, async (req: Request, res: Response) => {
  try {
    const { interests } = req.body;
    if (!Array.isArray(interests)) {
      res.status(400).json({ error: "interests deve essere un array" });
      return;
    }

    await prisma.userInterest.deleteMany({
      where: { userId: req.user!.userId, source: "onboarding" },
    });

    if (interests.length > 0) {
      await prisma.userInterest.createMany({
        data: interests.map((i: { key: string; label: string; source?: string }) => ({
          userId: req.user!.userId,
          key: i.key,
          label: i.label,
          source: i.source ?? "onboarding",
        })),
      });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Interests bulk set error:", err);
    res.status(500).json({ error: "Errore nel salvataggio interessi" });
  }
});

router.post("/interests", requireAuth, async (req: Request, res: Response) => {
  try {
    const { key, label, source, snippet } = req.body;
    if (!key || !label) {
      res.status(400).json({ error: "key e label sono obbligatori" });
      return;
    }

    const interest = await prisma.userInterest.create({
      data: {
        userId: req.user!.userId,
        key,
        label,
        source: source ?? "inferred",
        snippet: snippet ?? null,
      },
    });

    res.status(201).json({ interest });
  } catch (err) {
    console.error("Interest add error:", err);
    res.status(500).json({ error: "Errore nell'aggiunta interesse" });
  }
});

router.delete("/interests/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "ID non valido" });
      return;
    }

    await prisma.userInterest.deleteMany({
      where: { id, userId: req.user!.userId },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Interest delete error:", err);
    res.status(500).json({ error: "Errore nell'eliminazione interesse" });
  }
});

// --- Purchases ---

router.get("/purchases", requireAuth, async (req: Request, res: Response) => {
  try {
    const purchases = await prisma.userPurchase.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ purchases });
  } catch (err) {
    console.error("Purchases list error:", err);
    res.status(500).json({ error: "Errore nel recupero acquisti" });
  }
});

router.post("/purchases", requireAuth, async (req: Request, res: Response) => {
  try {
    const { productId, category, name, priceEUR } = req.body;
    if (!category || !name || priceEUR == null) {
      res.status(400).json({ error: "category, name e priceEUR sono obbligatori" });
      return;
    }

    const purchase = await prisma.userPurchase.create({
      data: {
        userId: req.user!.userId,
        productId: productId ? Number(productId) : null,
        category,
        name,
        priceEUR: Number(priceEUR),
      },
    });

    res.status(201).json({ purchase });
  } catch (err) {
    console.error("Purchase add error:", err);
    res.status(500).json({ error: "Errore nel salvataggio acquisto" });
  }
});

// --- Settings ---

router.get("/settings", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { settings: true, onboardingInterests: true },
    });
    res.json({ settings: user?.settings ?? null, onboardingInterests: user?.onboardingInterests ?? null });
  } catch (err) {
    console.error("Settings get error:", err);
    res.status(500).json({ error: "Errore nel recupero impostazioni" });
  }
});

router.put("/settings", requireAuth, async (req: Request, res: Response) => {
  try {
    const { settings, onboardingInterests } = req.body;

    const data: Record<string, unknown> = {};
    if (settings !== undefined) data.settings = settings;
    if (onboardingInterests !== undefined) data.onboardingInterests = onboardingInterests;

    await prisma.user.update({
      where: { id: req.user!.userId },
      data,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Settings update error:", err);
    res.status(500).json({ error: "Errore nel salvataggio impostazioni" });
  }
});

export default router;
