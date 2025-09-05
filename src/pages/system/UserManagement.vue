<template>
  <q-page class="h-screen flex">
    <!-- 左侧导航区域 -->
    <div class="h-full flex relative">
      <!-- 导航菜单 -->
      <div class="bg-white h-full border-r border-grey-200 flex-shrink-0 z-10" :style="{ width: sidebarWidth + 'px', display: sidebarHidden ? 'none' : 'block' }"></div>
      <div class="bg-white h-full border-r border-grey-200 flex-shrink-0 z-10 absolute left-0 top-0 bottom-0" :style="{ width: sidebarWidth + 'px', display: sidebarHidden ? 'none' : 'block' }">
        <div class="p-4 bg-primary text-white">
          <h3 class="text-center font-semibold">{{ $t('user_management') }}</h3>
        </div>
        <div class="h-full p-2">
          <q-tree
            :nodes="menuTree"
            node-key="label"
            no-connectors
            clickable
            selected-color="primary"
            v-model:selected="selectedNode"
            v-model:expanded="expandedNodes"
            class="h-full"
          />
        </div>
      </div>

      <!-- 宽度调整拖拽条 -->
      <div
        class="sidebar-resizer"
        @mousedown="startResize"
        :style="{ left: sidebarWidth - 3 + 'px', display: sidebarHidden ? 'none' : 'block' }"
      ></div>

      <!-- 主内容区域 -->
      <div class="flex-1 flex flex-col h-full overflow-hidden">
        <!-- 顶部标题栏 -->
        <div class="bg-white border-b border-grey-200 p-4 flex items-center">
          <q-btn
            dense
            flat
            round
            icon="menu"
            class="mr-2"
            @click="toggleSidebar"
          />
          <h2 class="text-lg font-semibold">
            {{ currentPageTitle }}
          </h2>
        </div>

        <!-- 内容区域 -->
        <div class="flex-1 p-6 overflow-auto">
          <component
            :is="currentComponentName"
            v-bind="activePage === 'userList' ? userListProps.value : {}"
            v-on="activePage === 'userList' ? handleUserListEvents : (activePage === 'addUser' ? handleAddUserEvents : {})"
          />
        </div>
      </div>

      <!-- 移动设备上的抽屉覆盖层 -->
      <div
        v-if="mobileDrawerOpen && isMobile"
        class="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
        @click="mobileDrawerOpen = false"
      ></div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import axios from 'axios';
import { API } from "src/api/api.js";
import { usePositionInfoStore } from "src/stores/positionInfo.js";
import UserList from "./UserList.vue";
import AddUser from "./AddUser.vue";
import UserSettings from "./UserSettings.vue";
import UserStatistics from "./UserStatistics.vue";
import BranchPage from "./BranchPage.vue";
import PositionPage from "./PositionPage.vue";
import MenuPage from "./MenuPage.vue";
import UsersPage from "./UsersPage.vue";

