<template>
  <div class="branch-container full-width full-height">
    <q-card class="full-width full-height shadow-0">
      <q-card-section class="q-pa-lg full-width">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Branch Management</h2>
          <q-btn color="primary" label="ADD BRANCH" @click="addBranch" />
        </div>

        <!-- 分支列表表格 -->
        <q-table
          :rows="displayBranches"
          :columns="columns"
          row-key="id"
          flat bordered
          class="mt-4"
        >
          <template v-slot:body-cell-actions="props">
            <div class="flex justify-end">
              <q-btn-group flat size="sm">
                <q-btn color="primary" label="EDIT" @click="editBranch(props.row)" style="margin-right: 4px; padding: 2px 8px; font-size: 12px;" />
                <q-btn color="negative" label="DELETE" @click="deleteBranch(props.row)" style="padding: 2px 8px; font-size: 12px;" />
              </q-btn-group>
            </div>
          </template>
        </q-table>

        <div class="mt-6 flex justify-end">
          <q-btn color="primary" label="BACK TO LIST" @click="goBack"/>
        </div>
      </q-card-section>
    </q-card>
  </div>

  <!-- 分支编辑对话框 -->
  <BranchEditDialog
    v-model:visible="editDialogVisible"
    :branch="currentBranch"
    :branches="branches"
    @save="onBranchSave"
    @error="onBranchError"
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
import BranchEditDialog from './BranchEditDialog.vue';

export default defineComponent({
  name: 'BranchPage',
  components: {
    BranchEditDialog
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const $q = useQuasar();
    const branches = ref([]);
    const loading = ref(false);
    const editDialogVisible = ref(false);
    const currentBranch = ref(null);

    // 表格列配置
    const columns = ref([
      { name: "branch_id", label: "Branch ID", field: "branch_id", align: "left", sortable: true, width: 60 },
      { name: "name", label: "Branch Name", field: "name", align: "left", sortable: true },
      { name: "code", label: "Code", field: "code", align: "left", sortable: true },
      { name: "parent_id", label: "Parent ID", field: "parent_id", align: "left", sortable: true, width: 70 },
      { name: "level", label: "Level", field: "level", align: "left", sortable: true, width: 60 },
      { name: "sort", label: "Sort", field: "sort", align: "left", sortable: true, width: 60 },
      { name: "actions", label: "Operations", field: "id", align: "right", width: 150, sortable: false }
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

    // 显示的分支数据
    const displayBranches = computed(() => {
      return branches.value || [];
    });

    // 返回用户列表
    const goBack = () => {
      router.push('/system/userManagement/userList');
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
        message: 'Save Success',
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
        message: 'Save Failed' + ': ' + (error.message || 'Unknown Error'),
        color: 'negative',
        timeout: 2000
      });
    };

    // 删除分支
    const deleteBranch = (branch) => {
      // 使用Quasar Dialog替代原生confirm
      $q.dialog({
        title: 'Confirm Delete',
        message: 'Confirm to delete branch' + ': ' + branch.name + '?',
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
              message: 'Branch has children and cannot be deleted',
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
          branches.value = branches.value.filter(m => m.id !== branch.id);

          // 显示成功提示
          Notify.create({
            message: 'Delete Success',
            color: 'positive',
            timeout: 2000
          });

          // 重新加载分支数据以确保同步
          fetchBranches();
        } catch (error) {
          console.error('删除分支失败:', error);

          // 显示错误提示
          Notify.create({
            message: 'Delete Failed' + ': ' + (error.message || 'Unknown Error'),
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
      currentBranch,
      goBack,
      addBranch,
      editBranch,
      deleteBranch,
      onBranchSave,
      onBranchError
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