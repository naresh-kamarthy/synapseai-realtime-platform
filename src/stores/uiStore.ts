import { create } from 'zustand';

export interface UIState {
  selectedModels: string[];
  isSidebarOpen: boolean;
  isSavedResponsesOpen: boolean;
  isAdminPanelOpen: boolean;
  currentPath: string;
  
  setSelectedModels: (models: string[]) => void;
  toggleModel: (modelKey: string) => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSavedResponsesOpen: (isOpen: boolean) => void;
  setAdminPanelOpen: (isOpen: boolean) => void;
  setCurrentPath: (path: string) => void;
  navigateTo: (path: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedModels: ['gemini-3.5-flash'], // keep the active model active
  isSidebarOpen: true,
  isSavedResponsesOpen: false,
  isAdminPanelOpen: false,
  currentPath: window.location.pathname,

  setSelectedModels: (selectedModels) => set({ selectedModels }),
  toggleModel: (modelKey) => set((state) => {
    const models = [...state.selectedModels];
    const idx = models.indexOf(modelKey);
    if (idx !== -1) {
      if (models.length > 1) models.splice(idx, 1); // keep at least one active
    } else {
      models.push(modelKey);
    }
    return { selectedModels: models };
  }),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  setSavedResponsesOpen: (isSavedResponsesOpen) => set({ isSavedResponsesOpen }),
  setAdminPanelOpen: (isAdminPanelOpen) => set({ isAdminPanelOpen }),
  setCurrentPath: (currentPath) => set({ currentPath }),
  navigateTo: (path) => {
    window.history.pushState(null, '', path);
    set({ currentPath: path });
  }
}));
