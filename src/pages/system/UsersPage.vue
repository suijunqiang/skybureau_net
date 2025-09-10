<template>
  <div class="users-container full-width full-height">
    <q-card class="full-width full-height shadow-0">
      <q-card-section class="q-pa-lg full-width">
        <!-- 顶部操作栏 -->
        <div class="row items-center q-mb-lg">
          <div class="col">
            <h2 class="text-h5 q-my-none text-weight-medium">{{ t('users_management_title') || '用户管理' }}</h2>
            <p class="text-grey-6 q-mb-none q-mt-xs">{{ t('users_management_subtitle') || '管理系统用户账号和权限' }}</p>
          </div>
          <div class="col-auto">
            <q-btn 
              color="primary" 
              :label="t('add_user')"
              icon="person_add"
              @click="addUser"
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
              :placeholder="t('search_users_placeholder') || '搜索用户...'"
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
              v-model="statusFilter"
              :options="statusOptions"
              :label="t('filter_by_status') || '按状态筛选'"
              outlined
              dense
              clearable
              @update:model-value="handleFilterChange"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="roleFilter"
              :options="roleOptions"
              :label="t('filter_by_role') || '按角色筛选'"
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

        <!-- 用户列表表格 -->
        <q-table
          :rows="displayUsers"
          :columns="columns"
          :loading="loading"
          row-key="id"
          flat
          bordered
          class="users-table"
          :pagination="pagination"
          @request="onRequest"
        >
          <!-- 用户名列自定义显示 -->
          <template v-slot:body-cell-username="props">
            <q-td :props="props">
              <div class="user-info-cell">
                <div class="text-weight-medium text-primary cursor-pointer" @click="viewUser(props.row)">
                  {{ props.value || t('unnamed_user') }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  {{ props.row.email || t('no_email') }}
                </div>
              </div>
            </q-td>
          </template>

          <!-- 状态列 -->
          <template v-slot:body-cell-confirmed="props">
            <q-td :props="props">
              <q-chip
                :color="props.value ? 'positive' : 'orange'"
                text-color="white"
                :label="props.value ? t('confirmed') : t('unconfirmed')"
                size="sm"
              />
            </q-td>
          </template>

          <!-- 启用状态列 -->
          <template v-slot:body-cell-is_enabled="props">
            <q-td :props="props">
              <q-icon
                :name="props.value ? 'check_circle' : 'cancel'"
                :color="props.value ? 'positive' : 'negative'"
                size="sm"
              />
            </q-td>
          </template>

          <!-- 创建日期列 -->
          <template v-slot:body-cell-createdAt="props">
            <q-td :props="props">
              <div class="flex items-center">
                <q-icon name="schedule" size="xs" class="q-mr-xs text-grey-6" />
                {{ formatDate(props.value) }}
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
                  @click="editUser(props.row)"
                >
                  <q-tooltip>{{ t('edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="info"
                  icon="visibility"
                  size="sm"
                  @click="viewUser(props.row)"
                >
                  <q-tooltip>{{ t('view') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="deleteUser(props.row)"
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
              {{ t('total_users', { count: totalUsers }) || `总共 ${totalUsers} 个用户` }}
            </span>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>

  <!-- 用户编辑对话框 -->
  <UserEditDialog
    v-model:visible="editDialogVisible"
    :user="currentUser"
    @save="onUserSave"
    @error="onUserError"
  />

  <!-- 用户查看对话框 -->
  <UserViewDialog
    v-model:visible="viewDialogVisible"
    :user="currentUser"
  />
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API } from 'src/api/api.js';
import { Notify, useQuasar } from 'quasar';
import UserEditDialog from './UserEditDialog.vue';
import UserViewDialog from './UserViewDialog.vue';

export default defineComponent({
  name: 'UsersPage',
  components: {
    UserEditDialog,
    UserViewDialog
  },
  emits: ['goBackToWelcome'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const router = useRouter();
    const $q = useQuasar();

    // 用户列表数据
    const users = ref([
      {
          "id": 1,
          "documentId": "dfu42e7366d5zt5ea9onbbls",
          "username": "admin",
          "email": "suijunqiang@126.com",
          "provider": "local",
          "confirmed": false,
          "blocked": false,
          "createdAt": "2025-03-31T05:41:59.256Z",
          "updatedAt": "2025-09-03T08:39:00.043Z",
          "publishedAt": "2025-09-03T08:39:00.025Z",
          "real_name": "Admin",
          "position_id": "1",
          "position_name": "Software",
          "branch_id": "2",
          "branch_name": "Software",
          "mobile": "13391023986",
          "is_enabled": true
      },
      {
          "id": 2,
          "documentId": "p8fj7ji50bxv642ur9q3j04k",
          "username": "sjq",
          "email": "sjq@126.com",
          "provider": "local",
          "confirmed": true,
          "blocked": false,
          "createdAt": "2025-08-29T02:11:33.321Z",
          "updatedAt": "2025-08-29T02:11:33.321Z",
          "publishedAt": "2025-08-29T02:11:33.323Z",
          "real_name": null,
          "position_id": null,
          "position_name": null,
          "branch_id": null,
          "branch_name": null,
          "mobile": null,
          "is_enabled": null
      },
      {
          "id": 3,
          "documentId": "g9k9mb0ifyt2ze5np1ezd76j",
          "username": "sui",
          "email": "sui@126.com",
          "provider": "local",
          "confirmed": true,
          "blocked": false,
          "createdAt": "2025-08-29T02:15:11.612Z",
          "updatedAt": "2025-08-29T02:15:11.612Z",
          "publishedAt": "2025-08-29T02:15:11.612Z",
          "real_name": null,
          "position_id": null,
          "position_name": null,
          "branch_id": null,
          "branch_name": null,
          "mobile": null,
          "is_enabled": null
      }
    ]);
    
    const loading = ref(false);
    const editDialogVisible = ref(false);
    const viewDialogVisible = ref(false);
    const currentUser = ref(null);
    
    // 搜索和筛选状态
    const searchText = ref('');
    const statusFilter = ref(null);
    const roleFilter = ref(null);
    
    // 筛选选项
    const statusOptions = [
      { label: t('all_status') || '所有状态', value: null },
      { label: t('enabled') || '启用', value: true },
      { label: t('disabled') || '禁用', value: false },
      { label: t('confirmed') || '已确认', value: 'confirmed' },
      { label: t('unconfirmed') || '未确认', value: 'unconfirmed' }
    ];
    
    const roleOptions = [
      { label: t('all_roles') || '所有角色', value: null },
      { label: t('admin') || '管理员', value: 'admin' },
      { label: t('user') || '用户', value: 'user' },
      { label: t('guest') || '访客', value: 'guest' }
    ];
    
    // 分页配置
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    });

    // 表格列配置
    const columns = ref([
      { name: "id", label: t("id"), field: "id", align: "left", sortable: true, width: 60 },
      { name: "username", label: t("username"), field: "username", align: "left", sortable: true },
      { name: "real_name", label: t("real_name"), field: "real_name", align: "left", sortable: true },
      { name: "position_name", label: t("position_name"), field: "position_name", align: "left", sortable: true },
      { name: "branch_name", label: t("branch_name"), field: "branch_name", align: "left", sortable: true },
      { name: "mobile", label: t("mobile"), field: "mobile", align: "left", sortable: true },
      { name: "confirmed", label: t("confirmed"), field: "confirmed", align: "left", sortable: true, width: 100 },
      { name: "is_enabled", label: t("is_enabled"), field: "is_enabled", align: "left", sortable: true, width: 80 },
      { name: "createdAt", label: t("created_at"), field: "createdAt", align: "left", sortable: true, width: 120 },
      { name: "actions", label: t("operations"), field: "id", align: "right", width: 150, sortable: false }
    ]);

    // 获取用户数据
    const fetchUsers = async () => {
      loading.value = true;
      try {
        // 调用用户列表接口
        const response = await axios.get(API.USER.USERS.LIST);
        // 检查响应数据格式，适应不同的返回结构
        if (response.data && Array.isArray(response.data)) {
          // 如果直接是数组格式
          users.value = response.data;
        } else if (response.data && response.data.data) {
          // 如果是嵌套在data属性中的数据
          users.value = response.data.data;
        } else {
          // 默认情况
          users.value = response.data || [];
        }
        console.log('用户数据加载成功:', users.value);
      } catch (error) {
        console.error('获取用户数据失败:', error);
        users.value = [];
        Notify.create({
          message: t('fetch_users_failed') + ': ' + (error.message || t('unknown_error')),
          color: 'negative',
          timeout: 2000
        });
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
      console.log('Filter changed:', statusFilter.value, roleFilter.value);
    };
    
    const resetFilters = () => {
      searchText.value = '';
      statusFilter.value = null;
      roleFilter.value = null;
    };
    
    // 表格请求处理
    const onRequest = (props) => {
      const { page, rowsPerPage } = props.pagination;
      pagination.value.page = page;
      pagination.value.rowsPerPage = rowsPerPage;
    };
    
    // 日期格式化
    const formatDate = (dateString) => {
      if (!dateString) return t('unknown_date') || '未知日期';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    };

    // 显示的用户数据（带搜索和筛选）
    const displayUsers = computed(() => {
      let filtered = users.value || [];
      
      // 搜索筛选
      if (searchText.value) {
        const search = searchText.value.toLowerCase();
        filtered = filtered.filter(user => 
          (user.username && user.username.toLowerCase().includes(search)) ||
          (user.email && user.email.toLowerCase().includes(search)) ||
          (user.real_name && user.real_name.toLowerCase().includes(search))
        );
      }
      
      // 状态筛选
      if (statusFilter.value !== null) {
        if (statusFilter.value === 'confirmed') {
          filtered = filtered.filter(user => user.confirmed === true);
        } else if (statusFilter.value === 'unconfirmed') {
          filtered = filtered.filter(user => user.confirmed === false);
        } else if (typeof statusFilter.value === 'boolean') {
          filtered = filtered.filter(user => user.is_enabled === statusFilter.value);
        }
      }
      
      return filtered;
    });
    
    // 用户总数
    const totalUsers = computed(() => {
      return displayUsers.value.length;
    });

    // 添加用户
    const addUser = () => {
      // 设置currentUser为null表示新增操作
      currentUser.value = null;
      editDialogVisible.value = true;
    };

    // 编辑用户
    const editUser = (user) => {
      currentUser.value = { ...user };
      editDialogVisible.value = true;
    };
    
    // 查看用户
    const viewUser = (user) => {
      currentUser.value = { ...user };
      viewDialogVisible.value = true;
    };

    // 用户保存成功处理
    const onUserSave = (updatedUser) => {
      // 查找并更新用户列表中的对应项
      const index = users.value.findIndex(u => u.id === updatedUser.id);
      if (index !== -1) {
        users.value[index] = updatedUser;
      } else {
        // 如果是新增的用户，则添加到列表中
        users.value.push(updatedUser);
      }

      // 显示成功提示
      Notify.create({
        message: t('save_success'),
        color: 'positive',
        timeout: 2000
      });

      // 延迟一小段时间后重新加载用户数据
      setTimeout(() => {
        fetchUsers();
      }, 500);
    };

    // 用户保存失败处理
    const onUserError = (error) => {
      // 显示错误提示
      Notify.create({
        message: t('save_failed') + ': ' + (error.message || t('unknown_error')),
        color: 'negative',
        timeout: 2000
      });
    };

    // 删除用户
    const deleteUser = (user) => {
      // 使用Quasar Dialog
      $q.dialog({
        title: t('confirm_delete'),
        message: t('confirm_delete_user') + ': ' + user.username + '?',
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
          // 使用documentId作为参数调用删除接口
          const deleteUrl = API.USER.USERS.DELETE(user.documentId || user.id);
          console.log('DELETE请求URL:', deleteUrl);

          // 调用删除API
          const deleteResponse = await axios.delete(deleteUrl, {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          console.log('删除用户成功:', deleteResponse.data);

          // 更新前端用户列表
          users.value = users.value.filter(u => u.id !== user.id);

          // 显示成功提示
          Notify.create({
            message: t('delete_success'),
            color: 'positive',
            timeout: 2000
          });

          // 重新加载用户数据以确保同步
          fetchUsers();
        } catch (error) {
          console.error('删除用户失败:', error);

          // 显示错误提示
          Notify.create({
            message: t('delete_failed') + ': ' + (error.message || t('unknown_error')),
            color: 'negative',
            timeout: 2000
          });
        }
      }).onCancel(() => {
        // 用户取消删除操作
        console.log('用户取消删除用户:', user.username);
      }).onDismiss(() => {
        // 对话框关闭的回调
      });
    };

    // 返回用户列表
    const goBack = () => {
      // 在UserManagement页面内部，我们不应该导航到同一页面
      // 而是应该通过事件通知父组件切换回欢迎页面
      console.log('在UserManagement页面内部执行返回操作，将切换回欢迎页面');

      // 通过emit通知父组件（UserManagement）切换页面
      emit('goBackToWelcome');
    };

    // 生命周期钩子
    onMounted(async () => {
      await fetchUsers();
    });

    return {
      t,
      users,
      displayUsers,
      columns,
      loading,
      editDialogVisible,
      viewDialogVisible,
      currentUser,
      searchText,
      statusFilter,
      roleFilter,
      statusOptions,
      roleOptions,
      pagination,
      totalUsers,
      goBack,
      addUser,
      editUser,
      viewUser,
      deleteUser,
      onUserSave,
      onUserError,
      handleSearch,
      handleFilterChange,
      resetFilters,
      onRequest,
      formatDate
    };
  }
});
</script>

<style scoped>
  .users-container {
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

  .users-table {
    width: 100% !important;
    min-width: 100% !important;
    overflow-x: auto;
    table-layout: auto !important;
  }

  .users-table .q-table__container {
    width: 100% !important;
    overflow-x: visible;
  }

  .users-table th,
  .users-table td {
    padding: 12px 16px !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 用户信息单元格样式 */
  .user-info-cell {
    min-width: 200px;
  }

  .user-info-cell .text-primary {
    font-weight: 500;
    transition: color 0.2s ease;
  }

  .user-info-cell .text-primary:hover {
    color: var(--q-primary) !important;
    text-decoration: underline;
  }

  /* 表格列自动填充剩余空间 */
  .users-table th:not(:last-child),
  .users-table td:not(:last-child) {
    width: auto;
    min-width: 120px;
  }

  /* 操作列固定宽度 */
  .users-table th:last-child,
  .users-table td:last-child {
    width: 150px;
    min-width: 150px;
    text-align: right;
  }

  /* 操作按钮样式 */
  .users-table .q-btn {
    transition: all 0.2s ease;
  }

  .users-table .q-btn:hover {
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
    .users-table th,
    .users-table td {
      padding: 8px 12px !important;
      font-size: 14px;
    }
    
    .user-info-cell {
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
  .layout-view-active .users-container {
    width: 100%;
  }
</style>
