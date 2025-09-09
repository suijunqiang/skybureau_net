<template>
  <q-page class="h-full flex">
    <!-- 左侧导航区域 -->
    <div class="h-full flex relative">
      <!-- 导航菜单 -->
      <div class="bg-white h-full border-r border-grey-200 flex-shrink-0 z-10" :style="{ width: sidebarWidth + 'px', display: sidebarHidden ? 'none' : 'block' }">
        <div class="h-full p-2 overflow-auto">
          <q-list class="h-full">
            <template v-for="node in menuTree" :key="node.label">
              <!-- 直接使用q-expansion-item -->
              <q-expansion-item
                v-if="node.children && node.children.length > 0"
                :icon="getNodeIcon(node)"
                :label="node.label"
                :default-opened="expandedNodes.includes(node.label)"
                :color="selectedNode === node.label ? 'primary' : (node.color || '#333333')"
                :header-inset-level="0"
                :content-inset-level="1"
                dense-toggle
                @update:model-value="(open) => handleToggleExpand(node.label, open)"
              >
                <!-- 子菜单 -->
                <template v-for="child in node.children" :key="child.label">
                  <q-item
                    clickable
                    dense
                    @click="() => {
                      console.log('子菜单点击事件直接触发！');
                      handleNodeSelect(child); }"
                    style="cursor: pointer;"
                  >
                    <q-item-section side>
                      <q-icon
                        :name="getNodeIcon(child)"
                        size="18px"
                        :color="selectedNode === child.label ? 'primary' : (child.color || '#333333')"
                      />
                    </q-item-section>
                    <q-item-section class="text-sm">
                      {{ child.label }}
                    </q-item-section>
                  </q-item>
                </template>
              </q-expansion-item>

              <!-- 没有子菜单的菜单项 -->
              <q-item
                v-else
                dense
                :class="[selectedNode === node.label ? 'bg-primary/10 text-primary font-medium' : '', 'transition-all duration-300']"
                @click="() => { console.log('菜单项点击事件直接触发！'); handleNodeSelect(node); }"
                style="cursor: pointer;"
              >
                <q-item-section side>
                  <q-icon
                    :name="getNodeIcon(node)"
                    size="18px"
                    :color="selectedNode === node.label ? 'primary' : (node.color || '#333333')"
                  />
                </q-item-section>
                <q-item-section class="text-sm">
                  {{ node.label }}
                </q-item-section>
              </q-item>
            </template>
          </q-list>
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
      <div class="flex-1 h-full w-full overflow-auto content-area" :class="['users', 'userList', 'menu', 'position', 'branch', 'blogCreate', 'create'].includes(activePage) ? 'no-padding' : 'p-6'">
        <!-- 使用渲染函数直接创建组件 -->
        <div class="h-full w-full component-wrapper">
          <component :is="renderCurrentPage()" />
        </div>
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
import { ref, computed, watch, onMounted, onUnmounted, h } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import axios from 'axios';
import { API } from "src/api/api.js";
import { usePositionInfoStore } from "src/stores/positionInfo.js";
import WelcomePage from "./WelcomePage.vue";
import AddUser from "./AddUser.vue";
import UserSettings from "./UserSettings.vue";
import UserStatistics from "./UserStatistics.vue";
import BranchPage from "./BranchPage.vue";
import PositionPage from "./PositionPage.vue";
import MenuPage from "./MenuPage.vue";
import UsersPage from "./UsersPage.vue";
import BlogCreate from "../blog/BlogCreate.vue";

