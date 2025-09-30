<template>
  <nav>
    <!--
    <div class="logo">
      <img src="../assets/img/skybureau/favicon-32x32.png" />
    </div>
      -->
    <RouterLink class="el-menu-item" to="/" :style="getMenuItemStyle()">{{ $t("homePage") }}</RouterLink>
    <!--
    <RouterLink class="el-menu-item" to="/news">{{ $t("newsPage") }}</RouterLink>
    -->
    <RouterLink class="el-menu-item" to="/blog" :style="getMenuItemStyle()">{{ $t("blogPage") }}</RouterLink>
    <!-- Theme Menu -->
    <div class="el-menu-item theme-menu" :style="getMenuItemStyle()">
      <q-btn-dropdown
        flat
        no-caps
        :label="$t('theme_menu')"
        class="theme-dropdown"
        dropdown-icon="palette"
        :style="getDropdownStyle()"
      >
        <q-list>
          <q-item
            clickable
            @click="setTheme('default')"
            :class="{ 'active-theme': themeStore.currentTheme === 'default' }"
          >
            <q-item-section avatar>
              <q-icon :name="themeStore.currentTheme === 'default' ? 'check_circle' : 'radio_button_unchecked'" :color="themeStore.currentTheme === 'default' ? 'primary' : 'grey'" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('classic_style') }}</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item
            clickable
            @click="setTheme('tech')"
            :class="{ 'active-theme': themeStore.currentTheme === 'tech' }"
          >
            <q-item-section avatar>
              <q-icon :name="themeStore.currentTheme === 'tech' ? 'check_circle' : 'radio_button_unchecked'" :color="themeStore.currentTheme === 'tech' ? 'primary' : 'grey'" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('tech_style') }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </div>
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
import { useThemeStore } from "../stores/theme";
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
export default {
  setup() {
    const { locale, t } = useI18n({ useScope: "global" });
    const userInfoStore = useUserInfoStore();
    const tokenStore = useTokenStore();
    const positionInfoStore = usePositionInfoStore();
    const themeStore = useThemeStore();
    const router = useRouter();

    // Initialize theme on component mount
    onMounted(() => {
      themeStore.initializeTheme();
    });

    // Theme functions
    const setTheme = (themeName) => {
      themeStore.setTheme(themeName);
      
      // Force immediate style update with highest priority
      setTimeout(() => {
        const nav = document.querySelector('nav');
        if (nav) {
          // Remove all existing theme classes and add the new one
          nav.className = nav.className.replace(/theme-\w+/g, '');
          nav.classList.add(`theme-${themeName}`);
          
          // Apply direct styles
          if (themeName === 'tech') {
            nav.style.cssText = `
              background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%) !important;
              border-bottom: 2px solid rgba(0, 255, 255, 0.3) !important;
              box-shadow: 0 2px 20px rgba(0, 255, 255, 0.2), inset 0 1px 0 rgba(0, 255, 255, 0.1) !important;
              position: relative !important;
              display: flex !important;
              align-items: center !important;
              justify-content: flex-end !important;
              padding: 0 16px !important;
              min-height: 50px !important;
              max-height: 50px !important;
              gap: 6px !important;
              z-index: 10 !important;
            `;
          } else {
            nav.style.cssText = `
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
              border-bottom: 2px solid rgba(255, 255, 255, 0.2) !important;
              box-shadow: 0 2px 20px rgba(0, 0, 0, 0.15) !important;
              position: relative !important;
              display: flex !important;
              align-items: center !important;
              justify-content: flex-end !important;
              padding: 0 16px !important;
              min-height: 50px !important;
              max-height: 50px !important;
              gap: 6px !important;
              z-index: 10 !important;
            `;
          }
        }
        
        // Also update all menu items
        const menuItems = document.querySelectorAll('nav .el-menu-item');
        menuItems.forEach(item => {
          if (themeName === 'tech') {
            item.style.cssText = `
              color: #00ffff !important;
              border: 1px solid rgba(0, 255, 255, 0.3) !important;
              transition: all 0.3s ease !important;
              font-family: 'Courier New', monospace !important;
              letter-spacing: 0.5px !important;
              background: rgba(0, 255, 255, 0.05) !important;
              box-shadow: 0 0 3px rgba(0, 255, 255, 0.2) !important;
              border-radius: 4px !important;
              padding: 6px 12px !important;
              margin: 0 1px !important;
              text-decoration: none !important;
              display: flex !important;
              align-items: center !important;
              min-height: 32px !important;
              white-space: nowrap !important;
              text-shadow: 0 0 3px rgba(0, 255, 255, 0.5) !important;
              font-size: 14px !important;
            `;
          } else {
            item.style.cssText = `
              color: white !important;
              font-weight: 500 !important;
              letter-spacing: 0.3px !important;
              background: rgba(255, 255, 255, 0.1) !important;
              text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
              border: 1px solid rgba(255, 255, 255, 0.2) !important;
              border-radius: 6px !important;
              padding: 6px 12px !important;
              margin: 0 1px !important;
              transition: all 0.3s ease !important;
              text-decoration: none !important;
              display: flex !important;
              align-items: center !important;
              min-height: 32px !important;
              white-space: nowrap !important;
              font-size: 14px !important;
            `;
          }
        });
      }, 0);
    };

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

    // Inline style functions for stronger CSS override
    const getMenuItemStyle = () => {
      const currentTheme = themeStore.currentTheme;
      if (currentTheme === 'tech') {
        return {
          color: '#00ffff !important',
          fontFamily: 'Courier New, monospace !important',
          background: 'rgba(0, 255, 255, 0.05) !important',
          border: '1px solid rgba(0, 255, 255, 0.3) !important',
          borderRadius: '4px !important',
          textShadow: '0 0 5px rgba(0, 255, 255, 0.5) !important',
          transition: 'all 0.3s ease !important'
        };
      } else {
        return {
          color: 'white !important',
          background: 'rgba(255, 255, 255, 0.1) !important',
          border: '1px solid rgba(255, 255, 255, 0.2) !important',
          borderRadius: '8px !important',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.3) !important',
          transition: 'all 0.3s ease !important'
        };
      }
    };

    const getDropdownStyle = () => {
      const currentTheme = themeStore.currentTheme;
      if (currentTheme === 'tech') {
        return {
          color: '#00ffff !important',
          fontFamily: 'Courier New, monospace !important',
          background: 'rgba(0, 255, 255, 0.05) !important',
          border: '1px solid rgba(0, 255, 255, 0.3) !important',
          borderRadius: '4px !important',
          boxShadow: '0 0 10px rgba(0, 255, 255, 0.3) !important'
        };
      } else {
        return {
          color: 'white !important',
          background: 'rgba(255, 255, 255, 0.1) !important',
          border: '1px solid rgba(255, 255, 255, 0.2) !important',
          borderRadius: '8px !important',
          textShadow: '0 1px 3px rgba(0, 0, 0, 0.3) !important'
        };
      }
    };

    return {
      locale,
      displayUserName,
      userInfoStore,
      themeStore,
      handleLogout,
      navigateToWelcome,
      setTheme,
      getMenuItemStyle,
      getDropdownStyle,
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
/* Base navigation styles with theme awareness */
body.theme-default nav,
.theme-default nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.15) !important;
}

