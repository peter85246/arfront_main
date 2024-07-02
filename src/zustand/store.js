import { create } from 'zustand';

export const useStore = create()((set) => ({
  isCreatingSOP: false,
  SOPInfo: null,
  knowledgeBaseModelImages: [],
  knowledgeBaseToolsImages: [],
  knowledgeBasePositionImages: [],

  setIsCreatingSOP: (isCreatingSOP) => set({ isCreatingSOP }),
  setSOPInfo: (updater) =>
    set((state) => {
      const newSOPInfo =
        typeof updater === 'function' ? updater(state.SOPInfo) : updater;
      return { SOPInfo: newSOPInfo };
    }),

    // 添加用於更新圖片數據的方法
    setKnowledgeBaseModelImages: (images) => set({ knowledgeBaseModelImages: images }),
    setKnowledgeBaseToolsImages: (images) => set({ knowledgeBaseToolsImages: images }),
    setKnowledgeBasePositionImages: (images) => set({ knowledgeBasePositionImages: images }),
}));
