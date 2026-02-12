import { Platform } from "react-native";
import type { InventoryItem, Job, School } from "./types";

const BASE_URL = Platform.select({
  android: "http://10.0.2.2:8000",
  default: "http://localhost:8000",
});

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export function getSchools(): Promise<School[]> {
  return request<School[]>("/schools");
}

export function getInventory(): Promise<InventoryItem[]> {
  return request<InventoryItem[]>("/inventory");
}

export function triggerOptimize(): Promise<{ job_id: number }> {
  return request<{ job_id: number }>("/optimize", { method: "POST" });
}

export function getJobStatus(jobId: number): Promise<Job> {
  return request<Job>(`/jobs/${jobId}`);
}
