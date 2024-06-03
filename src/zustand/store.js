import { create } from 'zustand'

export const useStore = create()((set) => ({
  isCreatingSOP: false,
  SOPInfo: null,

  setIsCreatingSOP: (isCreatingSOP) => set({ isCreatingSOP }),
  setSOPInfo: (updater) => set((state) => {
    const newSOPInfo = typeof updater === 'function' ? updater(state.SOPInfo) : updater;
    return { SOPInfo: newSOPInfo };
  }),
}))