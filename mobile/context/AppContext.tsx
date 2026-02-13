import React, { createContext, useCallback, useContext, useReducer } from "react";
import * as api from "@/lib/api";
import i18n from "@/lib/i18n";
import type { InventoryItem, Job, OptimizationResult, PickingList, School } from "@/lib/types";

// ── State ──

export type Locale = "es" | "en";

interface AppState {
  schools: School[];
  inventory: InventoryItem[];
  currentJob: Job | null;
  isOptimizing: boolean;
  lastResult: OptimizationResult | null;
  pickingList: PickingList | null;
  locale: Locale;
}

const initialState: AppState = {
  schools: [],
  inventory: [],
  currentJob: null,
  isOptimizing: false,
  lastResult: null,
  pickingList: null,
  locale: "es",
};

// ── Actions ──

type Action =
  | { type: "SET_SCHOOLS"; payload: School[] }
  | { type: "SET_INVENTORY"; payload: InventoryItem[] }
  | { type: "SET_JOB"; payload: Job | null }
  | { type: "SET_OPTIMIZING"; payload: boolean }
  | { type: "SET_RESULT"; payload: OptimizationResult }
  | { type: "SET_PICKING_LIST"; payload: PickingList | null }
  | { type: "SET_LOCALE"; payload: Locale };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_SCHOOLS":
      return { ...state, schools: action.payload };
    case "SET_INVENTORY":
      return { ...state, inventory: action.payload };
    case "SET_JOB":
      return { ...state, currentJob: action.payload };
    case "SET_OPTIMIZING":
      return { ...state, isOptimizing: action.payload };
    case "SET_RESULT":
      return { ...state, lastResult: action.payload, isOptimizing: false };
    case "SET_PICKING_LIST":
      return { ...state, pickingList: action.payload };
    case "SET_LOCALE":
      return { ...state, locale: action.payload };
    default:
      return state;
  }
}

// ── Context ──

interface AppContextValue extends AppState {
  fetchSchools: () => Promise<void>;
  fetchInventory: () => Promise<void>;
  startOptimization: () => Promise<void>;
  toggleLocale: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchSchools = useCallback(async () => {
    const schools = await api.getSchools();
    dispatch({ type: "SET_SCHOOLS", payload: schools });
  }, []);

  const fetchInventory = useCallback(async () => {
    const inventory = await api.getInventory();
    dispatch({ type: "SET_INVENTORY", payload: inventory });
  }, []);

  const startOptimization = useCallback(async () => {
    dispatch({ type: "SET_OPTIMIZING", payload: true });
    const { job_id } = await api.triggerOptimize();
    dispatch({ type: "SET_JOB", payload: { job_id, status: "PENDING", created_at: new Date().toISOString(), result: null } });

    // Poll until completed
    const poll = async () => {
      const job = await api.getJobStatus(job_id);
      dispatch({ type: "SET_JOB", payload: job });

      if (job.status === "COMPLETED" && job.result) {
        dispatch({ type: "SET_RESULT", payload: job.result });
        // Refresh inventory to get updated allocations
        const inventory = await api.getInventory();
        dispatch({ type: "SET_INVENTORY", payload: inventory });
        // Fetch student-level picking list
        const picking = await api.getPickingList(job_id);
        dispatch({ type: "SET_PICKING_LIST", payload: picking });
      } else {
        setTimeout(poll, 2000);
      }
    };

    setTimeout(poll, 1000);
  }, []);

  const toggleLocale = useCallback(() => {
    const newLocale: Locale = i18n.locale === "es" ? "en" : "es";
    i18n.locale = newLocale;
    dispatch({ type: "SET_LOCALE", payload: newLocale });
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        fetchSchools,
        fetchInventory,
        startOptimization,
        toggleLocale,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
