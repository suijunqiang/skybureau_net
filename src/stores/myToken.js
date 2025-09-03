import { defineStore } from "pinia";

export const useTokenStore = defineStore("myToken", {
  state: () => ({
    token: window.localStorage.getItem("myToken") || null
  }),

  getters: {
    isAuthenticated: (state) => {
      return !!state.token;
    }
  },

  actions: {
    saveToken(token) {
      this.token = token;
      window.localStorage.setItem("myToken", token);
    },
    removeToken() {
      this.token = null;
      window.localStorage.removeItem("myToken");
    }
  },
});
