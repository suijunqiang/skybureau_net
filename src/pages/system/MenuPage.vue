<template>
  <div class="menu-container full-width full-height">
    <q-card class="full-width full-height shadow-0">
      <q-card-section class="q-pa-lg full-width">
        <!-- 顶部操作栏 -->
        <div class="row items-center q-mb-lg">
          <div class="col">
            <h2 class="text-h5 q-my-none text-weight-medium">{{ t('menu_management_title') || '菜单管理' }}</h2>
            <p class="text-grey-6 q-mb-none q-mt-xs">{{ t('menu_management_subtitle') || '管理系统菜单结构和权限' }}</p>
          </div>
          <div class="col-auto">
            <q-btn 
              color="primary" 
              :label="t('add_menu')"
              icon="add_box"
              @click="addMenu"
              size="md"
              class="q-px-lg"
            />
          </div>
        </div>

        <!-- 搜索和筛选栏 -->
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-12 col-md-4">
            <q-input
              v-model="searchText"
              :placeholder="t('search_menus_placeholder') || '搜索菜单...'"
              outlined
              dense
              clearable
              @input="handleSearch"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="levelFilter"
              :options="levelOptions"
              :label="t('filter_by_level') || '按层级筛选'"
              outlined
              dense
              clearable
              @update:model-value="handleFilterChange"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="statusFilter"
              :options="statusOptions"
              :label="t('filter_by_status') || '按状态筛选'"
              outlined
              dense
              clearable
              @update:model-value="handleFilterChange"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-btn
              flat
              color="primary"
              :label="t('reset_filters') || '重置筛选'"
              @click="resetFilters"
              size="md"
            />
          </div>
        </div>

        <!-- 菜单列表表格 -->
        <q-table
          :rows="displayMenus"
          :columns="columns"
          :loading="loading"
          row-key="menu_id"
          flat
          bordered
          class="menu-table"
          :pagination="pagination"
          @request="onRequest"
        >
          <!-- 菜单名称列自定义显示 -->
          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <div class="menu-info-cell">
                <div class="text-weight-medium text-primary cursor-pointer" @click="viewMenu(props.row)">
                  {{ props.value || t('unnamed_menu') }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  {{ props.row.page_url || t('no_url') }}
                </div>
              </div>
            </q-td>
          </template>

          <!-- 父级菜单列 -->
          <template v-slot:body-cell-parent_id="props">
            <q-td :props="props">
              <q-chip
                v-if="props.value === 0"
                color="info"
                text-color="white"
                :label="t('root_menu')"
                size="sm"
              />
              <span v-else>{{ props.value }}</span>
            </q-td>
          </template>

          <!-- 显示状态列 -->
          <template v-slot:body-cell-is_show="props">
            <q-td :props="props">
              <q-chip
                :color="props.value === 1 ? 'positive' : 'grey'"
                text-color="white"
                :label="props.value === 1 ? t('visible') : t('hidden')"
                size="sm"
              />
            </q-td>
          </template>

          <!-- 启用状态列 -->
          <template v-slot:body-cell-is_enable="props">
            <q-td :props="props">
              <q-icon
                :name="props.value === 1 ? 'check_circle' : 'cancel'"
                :color="props.value === 1 ? 'positive' : 'negative'"
                size="sm"
              />
            </q-td>
          </template>

          <!-- 排序列 -->
          <template v-slot:body-cell-sort="props">
            <q-td :props="props">
              <div class="flex items-center">
                <q-icon name="sort" size="xs" class="q-mr-xs text-grey-6" />
                {{ props.value || 0 }}
              </div>
            </q-td>
          </template>

          <!-- 操作列 -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="flex justify-end q-gutter-xs">
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="edit"
                  size="sm"
                  @click="editMenu(props.row)"
                >
                  <q-tooltip>{{ t('edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="info"
                  icon="visibility"
                  size="sm"
                  @click="viewMenu(props.row)"
                >
                  <q-tooltip>{{ t('view') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="deleteMenu(props.row)"
                >
                  <q-tooltip>{{ t('delete') }}</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>

        <!-- 底部操作栏 -->
        <div class="row justify-between items-center q-mt-lg">
          <div class="col-auto">
            <q-btn
              flat
              color="primary"
              :label="t('back_to_list') || '返回列表'"
              icon="arrow_back"
              @click="goBack"
            />
          </div>
          <div class="col-auto">
            <span class="text-grey-6">
              {{ t('total_menus', { count: totalMenus }) || `总共 ${totalMenus} 个菜单` }}
            </span>
          </div>
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

  <!-- 菜单查看对话框 -->
  <MenuViewDialog
    v-model:visible="viewDialogVisible"
    :menu="currentMenu"
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
import MenuViewDialog from './MenuViewDialog.vue';

export default defineComponent({
  name: 'MenuPage',
  components: {
    MenuEditDialog,
    MenuViewDialog
  },
  emits: ['goBackToWelcome'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const router = useRouter();
    const $q = useQuasar();
    const menus = ref([]);
    const loading = ref(false);
    const editDialogVisible = ref(false);
    const viewDialogVisible = ref(false);
    const currentMenu = ref(null);
    
    // 搜索和筛选状态
    const searchText = ref('');
    const levelFilter = ref(null);
    const statusFilter = ref(null);
    
    // 筛选选项
    const levelOptions = [
      { label: t('all_levels') || '所有层级', value: null },
      { label: t('level_1') || '一级菜单', value: 1 },
      { label: t('level_2') || '二级菜单', value: 2 },
      { label: t('level_3') || '三级菜单', value: 3 }
    ];
    
    const statusOptions = [
      { label: t('all_status') || '所有状态', value: null },
      { label: t('enabled_and_visible') || '启用且可见', value: 'enabled_visible' },
      { label: t('enabled_only') || '仅启用', value: 'enabled' },
      { label: t('visible_only') || '仅可见', value: 'visible' },
      { label: t('disabled') || '禁用', value: 'disabled' }
    ];
    
    // 分页配置
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    });

    // 表格列配置
    const columns = ref([
      { name: "menu_id", label: t("menu_id"), field: "menu_id", align: "left", sortable: true, width: 80 },
      { name: "name", label: t("menu_name"), field: "name", align: "left", sortable: true },
      { name: "parent_id", label: t("parent_id"), field: "parent_id", align: "left", sortable: true, width: 100 },
      { name: "level", label: t("level"), field: "level", align: "left", sortable: true, width: 80 },
      { name: "sort", label: t("sort"), field: "sort", align: "left", sortable: true, width: 80 },
      { name: "is_show", label: t("is_show"), field: "is_show", align: "left", sortable: true, width: 100 },
      { name: "is_enable", label: t("is_enable"), field: "is_enable", align: "left", sortable: true, width: 100 },
      { name: "actions", label: t("operations"), field: "menu_id", align: "right", width: 150, sortable: false }
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
    
    // 搜索和筛选功能
    const handleSearch = () => {
      // 实时搜索逻辑
      console.log('Searching for:', searchText.value);
    };
    
    const handleFilterChange = () => {
      // 筛选变更逻辑
      console.log('Filter changed:', levelFilter.value, statusFilter.value);
    };
    
    const resetFilters = () => {
      searchText.value = '';
      levelFilter.value = null;
      statusFilter.value = null;
    };
    
    // 表格请求处理
    const onRequest = (props) => {
      const { page, rowsPerPage } = props.pagination;
      pagination.value.page = page;
      pagination.value.rowsPerPage = rowsPerPage;
    };

    // 显示的菜单数据（带搜索和筛选）
    const displayMenus = computed(() => {
      let filtered = menus.value || [];
      
      // 搜索筛选
      if (searchText.value) {
        const search = searchText.value.toLowerCase();
        filtered = filtered.filter(menu => 
          (menu.name && menu.name.toLowerCase().includes(search)) ||
          (menu.page_url && menu.page_url.toLowerCase().includes(search))
        );
      }
      
      // 层级筛选
      if (levelFilter.value !== null) {
        filtered = filtered.filter(menu => menu.level === levelFilter.value);
      }
      
      // 状态筛选
      if (statusFilter.value !== null) {
        switch (statusFilter.value) {
          case 'enabled_visible':
            filtered = filtered.filter(menu => menu.is_enable === 1 && menu.is_show === 1);
            break;
          case 'enabled':
            filtered = filtered.filter(menu => menu.is_enable === 1);
            break;
          case 'visible':
            filtered = filtered.filter(menu => menu.is_show === 1);
            break;
          case 'disabled':
            filtered = filtered.filter(menu => menu.is_enable === 0);
            break;
        }
      }
      
      return filtered;
    });
    
    // 菜单总数
    const totalMenus = computed(() => {
      return displayMenus.value.length;
    });

    // 返回用户列表
    const goBack = () => {
      emit('goBackToWelcome');
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
    
    // 查看菜单
    const viewMenu = (menu) => {
      currentMenu.value = { ...menu };
      viewDialogVisible.value = true;
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
      viewDialogVisible,
      currentMenu,
      searchText,
      levelFilter,
      statusFilter,
      levelOptions,
      statusOptions,
      pagination,
      totalMenus,
      goBack,
      addMenu,
      editMenu,
      viewMenu,
      deleteMenu,
      onMenuSave,
      onMenuError,
      handleSearch,
      handleFilterChange,
      resetFilters,
      onRequest
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

  .menu-table {
    width: 100% !important;
    min-width: 100% !important;
    overflow-x: auto;
    table-layout: auto !important;
  }

  .menu-table .q-table__container {
    width: 100% !important;
    overflow-x: visible;
  }

  .menu-table th,
  .menu-table td {
    padding: 12px 16px !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 菜单信息单元格样式 */
  .menu-info-cell {
    min-width: 200px;
  }

  .menu-info-cell .text-primary {
    font-weight: 500;
    transition: color 0.2s ease;
  }

  .menu-info-cell .text-primary:hover {
    color: var(--q-primary) !important;
    text-decoration: underline;
  }

  /* 表格列自动填充剩余空间 */
  .menu-table th:not(:last-child),
  .menu-table td:not(:last-child) {
    width: auto;
    min-width: 120px;
  }

  /* 操作列固定宽度 */
  .menu-table th:last-child,
  .menu-table td:last-child {
    width: 150px;
    min-width: 150px;
    text-align: right;
  }

  /* 操作按钮样式 */
  .menu-table .q-btn {
    transition: all 0.2s ease;
  }

  .menu-table .q-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  /* 快速操作栏样式 */
  .row.q-col-gutter-md > div {
    padding: 0 8px;
  }

  /* 自定义状态芒片样式 */
  .q-chip {
    font-weight: 500;
    border-radius: 16px;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .menu-table th,
    .menu-table td {
      padding: 8px 12px !important;
      font-size: 14px;
    }
    
    .menu-info-cell {
      min-width: 150px;
    }
    
    .q-card-section {
      padding: 16px !important;
    }
  }

  /* 类似 BlogManagement 的专业样式 */
  .q-table--bordered {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
  }

  .q-table__top {
    background: #fafafa;
    border-bottom: 1px solid #e0e0e0;
  }

  .q-table thead tr th {
    background: #f5f5f5;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.5px;
    color: #666;
  }

  .q-table tbody tr:hover {
    background-color: #f8f9fa;
  }

  /* 当侧边栏隐藏时，确保表格能正确响应 */
  .layout-view-active .menu-container {
    width: 100%;
  }
</style>
