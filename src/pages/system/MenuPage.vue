<template>
  <div class="menu-container full-width full-height">
    <q-card class="full-width full-height shadow-0">
      <q-card-section class="q-pa-lg full-width">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">{{ $t('menu_page_title') }}</h2>
          <q-btn color="primary" :label="$t('add_menu')" @click="addMenu" />
        </div>

        <!-- 菜单列表表格 -->
        <q-table
          :rows="displayMenus"
          :columns="columns"
          row-key="id"
          flat bordered
          class="mt-4"
        >
          <template v-slot:body-cell-is_show="props">
            <div class="flex items-center">
              <span class="ml-2">{{ props.value === 1 ? 'Yes' : 'No' }}</span>
            </div>
          </template>
          <template v-slot:body-cell-is_enable="props">
            <div class="flex items-center">
              <span class="ml-2">{{ props.value === 1 ? 'Yes' : 'No' }}</span>
            </div>
          </template>
          <template v-slot:body-cell-actions="props">
            <div class="flex justify-end">
              <q-btn-group flat size="sm">
                <q-btn color="primary" :label="$t('edit')" @click="editMenu(props.row)" style="margin-right: 4px; padding: 2px 8px; font-size: 12px;" />
                <q-btn color="negative" :label="$t('delete')" @click="deleteMenu(props.row)" style="padding: 2px 8px; font-size: 12px;" />
              </q-btn-group>
            </div>
          </template>
        </q-table>

        <div class="mt-6 flex justify-end">
          <q-btn color="primary" :label="$t('back_to_list')" @click="goBack"/>
        </div>
      </q-card-section>
    </q-card>
  </div>

  <!-- 菜单编辑对话框 -->
  <MenuEditDialog
    v-model:visible="editDialogVisible"
    :menu="currentMenu"
    :menus="menus"
    @save="onMenuSave"
    @error="onMenuError"
  />
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API } from 'src/api/api.js';
import { usePositionInfoStore } from 'src/stores/positionInfo.js';
import { Notify, useQuasar } from 'quasar';
import MenuEditDialog from './MenuEditDialog.vue';

