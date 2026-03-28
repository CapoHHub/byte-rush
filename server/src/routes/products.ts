import { Router, Request, Response } from "express";
import prisma from "../prisma.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const { categoria } = req.query;
    const where: Record<string, unknown> = { attivo: true };
    if (categoria && typeof categoria === "string") {
      where.categoria = categoria;
    }

    const products = await prisma.product.findMany({
      where,
      include: { company: { select: { ragioneSociale: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json({ products });
  } catch (err) {
    console.error("Products list error:", err);
    res.status(500).json({ error: "Errore nel recupero prodotti" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "ID non valido" });
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: { company: { select: { ragioneSociale: true } } },
    });

    if (!product || !product.attivo) {
      res.status(404).json({ error: "Prodotto non trovato" });
      return;
    }

    res.json({ product });
  } catch (err) {
    console.error("Product detail error:", err);
    res.status(500).json({ error: "Errore nel recupero prodotto" });
  }
});

export default router;
