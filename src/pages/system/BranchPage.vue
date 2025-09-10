<template>
  <div class="branch-container full-width full-height">
    <q-card class="full-width full-height shadow-0">
      <q-card-section class="q-pa-lg full-width">
        <!-- 顶部操作栏 -->
        <div class="row items-center q-mb-lg">
          <div class="col">
            <h2 class="text-h5 q-my-none text-weight-medium">{{ t('branch_management_title') || '部门管理' }}</h2>
            <p class="text-grey-6 q-mb-none q-mt-xs">{{ t('branch_management_subtitle') || '管理组织架构和部门层级' }}</p>
          </div>
          <div class="col-auto">
            <q-btn 
              color="primary" 
              :label="t('add_branch') || '添加部门'"
              icon="add_business"
              @click="addBranch"
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
              :placeholder="t('search_branches_placeholder') || '搜索部门...'"
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

        <!-- 部门列表表格 -->
        <q-table
          :rows="displayBranches"
          :columns="columns"
          :loading="loading"
          row-key="branch_id"
          flat
          bordered
          class="branch-table"
          :pagination="pagination"
          @request="onRequest"
        >
          <!-- 部门名称列自定义显示 -->
          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <div class="branch-info-cell">
                <div class="text-weight-medium text-primary cursor-pointer" @click="viewBranch(props.row)">
                  {{ props.value || t('unnamed_branch') }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  {{ props.row.code || t('no_code') }}
                </div>
              </div>
            </q-td>
          </template>

          <!-- 父级部门列 -->
          <template v-slot:body-cell-parent_id="props">
            <q-td :props="props">
              <q-chip
                v-if="props.value === 0"
                color="info"
                text-color="white"
                :label="t('root_branch')"
                size="sm"
              />
              <span v-else>{{ props.value }}</span>
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
                  @click="editBranch(props.row)"
                >
                  <q-tooltip>{{ t('edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="info"
                  icon="visibility"
                  size="sm"
                  @click="viewBranch(props.row)"
                >
                  <q-tooltip>{{ t('view') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="deleteBranch(props.row)"
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
              {{ t('total_branches', { count: totalBranches }) || `总共 ${totalBranches} 个部门` }}
            </span>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>

  <!-- 部门编辑对话框 -->
  <BranchEditDialog
    v-model:visible="editDialogVisible"
    :branch="currentBranch"
    :branches="branches"
    @save="onBranchSave"
    @error="onBranchError"
  />

  <!-- 部门查看对话框 -->
  <!-- <BranchViewDialog
    v-model:visible="viewDialogVisible"
    :branch="currentBranch"
  /> -->
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API } from 'src/api/api.js';
import { usePositionInfoStore } from 'src/stores/positionInfo.js';
import { Notify, useQuasar } from 'quasar';
import BranchEditDialog from './BranchEditDialog.vue';
// import BranchViewDialog from './BranchViewDialog.vue';

export default defineComponent({
  name: 'BranchPage',
  components: {
    BranchEditDialog
    // BranchViewDialog
  },
  emits: ['goBackToWelcome'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const router = useRouter();
    const $q = useQuasar();
    const branches = ref([]);
    const loading = ref(false);
    const editDialogVisible = ref(false);
    const viewDialogVisible = ref(false);
    const currentBranch = ref(null);
    
    // 搜索和筛选状态
    const searchText = ref('');
    const levelFilter = ref(null);
    const statusFilter = ref(null);
    
    // 筛选选项
    const levelOptions = [
      { label: t('all_levels') || '所有层级', value: null },
      { label: t('level_1') || '一级部门', value: 1 },
      { label: t('level_2') || '二级部门', value: 2 },
      { label: t('level_3') || '三级部门', value: 3 }
    ];
    
    const statusOptions = [
      { label: t('all_status') || '所有状态', value: null },
      { label: t('active') || '活跃', value: 'active' },
      { label: t('inactive') || '非活跃', value: 'inactive' }
    ];
    
    // 分页配置
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    });

    // 表格列配置
    const columns = ref([
      { name: "branch_id", label: t("branch_id") || "部门ID", field: "branch_id", align: "left", sortable: true, width: 80 },
      { name: "name", label: t("branch_name") || "部门名称", field: "name", align: "left", sortable: true },
      { name: "code", label: t("code") || "部门代码", field: "code", align: "left", sortable: true, width: 120 },
      { name: "parent_id", label: t("parent_id") || "上级部门", field: "parent_id", align: "left", sortable: true, width: 100 },
      { name: "level", label: t("level") || "层级", field: "level", align: "left", sortable: true, width: 80 },
      { name: "sort", label: t("sort") || "排序", field: "sort", align: "left", sortable: true, width: 80 },
      { name: "actions", label: t("operations") || "操作", field: "branch_id", align: "right", width: 150, sortable: false }
    ]);

    // 获取分支数据
    const fetchBranches = async () => {
      loading.value = true;
      try {
        // 构建带过滤条件的URL
        let branchUrl = API.USER.BRANCH.LIST;

        // 输出完整URL到控制台方便调试
        console.log('请求分支的完整URL:', branchUrl);

        // 使用构建的URL访问分支数据
        const response = await axios.get(branchUrl);
        branches.value = response.data.data;

        console.log('分支数据加载成功:', branches.value);
      } catch (error) {
        console.error('获取分支数据失败:', error);
        branches.value = [];
      } finally {
        loading.value = false;
      }
    };
    
    // 搜索和筛选功能
    const handleSearch = () => {
      console.log('Searching for:', searchText.value);
    };
    
    const handleFilterChange = () => {
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

    // 显示的分支数据（带搜索和筛选）
    const displayBranches = computed(() => {
      let filtered = branches.value || [];
      
      // 搜索筛选
      if (searchText.value) {
        const search = searchText.value.toLowerCase();
        filtered = filtered.filter(branch => 
          (branch.name && branch.name.toLowerCase().includes(search)) ||
          (branch.code && branch.code.toLowerCase().includes(search))
        );
      }
      
      // 层级筛选
      if (levelFilter.value !== null) {
        filtered = filtered.filter(branch => branch.level === levelFilter.value);
      }
      
      return filtered;
    });
    
    // 部门总数
    const totalBranches = computed(() => {
      return displayBranches.value.length;
    });

    // 返回用户列表
    const goBack = () => {
      emit('goBackToWelcome');
    };

    // 添加分支
    const addBranch = () => {
      // 设置currentBranch为null表示新增操作
      currentBranch.value = null;
      editDialogVisible.value = true;
    };

    // 编辑分支
    const editBranch = (branch) => {
      currentBranch.value = { ...branch };
      editDialogVisible.value = true;
    };
    
    // 查看分支
    const viewBranch = (branch) => {
      currentBranch.value = { ...branch };
      viewDialogVisible.value = true;
    };

    // 分支保存成功处理
    const onBranchSave = (updatedBranch) => {
      // 查找并更新分支列表中的对应项
      const index = branches.value.findIndex(m => m.id === updatedBranch.id);
      if (index !== -1) {
        branches.value[index] = updatedBranch;
      } else {
        // 如果是新增的分支，则添加到列表中
        branches.value.push(updatedBranch);
      }

      // 显示成功提示
      Notify.create({
        message: t('save_success') || 'Save Success',
        color: 'positive',
        timeout: 2000
      });

      // 延迟一小段时间后重新加载分支数据
      setTimeout(() => {
        fetchBranches();
      }, 500);
    };

    // 分支保存失败处理
    const onBranchError = (error) => {
      // 显示错误提示
      Notify.create({
        message: (t('save_failed') || 'Save Failed') + ': ' + (error.message || t('unknown_error') || 'Unknown Error'),
        color: 'negative',
        timeout: 2000
      });
    };

    // 删除分支
    const deleteBranch = (branch) => {
      // 使用Quasar Dialog替代原生confirm
      $q.dialog({
        title: t('confirm_delete') || 'Confirm Delete',
        message: (t('confirm_delete_branch') || 'Confirm to delete branch') + ': ' + branch.name + '?',
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
          // 1. 先查询是否有其他分支使用此分支作为父节点
          const checkUrl = `${API.USER.BRANCH.LIST}?filters[parent_id][$eq]=${branch.branch_id}`;
          console.log('检查引用请求URL:', checkUrl);

          const checkResponse = await axios.get(checkUrl);
          const hasChildren = checkResponse.data.data && checkResponse.data.data.length > 0;

          // 如果有子分支引用，则不能删除
          if (hasChildren) {
            Notify.create({
              message: t('branch_has_children_cannot_delete') || 'Branch has children and cannot be deleted',
              color: 'warning',
              timeout: 3000
            });
            return;
          }

          // 2. 没有引用，可以执行删除操作
          // 使用documentId作为参数调用删除接口
          const deleteUrl = API.USER.BRANCH.DELETE(branch.documentId || branch.id);
          console.log('DELETE请求URL:', deleteUrl);

          // 调用删除API
          const deleteResponse = await axios.delete(deleteUrl, {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          console.log('删除分支成功:', deleteResponse.data);

          // 更新前端分支列表
          branches.value = branches.value.filter(b => b.id !== branch.id);

          // 显示成功提示
          Notify.create({
            message: t('delete_success') || 'Delete Success',
            color: 'positive',
            timeout: 2000
          });

          // 重新加载分支数据以确保同步
          fetchBranches();
        } catch (error) {
          console.error('删除分支失败:', error);

          // 显示错误提示
          Notify.create({
            message: (t('delete_failed') || 'Delete Failed') + ': ' + (error.message || t('unknown_error') || 'Unknown Error'),
            color: 'negative',
            timeout: 2000
          });
        }
      }).onCancel(() => {
        // 用户取消删除操作
        console.log('用户取消删除分支:', branch.name);
      }).onDismiss(() => {
        // 对话框关闭的回调
      });
    };

    // 生命周期钩子
    onMounted(async () => {
      await fetchBranches();
    });

    return {
      t,
      branches,
      displayBranches,
      columns,
      loading,
      editDialogVisible,
      viewDialogVisible,
      currentBranch,
      searchText,
      levelFilter,
      statusFilter,
      levelOptions,
      statusOptions,
      pagination,
      totalBranches,
      goBack,
      addBranch,
      editBranch,
      viewBranch,
      deleteBranch,
      onBranchSave,
      onBranchError,
      handleSearch,
      handleFilterChange,
      resetFilters,
      onRequest
    };
  }
});
</script>

<style scoped>
  .branch-container {
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

  .branch-table {
    width: 100% !important;
    min-width: 100% !important;
    overflow-x: auto;
    table-layout: auto !important;
  }

  .branch-table .q-table__container {
    width: 100% !important;
    overflow-x: visible;
  }

  .branch-table th,
  .branch-table td {
    padding: 12px 16px !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 部门信息单元格样式 */
  .branch-info-cell {
    min-width: 200px;
  }

  .branch-info-cell .text-primary {
    font-weight: 500;
    transition: color 0.2s ease;
  }

  .branch-info-cell .text-primary:hover {
    color: var(--q-primary) !important;
    text-decoration: underline;
  }

  /* 表格列自动填充剩余空间 */
  .branch-table th:not(:last-child),
  .branch-table td:not(:last-child) {
    width: auto;
    min-width: 120px;
  }

  /* 操作列固定宽度 */
  .branch-table th:last-child,
  .branch-table td:last-child {
    width: 150px;
    min-width: 150px;
    text-align: right;
  }

  /* 操作按钮样式 */
  .branch-table .q-btn {
    transition: all 0.2s ease;
  }

  .branch-table .q-btn:hover {
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
    .branch-table th,
    .branch-table td {
      padding: 8px 12px !important;
      font-size: 14px;
    }
    
    .branch-info-cell {
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
  .layout-view-active .branch-container {
    width: 100%;
  }
</style>

<style scoped>
  .branch-container {
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
  .layout-view-active .branch-container {
    /* 布局类名可能需要根据实际情况调整 */
    width: 100%;
  }
</style>