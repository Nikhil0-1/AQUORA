import { v4 as uuidv4 } from 'uuid';
import {
  Product,
  Category,
  Machine,
  MachineChannel,
  DispensingProfile,
  InventoryItem,
  Order,
  DispenseJob,
  MachineEvent,
  MachineError,
  MachineTelemetry,
  OrderStatus,
  PaymentStatus,
  DispenseJobStatus,
  StockLevelStatus,
} from '@aquora/shared-types';
import { IDatabase } from './database.interface';

export class MemoryDatabase implements IDatabase {
  private categories: Category[] = [];
  private products: Product[] = [];
  private machines: Machine[] = [];
  private dispensingProfiles: DispensingProfile[] = [];
  private inventory: InventoryItem[] = [];
  private orders: Order[] = [];
  private dispenseJobs: DispenseJob[] = [];
  private telemetry: MachineTelemetry[] = [];
  private events: MachineEvent[] = [];
  private errors: MachineError[] = [];
  private auditLogs: any[] = [];
  private inventoryLogs: any[] = [];
  private adminUsers: any[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    // 1. Categories
    this.categories = [
      { id: 'c1111111-1111-1111-1111-111111111111', name: 'Everyday', slug: 'everyday', display_order: 1, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'c2222222-2222-2222-2222-222222222222', name: 'Aloe Vera', slug: 'aloe-vera', display_order: 2, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'c3333333-3333-3333-3333-333333333333', name: 'Herbal', slug: 'herbal', display_order: 3, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'c4444444-4444-4444-4444-444444444444', name: 'Premium', slug: 'premium', display_order: 4, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'c5555555-5555-5555-5555-555555555555', name: 'Family', slug: 'family', display_order: 5, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];

    // 2. 5 Signature Products
    this.products = [
      {
        id: 'p1111111-1111-1111-1111-111111111111',
        name: 'AQUORA Classic Sanitizer', slug: 'aquora-classic-sanitizer',
        description: 'Standard everyday hand sanitizer for quick and effective 99.9% germ protection.', short_description: 'Standard 99.9% germ protection.',
        category_id: 'c1111111-1111-1111-1111-111111111111', category_name: 'Everyday', price: 40, currency: 'INR', image_url: 'https://images.unsplash.com/photo-1584483766114-2caea62f143c?auto=format&fit=crop&w=800&q=80', volume_ml: 50,
        variants: [
          { id: 'v11', product_id: 'p1111111-1111-1111-1111-111111111111', volume_ml: 50, price: 40, channel_id: 1, is_available: true },
          { id: 'v12', product_id: 'p1111111-1111-1111-1111-111111111111', volume_ml: 100, price: 70, channel_id: 1, is_available: true }
        ],
        ingredients: ['70% Isopropyl Alcohol', 'Purified Water'], nutrition: { calories: 0, sugar_g: 0, vitamin_c_mg: 0, carbs_g: 0, fat_g: 0, protein_g: 0 },
        is_available: true, is_featured: true, channel_id: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      },
      {
        id: 'p2222222-2222-2222-2222-222222222222',
        name: 'AQUORA Aloe Vera Sanitizer', slug: 'aquora-aloe-vera',
        description: 'Enriched with Aloe Vera extracts to keep your hands soft and moisturized while killing germs.', short_description: 'Moisturizing with Aloe Vera.',
        category_id: 'c2222222-2222-2222-2222-222222222222', category_name: 'Aloe Vera', price: 60, currency: 'INR', image_url: 'https://images.unsplash.com/photo-1596755490130-10901e1ed9a2?auto=format&fit=crop&w=800&q=80', volume_ml: 100,
        variants: [
          { id: 'v21', product_id: 'p2222222-2222-2222-2222-222222222222', volume_ml: 50, price: 35, channel_id: 2, is_available: true },
          { id: 'v22', product_id: 'p2222222-2222-2222-2222-222222222222', volume_ml: 100, price: 60, channel_id: 2, is_available: true },
          { id: 'v23', product_id: 'p2222222-2222-2222-2222-222222222222', volume_ml: 150, price: 80, channel_id: 2, is_available: true },
          { id: 'v24', product_id: 'p2222222-2222-2222-2222-222222222222', volume_ml: 250, price: 120, channel_id: 2, is_available: true }
        ],
        ingredients: ['70% Isopropyl Alcohol', 'Aloe Vera Extract'], nutrition: { calories: 0, sugar_g: 0, vitamin_c_mg: 0, carbs_g: 0, fat_g: 0, protein_g: 0 },
        is_available: true, is_featured: true, channel_id: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      },
      {
        id: 'p3333333-3333-3333-3333-333333333333',
        name: 'AQUORA Herbal Sanitizer', slug: 'aquora-herbal',
        description: 'Infused with Neem and Tulsi for natural antibacterial properties alongside alcohol.', short_description: 'Natural Neem & Tulsi blend.',
        category_id: 'c3333333-3333-3333-3333-333333333333', category_name: 'Herbal', price: 70, currency: 'INR', image_url: 'https://images.unsplash.com/photo-1605330839818-e3a1f4961be4?auto=format&fit=crop&w=800&q=80', volume_ml: 100,
        variants: [
          { id: 'v31', product_id: 'p3333333-3333-3333-3333-333333333333', volume_ml: 100, price: 70, channel_id: 3, is_available: true }
        ],
        ingredients: ['70% Isopropyl Alcohol', 'Neem Extract', 'Tulsi Extract'], nutrition: { calories: 0, sugar_g: 0, vitamin_c_mg: 0, carbs_g: 0, fat_g: 0, protein_g: 0 },
        is_available: true, is_featured: true, channel_id: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      },
      {
        id: 'p4444444-4444-4444-4444-444444444444',
        name: 'AQUORA Premium Sanitizer', slug: 'aquora-premium',
        description: 'Luxurious feel with essential oils and a pleasant long-lasting fragrance.', short_description: 'Luxury feel with essential oils.',
        category_id: 'c4444444-4444-4444-4444-444444444444', category_name: 'Premium', price: 90, currency: 'INR', image_url: 'https://images.unsplash.com/photo-1584483766114-2caea62f143c?auto=format&fit=crop&w=800&q=80', volume_ml: 150,
        variants: [
          { id: 'v41', product_id: 'p4444444-4444-4444-4444-444444444444', volume_ml: 150, price: 90, channel_id: 4, is_available: true }
        ],
        ingredients: ['75% Ethyl Alcohol', 'Essential Oils', 'Fragrance'], nutrition: { calories: 0, sugar_g: 0, vitamin_c_mg: 0, carbs_g: 0, fat_g: 0, protein_g: 0 },
        is_available: true, is_featured: true, channel_id: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      },
      {
        id: 'p5555555-5555-5555-5555-555555555555',
        name: 'AQUORA Family Sanitizer', slug: 'aquora-family',
        description: 'Large volume sanitizer perfect for family dispensing, offering great value and complete protection.', short_description: 'Value size 250ml for the whole family.',
        category_id: 'c5555555-5555-5555-5555-555555555555', category_name: 'Family', price: 150, currency: 'INR', image_url: 'https://images.unsplash.com/photo-1629731697330-8041c2c366ff?auto=format&fit=crop&w=800&q=80', volume_ml: 250,
        variants: [
          { id: 'v51', product_id: 'p5555555-5555-5555-5555-555555555555', volume_ml: 250, price: 150, channel_id: 5, is_available: true },
          { id: 'v52', product_id: 'p5555555-5555-5555-5555-555555555555', volume_ml: 500, price: 280, channel_id: 5, is_available: true }
        ],
        ingredients: ['70% Isopropyl Alcohol', 'Water', 'Glycerin'], nutrition: { calories: 0, sugar_g: 0, vitamin_c_mg: 0, carbs_g: 0, fat_g: 0, protein_g: 0 },
        is_available: true, is_featured: true, channel_id: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }
    ];

    // 3. Machine AQ-VM-001 with 5 channels
    const machineId = 'm0011111-1111-1111-1111-111111111111';
    const channels: MachineChannel[] = [
      {
        channel_number: 1,
        product_id: 'p1111111-1111-1111-1111-111111111111',
        product_name: 'AQUORA Classic Sanitizer',
        is_active: true,
        gpio_pin: 25,
        flow_sensor_pin: 34,
        level_sensor_pin: 36,
        current_level_ml: 4600,
        max_capacity_ml: 5000,
        stock_status: 'GOOD',
        calibration_factor: 10.0,
      },
      {
        channel_number: 2,
        product_id: 'p2222222-2222-2222-2222-222222222222',
        product_name: 'AQUORA Aloe Vera Sanitizer',
        is_active: true,
        gpio_pin: 26,
        flow_sensor_pin: 35,
        level_sensor_pin: 39,
        current_level_ml: 4400,
        max_capacity_ml: 5000,
        stock_status: 'GOOD',
        calibration_factor: 10.0,
      },
      {
        channel_number: 3,
        product_id: 'p3333333-3333-3333-3333-333333333333',
        product_name: 'AQUORA Herbal Sanitizer',
        is_active: true,
        gpio_pin: 27,
        flow_sensor_pin: 32,
        level_sensor_pin: 35,
        current_level_ml: 4800,
        max_capacity_ml: 5000,
        stock_status: 'GOOD',
        calibration_factor: 10.0,
      },
      {
        channel_number: 4,
        product_id: 'p4444444-4444-4444-4444-444444444444',
        product_name: 'AQUORA Premium Sanitizer',
        is_active: true,
        gpio_pin: 14,
        flow_sensor_pin: 33,
        level_sensor_pin: 25,
        current_level_ml: 3900,
        max_capacity_ml: 5000,
        stock_status: 'GOOD',
        calibration_factor: 10.0,
      },
      {
        channel_number: 5,
        product_id: 'p5555555-5555-5555-5555-555555555555',
        product_name: 'AQUORA Family Sanitizer',
        is_active: true,
        gpio_pin: 12,
        flow_sensor_pin: 39,
        level_sensor_pin: 19,
        current_level_ml: 4100,
        max_capacity_ml: 5000,
        stock_status: 'GOOD',
        calibration_factor: 10.0,
      },
    ];

    this.machines = [
      {
        id: machineId,
        machine_code: 'AQ-DM-001',
        name: 'AQUORA Dispenser AQ-DM-001',
        location: 'Building A, Ground Floor Lobby',
        status: 'ONLINE',
        firmware_version: 'v1.0.0-esp32',
        ip_address: '192.168.1.102',
        last_seen: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        channels,
      },
      {
        id: 'm0022222-2222-2222-2222-222222222222',
        machine_code: 'AQ-VM-001',
        name: 'AQUORA Dispenser AQ-VM-001 (Alias)',
        location: 'Building A, Ground Floor Lobby',
        status: 'ONLINE',
        firmware_version: 'v1.0.0-esp32',
        ip_address: '192.168.1.102',
        last_seen: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        channels: JSON.parse(JSON.stringify(channels)),
      },
    ];

    // 4. Inventory
    this.inventory = channels.map((ch, idx) => ({
      id: `inv-${idx + 1}`,
      machine_id: machineId,
      machine_code: 'AQ-DM-001',
      channel_number: ch.channel_number,
      product_id: ch.product_id!,
      product_name: ch.product_name,
      current_volume_ml: ch.current_level_ml,
      max_volume_ml: ch.max_capacity_ml,
      low_threshold_ml: 1000,
      critical_threshold_ml: 400,
      status: 'GOOD',
      last_refilled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // 5. Dispensing Profiles
    this.dispensingProfiles = [
      {
        id: 'dp-1',
        name: 'Valencia Orange Standard 250ml',
        channel_number: 1,
        target_volume_ml: 250,
        max_dispense_time_sec: 25,
        pump_mode: 'FLOW_SENSOR',
        calibration_factor: 4.5,
        min_flow_rate_ml_s: 3.0,
      },
      {
        id: 'dp-2',
        name: 'Kinnaur Apple Crisp 250ml',
        channel_number: 2,
        target_volume_ml: 250,
        max_dispense_time_sec: 25,
        pump_mode: 'FLOW_SENSOR',
        calibration_factor: 4.5,
        min_flow_rate_ml_s: 3.0,
      },
      {
        id: 'dp-3',
        name: 'Alphonso Mango Nectar 250ml',
        channel_number: 3,
        target_volume_ml: 250,
        max_dispense_time_sec: 30,
        pump_mode: 'FLOW_SENSOR',
        calibration_factor: 4.8,
        min_flow_rate_ml_s: 2.5,
      },
      {
        id: 'dp-4',
        name: 'Pineapple Tropic 250ml',
        channel_number: 4,
        target_volume_ml: 250,
        max_dispense_time_sec: 25,
        pump_mode: 'FLOW_SENSOR',
        calibration_factor: 4.5,
        min_flow_rate_ml_s: 3.0,
      },
      {
        id: 'dp-5',
        name: 'Antioxidant Fusion 250ml',
        channel_number: 5,
        target_volume_ml: 250,
        max_dispense_time_sec: 30,
        pump_mode: 'FLOW_SENSOR',
        calibration_factor: 4.7,
        min_flow_rate_ml_s: 2.5,
      },
    ];
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return JSON.parse(JSON.stringify(this.categories));
  }
  async getCategoryById(id: string): Promise<Category | null> {
    const item = this.categories.find((c) => c.id === id);
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  // Products
  async getProducts(includeArchived: boolean = false): Promise<Product[]> {
    const list = includeArchived ? this.products : this.products.filter((p) => !p.is_archived);
    return JSON.parse(JSON.stringify(list));
  }
  async getProductById(id: string): Promise<Product | null> {
    const p = this.products.find((item) => item.id === id);
    return p ? JSON.parse(JSON.stringify(p)) : null;
  }
  async createProduct(
    data: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Product> {
    const newProduct: Product = {
      ...data,
      id: uuidv4(),
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.products.push(newProduct);
    return JSON.parse(JSON.stringify(newProduct));
  }
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.products[idx] = {
      ...this.products[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return JSON.parse(JSON.stringify(this.products[idx]));
  }
  async deleteProduct(id: string, archiveOnly: boolean = true): Promise<{ success: boolean; archived: boolean }> {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return { success: false, archived: false };

    // Check if referenced in historical orders
    const isReferencedInOrders = this.orders.some((o) =>
      o.items.some((item) => item.product_id === id)
    );

    if (archiveOnly || isReferencedInOrders) {
      // Safe Soft-Delete / Archive: Preserves historical order integrity
      this.products[idx].is_archived = true;
      this.products[idx].is_available = false;
      this.products[idx].updated_at = new Date().toISOString();
      return { success: true, archived: true };
    }

    this.products.splice(idx, 1);
    return { success: true, archived: false };
  }

  async toggleProductAvailability(id: string): Promise<Product | null> {
    const p = this.products.find((item) => item.id === id);
    if (!p) return null;
    p.is_available = !p.is_available;
    p.updated_at = new Date().toISOString();
    return JSON.parse(JSON.stringify(p));
  }

  // Variants CRUD
  async createVariant(productId: string, variant: any): Promise<any> {
    const p = this.products.find((item) => item.id === productId);
    if (!p) throw new Error('Product not found');
    if (!p.variants) p.variants = [];

    const newVariant = {
      ...variant,
      id: uuidv4(),
      product_id: productId,
      is_archived: false,
      is_available: variant.is_available ?? true,
      available_quantity: variant.available_quantity ?? 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    p.variants.push(newVariant);
    return JSON.parse(JSON.stringify(newVariant));
  }

  async updateVariant(arg1: string, arg2: any, arg3?: any): Promise<any | null> {
    let productId = '';
    let variantId = '';
    let updates: any = {};
    if (arg3 !== undefined) {
      productId = arg1;
      variantId = arg2;
      updates = arg3;
    } else {
      variantId = arg1;
      updates = arg2;
    }

    for (const p of this.products) {
      if (!p.variants) continue;
      if (productId && p.id !== productId) continue;
      const vIdx = p.variants.findIndex((v) => v.id === variantId);
      if (vIdx !== -1) {
        p.variants[vIdx] = {
          ...p.variants[vIdx],
          ...updates,
          updated_at: new Date().toISOString(),
        };
        return JSON.parse(JSON.stringify(p.variants[vIdx]));
      }
    }
    return null;
  }

  async deleteVariant(arg1: string, arg2?: string): Promise<boolean> {
    const productId = arg2 !== undefined ? arg1 : '';
    const variantId = arg2 !== undefined ? arg2 : arg1;

    for (const p of this.products) {
      if (!p.variants) continue;
      if (productId && p.id !== productId) continue;
      const vIdx = p.variants.findIndex((v) => v.id === variantId);
      if (vIdx !== -1) {
        // Soft-delete variant
        p.variants[vIdx].is_archived = true;
        p.variants[vIdx].is_available = false;
        p.variants[vIdx].updated_at = new Date().toISOString();
        return true;
      }
    }
    return false;
  }

  // Stock Adjustment & Audit Logging
  async adjustStock(params: any): Promise<InventoryItem | null> {
    const machineCode = params.machineCode || params.machine_code || 'AQ-DM-001';
    const channelNumber = params.channelNumber || params.channel_number;
    const action = params.action;
    const amountMl = params.amountMl || params.amount_ml;
    const reason = params.reason || 'Manual Adjustment';
    const actorId = params.actorId || params.actor_id || 'admin';

    const inv = this.inventory.find(
      (i) =>
        i.machine_code?.toUpperCase() === machineCode.toUpperCase() &&
        i.channel_number === channelNumber
    );
    if (!inv) return null;

    let newVolume = inv.current_volume_ml;
    if (action === 'ADD') {
      newVolume = Math.min(inv.max_volume_ml, inv.current_volume_ml + amountMl);
    } else if (action === 'REDUCE') {
      newVolume = Math.max(0, inv.current_volume_ml - amountMl);
    } else if (action === 'SET') {
      newVolume = Math.max(0, Math.min(inv.max_volume_ml, amountMl));
    }

    inv.current_volume_ml = newVolume;
    inv.updated_at = new Date().toISOString();
    inv.status =
      newVolume === 0
        ? 'OUT_OF_STOCK'
        : newVolume <= inv.critical_threshold_ml
        ? 'CRITICAL'
        : newVolume <= inv.low_threshold_ml
        ? 'LOW'
        : 'GOOD';

    // Log to inventory history
    this.inventoryLogs.push({
      id: uuidv4(),
      machine_code: machineCode,
      channel_number: channelNumber,
      change_amount_ml: amountMl,
      resulting_volume_ml: newVolume,
      reason: reason,
      actor_id: actorId,
      created_at: new Date().toISOString(),
    });

    return JSON.parse(JSON.stringify(inv));
  }

  async getInventoryLogs(machineCode?: string): Promise<any[]> {
    const logs = machineCode
      ? this.inventoryLogs.filter((l) => l.machine_code.toUpperCase() === machineCode.toUpperCase())
      : this.inventoryLogs;
    return JSON.parse(JSON.stringify(logs.reverse()));
  }

  // Admin Auth Mapping
  async getAdminUserByFirebaseUid(uid: string): Promise<any | null> {
    const u = this.adminUsers.find((user) => user.firebase_uid === uid && user.is_active);
    return u ? JSON.parse(JSON.stringify(u)) : null;
  }

  async getAdminUserByEmail(email: string): Promise<any | null> {
    const u = this.adminUsers.find((user) => user.email.toLowerCase() === email.toLowerCase() && user.is_active);
    return u ? JSON.parse(JSON.stringify(u)) : null;
  }

  async upsertAdminUser(user: any): Promise<any> {
    const idx = this.adminUsers.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (idx !== -1) {
      this.adminUsers[idx] = { ...this.adminUsers[idx], ...user, updated_at: new Date().toISOString() };
      return JSON.parse(JSON.stringify(this.adminUsers[idx]));
    }
    const newUser = {
      id: uuidv4(),
      role: 'ADMIN',
      is_active: true,
      ...user,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.adminUsers.push(newUser);
    return JSON.parse(JSON.stringify(newUser));
  }

  // Machines
  async getMachines(): Promise<Machine[]> {
    return JSON.parse(JSON.stringify(this.machines));
  }
  async getMachineByCode(code: string): Promise<Machine | null> {
    const m = this.machines.find(
      (item) => item.machine_code.toUpperCase() === code.toUpperCase()
    );
    return m ? JSON.parse(JSON.stringify(m)) : null;
  }
  async getMachineById(id: string): Promise<Machine | null> {
    const m = this.machines.find((item) => item.id === id);
    return m ? JSON.parse(JSON.stringify(m)) : null;
  }
  async updateMachineHeartbeat(
    code: string,
    ip?: string,
    state?: string
  ): Promise<Machine | null> {
    const m = this.machines.find(
      (item) => item.machine_code.toUpperCase() === code.toUpperCase()
    );
    if (!m) return null;
    m.last_seen = new Date().toISOString();
    m.status = 'ONLINE';
    if (ip) m.ip_address = ip;
    return JSON.parse(JSON.stringify(m));
  }
  async updateMachineChannel(
    machineId: string,
    channelNumber: number,
    updates: Partial<MachineChannel>
  ): Promise<MachineChannel | null> {
    const m = this.machines.find((item) => item.id === machineId);
    if (!m) return null;
    const ch = m.channels.find((c) => c.channel_number === channelNumber);
    if (!ch) return null;
    Object.assign(ch, updates);
    return JSON.parse(JSON.stringify(ch));
  }

  // Profiles
  async getDispensingProfiles(): Promise<DispensingProfile[]> {
    return JSON.parse(JSON.stringify(this.dispensingProfiles));
  }
  async getDispensingProfileByChannel(channelNumber: number): Promise<DispensingProfile | null> {
    const dp = this.dispensingProfiles.find((p) => p.channel_number === channelNumber);
    return dp ? JSON.parse(JSON.stringify(dp)) : null;
  }

  // Inventory
  async getInventory(): Promise<InventoryItem[]> {
    return JSON.parse(JSON.stringify(this.inventory));
  }
  async getInventoryByMachineAndChannel(
    machineId: string,
    channelNumber: number
  ): Promise<InventoryItem | null> {
    const inv = this.inventory.find(
      (i) => i.machine_id === machineId && i.channel_number === channelNumber
    );
    return inv ? JSON.parse(JSON.stringify(inv)) : null;
  }
  async deductInventory(
    machineId: string,
    channelNumber: number,
    volumeMl: number
  ): Promise<InventoryItem | null> {
    const inv = this.inventory.find(
      (i) => i.machine_id === machineId && i.channel_number === channelNumber
    );
    if (!inv) return null;
    inv.current_volume_ml = Math.max(0, inv.current_volume_ml - volumeMl);
    if (inv.current_volume_ml <= 0) {
      inv.status = 'OUT_OF_STOCK';
    } else if (inv.current_volume_ml <= inv.critical_threshold_ml) {
      inv.status = 'CRITICAL';
    } else if (inv.current_volume_ml <= inv.low_threshold_ml) {
      inv.status = 'LOW';
    } else {
      inv.status = 'GOOD';
    }
    inv.updated_at = new Date().toISOString();

    // Also update machine channel level
    const machine = this.machines.find((m) => m.id === machineId);
    if (machine) {
      const ch = machine.channels.find((c) => c.channel_number === channelNumber);
      if (ch) {
        ch.current_level_ml = inv.current_volume_ml;
        ch.stock_status = inv.status;
      }
    }
    return JSON.parse(JSON.stringify(inv));
  }
  async refillInventory(id: string, volumeMl: number): Promise<InventoryItem | null> {
    const inv = this.inventory.find((i) => i.id === id);
    if (!inv) return null;
    inv.current_volume_ml = Math.min(inv.max_volume_ml, inv.current_volume_ml + volumeMl);
    inv.status = inv.current_volume_ml > inv.low_threshold_ml ? 'GOOD' : 'LOW';
    inv.last_refilled_at = new Date().toISOString();
    inv.updated_at = new Date().toISOString();

    const machine = this.machines.find((m) => m.id === inv.machine_id);
    if (machine) {
      const ch = machine.channels.find((c) => c.channel_number === inv.channel_number);
      if (ch) {
        ch.current_level_ml = inv.current_volume_ml;
        ch.stock_status = inv.status;
      }
    }
    return JSON.parse(JSON.stringify(inv));
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return JSON.parse(JSON.stringify(this.orders));
  }
  async getOrderById(id: string): Promise<Order | null> {
    const ord = this.orders.find((o) => o.id === id);
    return ord ? JSON.parse(JSON.stringify(ord)) : null;
  }
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const ord = this.orders.find((o) => o.order_number === orderNumber);
    return ord ? JSON.parse(JSON.stringify(ord)) : null;
  }
  async createOrder(order: any): Promise<Order> {
    const newOrder: Order = {
      id: order.id || uuidv4(),
      order_number: order.order_number || ('AQ-' + Math.floor(100000 + Math.random() * 900000)),
      customer_id: order.customer_id,
      customer_name: order.customer_name || 'Customer',
      customer_phone: order.customer_phone,
      machine_id: order.machine_id || 'm1111111-1111-1111-1111-111111111111',
      machine_code: order.machine_code || 'AQ-DM-001',
      source: order.source || 'SYSTEM_1_TERMINAL',
      amount: order.amount,
      currency: order.currency || 'INR',
      payment_status: order.payment_status || 'PENDING',
      order_status: order.order_status || 'CREATED',
      qr_token: order.qr_token,
      items: order.items || [],
      created_at: order.created_at || new Date().toISOString(),
      updated_at: order.updated_at || new Date().toISOString(),
      expires_at: order.expires_at || new Date(Date.now() + 15 * 60000).toISOString(),
    };
    this.orders.push(newOrder);
    return JSON.parse(JSON.stringify(newOrder));
  }
  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    dispensedAt?: string
  ): Promise<Order | null> {
    const ord = this.orders.find((o) => o.id === id);
    if (!ord) return null;
    ord.order_status = status;
    ord.updated_at = new Date().toISOString();
    if (dispensedAt) ord.dispensed_at = dispensedAt;
    return JSON.parse(JSON.stringify(ord));
  }
  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Order | null> {
    const ord = this.orders.find((o) => o.id === id);
    if (!ord) return null;
    ord.payment_status = status;
    if (status === 'PAID') {
      ord.order_status = 'PAID';
    } else if (status === 'FAILED') {
      ord.order_status = 'FAILED';
    }
    ord.updated_at = new Date().toISOString();
    return JSON.parse(JSON.stringify(ord));
  }

  // QR Tokens
  async createDispenseJob(token: DispenseJob): Promise<DispenseJob> {
    this.dispenseJobs.push(token);
    return JSON.parse(JSON.stringify(token));
  }
  async getDispenseJobByString(tokenString: string): Promise<DispenseJob | null> {
    const t = this.dispenseJobs.find((tok) => tok.id === tokenString);
    return t ? JSON.parse(JSON.stringify(t)) : null;
  }
  async getDispenseJobByOrderId(orderId: string): Promise<DispenseJob | null> {
    const t = this.dispenseJobs.find((tok) => tok.order_id === orderId);
    return t ? JSON.parse(JSON.stringify(t)) : null;
  }
  async updateDispenseJobStatus(
    id: string,
    status: DispenseJobStatus,
    completedAt?: string
  ): Promise<DispenseJob | null> {
    const t = this.dispenseJobs.find((tok) => tok.id === id);
    if (!t) return null;
    t.status = status;
    if (completedAt) t.completed_at = completedAt;
    return JSON.parse(JSON.stringify(t));
  }
  async incrementTokenValidation(id: string): Promise<void> {
    const t = this.dispenseJobs.find((tok) => tok.id === id);
    if (t) t.flow_rate += 1;
  }

  // Telemetry & Logs
  async recordMachineTelemetry(tel: MachineTelemetry): Promise<void> {
    this.telemetry.unshift(tel);
    if (this.telemetry.length > 500) this.telemetry.pop();
  }
  async recordMachineEvent(
    event: Omit<MachineEvent, 'id' | 'created_at'>
  ): Promise<MachineEvent> {
    const newEvent: MachineEvent = {
      ...event,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    this.events.unshift(newEvent);
    if (this.events.length > 500) this.events.pop();
    return JSON.parse(JSON.stringify(newEvent));
  }
  async recordMachineError(
    error: Omit<MachineError, 'id' | 'created_at'>
  ): Promise<MachineError> {
    const newErr: MachineError = {
      ...error,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    this.errors.unshift(newErr);
    return JSON.parse(JSON.stringify(newErr));
  }
  async getMachineEvents(machineCode?: string, limit = 50): Promise<MachineEvent[]> {
    let list = this.events;
    if (machineCode) {
      list = list.filter((e) => e.machine_code === machineCode);
    }
    return JSON.parse(JSON.stringify(list.slice(0, limit)));
  }
  async getMachineErrors(machineCode?: string): Promise<MachineError[]> {
    let list = this.errors;
    if (machineCode) {
      list = list.filter((e) => e.machine_code === machineCode);
    }
    return JSON.parse(JSON.stringify(list));
  }
  async getAuditLogs(): Promise<any[]> {
    return JSON.parse(JSON.stringify(this.auditLogs));
  }
}
