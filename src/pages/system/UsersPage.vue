<template>
  <div class="users-container full-width full-height">
      <q-card class="full-width full-height shadow-0">
        <q-card-section class="q-pa-lg full-width">
          <div class="flex w-full justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">{{ $t('users_page_title') }}</h2>
            <q-btn color="primary" :label="$t('add_user')" @click="addUser" />
          </div>

        <!-- 用户列表表格 -->
        <q-table
          :rows="displayUsers"
          :columns="columns"
          row-key="id"
          flat bordered
          class="mt-4"
        >
          <template v-slot:body-cell-confirmed="props">
            <div class="flex items-center">
              <span class="ml-2">{{ props.value ? 'Yes' : 'No' }}</span>
            </div>
          </template>
          <template v-slot:body-cell-blocked="props">
            <div class="flex items-center">
              <span class="ml-2">{{ props.value ? 'Yes' : 'No' }}</span>
            </div>
          </template>
          <template v-slot:body-cell-is_enabled="props">
            <div class="flex items-center">
              <span class="ml-2">{{ props.value ? 'Yes' : 'No' }}</span>
            </div>
          </template>
          <template v-slot:body-cell-actions="props">
            <div class="flex justify-end">
              <q-btn-group flat size="sm">
                <q-btn color="primary" :label="$t('edit')" @click="editUser(props.row)" style="margin-right: 4px; padding: 2px 8px; font-size: 12px;" />
                <q-btn color="negative" :label="$t('delete')" @click="deleteUser(props.row)" style="padding: 2px 8px; font-size: 12px;" />
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

  <!-- 用户编辑对话框 -->
  <UserEditDialog
    v-model:visible="editDialogVisible"
    :user="currentUser"
    @save="onUserSave"
    @error="onUserError"
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

export default defineComponent({
  name: 'UsersPage',
  components: {
    UserEditDialog
  },
  emits: ['goBackToWelcome'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const router = useRouter();
    const $q = useQuasar();

    // 用户列表数据 - 添加默认模拟数据以确保页面能正常显示
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
    const currentUser = ref(null);

    // 表格列配置
    const columns = ref([
      { name: "id", label: t("id"), field: "id", align: "left", sortable: true, width: 60 },
      { name: "username", label: t("username"), field: "username", align: "left", sortable: true },
      { name: "email", label: t("email"), field: "email", align: "left", sortable: true },
      { name: "real_name", label: t("real_name"), field: "real_name", align: "left", sortable: true },
      { name: "position_name", label: t("position_name"), field: "position_name", align: "left", sortable: true },
      { name: "branch_name", label: t("branch_name"), field: "branch_name", align: "left", sortable: true },
      { name: "mobile", label: t("mobile"), field: "mobile", align: "left", sortable: true },
      { name: "confirmed", label: t("confirmed"), field: "confirmed", align: "left", sortable: true, width: 80 },
      { name: "blocked", label: t("blocked"), field: "blocked", align: "left", sortable: true, width: 80 },
      { name: "is_enabled", label: t("is_enabled"), field: "is_enabled", align: "left", sortable: true, width: 80 },
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

    // 显示的用户数据
    const displayUsers = computed(() => {
      return users.value || [];
    });

    // 返回用户列表
    const goBack = () => {
      // 在UserManagement页面内部，我们不应该导航到同一页面
      // 而是应该通过事件通知父组件切换回欢迎页面
      console.log('在UserManagement页面内部执行返回操作，将切换回欢迎页面');

      // 通过emit通知父组件（UserManagement）切换页面
      emit('goBackToWelcome');
    };

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
      currentUser,
      goBack,
      addUser,
      editUser,
      deleteUser,
      onUserSave,
      onUserError
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
  .layout-view-active .users-container {
    width: 100%;
  }
</style>
