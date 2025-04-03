<template>
  <nav>
    <!--
    <div class="logo">
      <img src="../assets/img/skybureau/favicon-32x32.png" />
    </div>
      -->
    <RouterLink class="el-menu-item" to="/">{{ $t("homePage") }}</RouterLink>
    <!--
    <RouterLink class="el-menu-item" to="/news">{{ $t("newsPage") }}</RouterLink>
    -->
    <div class="el-menu-item" href="#">{{ $t("productPage") }}</div>
    <RouterLink class="el-menu-item" to="/aboutus">{{ $t("about_us") }}</RouterLink>
    <RouterLink class="el-menu-item" to="/loginRegister">{{ $t("loginPage") }}</RouterLink>
    <div class="el-menu-item" href="#">
      <!--
      <q-select
        filled
        v-model="model"
        label="Language"
        :options="localeOptions"
        style="width: 250px"
        behavior="menu"
      />
      -->
      <q-select
        class="el-menu-item"
        color="primary"
        v-model="locale"
        :options="localeOptions"
        dense
        default-label="选择语言"
        borderless
        emit-value
        map-options
        options-dense
        behavior="menu"
      />
    </div>
    <!--
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
      //userName: LocalStorage.getItem("userInfo").user.username || "",
      localeOptions: [
        { label: "中文", value: "zh-CN" },
        { label: "English", value: "en-US" },
      ],
    };
  },
  name: "HeadBar",
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
