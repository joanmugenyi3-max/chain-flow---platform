// ============================================================
// ChainFlow Platform – Shared TypeScript Types
// packages/types/src/index.ts
// ============================================================

// ─────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER',
  MINING_ENGINEER = 'MINING_ENGINEER',
  SAFETY_OFFICER = 'SAFETY_OFFICER',
}

export enum Plan {
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
  MINING_ENTERPRISE = 'MINING_ENTERPRISE',
}

export enum Industry {
  MINING = 'MINING',
  MANUFACTURING = 'MANUFACTURING',
  RETAIL = 'RETAIL',
  PHARMACEUTICAL = 'PHARMACEUTICAL',
  FOOD_BEVERAGE = 'FOOD_BEVERAGE',
  AUTOMOTIVE = 'AUTOMOTIVE',
  ELECTRONICS = 'ELECTRONICS',
  CONSTRUCTION = 'CONSTRUCTION',
  ENERGY = 'ENERGY',
  OTHER = 'OTHER',
}

export enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  SENT = 'SENT',
  PARTIAL = 'PARTIAL',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export enum ShipmentStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  DELAYED = 'DELAYED',
  CANCELLED = 'CANCELLED',
}

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY',
}

// ─────────────────────────────────────────────────────────────
// Generic / Utility Types
// ─────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  timestamp: string;
  requestId?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams extends PaginationParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  organizationId?: string;
}

