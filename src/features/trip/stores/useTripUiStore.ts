import { create } from "zustand";
import type { TripStatus } from "@/types/trip";


interface TripUiState {
  activeTab: TripStatus;
  setActiveTab: (tab: TripStatus) => void;
}


export const useTripUiStore = create<TripUiState>(() => ({
  activeTab: "ACTIVE",
  setActiveTab: () => {
    throw new Error("Not implemented");
  },
}));
