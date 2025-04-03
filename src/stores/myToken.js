import { defineStore } from "pinia";

export const useTokenStore = defineStore("myToken", {
  state: () => ({
    counter: 0,
    token: null,
    //token: ref(window.localStorage.getItem("myToken") || ""),
  }),

  getters: {
    doubleCount(state) {
      return token, state.counter * 2;
    },
  },

  actions: {
    increment() {
      this.counter++;
    },
    saveToken(str) {
      this.token = str; // 假设token是一个字符串
      window.localStorage.setItem("myToken", str);
    },
  },
});
