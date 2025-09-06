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
    <div 
      v-if="userInfoStore.hasUserInfo"
      class="el-menu-item user-name cursor-pointer"
      @click="navigateToWelcome"
    >
      {{ displayUserName }}
    </div>
    <div v-else class="el-menu-item user-name">
      {{ displayUserName }}
    </div>
    <!-- 退出按钮，仅在登录状态下显示 -->
    <div
      v-if="userInfoStore.hasUserInfo"
      class="el-menu-item logout-button"
      @click="handleLogout"
    >
      <q-icon name="logout" class="mr-1" />
      {{ $t("logout") }}
    </div>
  </nav>
</template>
<script>
import { useI18n } from "vue-i18n";
import { useUserInfoStore } from "../stores/userInfo";
import { useTokenStore } from "../stores/myToken";
import { usePositionInfoStore } from "../stores/positionInfo";
import { computed } from "vue";
import { useRouter } from "vue-router";
export default {
  setup() {
    const { locale, t } = useI18n({ useScope: "global" });
    const userInfoStore = useUserInfoStore();
    const tokenStore = useTokenStore();
    const positionInfoStore = usePositionInfoStore();
    const router = useRouter();

    // 计算显示的用户名：未登录时显示多语言的"游客"，登录后显示用户名
    const displayUserName = computed(() => {
      if (userInfoStore.hasUserInfo && userInfoStore.userInfo?.user?.username) {
        return userInfoStore.userInfo.user.username;
      }
      return t('visitor');
    });

    // 处理退出登录
    const handleLogout = () => {
      // 清除用户信息
      userInfoStore.clearUserInfo();
      // 清除token
      tokenStore.removeToken();
      // 清除职位信息
      positionInfoStore.clearPositionInfo();
      // 跳转到首页
      router.push('/');
    };

    // 导航到欢迎页面
    const navigateToWelcome = () => {
      router.push('/system/userManagement/welcome');
    };

    return {
      locale,
      displayUserName,
      userInfoStore,
      handleLogout,
      navigateToWelcome,
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
  align-items: center;
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

.user-name {
  margin-left: auto;
  color: #ffffff;
  font-weight: bold;
}

.logout-button {
  color: #ffffff;
  font-weight: bold;
  cursor: pointer;
}

.logout-button:hover {
  background-color: blue;
  border-bottom: solid 1px;
  border-bottom-color: brown;
  height: 30px;
}
</style>