export default {
  name: "UserManagement",
  components: {
    UserList,
    AddUser,
    UserSettings,
    UserStatistics,
    BranchPage,
    PositionPage,
    MenuPage,
    UsersPage
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();

    // 当前活动页面
    const activePage = ref("userList");

    // 移动设备上的抽屉状态
    const mobileDrawerOpen = ref(false);

    // 检测是否为移动设备
    const isMobile = ref(window.innerWidth < 768);

    // 侧边栏宽度（默认12rem = 192px，是原来128的一半）
    const sidebarWidth = ref(192);

    // 侧边栏隐藏状态
    const sidebarHidden = ref(false);

    // 选中的节点
    const selectedNode = ref(null);

    // 分页配置
    const pagination = ref({ page: 1, pages: 1, rowsPerPage: 10 });

    // 硬编码的用户数据
    const users = ref([
      {
        id: 1,
        username: "admin",
        realname: "管理员",
        department: "信息部",
        position: "软件开发",
        status: true
      },
      {
        id: 2,
        username: "test",
        realname: "测试1",
        department: "信息部",
        position: "软件测试",
        status: true
      }
    ]);

    // 表格列配置
    const columns = ref([
      { name: "id", label: t("serial_number"), field: "id", align: "left", sortable: true, width: 80 },
      { name: "username", label: t("login_name"), field: "username", align: "left", sortable: true },
      { name: "realname", label: t("real_name"), field: "realname", align: "left", sortable: true },
      { name: "department", label: t("department"), field: "department", align: "left", sortable: true },
      { name: "position", label: t("position"), field: "position", align: "left", sortable: true },
      { name: "status", label: t("status"), field: "status", align: "left", sortable: true, format: (val) => val ? t("active") : t("inactive") },
      { name: "actions", label: t("operations"), field: "id", align: "right", width: 120, sortable: false }
    ]);

    // 树形菜单配置
    const menuTree = ref([]);

    // 展开的节点
    const expandedNodes = ref([]);

    // 获取菜单数据
    const fetchMenus = async () => {
      try {
        // 获取职位信息存储
        const positionInfoStore = usePositionInfoStore();

        // 从职位信息中获取menu_id
        let menuIds = [];
        if (positionInfoStore.positionInfo && positionInfoStore.positionInfo.menu_id) {
          // 解析以逗号分隔的menu_id字符串
          menuIds = positionInfoStore.positionInfo.menu_id.split(',').map(id => id.trim());
        }

        // 构建带过滤条件的URL
        let menuUrl = API.USER.MENU.LIST;
        if (menuIds.length > 0) {
          const filters = menuIds.map(id => `filters[menu_id][$in]=${id}`).join('&');
          menuUrl = `${menuUrl}?${filters}`;
        }

        // 输出完整URL到控制台方便调试
        console.log('请求菜单的完整URL:', menuUrl);

        // 使用构建的URL访问菜单数据
        const response = await axios.get(menuUrl);
        const menuData = response.data.data;

        // 过滤出需要显示的菜单（is_show和is_enable都为1）
        const visibleMenus = menuData.filter(menu => menu.is_show === 1 && menu.is_enable === 1);

        // 按照sort排序
        visibleMenus.sort((a, b) => a.sort - b.sort);

        // 构建树形结构
        const buildMenuTree = (menus) => {
          const tree = [];
          const menuMap = new Map();

          // 初始化所有菜单到map
          menus.forEach(menu => {
            menuMap.set(menu.menu_id, {
              label: menu.name,
              icon: menu.icon || 'menu', // 使用默认图标或数据中的图标
              // 只提取URL的最后一部分作为页面名称，避免路径拼接错误
              pageName: menu.page_url ? menu.page_url.split('/').pop() : null,
              children: []
            });
          });

          // 构建树形结构
          menus.forEach(menu => {
            const menuNode = menuMap.get(menu.menu_id);

            if (menu.parent_id === 0) {
              // 一级菜单
              tree.push(menuNode);
            } else {
              // 子菜单
              const parentNode = menuMap.get(menu.parent_id);
              if (parentNode) {
                parentNode.children.push(menuNode);
              }
            }
          });

          return tree;
        };

        // 更新菜单树
        menuTree.value = buildMenuTree(visibleMenus);

        // 展开所有一级菜单
        if (menuTree.value.length > 0) {
          expandedNodes.value = menuTree.value.map(node => node.label);
        }

        console.log('菜单数据加载成功:', menuTree.value);
      } catch (error) {
        console.error('获取菜单数据失败:', error);
      }
    };

    // 定义当前页面组件名称
    const currentComponentName = computed(() => {
      switch (activePage.value) {
        case 'userList': return 'UserList';
        case 'addUser': return 'AddUser';
        case 'userSettings': return 'UserSettings';
        case 'userStatistics': return 'UserStatistics';
        case 'branch': return 'BranchPage';
        case 'position': return 'PositionPage';
        case 'menu': return 'MenuPage';
        case 'users': return 'UsersPage';
        default: return 'UserList';
      }
    });

    // 获取当前页面标题
    const currentPageTitle = computed(() => {
      // 递归查找当前页面标题
      const findPageTitle = (nodes) => {
        for (const node of nodes) {
          if (node.pageName === activePage.value) {
            return node.label;
          }
          if (node.children) {
            const found = findPageTitle(node.children);
            if (found) return found;
          }
        }
        return t('user_management');
      };

      return findPageTitle(menuTree.value);
    });

    // 用户列表组件属性 - 使用computed实现响应式
    const userListProps = computed(() => ({
      users: users.value,
      columns: columns.value,
      pagination: pagination.value
    }));

    // 切换页面
    const switchPage = async (pageName) => {
      activePage.value = pageName;
      // 更新浏览器地址栏
      router.push(`/system/userManagement/${pageName}`);
      // 在移动设备上切换页面后关闭抽屉
      if (isMobile.value) {
        mobileDrawerOpen.value = false;
      }
      // 重新获取菜单数据，确保用户切换后显示正确的菜单
      await fetchMenus();
    };

    // 处理节点点击事件
    const handleNodeClick = (nodeProps) => {
      if (nodeProps.node.pageName) {
        switchPage(nodeProps.node.pageName);
      }
    };

    // 切换移动设备抽屉
    const toggleDrawer = () => {
      mobileDrawerOpen.value = !mobileDrawerOpen.value;
    };

    // 切换侧边栏显示/隐藏
    const toggleSidebar = () => {
      sidebarHidden.value = !sidebarHidden.value;
    };

    // 监听窗口大小变化
    const handleResize = () => {
      isMobile.value = window.innerWidth < 768;
      // 窗口变大时关闭移动抽屉
      if (!isMobile.value) {
        mobileDrawerOpen.value = false;
      }
    };

    // 开始调整侧边栏宽度
    const startResize = (e) => {
      e.preventDefault();

      const onMouseMove = (moveEvent) => {
        const newWidth = moveEvent.clientX;
        // 限制最小宽度和最大宽度
        if (newWidth >= 50 && newWidth <= 300) {
          sidebarWidth.value = newWidth;
        }
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    // 监听选中节点的变化
    watch(selectedNode, (newNode) => {
      if (newNode) {
        // 递归查找选中节点的 pageName
        const findPageName = (nodes) => {
          for (const node of nodes) {
            if (node.label === newNode) {
              return node.pageName;
            }
            if (node.children) {
              const found = findPageName(node.children);
              if (found) return found;
            }
          }
          return null;
        };

        const pageName = findPageName(menuTree.value);
        if (pageName) {
          switchPage(pageName);
        }
      }
    });

    // 生命周期钩子
    onMounted(async () => {
      window.addEventListener('resize', handleResize);

      // 加载菜单数据
      await fetchMenus();

      // 从URL解析当前页面
      const path = window.location.pathname;
      const pathParts = path.split('/');
      // 当路径以/userManagement结尾时，使用默认页面userList
      let pageName = pathParts[pathParts.length - 1];
      if (pageName === 'userManagement') {
        pageName = 'userList';
      }

      // 如果有页面名称，则尝试找到匹配的菜单项
      if (pageName && menuTree.value.length > 0) {
        // 递归查找匹配的菜单项
        const findMatchingMenu = (nodes) => {
          for (const node of nodes) {
            if (node.pageName === pageName || node.label === pageName) {
              return node;
            }
            if (node.children) {
              const found = findMatchingMenu(node.children);
              if (found) return found;
            }
          }
          return null;
        };

        const matchingMenu = findMatchingMenu(menuTree.value);
        if (matchingMenu) {
          activePage.value = matchingMenu.pageName || 'userList';
          selectedNode.value = matchingMenu.label;
        } else {
          // 默认选择第一个有效菜单项
          setDefaultActiveMenu();
        }
      } else if (menuTree.value.length > 0) {
        // 设置默认活动菜单
        setDefaultActiveMenu();
      }
    });

    // 设置默认活动菜单
    const setDefaultActiveMenu = () => {
      if (menuTree.value.length > 0) {
        // 查找第一个有pageName的菜单项
        const findFirstValidMenu = (nodes) => {
          for (const node of nodes) {
            if (node.pageName) {
              return node;
            }
            if (node.children && node.children.length > 0) {
              const found = findFirstValidMenu(node.children);
              if (found) return found;
            }
          }
          return null;
        };

        const firstValidMenu = findFirstValidMenu(menuTree.value);
        if (firstValidMenu) {
          activePage.value = firstValidMenu.pageName;
          selectedNode.value = firstValidMenu.label;
        }
      }
    };

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
    });

    // 添加用户方法
    const addUser = (userData) => {
      // 创建新用户对象
      const userToAdd = {
        ...userData,
        id: Math.max(...users.value.map(u => u.id), 0) + 1
      };

      // 添加到用户列表
      users.value.push(userToAdd);

      // 显示成功消息
      alert(t("user_added_successfully"));

      // 切换回用户列表
      switchPage("userList");
    };

    // 编辑用户方法
    const editUser = (user) => {
      // 这里可以实现编辑用户的逻辑
      alert(t("edit") + ": " + user.username);
    };

    // 删除用户方法
    const deleteUser = (user) => {
      // 这里可以实现删除用户的逻辑
      if (confirm(t("confirm_delete_user") + ": " + user.username + "?")) {
        // 实际删除逻辑
        users.value = users.value.filter(u => u.id !== user.id);
      }
    };

    // 处理用户列表事件
    const handleUserListEvents = {
      'edit-user': editUser,
      'delete-user': deleteUser,
      'switch-to-add-user': () => { switchPage('addUser'); },
      'update-pagination': (newPagination) => {
        Object.assign(pagination.value, newPagination);
      }
    };

    // 处理添加用户事件
    const handleAddUserEvents = {
      'add-user': addUser,
      'switch-to-user-list': () => { switchPage('userList'); }
    };

    return {
      activePage,
      mobileDrawerOpen,
      isMobile,
      menuTree,
      expandedNodes,
      selectedNode,
      currentComponentName,
      currentPageTitle,
      userListProps,
      handleUserListEvents,
      handleAddUserEvents,
      switchPage,
      toggleDrawer,
      toggleSidebar,
      sidebarWidth,
      sidebarHidden,
      startResize,
      fetchMenus,
      setDefaultActiveMenu
    };
  }
};
</script>