// ─────────────────────────────────────────────────────────────
// Organization & User
// ─────────────────────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  industry: Industry;
  plan: Plan;
  country: string;
  timezone: string;
  currency: string;
  logoUrl?: string;
  website?: string;
  address?: Address;
  settings?: OrganizationSettings;
  isActive: boolean;
  trialEndsAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  features: {
    mining: boolean;
    aiInsights: boolean;
    iotSensors: boolean;
    advancedAnalytics: boolean;
    customWorkflows: boolean;
  };
  notifications: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    slackWebhook?: string;
    teamsWebhook?: string;
  };
  approval: {
    requirePurchaseOrderApproval: boolean;
    purchaseOrderApprovalThreshold: number;
    approvalChain: string[];
  };
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  coordinates?: Coordinates;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface User {
  id: string;
  organizationId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: Date | null;
  twoFactorEnabled: boolean;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  currency: string;
  theme: 'light' | 'dark' | 'system';
  dashboardLayout?: Record<string, unknown>;
  notificationPreferences?: {
    email: boolean;
    inApp: boolean;
    sms: boolean;
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  organizationId: string;
  role: UserRole;
  plan: Plan;
  sessionId: string;
  iat?: number;
  exp?: number;
}

// ─────────────────────────────────────────────────────────────
// Supply Chain – Core
// ─────────────────────────────────────────────────────────────

export interface Supplier {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  address: Address;
  industry?: Industry;
  website?: string;
  taxId?: string;
  bankDetails?: BankDetails;
  paymentTermsDays: number;
  currency: string;
  rating?: number;
  isActive: boolean;
  tags?: string[];
  notes?: string;
  certifications?: SupplierCertification[];
  performanceMetrics?: SupplierPerformance;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  iban?: string;
  swiftCode?: string;
}

export interface SupplierCertification {
  name: string;
  issuingBody: string;
  certNumber: string;
  issuedAt: Date;
  expiresAt: Date;
  documentUrl?: string;
}

export interface SupplierPerformance {
  onTimeDeliveryRate: number;
  qualityScore: number;
  responseTimeHours: number;
  defectRate: number;
  evaluatedAt: Date;
}

export interface PurchaseOrder {
  id: string;
  organizationId: string;
  poNumber: string;
  supplierId: string;
  supplier?: Supplier;
  status: OrderStatus;
  currency: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  lines: PurchaseOrderLine[];
  requestedById: string;
  requestedBy?: Pick<User, 'id' | 'fullName' | 'email'>;
  approvedById?: string | null;
  approvedBy?: Pick<User, 'id' | 'fullName' | 'email'> | null;
  approvedAt?: Date | null;
  expectedDeliveryDate?: Date | null;
  actualDeliveryDate?: Date | null;
  notes?: string;
  attachments?: Attachment[];
  warehouseId?: string;
  shipmentIds?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderLine {
  id: string;
  purchaseOrderId: string;
  productId?: string;
  description: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountRate: number;
  totalPrice: number;
  unit: string;
  receivedQuantity: number;
  notes?: string;
}

export interface Contract {
  id: string;
  organizationId: string;
  supplierId: string;
  supplier?: Supplier;
  title: string;
  contractNumber: string;
  type: 'FRAMEWORK' | 'SPOT' | 'BLANKET' | 'CONSIGNMENT';
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'PENDING_RENEWAL';
  currency: string;
  totalValue: number;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  renewalNoticeDays: number;
  paymentTermsDays: number;
  terms?: string;
  attachments?: Attachment[];
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: Date;
  uploadedById: string;
}

// ─────────────────────────────────────────────────────────────
// Inventory & Warehouse
// ─────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  organizationId: string;
  warehouseId: string;
  warehouse?: Warehouse;
  productId: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  quantityInTransit: number;
  reorderPoint: number;
  reorderQuantity: number;
  maxStockLevel: number;
  unitCost: number;
  totalValue: number;
  location?: string;
  lotNumber?: string;
  expiresAt?: Date | null;
  supplierId?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Warehouse {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  type: 'MAIN' | 'TRANSIT' | 'RETURNS' | 'QUARANTINE' | 'COLD_STORAGE' | 'HAZMAT';
  address: Address;
  manager?: string;
  contactPhone?: string;
  contactEmail?: string;
  capacityTotal?: number;
  capacityUsed?: number;
  capacityUnit?: string;
  isActive: boolean;
  zones?: WarehouseZone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WarehouseZone {
  id: string;
  warehouseId: string;
  name: string;
  code: string;
  type: string;
  temperature?: number;
  humidity?: number;
  capacity?: number;
}

// ─────────────────────────────────────────────────────────────
// Logistics
// ─────────────────────────────────────────────────────────────

export interface Shipment {
  id: string;
  organizationId: string;
  shipmentNumber: string;
  purchaseOrderIds: string[];
  supplierId?: string;
  supplier?: Supplier;
  status: ShipmentStatus;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  vehicleId?: string;
  vehicle?: Vehicle;
  routeId?: string;
  route?: Route;
  originAddress: Address;
  destinationAddress: Address;
  estimatedDepartureAt?: Date | null;
  actualDepartureAt?: Date | null;
  estimatedArrivalAt?: Date | null;
  actualArrivalAt?: Date | null;
  weight?: number;
  weightUnit?: string;
  volume?: number;
  volumeUnit?: string;
  packageCount?: number;
  specialInstructions?: string;
  insuranceValue?: number;
  events?: ShipmentEvent[];
  documents?: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id: string;
  organizationId: string;
  name: string;
  licensePlate: string;
  type: 'TRUCK' | 'VAN' | 'RAIL' | 'SHIP' | 'AIRCRAFT' | 'DRONE';
  make?: string;
  model?: string;
  year?: number;
  capacity?: number;
  capacityUnit?: string;
  driverName?: string;
  driverPhone?: string;
  currentLocation?: Coordinates;
  isAvailable: boolean;
  lastMaintenanceAt?: Date | null;
  nextMaintenanceAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Route {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  origin: Address;
  destination: Address;
  waypoints?: Coordinates[];
  distanceKm: number;
  estimatedDurationHours: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────
// Mining
// ─────────────────────────────────────────────────────────────

export interface MiningSite {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  type: 'OPEN_PIT' | 'UNDERGROUND' | 'PLACER' | 'OFFSHORE' | 'IN_SITU';
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED' | 'EXPLORATION';
  location: Address;
  coordinates: Coordinates;
  areaHectares?: number;
  concessionNumber?: string;
  concessionExpiresAt?: Date | null;
  mineralTypes?: string[];
  annualCapacityTons?: number;
  currentProductionTons?: number;
  manager?: string;
  managerEmail?: string;
  zones?: MiningZone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MiningZone {
  id: string;
  siteId: string;
  name: string;
  code: string;
  type: 'EXTRACTION' | 'PROCESSING' | 'STORAGE' | 'TAILINGS' | 'OFFICE' | 'MAINTENANCE';
  status: 'ACTIVE' | 'INACTIVE' | 'RESTRICTED';
  coordinates?: Coordinates[];
  depthMeters?: number;
  oreGrade?: number;
  safetyLevel?: AlertSeverity;
  restrictions?: string[];
}

export interface OreExtraction {
  id: string;
  organizationId: string;
  siteId: string;
  site?: MiningSite;
  zoneId?: string;
  zone?: MiningZone;
  date: Date;
  shift: 'DAY' | 'NIGHT' | 'AFTERNOON';
  extractedTons: number;
  oreGrade: number;
  recoveryRate: number;
  processedTons: number;
  wasteRockTons: number;
  strippingRatio?: number;
  operatorId?: string;
  equipmentIds?: string[];
  notes?: string;
  qualityMetrics?: OreQualityMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface OreQualityMetrics {
  moisture: number;
  density: number;
  hardness?: number;
  mineralContent: Record<string, number>;
}

export interface MiningEquipment {
  id: string;
  organizationId: string;
  siteId: string;
  name: string;
  serialNumber: string;
  type:
    | 'EXCAVATOR'
    | 'HAUL_TRUCK'
    | 'DRILL_RIG'
    | 'CRUSHER'
    | 'CONVEYOR'
    | 'LOADER'
    | 'GRADER'
    | 'PUMP'
    | 'VENTILATION'
    | 'OTHER';
  make?: string;
  model?: string;
  year?: number;
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'BREAKDOWN' | 'IDLE' | 'DECOMMISSIONED';
  location?: string;
  operatorId?: string;
  hoursTotal: number;
  hoursThisMonth: number;
  fuelConsumptionLph?: number;
  lastMaintenanceAt?: Date | null;
  nextMaintenanceAt?: Date | null;
  nextMaintenanceHours?: number | null;
  purchasedAt?: Date | null;
  purchaseValue?: number;
  currentValue?: number;
  sensors?: IoTSensor[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IoTSensor {
  id: string;
  organizationId: string;
  siteId: string;
  equipmentId?: string;
  name: string;
  deviceId: string;
  type:
    | 'TEMPERATURE'
    | 'PRESSURE'
    | 'VIBRATION'
    | 'GPS'
    | 'GAS_DETECTOR'
    | 'DUST'
    | 'NOISE'
    | 'LOAD'
    | 'FLOW'
    | 'LEVEL'
    | 'HUMIDITY'
    | 'RADIATION'
    | 'SPEED';
  unit: string;
  manufacturer?: string;
  model?: string;
  firmwareVersion?: string;
  installDate?: Date;
  calibrationDate?: Date | null;
  nextCalibrationDate?: Date | null;
  location?: string;
  coordinates?: Coordinates;
  isOnline: boolean;
  lastSeenAt?: Date | null;
  alertThresholds?: SensorThreshold[];
  latestReading?: SensorReading;
  createdAt: Date;
  updatedAt: Date;
}

export interface SensorThreshold {
  severity: AlertSeverity;
  min?: number;
  max?: number;
}

export interface SensorReading {
  id: string;
  sensorId: string;
  deviceId: string;
  value: number;
  unit: string;
  quality: 'GOOD' | 'UNCERTAIN' | 'BAD';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface SafetyIncident {
  id: string;
  organizationId: string;
  siteId: string;
  site?: MiningSite;
  type:
    | 'NEAR_MISS'
    | 'FIRST_AID'
    | 'MEDICAL_TREATMENT'
    | 'LOST_TIME'
    | 'FATALITY'
    | 'PROPERTY_DAMAGE'
    | 'ENVIRONMENTAL';
  severity: AlertSeverity;
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'CORRECTIVE_ACTION' | 'CLOSED';
  title: string;
  description: string;
  location?: string;
  occurredAt: Date;
  reportedById: string;
  injuredPersonnel?: string[];
  witnesses?: string[];
  immediateActions?: string;
  rootCause?: string;
  correctiveActions?: CorrectiveAction[];
  attachments?: Attachment[];
  closedAt?: Date | null;
  closedById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CorrectiveAction {
  id: string;
  description: string;
  assignedToId: string;
  dueDate: Date;
  completedAt?: Date | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
}

export interface EsgMetric {
  id: string;
  organizationId: string;
  siteId?: string;
  period: string;
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  category: 'ENVIRONMENTAL' | 'SOCIAL' | 'GOVERNANCE';
  metricName: string;
  value: number;
  unit: string;
  target?: number;
  baseline?: number;
  notes?: string;
  verifiedAt?: Date | null;
  verifiedById?: string | null;
  reportedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────
// Production
// ─────────────────────────────────────────────────────────────

export interface ProductionPlan {
  id: string;
  organizationId: string;
  name: string;
  status: 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startDate: Date;
  endDate: Date;
  productionLineId?: string;
  targetQuantity: number;
  actualQuantity?: number;
  unit: string;
  productId?: string;
  notes?: string;
  createdById: string;
  approvedById?: string | null;
  approvedAt?: Date | null;
  workOrders?: WorkOrder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductionLine {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  description?: string;
  warehouseId?: string;
  status: 'RUNNING' | 'IDLE' | 'MAINTENANCE' | 'BREAKDOWN' | 'SETUP';
  capacityPerHour: number;
  capacityUnit: string;
  currentEfficiency: number;
  oeeScore?: number;
  shift?: 'DAY' | 'NIGHT' | 'AFTERNOON' | '24H';
  supervisorId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkOrder {
  id: string;
  organizationId: string;
  productionPlanId?: string;
  productionLineId?: string;
  workOrderNumber: string;
  type: 'PRODUCTION' | 'MAINTENANCE' | 'QUALITY_CHECK' | 'SETUP' | 'CLEANING';
  status: 'PLANNED' | 'RELEASED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date | null;
  actualEnd?: Date | null;
  assignedToId?: string;
  quantity?: number;
  unit?: string;
  completedQuantity?: number;
  rejectedQuantity?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceSchedule {
  id: string;
  organizationId: string;
  equipmentId: string;
  title: string;
  type: 'PREVENTIVE' | 'PREDICTIVE' | 'CORRECTIVE' | 'CONDITION_BASED';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'ON_CONDITION';
  intervalHours?: number;
  lastPerformedAt?: Date | null;
  nextScheduledAt: Date;
  estimatedDurationHours?: number;
  actualDurationHours?: number;
  technician?: string;
  technicianId?: string;
  tasks?: MaintenanceTask[];
  partsUsed?: SparePart[];
  cost?: number;
  notes?: string;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceTask {
  id: string;
  description: string;
  isCompleted: boolean;
  completedAt?: Date | null;
  notes?: string;
}

export interface SparePart {
  partNumber: string;
  description: string;
  quantity: number;
  unitCost: number;
}

// ─────────────────────────────────────────────────────────────
// AI / Analytics
// ─────────────────────────────────────────────────────────────

export interface AiInsight {
  id: string;
  organizationId: string;
  type:
    | 'DEMAND_FORECAST'
    | 'SUPPLY_RISK'
    | 'COST_OPTIMIZATION'
    | 'MAINTENANCE_PREDICTION'
    | 'INVENTORY_OPTIMIZATION'
    | 'ROUTE_OPTIMIZATION'
    | 'ANOMALY_DETECTED'
    | 'SAFETY_RISK';
  severity: AlertSeverity;
  title: string;
  description: string;
  recommendation?: string;
  confidence: number;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impactValue?: number;
  impactCurrency?: string;
  status: 'NEW' | 'ACKNOWLEDGED' | 'ACTIONED' | 'DISMISSED' | 'EXPIRED';
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: Record<string, unknown>;
  expiresAt?: Date | null;
  acknowledgedById?: string | null;
  acknowledgedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForecastResult {
  id: string;
  organizationId: string;
  modelType: 'ARIMA' | 'PROPHET' | 'LSTM' | 'ENSEMBLE' | 'LINEAR_REGRESSION';
  entityType: 'PRODUCT' | 'SUPPLIER' | 'EQUIPMENT' | 'ORE_GRADE';
  entityId: string;
  metric: string;
  period: string;
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  forecast: ForecastDataPoint[];
  accuracy?: number;
  mape?: number;
  rmse?: number;
  generatedAt: Date;
  validUntil: Date;
  metadata?: Record<string, unknown>;
}

export interface ForecastDataPoint {
  date: string;
  value: number;
  lowerBound?: number;
  upperBound?: number;
  confidence?: number;
}

export interface RiskAssessment {
  id: string;
  organizationId: string;
  type: 'SUPPLIER' | 'GEOPOLITICAL' | 'WEATHER' | 'DEMAND' | 'FINANCIAL' | 'OPERATIONAL';
  entityType?: string;
  entityId?: string;
  title: string;
  description: string;
  probability: number;
  impact: number;
  riskScore: number;
  category: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  mitigationStrategy?: string;
  mitigationActions?: string[];
  status: 'IDENTIFIED' | 'ASSESSED' | 'MITIGATED' | 'ACCEPTED' | 'CLOSED';
  ownerId?: string;
  dueDate?: Date | null;
  resolvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnomalyDetection {
  id: string;
  organizationId: string;
  sensorId?: string;
  entityType: string;
  entityId: string;
  metric: string;
  detectedAt: Date;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: AlertSeverity;
  algorithm: 'ISOLATION_FOREST' | 'Z_SCORE' | 'IQR' | 'LSTM_AUTOENCODER' | 'MAHALANOBIS';
  confidence: number;
  isAcknowledged: boolean;
  acknowledgedById?: string | null;
  acknowledgedAt?: Date | null;
  notes?: string;
  createdAt: Date;
}

// ─────────────────────────────────────────────────────────────
// Billing & Subscriptions
// ─────────────────────────────────────────────────────────────

export interface Subscription {
  id: string;
  organizationId: string;
  plan: Plan;
  status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'UNPAID' | 'PAUSED';
  billingCycle: 'MONTHLY' | 'ANNUAL';
  currency: string;
  unitPrice: number;
  quantity: number;
  discountPercent?: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAt?: Date | null;
  cancelledAt?: Date | null;
  trialStart?: Date | null;
  trialEnd?: Date | null;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  organizationId: string;
  subscriptionId?: string;
  invoiceNumber: string;
  status: 'DRAFT' | 'OPEN' | 'PAID' | 'VOID' | 'UNCOLLECTIBLE';
  currency: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  lines: InvoiceLine[];
  dueDate?: Date | null;
  paidAt?: Date | null;
  periodStart: Date;
  periodEnd: Date;
  stripeInvoiceId?: string;
  pdfUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  period?: string;
}

export interface UsageMetric {
  id: string;
  organizationId: string;
  metric:
    | 'API_CALLS'
    | 'USERS'
    | 'STORAGE_GB'
    | 'IOT_MESSAGES'
    | 'AI_REQUESTS'
    | 'PURCHASE_ORDERS'
    | 'SUPPLIERS';
  value: number;
  limit?: number;
  period: string;
  periodType: 'DAILY' | 'MONTHLY';
  recordedAt: Date;
}

// ─────────────────────────────────────────────────────────────
// Kafka / Event Types
// ─────────────────────────────────────────────────────────────

export type DomainEventType =
  | 'purchase_order.created'
  | 'purchase_order.updated'
  | 'purchase_order.approved'
  | 'purchase_order.rejected'
  | 'purchase_order.sent'
  | 'purchase_order.received'
  | 'purchase_order.cancelled'
  | 'inventory.updated'
  | 'inventory.low_stock'
  | 'inventory.out_of_stock'
  | 'inventory.replenishment_triggered'
  | 'shipment.created'
  | 'shipment.dispatched'
  | 'shipment.in_transit'
  | 'shipment.delivered'
  | 'shipment.delayed'
  | 'shipment.cancelled'
  | 'mining.extraction_recorded'
  | 'mining.equipment_status_changed'
  | 'mining.sensor_alert'
  | 'mining.safety_incident_reported'
  | 'mining.esg_metric_recorded'
  | 'ai.insight_generated'
  | 'ai.anomaly_detected'
  | 'ai.forecast_updated'
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'organization.plan_changed'
  | 'billing.invoice_created'
  | 'billing.payment_succeeded'
  | 'billing.payment_failed';

export interface DomainEvent<T = unknown> {
  id: string;
  type: DomainEventType;
  version: string;
  organizationId: string;
  userId?: string;
  correlationId?: string;
  causationId?: string;
  payload: T;
  metadata?: Record<string, unknown>;
  occurredAt: string;
}

export interface PurchaseOrderEventPayload {
  purchaseOrderId: string;
  poNumber: string;
  supplierId: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  requestedById?: string;
  approvedById?: string;
}

export type PurchaseOrderDomainEvent = DomainEvent<PurchaseOrderEventPayload>;

export interface InventoryEventPayload {
  inventoryItemId: string;
  warehouseId: string;
  productId: string;
  sku: string;
  previousQuantity: number;
  newQuantity: number;
  changeType: 'RECEIPT' | 'ISSUE' | 'ADJUSTMENT' | 'TRANSFER' | 'COUNT';
  reorderPoint?: number;
}

export type InventoryDomainEvent = DomainEvent<InventoryEventPayload>;

export interface ShipmentEventPayload {
  shipmentId: string;
  shipmentNumber: string;
  previousStatus?: ShipmentStatus;
  newStatus: ShipmentStatus;
  carrierId?: string;
  trackingNumber?: string;
  estimatedArrivalAt?: string;
  location?: Coordinates;
}

export type ShipmentDomainEvent = DomainEvent<ShipmentEventPayload>;

export interface MiningEventPayload {
  siteId: string;
  siteName?: string;
  equipmentId?: string;
  sensorId?: string;
  zoneId?: string;
  eventSubType: string;
  value?: number;
  unit?: string;
  severity?: AlertSeverity;
  details?: Record<string, unknown>;
}

export type MiningDomainEvent = DomainEvent<MiningEventPayload>;

export interface SensorAlertPayload {
  sensorId: string;
  deviceId: string;
  siteId: string;
  equipmentId?: string;
  type: IoTSensor['type'];
  value: number;
  unit: string;
  threshold: SensorThreshold;
  severity: AlertSeverity;
  location?: Coordinates;
  timestamp: string;
}

export type SensorAlertEvent = DomainEvent<SensorAlertPayload>;
