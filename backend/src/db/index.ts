import { IDatabase } from './database.interface';
import { MemoryDatabase } from './memory-db';

let dbInstance: IDatabase | null = null;

export function getDatabase(): IDatabase {
  if (!dbInstance) {
    dbInstance = new MemoryDatabase();
    console.log('📦 Database initialized: High-performance in-memory datastore with relational seed data');
  }
  return dbInstance;
}

export { IDatabase };
