import { defineStore } from "pinia";

export const usePositionInfoStore = defineStore("positionInfo", {
  state: () => {
    try {
      const savedPositionInfo = window.localStorage.getItem("positionInfo");
      // 检查是否是Quasar的序列化格式
      if (savedPositionInfo && savedPositionInfo.startsWith("__q_objt|")) {
        // 提取实际的JSON部分
        const jsonPart = savedPositionInfo.substring(9);
        return {
          positionInfo: jsonPart ? JSON.parse(jsonPart) : null
        };
      }
      return {
        positionInfo: savedPositionInfo ? JSON.parse(savedPositionInfo) : null
      };
    } catch (error) {
      console.error("Error parsing positionInfo from localStorage:", error);
      return {
        positionInfo: null
      };
    }
  },

  getters: {
    hasPositionInfo: (state) => {
      return !!state.positionInfo;
    }
  },

  actions: {
    setPositionInfo(positionData) {
      this.positionInfo = positionData;
      window.localStorage.setItem("positionInfo", JSON.stringify(positionData));
    },
    clearPositionInfo() {
      this.positionInfo = null;
      window.localStorage.removeItem("positionInfo");
    }
  },
});