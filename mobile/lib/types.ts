// ── Backend API response types ──

export interface InventoryItem {
  sku_id: string;
  description: string;
  total_stock_available: number;
  allocated: number;
  remaining: number;
  usage_pct: number;
}

export interface School {
  school_id: string;
  total_students: number;
  sku_demand: Record<string, number>;
}

export interface SelectionReport {
  selected_school_ids: string[];
  total_students_served: number;
}

export interface InventoryImpact {
  sku_id: string;
  total_stock: number;
  allocated: number;
  remaining: number;
  usage_pct: number;
}

export interface Shortage {
  sku_id: string;
  school_id: string;
  demand: number;
  available_after_allocation: number;
  deficit: number;
}

export interface OptimizationResult {
  selection: SelectionReport;
  inventory_impact: InventoryImpact[];
  shortages: Shortage[];
}

export type JobStatus = "PENDING" | "PROCESSING" | "COMPLETED";

export interface Job {
  job_id: number;
  status: JobStatus;
  created_at: string;
  result: OptimizationResult | null;
}