<style scoped>
.q-btn {
  border-radius: 4px;
}

.q-table {
  border-radius: 0;
}

.q-pagination {
  padding: 16px 0;
}

/* 左侧导航样式 */
.q-item {
  cursor: pointer;
  transition: all 0.2s ease;
}

.q-item.active {
  background-color: #e3f2fd;
  color: #1976d2;
}

.q-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.q-item.no-border {
  border: none;
}

/* 确保布局高度与页面一致 */
.h-full {
  height: 100%;
  min-height: 0;
}

.h-screen {
  height: 100vh;
  min-height: 100vh;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.flex-1 {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.overflow-hidden {
  overflow: hidden;
}

.overflow-auto {
  overflow: auto;
}

/* 主内容区域样式 */
.p-6 {
  padding: 1.5rem;
}

.p-4 {
  padding: 1rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

/* 响应式布局调整 */
@media (max-width: 767px) {
  /* 移动设备上的侧边栏 */
  [style*="width:"] {
    position: fixed;
    left: -20rem;
    top: 0;
    bottom: 0;
    z-index: 30;
    transition: left 0.3s ease;
  }

  [style*="width:"].mobile-drawer-open {
    left: 0;
  }
}

/* 边框样式 */
.border-r {
  border-right-width: 1px;
  border-right-style: solid;
}

.border-b {
  border-bottom-width: 1px;
  border-bottom-style: solid;
}

.border-grey-200 {
  border-color: #e0e0e0;
}

/* 背景色 */
.bg-primary {
  background-color: #1976d2;
}

.bg-white {
  background-color: #ffffff;
}

/* 文字颜色 */
.text-white {
  color: #ffffff;
}

/* 文本对齐 */
.text-center {
  text-align: center;
}

/* 字体粗细 */
.font-semibold {
  font-weight: 600;
}

/* Z-index */
.z-10 {
  z-index: 10;
}

.z-20 {
  z-index: 20;
}

.z-30 {
  z-index: 30;
}

/* 透明度 */
.bg-opacity-50 {
  background-color: rgba(0, 0, 0, 0.5);
}

/* 定位 */
.fixed {
  position: fixed;
}

.relative {
  position: relative;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

/* 居中对齐 */
.items-center {
  align-items: center;
}

/* 侧边栏调整器样式 */
.sidebar-resizer {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: ew-resize;
  z-index: 20;
  transition: all 0.2s ease;
}

.sidebar-resizer:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* 主内容区域随侧边栏宽度变化 */
.flex-1 {
  transition: margin-left 0.2s ease;
}

/* 隐藏类 - 用于侧边栏宽度过小时隐藏文本 */
.hidden {
  display: none;
}
</style>
