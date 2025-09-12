<template>
  <nav>
    <!--
    <div class="logo">
      <img src="../assets/img/skybureau/favicon-32x32.png" />
    </div>
      -->
    <!--
    <RouterLink class="el-menu-item" to="/">{{ $t("homePage") }}</RouterLink>
    <div class="el-menu-item" href="#">
      {{ userName ? userName : "未登录" }}
    </div>
-->
  </nav>
</template>
<script>
import { useI18n } from "vue-i18n";
import { LocalStorage } from "quasar";
export default {
  setup() {
    //console.log("SJQ:" + LocalStorage.getItem("userInfo").user.username);
    const { locale } = useI18n({ useScope: "global" });
    console.log("SJQ: local " + locale.value);

    return {
      locale,
      // userName: LocalStorage.getItem("userInfo").user.username,
    };
  },
  name: "FootBar",
};
</script>

<style lang="css">
/* Footer base styles with maximum specificity */
body.theme-default nav,
.theme-default nav,
html body.theme-default nav {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border-top: 2px solid rgba(255, 255, 255, 0.2) !important;
  padding: 16px 24px !important;
  min-height: 60px !important;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1) !important;
}

body.theme-tech nav,
.theme-tech nav,
html body.theme-tech nav {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%) !important;
  border-top: 2px solid rgba(0, 255, 255, 0.3) !important;
  padding: 16px 24px !important;
  min-height: 60px !important;
  box-shadow: 0 -2px 12px rgba(0, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 255, 255, 0.1) !important;
  position: relative !important;
}

body.theme-tech nav::before,
.theme-tech nav::before,
html body.theme-tech nav::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 98px,
    rgba(0, 255, 255, 0.03) 100px
  ) !important;
  pointer-events: none !important;
}

/* Default theme footer menu items */
body.theme-default nav .el-menu-item,
.theme-default nav .el-menu-item,
html body.theme-default nav .el-menu-item {
  color: white !important;
  padding: 5px 5px !important;
  position: relative !important;
  text-align: center !important;
  border-bottom: transparent !important;
  display: flex !important;
  transition: 0.4s !important;
  font-size: larger !important;
  font-weight: bold !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
  background-color: transparent !important;
  border-radius: 4px !important;
}

body.theme-default nav .el-menu-item:hover,
.theme-default nav .el-menu-item:hover,
html body.theme-default nav .el-menu-item:hover {
  color: white !important;
  background-color: rgba(255, 255, 255, 0.15) !important;
  border-radius: 8px !important;
  transform: translateY(-1px) !important;
  border-bottom: transparent !important;
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2) !important;
}

/* Tech theme footer menu items */
body.theme-tech nav .el-menu-item,
.theme-tech nav .el-menu-item,
html body.theme-tech nav .el-menu-item {
  color: #00ffff !important;
  padding: 5px 5px !important;
  position: relative !important;
  text-align: center !important;
  border-bottom: transparent !important;
  display: flex !important;
  transition: 0.4s !important;
  font-size: larger !important;
  font-weight: bold !important;
  font-family: 'Courier New', monospace !important;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5) !important;
  letter-spacing: 0.5px !important;
  background-color: transparent !important;
  border-radius: 4px !important;
}

body.theme-tech nav .el-menu-item:hover,
.theme-tech nav .el-menu-item:hover,
html body.theme-tech nav .el-menu-item:hover {
  color: #00ffff !important;
  background-color: rgba(0, 255, 255, 0.1) !important;
  border: 1px solid #00ffff !important;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3) !important;
  border-radius: 4px !important;
  transform: translateY(-1px) !important;
  border-bottom: 1px solid #00ffff !important;
}

/* Legacy fallback styles */
nav {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--theme-surface);
  border-top: 2px solid var(--theme-border);
  padding: 16px 24px;
  min-height: 60px;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.1);
}

nav .el-menu-item {
  color: var(--theme-text);
  padding: 5px 5px;
  position: relative;
  text-align: center;
  border-bottom: transparent;
  display: flex;
  transition: 0.4s;
  font-size: larger;
  font-weight: bold;
}

nav .el-menu-item:hover {
  background-color: var(--theme-primary);
  border-bottom: solid 1px;
  border-bottom-color: var(--theme-accent);
  height: 30px;
}
</style>
