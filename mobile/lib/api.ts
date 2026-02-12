import Constants from "expo-constants";
import { Platform } from "react-native";
import type { InventoryItem, Job, PickingList, School } from "./types";

const API_PORT = 8000;

function getBaseUrl(): string {
  if (Platform.OS === "web") {
    return `http://localhost:${API_PORT}`;
  }
  // On native (iOS/Android), derive the host IP from Expo's dev server
  // The debuggerHost is the IP:port that Expo uses to reach your machine
  const debuggerHost =
    Constants.expoConfig?.hostUri ?? Constants.experienceUrl ?? "";
  const host = debuggerHost.split(":")[0];

  if (!host || host === "localhost") {
    // Fallback for Android emulator
    if (Platform.OS === "android") {
      return `http://10.0.2.2:${API_PORT}`;
    }
    return `http://localhost:${API_PORT}`;
  }

  return `http://${host}:${API_PORT}`;
}

const BASE_URL = getBaseUrl();

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {};
  if (options?.body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
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

export function getPickingList(jobId: number): Promise<PickingList> {
  return request<PickingList>(`/picking/${jobId}`);
}

export function uploadCSVText(
  endpoint: "inventory" | "students",
  csvContent: string,
): Promise<{ upserted: number; errors: string[] }> {
  return request<{ upserted: number; errors: string[] }>(
    `/upload/${endpoint}/text`,
    {
      method: "POST",
      body: JSON.stringify({ csv_content: csvContent }),
    },
  );
}
