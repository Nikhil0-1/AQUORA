import { Router, Request, Response } from 'express';
import { getDatabase } from '../db';

export const productsRouter = Router();
const db = getDatabase();

// GET /api/v1/products
productsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const products = await db.getProducts();
    const categories = await db.getCategories();
    // enrich category name
    const enriched = products.map((p) => {
      const cat = categories.find((c) => c.id === p.category_id);
      return { ...p, category_name: cat ? cat.name : undefined };
    });
    return res.json(enriched);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// GET /api/v1/products/:id
productsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const categories = await db.getCategories();
    const cat = categories.find((c) => c.id === product.category_id);
    return res.json({ ...product, category_name: cat ? cat.name : undefined });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// GET /api/v1/categories
export const categoriesRouter = Router();
categoriesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await db.getCategories();
    return res.json(categories.sort((a, b) => a.display_order - b.display_order));
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});
