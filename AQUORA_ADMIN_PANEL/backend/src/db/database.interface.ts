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
} from '@aquora/shared-types';

export interface IDatabase {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;

  // Products
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;

  // Machines & Channels
  getMachines(): Promise<Machine[]>;
  getMachineByCode(code: string): Promise<Machine | null>;
  getMachineById(id: string): Promise<Machine | null>;
  updateMachineHeartbeat(code: string, ip?: string, state?: string): Promise<Machine | null>;
  updateMachineChannel(
    machineId: string,
    channelNumber: number,
    updates: Partial<MachineChannel>
  ): Promise<MachineChannel | null>;

  // Dispensing Profiles
  getDispensingProfiles(): Promise<DispensingProfile[]>;
  getDispensingProfileByChannel(channelNumber: number): Promise<DispensingProfile | null>;

  // Inventory
  getInventory(): Promise<InventoryItem[]>;
  getInventoryByMachineAndChannel(machineId: string, channelNumber: number): Promise<InventoryItem | null>;
  deductInventory(machineId: string, channelNumber: number, volumeMl: number): Promise<InventoryItem | null>;
  refillInventory(id: string, volumeMl: number): Promise<InventoryItem | null>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  getOrderByNumber(orderNumber: string): Promise<Order | null>;
  createOrder(order: Order): Promise<Order>;
  updateOrderStatus(id: string, status: OrderStatus, dispensedAt?: string): Promise<Order | null>;
  updatePaymentStatus(id: string, status: PaymentStatus): Promise<Order | null>;

  // QR Tokens
  createDispenseJob(token: DispenseJob): Promise<DispenseJob>;
  getDispenseJobByString(tokenString: string): Promise<DispenseJob | null>;
  getDispenseJobByOrderId(orderId: string): Promise<DispenseJob | null>;
  updateDispenseJobStatus(id: string, status: DispenseJobStatus, redeemedAt?: string): Promise<DispenseJob | null>;
  incrementTokenValidation(id: string): Promise<void>;

  // Telemetry & Logs
  recordMachineTelemetry(telemetry: MachineTelemetry): Promise<void>;
  recordMachineEvent(event: Omit<MachineEvent, 'id' | 'created_at'>): Promise<MachineEvent>;
  recordMachineError(error: Omit<MachineError, 'id' | 'created_at'>): Promise<MachineError>;
  getMachineEvents(machineCode?: string, limit?: number): Promise<MachineEvent[]>;
  getMachineErrors(machineCode?: string): Promise<MachineError[]>;
  getAuditLogs(): Promise<any[]>;
}
