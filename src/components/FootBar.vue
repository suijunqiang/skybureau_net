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
nav {
  display: flex;
  align-items: center;
  justify-content: center;
}
nav .el-menu-item {
  color: #ffffff;
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
  background-color: blue;
  border-bottom: solid 1px;
  border-bottom-color: brown;
  height: 30px;
}
</style>
