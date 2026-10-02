import { Router, Request, Response } from 'express';
import { getDatabase } from '../db';

export const machinesRouter = Router();
const db = getDatabase();

// GET /api/v1/machines/:code
machinesRouter.get('/:code', async (req: Request, res: Response) => {
  try {
    const code = req.params.code;
    const machine = await db.getMachineByCode(code);
    if (!machine) {
      return res.status(404).json({ message: `Machine ${code} not found` });
    }

    // Strip internal hardware pins if needed for public security, but return mapped products & availability
    return res.json(machine);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});
