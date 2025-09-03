import { defineStore } from "pinia";

export const useUserInfoStore = defineStore("userInfo", {
  state: () => {
    try {
      const savedUserInfo = window.localStorage.getItem("userInfo");
      // 检查是否是Quasar的序列化格式
      if (savedUserInfo && savedUserInfo.startsWith("__q_objt|")) {
        // 提取实际的JSON部分
        const jsonPart = savedUserInfo.substring(9);
        return {
          userInfo: jsonPart ? JSON.parse(jsonPart) : null
        };
      }
      return {
        userInfo: savedUserInfo ? JSON.parse(savedUserInfo) : null
      };
    } catch (error) {
      console.error("Error parsing userInfo from localStorage:", error);
      return {
        userInfo: null
      };
    }
  },

  getters: {
    hasUserInfo: (state) => {
      return !!state.userInfo;
    }
  },

  actions: {
    setUserInfo(userData) {
      this.userInfo = userData;
      window.localStorage.setItem("userInfo", JSON.stringify(userData));
    },
    clearUserInfo() {
      this.userInfo = null;
      window.localStorage.removeItem("userInfo");
    }
  },
});
