<template>
  <div class="position-container">
    <q-card>
      <q-card-section>
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">{{ $t('position_page_title') }}</h2>
          <q-btn color="primary" :label="$t('add_position')" @click="addPosition" />
        </div>

        <!-- 职位列表表格 -->
        <q-table
          :rows="displayPositions"
          :columns="columns"
          row-key="id"
          flat bordered
          class="mt-4"
        >
          <template v-slot:body-cell-actions="props">
            <div class="flex justify-end">
              <q-btn-group flat size="sm">
                <q-btn color="primary" :label="$t('edit')" @click="editPosition(props.row)" style="margin-right: 4px; padding: 2px 8px; font-size: 12px;" />
                <q-btn color="negative" :label="$t('delete')" @click="deletePosition(props.row)" style="padding: 2px 8px; font-size: 12px;" />
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

  <!-- 职位编辑对话框 -->
  <PositionEditDialog
    v-model:visible="editDialogVisible"
    :position="currentPosition"
    :branches="branches"
    :menus="menus"
    @save="onPositionSave"
    @error="onPositionError"
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

export default defineComponent({
  name: 'PositionPage',
  components: {
    PositionEditDialog
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
    const currentPosition = ref(null);

    // 表格列配置
    const columns = ref([
      { name: "position_id", label: t("position_id"), field: "position_id", align: "left", sortable: true, width: 80 },
      { name: "name", label: t("position_name"), field: "name", align: "left", sortable: true },
      { name: "branch_name", label: t("branch_name"), field: "branch_name", align: "left", sortable: true },
      { name: "menu_id", label: t("menu_permissions"), field: "menu_id", align: "left", sortable: false },
      { name: "actions", label: t("operations"), field: "id", align: "right", width: 150, sortable: false }
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

    // 显示的职位数据
    const displayPositions = computed(() => {
      return positions.value || [];
    });

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
          // 使用documentId作为参数调用删除接口
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
      currentPosition,
      goBack,
      addPosition,
      editPosition,
      deletePosition,
      onPositionSave,
      onPositionError
    };
  }
});
</script>

<style scoped>
  .position-container {
    width: 100%;
    margin: 0;
    padding: 1rem 0.5rem;
    box-sizing: border-box;
    transition: width 0.3s ease;
  }

  .q-card {
    width: 100%;
    max-width: none;
  }

  .q-card-section {
    width: 100%;
    padding: 16px;
  }

  .q-table {
    width: 100%;
    min-width: 100%;
    overflow-x: auto;
    table-layout: fixed;
  }

  .q-table__container {
    width: 100%;
    overflow-x: visible;
  }

  .q-table th, .q-table td {
    width: auto;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .q-table th:nth-child(2), .q-table td:nth-child(2), .q-table th:nth-child(3), .q-table td:nth-child(3) {
    width: auto;
    min-width: 180px;
  }

  .q-table th.col-actions, .q-table td.col-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  .q-btn-group > .q-btn {
    margin-right: 4px;
  }

  .q-btn-group > .q-btn:last-child {
    margin-right: 0;
  }
</style>
