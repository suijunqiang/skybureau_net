<template>
  <div class="device-type-management-container full-width full-height">
    <q-card class="full-width full-height shadow-0">
      <q-card-section class="q-pa-lg full-width">
        <!-- 顶部操作栏 -->
        <div class="row items-center q-mb-lg">
          <div class="col">
            <h2 class="text-h5 q-my-none text-weight-medium">{{ t('device_type_management_title') || '设备类型管理' }}</h2>
            <p class="text-grey-6 q-mb-none q-mt-xs">{{ t('device_type_management_subtitle') || '管理IoT设备类型信息' }}</p>
          </div>
          <div class="col-auto">
            <q-btn
              color="primary"
              :label="t('add_device_type') || '新增设备类型'"
              icon="add"
              @click="addDeviceType"
              size="md"
              class="q-px-lg"
            />
          </div>
        </div>

        <!-- 搜索栏 -->
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-12 col-md-4">
            <q-input
              v-model="searchText"
              :placeholder="t('search_device_types_placeholder') || '搜索设备类型...'"
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
          <div class="col-12 col-md-2">
            <q-btn
              flat
              color="primary"
              :label="t('reset_search') || '重置搜索'"
              @click="resetSearch"
              size="md"
            />
          </div>
        </div>

        <!-- 设备类型列表表格 -->
        <q-table
          :rows="displayDeviceTypes"
          :columns="columns"
          :loading="loading"
          row-key="id"
          flat
          bordered
          class="device-type-management-table"
          :pagination="pagination"
          @request="onRequest"
        >
          <!-- 设备类型名称列 -->
          <template v-slot:body-cell-type_name="props">
            <q-td :props="props">
              <div class="device-type-info-cell">
                <div class="text-weight-medium text-primary cursor-pointer" @click="viewDeviceType(props.row)">
                  {{ props.value || t('unnamed_device_type') || '未命名设备类型' }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  {{ t('document_id') }}: {{ props.row.documentId || t('not_set') }}
                </div>
              </div>
            </q-td>
          </template>

          <!-- 更新时间列 -->
          <template v-slot:body-cell-updatedAt="props">
            <q-td :props="props">
              <div class="text-caption text-grey-6">
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
                  @click="editDeviceType(props.row)"
                >
                  <q-tooltip>{{ t('edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="info"
                  icon="visibility"
                  size="sm"
                  @click="viewDeviceType(props.row)"
                >
                  <q-tooltip>{{ t('view') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="deleteDeviceType(props.row)"
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
              :label="t('back_to_device_list') || '返回设备列表'"
              icon="arrow_back"
              @click="goBack"
            />
          </div>
          <div class="col-auto">
            <span class="text-grey-6">
              {{ t('total_device_types', { count: totalDeviceTypes }) || `总共 ${totalDeviceTypes} 个设备类型` }}
            </span>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API } from 'src/api/api.js';
import { Notify, useQuasar } from 'quasar';

// 这里暂时不导入对话框组件，因为还没有创建
// import DeviceTypeEditDialog from './DeviceTypeEditDialog.vue';
// import DeviceTypeViewDialog from './DeviceTypeViewDialog.vue';

export default defineComponent({
  name: 'DeviceTypeManagement',
  components: {
    // DeviceTypeEditDialog,
    // DeviceTypeViewDialog
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const $q = useQuasar();
    const deviceTypes = ref([]);
    const loading = ref(false);
    const editDialogVisible = ref(false);
    const viewDialogVisible = ref(false);
    const currentDeviceType = ref(null);

    // 搜索状态
    const searchText = ref('');

    // 分页配置
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    });

    // 表格列配置
    const columns = ref([
      { name: "id", label: t("id") || "ID", field: "id", align: "left", sortable: true, width: 80 },
      { name: "type_id", label: t("type_id") || "类型ID", field: "type_id", align: "left", sortable: true, width: 100 },
      { name: "type_name", label: t("type_name") || "类型名称", field: "type_name", align: "left", sortable: true },
      { name: "documentId", label: t("document_id") || "文档ID", field: "documentId", align: "left", sortable: true },
      { name: "updatedAt", label: t("update_time") || "更新时间", field: "updatedAt", align: "left", sortable: true },
      { name: "actions", label: t("operations") || "操作", field: "id", align: "right", width: 150, sortable: false }
    ]);

    // 获取设备类型数据
    const fetchDeviceTypes = async () => {
      loading.value = true;
      try {
        const response = await axios.get(API.DEVICES.DEVICE_TYPES.LIST);
        // 适配API返回格式
        deviceTypes.value = response.data.data || [];
        pagination.value.rowsNumber = response.data.meta?.pagination?.total || deviceTypes.value.length;
        console.log('设备类型数据加载成功:', deviceTypes.value);
      } catch (error) {
        console.error('获取设备类型数据失败:', error);
        deviceTypes.value = [];
        Notify.create({
          message: t('fetch_device_types_failed') + ': ' + (error.message || t('unknown_error')),
          color: 'negative',
          timeout: 2000
        });
      } finally {
        loading.value = false;
      }
    };

    // 搜索功能
    const handleSearch = () => {
      console.log('搜索设备类型:', searchText.value);
    };

    const resetSearch = () => {
      searchText.value = '';
    };

    // 表格请求处理
    const onRequest = (props) => {
      const { page, rowsPerPage } = props.pagination;
      pagination.value.page = page;
      pagination.value.rowsPerPage = rowsPerPage;
    };

    // 显示的设备类型数据（带搜索）
    const displayDeviceTypes = computed(() => {
      let filtered = deviceTypes.value || [];

      // 搜索筛选
      if (searchText.value) {
        const search = searchText.value.toLowerCase();
        filtered = filtered.filter(deviceType =>
          (deviceType.type_name && deviceType.type_name.toLowerCase().includes(search)) ||
          (deviceType.id && deviceType.id.toString().includes(search)) ||
          (deviceType.type_id && deviceType.type_id.toString().includes(search)) ||
          (deviceType.documentId && deviceType.documentId.toLowerCase().includes(search))
        );
      }

      return filtered;
    });

    // 总设备类型数
    const totalDeviceTypes = computed(() => displayDeviceTypes.value.length);

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toLocaleString();
      } catch (e) {
        return dateString;
      }
    };

    // 返回设备列表
    const goBack = () => {
      router.push('/iotdevices');
    };

    // 添加设备类型
    const addDeviceType = () => {
      currentDeviceType.value = null;
      editDialogVisible.value = true;
    };

    // 编辑设备类型
    const editDeviceType = (deviceType) => {
      currentDeviceType.value = { ...deviceType };
      editDialogVisible.value = true;
    };

    // 查看设备类型
    const viewDeviceType = (deviceType) => {
      currentDeviceType.value = { ...deviceType };
      viewDialogVisible.value = true;
    };

    // 删除设备类型
    const deleteDeviceType = async (deviceType) => {
      try {
        await $q.dialog({
          title: t('confirm_delete_device_type'),
          message: t('confirm_delete_device_type_message', { name: deviceType.type_name }),
          cancel: t('cancel'),
          ok: t('confirm'),
          persistent: true
        });

        await axios.delete(API.DEVICES.DEVICE_TYPES.DELETE(deviceType.id));
        const index = deviceTypes.value.findIndex(d => d.id === deviceType.id);
        if (index !== -1) {
          deviceTypes.value.splice(index, 1);
        }

        Notify.create({
          message: t('delete_success'),
          color: 'positive',
          timeout: 2000
        });
      } catch (error) {
        if (error !== 'canceled') {
          console.error('删除设备类型失败:', error);
          Notify.create({
            message: t('delete_failed') + ': ' + (error.message || t('unknown_error')),
            color: 'negative',
            timeout: 2000
          });
        }
      }
    };

    // 设备类型保存成功处理
    const onDeviceTypeSave = (updatedDeviceType) => {
      const index = deviceTypes.value.findIndex(d => d.id === updatedDeviceType.id);
      if (index !== -1) {
        deviceTypes.value[index] = updatedDeviceType;
      } else {
        deviceTypes.value.push(updatedDeviceType);
      }

      Notify.create({
        message: t('save_success'),
        color: 'positive',
        timeout: 2000
      });
    };

    // 设备类型保存失败处理
    const onDeviceTypeError = (error) => {
      Notify.create({
        message: t('save_failed') + ': ' + (error.message || t('unknown_error')),
        color: 'negative',
        timeout: 2000
      });
    };

    // 组件挂载时加载数据
    onMounted(() => {
      fetchDeviceTypes();
    });

    return {
      deviceTypes,
      loading,
      editDialogVisible,
      viewDialogVisible,
      currentDeviceType,
      searchText,
      pagination,
      columns,
      displayDeviceTypes,
      totalDeviceTypes,
      t,
      fetchDeviceTypes,
      handleSearch,
      resetSearch,
      onRequest,
      formatDate,
      goBack,
      addDeviceType,
      editDeviceType,
      viewDeviceType,
      deleteDeviceType,
      onDeviceTypeSave,
      onDeviceTypeError
    };
  }
});
</script>

<style scoped>
.device-type-management-container {
  background-color: #f5f5f5;
}

.device-type-info-cell {
  display: flex;
  flex-direction: column;
}
</style>