body.theme-tech nav,
.theme-tech nav {
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%) !important;
  border-bottom: 2px solid rgba(0, 255, 255, 0.3) !important;
  box-shadow: 0 2px 20px rgba(0, 255, 255, 0.2), inset 0 1px 0 rgba(0, 255, 255, 0.1) !important;
  position: relative !important;
}

body.theme-tech nav::before,
.theme-tech nav::before {
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

nav {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 16px !important;
  min-height: 50px !important;
  max-height: 50px !important;
  gap: 6px;
  position: relative;
  z-index: 10;
}

/* Menu item base styles */
body.theme-default nav .el-menu-item,
.theme-default nav .el-menu-item {
  color: white !important;
  font-weight: 500 !important;
  letter-spacing: 0.3px !important;
  background: rgba(255, 255, 255, 0.1) !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 6px !important;
  padding: 6px 12px !important;
  margin: 0 1px !important;
  transition: all 0.3s ease !important;
  text-decoration: none !important;
  display: flex !important;
  align-items: center !important;
  min-height: 32px !important;
  white-space: nowrap !important;
  font-size: 14px !important;
}

body.theme-default nav .el-menu-item:hover,
.theme-default nav .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  transform: translateY(-1px) !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2) !important;
}

body.theme-tech nav .el-menu-item,
.theme-tech nav .el-menu-item {
  color: #00ffff !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  transition: all 0.3s ease !important;
  font-family: 'Courier New', monospace !important;
  letter-spacing: 0.5px !important;
  background: rgba(0, 255, 255, 0.05) !important;
  box-shadow: 0 0 3px rgba(0, 255, 255, 0.2) !important;
  border-radius: 4px !important;
  padding: 6px 12px !important;
  margin: 0 1px !important;
  text-decoration: none !important;
  display: flex !important;
  align-items: center !important;
  min-height: 32px !important;
  white-space: nowrap !important;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.5) !important;
  font-size: 14px !important;
}

