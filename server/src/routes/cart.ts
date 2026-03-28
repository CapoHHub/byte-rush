import { Router, Request, Response } from "express";
import prisma from "../prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

async function getOrCreateCart(userId: number) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: { include: { company: { select: { ragioneSociale: true } } } } },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: { product: { include: { company: { select: { ragioneSociale: true } } } } },
          orderBy: { id: "asc" },
        },
      },
    });
  }

  return cart;
}

router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const cart = await getOrCreateCart(req.user!.userId);
    res.json({ cart });
  } catch (err) {
    console.error("Cart get error:", err);
    res.status(500).json({ error: "Errore nel recupero carrello" });
  }
});

router.post("/add", requireAuth, async (req: Request, res: Response) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || typeof productId !== "number") {
      res.status(400).json({ error: "productId (number) è obbligatorio" });
      return;
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.attivo) {
      res.status(404).json({ error: "Prodotto non trovato o non disponibile" });
      return;
    }

    const cart = await getOrCreateCart(req.user!.userId);

    const existing = cart.items.find((i) => i.productId === productId);
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const updated = await getOrCreateCart(req.user!.userId);
    res.json({ cart: updated });
  } catch (err) {
    console.error("Cart add error:", err);
    res.status(500).json({ error: "Errore nell'aggiunta al carrello" });
  }
});

router.delete("/:itemId", requireAuth, async (req: Request, res: Response) => {
  try {
    const itemId = parseInt(String(req.params.itemId), 10);
    if (isNaN(itemId)) {
      res.status(400).json({ error: "ID item non valido" });
      return;
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== req.user!.userId) {
      res.status(404).json({ error: "Item non trovato" });
      return;
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    const updated = await getOrCreateCart(req.user!.userId);
    res.json({ cart: updated });
  } catch (err) {
    console.error("Cart remove error:", err);
    res.status(500).json({ error: "Errore nella rimozione dal carrello" });
  }
});

router.delete("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    const updated = await getOrCreateCart(req.user!.userId);
    res.json({ cart: updated });
  } catch (err) {
    console.error("Cart clear error:", err);
    res.status(500).json({ error: "Errore nello svuotamento carrello" });
  }
});

export default router;
