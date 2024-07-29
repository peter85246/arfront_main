import { create } from 'zustand';

export const useStore = create()((set) => ({
  isCreatingSOP: false,
  SOPInfo: {
    knowledgeInfo: {
      knowledgeBaseModelImageObj: [],
      knowledgeBaseToolsImageObj: [],
      knowledgeBasePositionImageObj: [],
      knowledgeBase3DModelImageObj: [], // 新增3D模型圖片物件數據
      knowledgeBase3DModelFileObj: [],  // 新增3D模型文件物件數據
    },
  },

  setIsCreatingSOP: (isCreatingSOP) => set({ isCreatingSOP }),
  setSOPInfo: (updater) =>
    set((state) => {
      const newSOPInfo =
        typeof updater === 'function' ? updater(state.SOPInfo) : updater;
      return { SOPInfo: newSOPInfo };
    }),

  // 添加用於更新圖片數據的方法
  setKnowledgeBaseModelImages: (images) =>
    set({ knowledgeBaseModelImages: images }),
  setKnowledgeBaseToolsImages: (images) =>
    set({ knowledgeBaseToolsImages: images }),
  setKnowledgeBasePositionImages: (images) =>
    set({ knowledgeBasePositionImages: images }),

  // 新增設置3D模型圖片和文件的方法
  setKnowledgeBase3DModelImageObj: (imageObjs) =>
    set((state) => ({
      SOPInfo: {
        ...state.SOPInfo,
        knowledgeInfo: {
          ...state.SOPInfo.knowledgeInfo,
          knowledgeBase3DModelImageObj: imageObjs,
        },
      },
    })),
  setKnowledgeBase3DModelFileObj: (fileObjs) =>
    set((state) => ({
      SOPInfo: {
        ...state.SOPInfo,
        knowledgeInfo: {
          ...state.SOPInfo.knowledgeInfo,
          knowledgeBase3DModelFileObj: fileObjs,
        },
      },
    })),
}));