body.theme-tech nav .el-menu-item:hover,
.theme-tech nav .el-menu-item:hover {
  background-color: rgba(0, 255, 255, 0.15) !important;
  border: 1px solid #00ffff !important;
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5) !important;
  border-radius: 4px !important;
  transform: translateY(-2px) !important;
  color: #00ffff !important;
}

/* User name styling */
body.theme-default nav .user-name,
.theme-default nav .user-name {
  margin-left: 12px !important;
  color: white !important;
  font-weight: 600 !important;
  padding: 6px 12px !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
  min-height: 32px !important;
  display: flex !important;
  align-items: center !important;
  font-size: 14px !important;
}

body.theme-tech nav .user-name,
.theme-tech nav .user-name {
  margin-left: 12px !important;
  color: #00ffff !important;
  font-weight: 600 !important;
  padding: 6px 12px !important;
  background: rgba(0, 255, 255, 0.1) !important;
  border-radius: 16px !important;
  border: 1px solid #00ffff !important;
  box-shadow: 0 0 6px rgba(0, 255, 255, 0.3) !important;
  font-family: 'Courier New', monospace !important;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.5) !important;
  min-height: 32px !important;
  display: flex !important;
  align-items: center !important;
  font-size: 14px !important;
}

/* Logout button styling */
body.theme-default nav .logout-button,
.theme-default nav .logout-button {
  color: white !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  padding: 6px 12px !important;
  border-radius: 6px !important;
  transition: all 0.3s ease !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
  min-height: 32px !important;
  display: flex !important;
  align-items: center !important;
  font-size: 14px !important;
}

body.theme-default nav .logout-button:hover,
.theme-default nav .logout-button:hover {
  background-color: rgba(255, 255, 255, 0.15) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2) !important;
}

body.theme-tech nav .logout-button,
.theme-tech nav .logout-button {
  color: #ff0080 !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  padding: 6px 12px !important;
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
  background: rgba(255, 0, 128, 0.1) !important;
  border: 1px solid #ff0080 !important;
  box-shadow: 0 0 6px rgba(255, 0, 128, 0.3) !important;
  font-family: 'Courier New', monospace !important;
  text-shadow: 0 0 3px rgba(255, 0, 128, 0.5) !important;
  min-height: 32px !important;
  display: flex !important;
  align-items: center !important;
  font-size: 14px !important;
}

body.theme-tech nav .logout-button:hover,
.theme-tech nav .logout-button:hover {
  background: rgba(255, 0, 128, 0.2) !important;
  box-shadow: 0 0 15px rgba(255, 0, 128, 0.5) !important;
  transform: translateY(-1px) !important;
}

