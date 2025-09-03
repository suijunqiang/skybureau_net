<template>
  <router-view />
</template>

<script>
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  name: "App",
  setup() {
    onMounted(() => {
      // 全局ResizeObserver错误处理
      if (window.ResizeObserver) {
        const originalResizeObserver = window.ResizeObserver;
        window.ResizeObserver = class ResizeObserver extends originalResizeObserver {
          constructor(callback) {
            // 包装原始回调函数，添加try-catch错误处理
            super((entries, observer) => {
              try {
                callback(entries, observer);
              } catch (error) {
                console.warn('ResizeObserver error caught:', error);
              }
            });
          }
        };
      }
    });

    return {};
  }
});
</script>