export default defineComponent({
  name: 'MenuPage',
  components: {
    MenuEditDialog
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const $q = useQuasar();
    const menus = ref([]);
    const loading = ref(false);
    const editDialogVisible = ref(false);
    const currentMenu = ref(null);



    // 表格列配置
    const columns = ref([
      { name: "menu_id", label: t("menu_id"), field: "menu_id", align: "left", sortable: true, width: 60 },
      { name: "name", label: t("menu_name"), field: "name", align: "left", sortable: true },
      { name: "page_url", label: t("page_url"), field: "page_url", align: "left", sortable: true },
      { name: "parent_id", label: t("parent_id"), field: "parent_id", align: "left", sortable: true, width: 70 },
      { name: "level", label: t("level"), field: "level", align: "left", sortable: true, width: 60 },
      { name: "sort", label: t("sort"), field: "sort", align: "left", sortable: true, width: 60 },
      { name: "is_show", label: t("is_show"), field: "is_show", align: "left", sortable: true, width: 80 },
      { name: "is_enable", label: t("is_enable"), field: "is_enable", align: "left", sortable: true, width: 80 },
      { name: "actions", label: t("operations"), field: "id", align: "right", width: 150, sortable: false }
    ]);

    // 获取菜单数据
    const fetchMenus = async () => {
      loading.value = true;
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
        /*
        if (menuIds.length > 0) {
          const filters = menuIds.map(id => `filters[menu_id][$in]=${id}`).join('&');
          menuUrl = `${menuUrl}?${filters}`;
        }
          */

        // 输出完整URL到控制台方便调试
        console.log('请求菜单的完整URL:', menuUrl);

        // 使用构建的URL访问菜单数据
        const response = await axios.get(menuUrl);
        menus.value = response.data.data;

        console.log('菜单数据加载成功:', menus.value);
      } catch (error) {
        console.error('获取菜单数据失败:', error);
        menus.value = []; // 设置为空数组而不是使用模拟数据
      } finally {
        loading.value = false;
      }
    };

    // 显示的菜单数据
    const displayMenus = computed(() => {
      return menus.value || [];
    });

    // 返回用户列表
    const goBack = () => {
      router.push('/system/userManagement/userList');
    };

    // 添加菜单
    const addMenu = () => {
      // 设置currentMenu为null表示新增操作
      currentMenu.value = null;
      editDialogVisible.value = true;
    };

    // 编辑菜单
    const editMenu = (menu) => {
      currentMenu.value = { ...menu };
      editDialogVisible.value = true;
    };

    // 菜单保存成功处理
    const onMenuSave = (updatedMenu) => {
      // 查找并更新菜单列表中的对应项
      const index = menus.value.findIndex(m => m.id === updatedMenu.id);
      if (index !== -1) {
        menus.value[index] = updatedMenu;
      } else {
        // 如果是新增的菜单，则添加到列表中
        menus.value.push(updatedMenu);
      }

      // 显示成功提示，使用Quasar notify组件，2秒自动关闭
      Notify.create({
        message: t('save_success'),
        color: 'positive',
        timeout: 2000
      });

      // 延迟一小段时间后重新加载菜单数据，确保UI更新先显示，然后再同步最新数据
      setTimeout(() => {
        fetchMenus();
      }, 500);
    };

    // 菜单保存失败处理
    const onMenuError = (error) => {
      // 显示错误提示，使用Quasar notify组件，2秒自动关闭
      Notify.create({
        message: t('save_failed') + ': ' + (error.message || t('unknown_error')),
        color: 'negative',
        timeout: 2000
      });
    };

    // 删除菜单
    const deleteMenu = (menu) => {
      // 使用Quasar Dialog替代原生confirm
      $q.dialog({
        title: t('confirm_delete'),
        message: t('confirm_delete_menu') + ': ' + menu.name + '?',
        ok: {
          push: true,
          color: 'positive'
        },
        cancel: {
          push: true,
          color: 'negative'
        },
        persistent: true
      }).onOk(async () => {
        try {
          // 1. 先查询是否有其他菜单使用此菜单作为父节点
          const checkUrl = `${API.USER.MENU.LIST}?filters[parent_id][$eq]=${menu.menu_id}`;
          console.log('检查引用请求URL:', checkUrl);

          const checkResponse = await axios.get(checkUrl);
          const hasChildren = checkResponse.data.data && checkResponse.data.data.length > 0;

          // 如果有子菜单引用，则不能删除
          if (hasChildren) {
            Notify.create({
              message: t('menu_has_children_cannot_delete'),
              color: 'warning',
              timeout: 3000
            });
            return;
          }

          // 2. 没有引用，可以执行删除操作
          // 使用documentId作为参数调用删除接口
          const deleteUrl = API.USER.MENU.DELETE(menu.documentId || menu.id);
          console.log('DELETE请求URL:', deleteUrl);

          // 调用删除API
          const deleteResponse = await axios.delete(deleteUrl, {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          console.log('删除菜单成功:', deleteResponse.data);

          // 更新前端菜单列表
          menus.value = menus.value.filter(m => m.id !== menu.id);

          // 显示成功提示
          Notify.create({
            message: t('delete_success'),
            color: 'positive',
            timeout: 2000
          });

          // 重新加载菜单数据以确保同步
          fetchMenus();
        } catch (error) {
          console.error('删除菜单失败:', error);

          // 显示错误提示
          Notify.create({
            message: t('delete_failed') + ': ' + (error.message || t('unknown_error')),
            color: 'negative',
            timeout: 2000
          });
        }
      }).onCancel(() => {
        // 用户取消删除操作
        console.log('用户取消删除菜单:', menu.name);
      }).onDismiss(() => {
        // 对话框关闭的回调，可以在这里执行一些清理操作
      });
    };

    // 生命周期钩子
    onMounted(async () => {
      await fetchMenus();
    });

    return {
      t,
      menus,
      displayMenus,
      columns,
      loading,
      editDialogVisible,
      currentMenu,
      goBack,
      addMenu,
      editMenu,
      deleteMenu,
      onMenuSave,
      onMenuError
    };
  }
});
</script>

<style scoped>
  .menu-container {
    width: 100% !important;
    height: 100% !important;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    max-width: none !important;
  }

  .full-width {
    width: 100% !important;
    max-width: none !important;
  }

  .full-height {
    height: 100% !important;
    min-height: 100% !important;
  }

  .q-card {
    width: 100% !important;
    max-width: none !important;
    border-radius: 0 !important;
  }

  .q-card-section {
    width: 100% !important;
    max-width: none !important;
  }

  .q-table {
    width: 100% !important;
    min-width: 100% !important;
    overflow-x: auto;
    table-layout: auto !important;
  }

  .q-table__container {
    width: 100% !important;
    overflow-x: visible;
  }

  .q-table th,
  .q-table td {
    padding: 8px 16px !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 让表格列自动填充剩余空间 */
  .q-table th:not(:last-child),
  .q-table td:not(:last-child) {
    width: auto;
    min-width: 120px;
  }

  /* 操作列固定宽度 */
  .q-table th:last-child,
  .q-table td:last-child {
    width: 150px;
    min-width: 150px;
    text-align: right;
  }

  /* 调整按钮间距 */
  .q-btn-group > .q-btn {
    margin-right: 4px;
  }

  .q-btn-group > .q-btn:last-child {
    margin-right: 0;
  }

  /* 当侧边栏隐藏时，确保表格能正确响应 */
  .layout-view-active .menu-container {
    /* 布局类名可能需要根据实际情况调整 */
    width: 100%;
  }
  </style>