/* Theme dropdown specific styling */
body.theme-default nav .theme-menu,
.theme-default nav .theme-menu {
  position: relative !important;
}

body.theme-default nav .theme-dropdown,
.theme-default nav .theme-dropdown {
  color: white !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 6px !important;
  padding: 6px 12px !important;
  background: rgba(255, 255, 255, 0.1) !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
  min-height: 32px !important;
  display: flex !important;
  align-items: center !important;
}

body.theme-tech nav .theme-menu,
.theme-tech nav .theme-menu {
  position: relative !important;
}

body.theme-tech nav .theme-dropdown,
.theme-tech nav .theme-dropdown {
  color: #00ffff !important;
  font-family: 'Courier New', monospace !important;
  background: rgba(0, 255, 255, 0.05) !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 4px !important;
  padding: 6px 12px !important;
  box-shadow: 0 0 6px rgba(0, 255, 255, 0.3) !important;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.5) !important;
  min-height: 32px !important;
  display: flex !important;
  align-items: center !important;
  font-size: 14px !important;
}

/* Quasar button dropdown overrides */
body.theme-default nav .q-btn-dropdown,
.theme-default nav .q-btn-dropdown {
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

body.theme-tech nav .q-btn-dropdown,
.theme-tech nav .q-btn-dropdown {
  color: #00ffff !important;
  border: 1px solid rgba(0, 255, 255, 0.3) !important;
  border-radius: 4px !important;
  transition: all 0.3s ease !important;
  background: rgba(0, 255, 255, 0.05) !important;
  font-family: 'Courier New', monospace !important;
}

body.theme-tech nav .q-btn-dropdown:hover,
.theme-tech nav .q-btn-dropdown:hover {
  border: 1px solid #00ffff !important;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.4) !important;
  background: rgba(0, 255, 255, 0.1) !important;
}

/* Language select styling */
body.theme-default nav .q-select,
.theme-default nav .q-select {
  color: white !important;
}

body.theme-tech nav .q-select,
.theme-tech nav .q-select {
  color: #00ffff !important;
  font-family: 'Courier New', monospace !important;
}

.active-theme {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

/* 响应式处理 - 确保小屏设备上顶部菜单可以横向滚动 */
  @media (max-width: 1024px) {
    nav {
      display: flex !important;
      flex-wrap: nowrap !important;
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch !important;
      scrollbar-width: none !important; /* Firefox */
      min-width: 100% !important;
      padding-right: 10px !important;
    }
    
    nav::-webkit-scrollbar {
      display: none !important; /* Chrome, Safari, Edge */
    }
    
    .el-menu-item {
      white-space: nowrap !important;
      flex-shrink: 0 !important;
      padding: 0 6px !important;
      font-size: 13px !important;
    }
    
    /* 确保所有菜单项在移动设备上正确显示 */
    .theme-menu, .logout-button {
      flex-shrink: 0 !important;
    }
    
    /* 调整下拉按钮大小以适应小屏幕 */
    .theme-dropdown, .q-select {
      min-height: 26px !important;
      font-size: 11px !important;
      padding: 3px 6px !important;
    }
  }
  
  /* 针对更小屏幕的特别优化 (iPhone Pro 7等) */
  @media (max-width: 768px) {
    nav {
      padding-left: 5px !important;
      padding-right: 5px !important;
    }
    
    .el-menu-item {
      padding: 0 5px !important;
      font-size: 12px !important;
      height: 36px !important;
      line-height: 36px !important;
    }
    
    /* 进一步减小按钮和选择器尺寸 */
    .theme-dropdown, .q-select, .logout-button {
      min-height: 24px !important;
      font-size: 10px !important;
      padding: 2px 5px !important;
      margin-left: 2px !important;
      margin-right: 2px !important;
    }
    
    /* 确保所有导航元素都不会被隐藏 */
    .nav-item {
      display: flex !important;
      align-items: center !important;
      height: 36px !important;
    }
  }
</style>