export default {
  name: "UserManagement",
  components: {
    WelcomePage,
    AddUser,
    UserSettings,
    UserStatistics,
    BranchPage,
    PositionPage,
    MenuPage,
    UsersPage,
    BlogCreate
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();

    // 当前活动页面
    const activePage = ref("welcome");
    // 添加一个强制更新的key，用于触发组件重新渲染
    const componentKey = ref(0);

    // 处理子组件发出的返回欢迎页面事件
    const handleGoBackToWelcome = () => {
      console.log('接收到子组件的返回欢迎页面事件，开始切换到welcome页面');
      switchPage('welcome');
    };

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

    // 菜单图标映射表 - 为不同类型的菜单设置默认图标
    const defaultIcons = {
      'User': 'person',
      'Menu': 'menu',
      'Branch': 'business',
      'Position': 'workflow',
      'Blog': 'subject',
      'Settings': 'settings',
      'System': 'cog',
      'Home': 'home',
      'Home Page': 'home'
    };

    // 菜单颜色映射表 - 为不同类型的菜单设置默认颜色
    const defaultColors = {
      'User': '#1976D2', // 蓝色
      'Menu': '#388E3C', // 绿色
      'Branch': '#F57C00', // 橙色
      'Position': '#7B1FA2', // 紫色
      'Blog': '#D32F2F', // 红色
      'Settings': '#616161', // 灰色
      'System': '#0097A7', // 青色
      'Home': '#FF9800', // 橙色
      'Home Page': '#FF9800' // 橙色
    };

    // 构建树形结构
    const buildMenuTree = (menus) => {
      const tree = [];
      const menuMap = new Map();

      console.log('原始菜单数据:', menus);

      // 初始化所有菜单到map
      menus.forEach(menu => {
        // 获取菜单名称
        const menuName = menu.name || '';

        // 根据菜单名称设置默认图标 - 改进匹配逻辑
        let icon = menu.icon || 'menu';
        const lowerCaseName = menuName.toLowerCase();

        // 首先检查是否有API返回的图标
        if (!menu.icon) {
          // 增强的匹配逻辑
          for (const [key, value] of Object.entries(defaultIcons)) {
            // 大小写不敏感的匹配
            if (lowerCaseName.includes(key.toLowerCase())) {
              icon = value;
              console.log(`菜单名称 "${menuName}" 匹配到图标: ${icon}`);
              break;
            }
          }
        } else {
          console.log(`菜单名称 "${menuName}" 使用API返回的图标: ${menu.icon}`);
        }

        // 根据菜单名称设置默认颜色 - 改进匹配逻辑
        let color = menu.color || '#333333';

        // 首先检查是否有API返回的颜色
        if (!menu.color) {
          // 增强的匹配逻辑
          for (const [key, value] of Object.entries(defaultColors)) {
            // 大小写不敏感的匹配
            if (lowerCaseName.includes(key.toLowerCase())) {
              color = value;
              console.log(`菜单名称 "${menuName}" 匹配到颜色: ${color}`);
              break;
            }
          }
        } else {
          console.log(`菜单名称 "${menuName}" 使用API返回的颜色: ${menu.color}`);
        }

        // 更健壮的pageName设置逻辑
        let pageName = null;
        if (menu.page_url) {
          pageName = menu.page_url.split('/').pop();
          // 特殊处理一些可能的page_url格式
          if (pageName.includes('.')) {
            pageName = pageName.split('.')[0];
          }
        } else {
          // 如果没有page_url，尝试根据菜单名称生成
          const nameMap = {
            'Users': 'users',
            'User': 'users',
            'Branch': 'branch',
            'Position': 'position',
            'Menu': 'menu'
          };

          for (const [key, value] of Object.entries(nameMap)) {
            if (lowerCaseName.includes(key.toLowerCase())) {
              pageName = value;
              break;
            }
          }
        }

        console.log(`菜单"${menuName}"的pageName:`, pageName);

        const menuNode = {
          label: menuName,
          icon: icon, // 使用数据中的图标或根据菜单名称匹配的默认图标
          color: color, // 使用数据中的颜色或根据菜单名称匹配的默认颜色
          pageName: pageName,
          children: []
        };

        console.log('构建的菜单节点:', menuNode);

        menuMap.set(menu.menu_id, menuNode);
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
      console.log('计算当前组件名称，activePage:', activePage.value);

      // 为了调试，添加更多日志信息
      const componentMap = {
        'welcome': 'WelcomePage',
        'addUser': 'AddUser',
        'userSettings': 'UserSettings',
        'userStatistics': 'UserStatistics',
        'branch': 'BranchPage',
        'position': 'PositionPage',
        'menu': 'MenuPage',
        'users': 'UsersPage',
        'userList': 'UsersPage',
        'blogCreate': 'BlogCreate',
        'blog': 'BlogCreate'
      };

      const result = componentMap[activePage.value] || 'WelcomePage';
      console.log('计算得到的组件名称:', result);
      return result;
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



    // 切换页面
    const switchPage = async (pageName) => {
      console.log('======================= 页面切换开始 =======================');
      console.log('进入switchPage函数，目标页面:', pageName);
      console.log('当前activePage值:', activePage.value);
      console.log('当前componentKey值:', componentKey.value);

      // 确保pageName存在
      if (!pageName) {
        console.error('pageName为空，无法切换页面');
        return;
      }

      // 如果页面相同，强制刷新
      if (activePage.value === pageName) {
        console.log('目标页面与当前页面相同，强制刷新组件');
        componentKey.value++;

        // 等待下一个渲染周期
        await new Promise(resolve => setTimeout(resolve, 10));

        console.log('组件已强制刷新，componentKey:', componentKey.value);
        return;
      }

      activePage.value = pageName;
      console.log('activePage已设置为:', pageName);

      // 增加componentKey来强制动态组件重新渲染
      componentKey.value++;
      console.log('已增加componentKey以强制组件重新渲染:', componentKey.value);

      // 等待组件更新
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('currentComponentName计算后的值:', currentComponentName.value);
      console.log('组件更新后的activePage值:', activePage.value);
      console.log('======================= 页面切换结束 =======================');

      return true;

      // 在移动设备上切换页面后关闭抽屉
      if (isMobile.value) {
        mobileDrawerOpen.value = false;
        console.log('移动设备：已关闭侧边抽屉');
      }
    };



    // 处理展开/折叠事件
    const handleToggleExpand = (nodeLabel, isOpen) => {
      if (isOpen) {
        // 如果要展开，且节点不在 expandedNodes 中，则添加
        if (!expandedNodes.value.includes(nodeLabel)) {
          expandedNodes.value = [...expandedNodes.value, nodeLabel];
        }
      } else {
        // 如果要折叠，且节点在 expandedNodes 中，则移除
        expandedNodes.value = expandedNodes.value.filter(label => label !== nodeLabel);
      }
    };

    // 处理节点选择
    const handleNodeSelect = async (node) => {

      if (!node) {
        console.error('无效的节点');
        return;
      }

      console.log('======================= 菜单点击事件开始 =======================');
      console.log('点击时间:', new Date().toLocaleString('zh-CN'));
      console.log('原始节点信息 - 标签:', node.label, '页面名:', node.pageName);
      console.log('原始节点完整信息:', node);
      console.log('节点是否有子菜单:', node.children && node.children.length > 0 ? '是' : '否');
      console.log('节点图标:', node.icon || '无');
      console.log('节点颜色:', node.color || '默认');

      // 验证和修复节点的pageName
      console.log('开始验证节点pageName...');
      const isValid = validateNodePageName(node);
      console.log('节点验证结果:', isValid ? '有效' : '已修复');
      console.log('验证后节点信息 - 页面名:', node.pageName);

      selectedNode.value = node.label;
      console.log('已设置selectedNode.value:', selectedNode.value);

      // 如果没有子菜单，则切换页面
      if (!node.children || node.children.length === 0) {
        console.log('即将切换到页面:', node.pageName);

        // 确保pageName有效
        if (node.pageName && node.pageName.trim() !== '') {
          await switchPage(node.pageName);
        } else {
          console.error('页面名无效，无法切换页面');
          // 如果没有有效页面名，尝试使用默认页面
          await switchPage('welcome');
        }
      } else {
        console.log('节点有子菜单，不切换页面');
      }

      console.log('======================= 菜单点击事件结束 =======================');

      // 在移动设备上关闭抽屉
      if (isMobile.value) {
        mobileDrawerOpen.value = false;
      }
    };

    // 验证和修复menuTree，确保所有节点都有pageName属性
    const validateAndFixMenuTree = (tree) => {
      console.log('======================= 开始验证和修复菜单树 =======================');

      if (!Array.isArray(tree)) {
        console.error('传入的不是数组:', tree);
        return;
      }

      // 扩展的页面名称映射表
      const pageNameMap = {
        '用户管理': 'users',
        '部门管理': 'branch',
        '职位管理': 'position',
        '菜单管理': 'menu',
        '用户设置': 'userSettings',
        '用户统计': 'userStatistics',
        '欢迎': 'welcome',
        'Welcome': 'welcome',
        'Users': 'users',
        'Branch': 'branch',
        'Position': 'position',
        'Menu': 'menu',
        '部门': 'branch',
        '职位': 'position',
        '用户': 'users',
        '设置': 'userSettings',
        '统计': 'userStatistics',
        '用户列表': 'users',
        '系统设置': 'userSettings',
        '数据统计': 'userStatistics'
      };

      let fixedCount = 0;

      // 深度优先遍历菜单树
      const traverseMenuTree = (nodes, level = 0) => {
        nodes.forEach(node => {
          const prefix = '  '.repeat(level);

          // 无论如何都为节点设置pageName，确保所有菜单项都有pageName
          if (!node.pageName || node.pageName.trim() === '') {
            fixedCount++;

            // 尝试根据label推断pageName
            if (node.label) {
              const lowerLabel = node.label.toLowerCase();
              let matched = false;

              // 尝试精确匹配
              if (pageNameMap[node.label]) {
                node.pageName = pageNameMap[node.label];
                console.log(`${prefix}修复菜单项: ${node.label} - 精确匹配设置pageName为: ${node.pageName}`);
                matched = true;
              } else {
                // 尝试模糊匹配（忽略大小写）
                for (const [key, value] of Object.entries(pageNameMap)) {
                  if (lowerLabel.includes(key.toLowerCase())) {
                    node.pageName = value;
                    console.log(`${prefix}修复菜单项: ${node.label} - 模糊匹配设置pageName为: ${node.pageName}`);
                    matched = true;
                    break;
                  }
                }
              }

              // 如果仍然没有匹配，使用默认页面
              if (!matched) {
                // 根据常见的菜单项模式推断
                if (lowerLabel.includes('用户')) {
                  node.pageName = 'users';
                  console.log(`${prefix}修复菜单项: ${node.label} - 基于模式匹配设置pageName为: users`);
                } else if (lowerLabel.includes('部门')) {
                  node.pageName = 'branch';
                  console.log(`${prefix}修复菜单项: ${node.label} - 基于模式匹配设置pageName为: branch`);
                } else if (lowerLabel.includes('职位')) {
                  node.pageName = 'position';
                  console.log(`${prefix}修复菜单项: ${node.label} - 基于模式匹配设置pageName为: position`);
                } else if (lowerLabel.includes('菜单')) {
                  node.pageName = 'menu';
                  console.log(`${prefix}修复菜单项: ${node.label} - 基于模式匹配设置pageName为: menu`);
                } else if (lowerLabel.includes('设置')) {
                  node.pageName = 'userSettings';
                  console.log(`${prefix}修复菜单项: ${node.label} - 基于模式匹配设置pageName为: userSettings`);
                } else if (lowerLabel.includes('统计')) {
                  node.pageName = 'userStatistics';
                  console.log(`${prefix}修复菜单项: ${node.label} - 基于模式匹配设置pageName为: userStatistics`);
                } else {
                  console.warn(`${prefix}无法为菜单项 ${node.label} 设置有效的pageName，使用默认值`);
                  node.pageName = 'welcome'; // 默认页面
                }
              }
            } else {
              console.warn(`${prefix}菜单项缺少label，无法设置pageName`);
              node.pageName = 'welcome'; // 默认页面
            }
          } else {
            console.log(`${prefix}菜单项 ${node.label} 已正确设置pageName: ${node.pageName}`);
          }

          // 递归处理子菜单
          if (node.children && Array.isArray(node.children)) {
            traverseMenuTree(node.children, level + 1);
          }
        });
      };

      // 开始遍历
      traverseMenuTree(tree);

      // 打印修复统计信息
      console.log(`已修复 ${fixedCount} 个菜单项的pageName属性`);
      console.log('======================= 完成验证和修复菜单树 =======================');

      // 添加一个简单的检查，确保所有菜单项都有pageName
      const verifyAllNodes = () => {
        let allValid = true;
        const invalidNodes = [];

        const checkNodes = (nodes) => {
          nodes.forEach(node => {
            if (!node.pageName || node.pageName.trim() === '') {
              allValid = false;
              invalidNodes.push(node.label || 'unnamed node');
            }
            if (node.children && Array.isArray(node.children)) {
              checkNodes(node.children);
            }
          });
        };

        checkNodes(tree);

        if (allValid) {
          console.log('✅ 所有菜单项都有有效的pageName属性');
        } else {
          console.error(`❌ 发现${invalidNodes.length}个无效的菜单项:`, invalidNodes);
        }

        return allValid;
      };

      // 验证所有节点
      verifyAllNodes();
    };

    // 验证单个节点的pageName
    const validateNodePageName = (node) => {
      if (!node || typeof node !== 'object') {
        console.error('无效的节点对象:', node);
        return false;
      }

      if (!node.pageName || node.pageName.trim() === '') {
        console.warn(`节点 ${node.label || 'unnamed'} 没有有效的pageName`);

        // 尝试修复单个节点
        const pageNameMap = {
          '用户管理': 'users',
          '部门管理': 'branch',
          '职位管理': 'position',
          '菜单管理': 'menu',
          '用户设置': 'userSettings',
          '用户统计': 'userStatistics',
          '欢迎': 'welcome'
        };

        if (node.label) {
          const lowerLabel = node.label.toLowerCase();

          // 尝试精确匹配
          if (pageNameMap[node.label]) {
            node.pageName = pageNameMap[node.label];
            console.log(`临时修复节点: ${node.label} - 设置pageName为: ${node.pageName}`);
            return true;
          } else if (lowerLabel.includes('用户')) {
            node.pageName = 'users';
            console.log(`临时修复节点: ${node.label} - 基于关键词设置pageName为: users`);
            return true;
          } else if (lowerLabel.includes('部门')) {
            node.pageName = 'branch';
            console.log(`临时修复节点: ${node.label} - 基于关键词设置pageName为: branch`);
            return true;
          } else if (lowerLabel.includes('职位')) {
            node.pageName = 'position';
            console.log(`临时修复节点: ${node.label} - 基于关键词设置pageName为: position`);
            return true;
          } else if (lowerLabel.includes('菜单')) {
            node.pageName = 'menu';
            console.log(`临时修复节点: ${node.label} - 基于关键词设置pageName为: menu`);
            return true;
          }
        }

        // 如果无法修复，使用默认值
        node.pageName = 'welcome';
        console.log(`临时修复节点: ${node.label || 'unnamed'} - 设置pageName为默认值: welcome`);
        return false;
      }

      return true;
    };

    // 定义路由监听器变量
    let routeListener = null;
    let removeRouterListener = null;

    // 测试页面切换功能
    const testPageSwitch = function() {
      console.log('页面切换功能已初始化');
      // 移除自动触发的代码，避免干扰用户点击
    };

    // 切换移动设备抽屉
    const toggleDrawer = function() {
      mobileDrawerOpen.value = !mobileDrawerOpen.value;
    };

    // 切换侧边栏显示/隐藏
    const toggleSidebar = function() {
      sidebarHidden.value = !sidebarHidden.value;
    };

    // 获取节点图标
    const getNodeIcon = function(node) {
      if (!node.icon || node.icon === ' ' || node.icon === 'fa') {
        return 'menu'; // 默认图标
      }
      return node.icon;
    };

    // 监听窗口大小变化
    const handleResize = function() {
      isMobile.value = window.innerWidth < 768;
      if (!isMobile.value) {
        mobileDrawerOpen.value = false;
      }
    };

    // 从URL初始化页面
    const initializePageFromUrl = function() {
      const path = window.location.pathname;
      const pathParts = path.split('/');
      let pageName = pathParts[pathParts.length - 1];
      if (pageName === 'userManagement') {
        pageName = 'welcome';
      }
      // 特殊处理博客创建页面
      if (path.includes('blog/create')) {
        pageName = 'blogCreate';
      }

      const isProgrammaticNavigation = window.location.hash.includes('fromSwitchPage=true');
      if (isProgrammaticNavigation) {
        const urlWithoutHash = window.location.href.replace(window.location.hash, '');
        history.replaceState(null, '', urlWithoutHash);
        return;
      }

      if (pageName && menuTree.value.length > 0 && !selectedNode.value) {
        const findMatchingMenu = function(nodes) {
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
        } else if (activePage.value === 'users') {
          return;
        } else {
          setDefaultActiveMenu();
        }
      } else if (menuTree.value.length > 0 && !selectedNode.value) {
        setDefaultActiveMenu();
      }
    };

    // 生命周期钩子
    onMounted(async function() {
      console.log('UserManagement组件已挂载');
      window.addEventListener('resize', handleResize);
      await fetchMenus();
      validateAndFixMenuTree(menuTree.value);
      initializePageFromUrl();

      let lastRouteChangeTime = 0;
      routeListener = function() {
        const currentTime = Date.now();
        if (currentTime - lastRouteChangeTime > 300) {
          if (!window.location.hash.includes('fromSwitchPage=true')) {
            initializePageFromUrl();
          }
          lastRouteChangeTime = currentTime;
        }
      };

      removeRouterListener = router.afterEach(routeListener);
      window.addEventListener('popstate', routeListener);
      console.log('执行页面切换测试');
      testPageSwitch();
    });

    // 生命周期钩子
    onUnmounted(function() {
      window.removeEventListener('resize', handleResize);
      if (routeListener) {
        window.removeEventListener('popstate', routeListener);
      }
      if (removeRouterListener) {
        removeRouterListener();
      }
    });

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



    // 处理添加用户事件
    const handleAddUserEvents = {
      'add-user': addUser,
      'switch-to-user-list': () => { switchPage('userList'); }
    };

    // 使用渲染函数直接创建组件
    const renderCurrentPage = () => {
      const props = {
        key: componentKey.value
      };

      const on = {
        goBackToWelcome: handleGoBackToWelcome
      };

      console.log('renderCurrentPage called, activePage:', activePage.value);

      switch (activePage.value) {
        case 'welcome':
          return h(WelcomePage, props, on);
        case 'addUser':
          on['add-user'] = handleAddUserEvents['add-user'];
          on['switch-to-user-list'] = handleAddUserEvents['switch-to-user-list'];
          return h(AddUser, props, on);
        case 'userSettings':
          return h(UserSettings, props, on);
        case 'userStatistics':
          return h(UserStatistics, props, on);
        case 'branch':
          return h(BranchPage, props, on);
        case 'position':
          return h(PositionPage, props, on);
        case 'menu':
          return h(MenuPage, props, on);
        case 'users':
        case 'userList':
          console.log('Rendering UsersPage component');
          return h(UsersPage, props, on);
        case 'blogCreate':
        case 'create':
          console.log('Rendering BlogCreate component');
          return h(BlogCreate, props, on);
        default:
          console.warn(`Unknown page: ${activePage.value}`);
          return h('div', {
            class: 'text-center text-gray-500 py-10'
          }, [
            h('p', {}, `无法加载页面: ${activePage.value}`),
            h("q-btn", {
              color: "primary",
              onClick: () => switchPage('welcome')
            }, "返回首页")
          ]);
      }
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
      handleAddUserEvents,
      switchPage,
      toggleDrawer,
      toggleSidebar,
      sidebarWidth,
      sidebarHidden,
      startResize,
      fetchMenus,
      setDefaultActiveMenu,
      handleNodeSelect,
      handleToggleExpand,
      getNodeIcon,
      validateAndFixMenuTree,
      testPageSwitch,
      componentKey,
      handleGoBackToWelcome,
      renderCurrentPage
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
.menu-expansion-item, .menu-item {
  width: 100%;
  box-sizing: border-box;
}

/* 确保菜单项文本不会溢出 */
.menu-expansion-item span, .menu-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 子菜单样式 */
.menu-children {
  transition: all 0.3s ease;
}

/* 确保QIcon正确显示 */
.q-icon {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
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

.no-padding {
  padding: 0 !important;
}

/* 强制内容区域全宽 */
.content-area {
  width: 100% !important;
  max-width: none !important;
}

/* 强制组件容器全宽 */
.component-wrapper {
  width: 100% !important;
  max-width: none !important;
}

/* 特别针对BlogCreate组件强制全宽 */
.component-wrapper > * {
  width: 100% !important;
  max-width: none !important;
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
