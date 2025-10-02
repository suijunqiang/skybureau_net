<template>
  <div class="position-container full-width full-height">
    <q-card class="full-width full-height shadow-0">
      <q-card-section class="q-pa-lg full-width">
        <!-- 顶部操作栏 -->
        <div class="row items-center q-mb-lg">
          <div class="col">
            <h2 class="text-h5 q-my-none text-weight-medium">{{ t('position_management_title') || '职位管理' }}</h2>
            <p class="text-grey-6 q-mb-none q-mt-xs">{{ t('position_management_subtitle') || '管理系统职位信息和权限配置' }}</p>
          </div>
          <div class="col-auto">
            <q-btn 
              color="primary" 
              :label="t('add_position') || '新增职位'"
              icon="add"
              @click="addPosition"
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
              :placeholder="t('search_positions_placeholder') || '搜索职位...'"
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
              v-model="branchFilter"
              :options="branchOptions"
              :label="t('filter_by_branch') || '按部门筛选'"
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

        <!-- 职位列表表格 -->
        <q-table
          :rows="displayPositions"
          :columns="columns"
          :loading="loading"
          row-key="id"
          flat
          bordered
          class="position-table"
          :pagination="pagination"
          @request="onRequest"
        >
          <!-- 职位名称列自定义显示 -->
          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <div class="position-info-cell">
                <div class="text-weight-medium text-primary cursor-pointer" @click="viewPosition(props.row)">
                  {{ props.value || t('unnamed_position') || '未命名职位' }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  {{ t('position_id') }}: {{ props.row.position_id || t('not_set') }}
                </div>
              </div>
            </q-td>
          </template>

          <!-- 部门名称列 -->
          <template v-slot:body-cell-branch_name="props">
            <q-td :props="props">
              <div class="flex items-center">
                <q-icon name="business" size="xs" class="q-mr-xs text-grey-6" />
                {{ props.value || t('not_set') || '未设置' }}
              </div>
            </q-td>
          </template>

          <!-- 菜单权限列 -->
          <template v-slot:body-cell-menu_id="props">
            <q-td :props="props">
              <div class="menu-permissions-cell">
                <div class="flex items-center q-mb-xs">
                  <q-icon name="menu" size="xs" class="q-mr-xs text-grey-6" />
                  <span class="text-caption text-weight-medium">
                    {{ t('menu_permissions') || '菜单权限' }}
                  </span>
                </div>
                <div v-if="props.value" class="menu-permissions-content">
                  <q-chip
                    v-for="(menuName, index) in getMenuNamesArray(props.value)"
                    :key="index"
                    size="sm"
                    color="primary"
                    text-color="white"
                    :label="menuName"
                    class="q-ma-xs"
                  />
                </div>
                <div v-else class="text-grey-5 text-caption">
                  {{ t('no_permissions') || '无权限' }}
                </div>
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
                  @click="editPosition(props.row)"
                >
                  <q-tooltip>{{ t('edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="info"
                  icon="visibility"
                  size="sm"
                  @click="viewPosition(props.row)"
                >
                  <q-tooltip>{{ t('view') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="deletePosition(props.row)"
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
              {{ t('total_positions', { count: totalPositions }) || `总共 ${totalPositions} 个职位` }}
            </span>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>

  <!-- 职位编辑对话框 -->
  <PositionEditDialog
    v-model:visible="editDialogVisible"
    :position="currentPosition"
    :branches="branches"
    :menus="menus"
    @save="onPositionSave"
    @error="onPositionError"
  />

  <!-- 职位查看对话框 -->
  <PositionViewDialog
    v-model:visible="viewDialogVisible"
    :position="currentPosition"
  />
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API } from 'src/api/api.js';
import { Notify, useQuasar } from 'quasar';
import PositionEditDialog from './PositionEditDialog.vue';
import PositionViewDialog from './PositionViewDialog.vue';

export default defineComponent({
  name: 'PositionPage',
  components: {
    PositionEditDialog,
    PositionViewDialog
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const $q = useQuasar();
    const positions = ref([]);
    const branches = ref([]);
    const menus = ref([]);
    const loading = ref(false);
    const editDialogVisible = ref(false);
    const viewDialogVisible = ref(false);
    const currentPosition = ref(null);
    
    // 搜索和筛选状态
    const searchText = ref('');
    const branchFilter = ref(null);
    const statusFilter = ref(null);
    
    // 筛选选项
    const branchOptions = computed(() => [
      { label: t('all_branches') || '所有部门', value: null },
      ...branches.value.map(branch => ({
        label: branch.name || branch.branch_name,
        value: branch.branch_id || branch.id
      }))
    ]);
    
    const statusOptions = [
      { label: t('all_status') || '所有状态', value: null },
      { label: t('active_positions') || '活跃职位', value: 'active' },
      { label: t('with_permissions') || '有权限', value: 'with_permissions' },
      { label: t('no_permissions') || '无权限', value: 'no_permissions' }
    ];
    
    // 分页配置
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    });

    // 表格列配置
    const columns = ref([
      { name: "position_id", label: t("position_id") || "职位ID", field: "position_id", align: "left", sortable: true, width: 80 },
      { name: "name", label: t("position_name") || "职位名称", field: "name", align: "left", sortable: true },
      { name: "branch_name", label: t("branch_name") || "部门名称", field: "branch_name", align: "left", sortable: true },
      { name: "menu_id", label: t("menu_permissions") || "菜单权限", field: "menu_id", align: "left", sortable: false },
      { name: "actions", label: t("operations") || "操作", field: "id", align: "right", width: 150, sortable: false }
    ]);

    // 获取职位数据
    const fetchPositions = async () => {
      loading.value = true;
      try {
        const response = await axios.get(API.USER.POSITION.LIST);
        positions.value = response.data.data;
        console.log('职位数据加载成功:', positions.value);
      } catch (error) {
        console.error('获取职位数据失败:', error);
        positions.value = [];
        Notify.create({
          message: t('fetch_positions_failed') + ': ' + (error.message || t('unknown_error')),
          color: 'negative',
          timeout: 2000
        });
      } finally {
        loading.value = false;
      }
    };

    // 获取部门数据
    const fetchBranches = async () => {
      try {
        const response = await axios.get(API.USER.BRANCH.LIST);
        branches.value = response.data.data;
        console.log('部门数据加载成功:', branches.value);
      } catch (error) {
        console.error('获取部门数据失败:', error);
        branches.value = [];
      }
    };

    // 获取菜单数据
    const fetchMenus = async () => {
      try {
        const response = await axios.get(API.USER.MENU.LIST);
        menus.value = response.data.data;
        console.log('菜单数据加载成功:', menus.value);
      } catch (error) {
        console.error('获取菜单数据失败:', error);
        menus.value = [];
      }
    };

    // 搜索和筛选功能
    const handleSearch = () => {
      console.log('Searching for:', searchText.value);
    };
    
    const handleFilterChange = () => {
      console.log('Filter changed:', branchFilter.value, statusFilter.value);
    };
    
    const resetFilters = () => {
      searchText.value = '';
      branchFilter.value = null;
      statusFilter.value = null;
    };
    
    // 表格请求处理
    const onRequest = (props) => {
      const { page, rowsPerPage } = props.pagination;
      pagination.value.page = page;
      pagination.value.rowsPerPage = rowsPerPage;
    };

    // 显示的职位数据（带搜索和筛选）
    const displayPositions = computed(() => {
      let filtered = positions.value || [];
      
      // 搜索筛选
      if (searchText.value) {
        const search = searchText.value.toLowerCase();
        filtered = filtered.filter(position => 
          (position.name && position.name.toLowerCase().includes(search)) ||
          (position.position_id && position.position_id.toString().includes(search)) ||
          (position.branch_name && position.branch_name.toLowerCase().includes(search))
        );
      }
      
      // 部门筛选
      if (branchFilter.value !== null) {
        filtered = filtered.filter(position => position.branch_id === branchFilter.value);
      }
      
      // 状态筛选
      if (statusFilter.value !== null) {
        if (statusFilter.value === 'with_permissions') {
          filtered = filtered.filter(position => position.menu_id && position.menu_id.trim() !== '');
        } else if (statusFilter.value === 'no_permissions') {
          filtered = filtered.filter(position => !position.menu_id || position.menu_id.trim() === '');
        }
      }
      
      return filtered;
    });
    
    // 总职位数
    const totalPositions = computed(() => displayPositions.value.length);
    
    // 获取菜单名称
    const getMenuNames = (menuIds) => {
      if (!menuIds || !menus.value.length) return t('no_permissions') || '无权限';
      
      const ids = menuIds.split(',').map(id => id.trim());
      const menuNames = ids.map(id => {
        const menu = menus.value.find(m => m.menu_id == id);
        return menu ? menu.name : `ID:${id}`;
      });
      
      return menuNames.join(', ');
    };
    
    // 获取菜单名称数组（用于显示为chip）
    const getMenuNamesArray = (menuIds) => {
      if (!menuIds || !menus.value.length) return [];
      
      const ids = menuIds.split(',').map(id => id.trim());
      const menuNames = ids.map(id => {
        const menu = menus.value.find(m => m.menu_id == id);
        return menu ? menu.name : `ID:${id}`;
      });
      
      return menuNames;
    };

    // 返回用户列表
    const goBack = () => {
      router.push('/system/userManagement/userList');
    };

    // 添加职位
    const addPosition = () => {
      currentPosition.value = null;
      editDialogVisible.value = true;
    };

    // 编辑职位
    const editPosition = (position) => {
      currentPosition.value = { ...position };
      editDialogVisible.value = true;
    };
    
    // 查看职位
    const viewPosition = (position) => {
      currentPosition.value = { ...position };
      viewDialogVisible.value = true;
    };

    // 职位保存成功处理
    const onPositionSave = (updatedPosition) => {
      const index = positions.value.findIndex(p => p.id === updatedPosition.id);
      if (index !== -1) {
        positions.value[index] = updatedPosition;
      } else {
        positions.value.push(updatedPosition);
      }

      Notify.create({
        message: t('save_success'),
        color: 'positive',
        timeout: 2000
      });

      setTimeout(() => {
        fetchPositions();
        // 调用全局菜单刷新方法，更新UserManagement中的菜单
        if (window.refreshUserManagementMenus) {
          window.refreshUserManagementMenus();
        }
      }, 500);
    };

    // 职位保存失败处理
    const onPositionError = (error) => {
      Notify.create({
        message: t('save_failed') + ': ' + (error.message || t('unknown_error')),
        color: 'negative',
        timeout: 2000
      });
    };

    // 删除职位
    const deletePosition = (position) => {
      $q.dialog({
        title: t('confirm_delete'),
        message: t('confirm_delete_position') + ': ' + position.name + '?',
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
          const deleteUrl = API.USER.POSITION.DELETE(position.documentId || position.id);
          console.log('DELETE请求URL:', deleteUrl);

          const deleteResponse = await axios.delete(deleteUrl, {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          console.log('删除职位成功:', deleteResponse.data);

          positions.value = positions.value.filter(p => p.id !== position.id);

          Notify.create({
            message: t('delete_success'),
            color: 'positive',
            timeout: 2000
          });

          fetchPositions();
        } catch (error) {
          console.error('删除职位失败:', error);

          Notify.create({
            message: t('delete_failed') + ': ' + (error.message || t('unknown_error')),
            color: 'negative',
            timeout: 2000
          });
        }
      }).onCancel(() => {
        console.log('用户取消删除职位:', position.name);
      });
    };

    // 生命周期钩子
    onMounted(async () => {
      await Promise.all([
        fetchPositions(),
        fetchBranches(),
        fetchMenus()
      ]);
    });

    return {
      t,
      positions,
      branches,
      menus,
      displayPositions,
      columns,
      loading,
      editDialogVisible,
      viewDialogVisible,
      currentPosition,
      searchText,
      branchFilter,
      statusFilter,
      branchOptions,
      statusOptions,
      pagination,
      totalPositions,
      goBack,
      addPosition,
      editPosition,
      viewPosition,
      deletePosition,
      onPositionSave,
      onPositionError,
      handleSearch,
      handleFilterChange,
      resetFilters,
      onRequest,
      getMenuNames,
      getMenuNamesArray
    };
  }
});
</script>

<style scoped>
  .position-container {
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

  .position-table {
    width: 100% !important;
    min-width: 100% !important;
    overflow-x: auto;
    table-layout: auto !important;
  }

  .position-table .q-table__container {
    width: 100% !important;
    overflow-x: visible;
  }

  .position-table th,
  .position-table td {
    padding: 12px 16px !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 职位信息单元格样式 */
  .position-info-cell {
    min-width: 200px;
  }

  .position-info-cell .text-primary {
    font-weight: 500;
    transition: color 0.2s ease;
  }

  .position-info-cell .text-primary:hover {
    color: var(--q-primary) !important;
    cursor: pointer;
  }

  /* 表格列宽度优化 */
  .position-table th:nth-child(1),
  .position-table td:nth-child(1) {
    width: 80px;
    min-width: 80px;
  }

  .position-table th:nth-child(2),
  .position-table td:nth-child(2) {
    width: 200px;
    min-width: 200px;
  }

  .position-table th:nth-child(3),
  .position-table td:nth-child(3) {
    width: 150px;
    min-width: 150px;
  }

  .position-table th:nth-child(4),
  .position-table td:nth-child(4) {
    width: auto;
    min-width: 250px;
    white-space: normal !important;
    overflow: visible !important;
    text-overflow: initial !important;
  }

  /* 菜单权限单元格样式 */
  .menu-permissions-cell {
    min-width: 250px;
    max-width: 350px;
  }

  .menu-permissions-content {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;
  }

  .menu-permissions-content .q-chip {
    margin: 2px !important;
    font-size: 11px;
    line-height: 1.2;
  }

  .position-table th:nth-child(5),
  .position-table td:nth-child(5) {
    width: 150px;
    min-width: 150px;
  }

  /* 操作按钮样式 */
  .q-btn {
    transition: all 0.2s ease;
  }

  .q-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .position-table th,
    .position-table td {
      padding: 8px 12px !important;
      font-size: 14px;
    }

    .position-info-cell {
      min-width: 150px;
    }

    .q-card-section {
      padding: 16px !important;
    }
  }

  /* 搜索和筛选栏样式 */
  .q-input,
  .q-select {
    border-radius: 8px;
  }

  .q-field--outlined .q-field__control {
    border-radius: 8px;
  }

  .q-field--outlined .q-field__control:hover {
    border-color: #1976d2;
  }

  /* 按钮组样式 */
  .q-btn-group > .q-btn {
    margin-right: 4px;
  }

  .q-btn-group > .q-btn:last-child {
    margin-right: 0;
  }
</style>
