<template>
  <div class="device-management-container full-width full-height">
    <q-card class="full-width full-height shadow-0">
      <q-card-section class="q-pa-lg full-width">
        <!-- 顶部操作栏 -->
        <div class="row items-center q-mb-lg">
          <div class="col">
            <h2 class="text-h5 q-my-none text-weight-medium">设备管理</h2>
            <p class="text-grey-6 q-mb-none q-mt-xs">管理IoT设备信息</p>
          </div>
          <div class="col-auto">
            <q-btn
              flat
              color="primary"
              :label="t('device_type_management_title') || '设备类型管理'"
              icon="list"
              @click="goToDeviceTypeManagement"
              size="md"
              class="q-px-lg q-mr-sm"
            />
            <q-btn
              color="primary"
              :label="t('add_device') || '新增设备'"
              icon="add"
              @click="addDevice"
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
              placeholder="搜索设备..."
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
              v-model="typeFilter"
              :options="deviceTypeOptions"
              label="按设备类型筛选"
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
              label="重置筛选"
              @click="resetFilters"
              size="md"
            />
          </div>
        </div>

        <!-- 设备列表表格 -->
        <q-table
          :rows="displayDevices"
          :columns="columns"
          :loading="loading"
          row-key="id"
          flat
          bordered
          class="device-management-table"
          :pagination="pagination"
          @request="onRequest"
        >
          <!-- 设备名称列 -->
          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <div class="device-info-cell">
                <div class="text-weight-medium text-primary cursor-pointer" @click="viewDevice(props.row)">
                  {{ props.value || '未命名设备' }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  设备序列号: {{ props.row.serialNum }}
                </div>
              </div>
            </q-td>
          </template>

          <!-- 连接状态列 -->
          <template v-slot:body-cell-connectionStatus="props">
            <q-td :props="props">
              <div class="flex items-center">
                <q-icon
                  :name="props.value === 0 ? 'wifi_off' : 'wifi'"
                  :color="props.value === 0 ? 'negative' : 'positive'"
                  size="sm"
                  class="q-mr-xs"
                />
                {{ props.value === 0 ? t('offline') : t('online') }}
              </div>
            </q-td>
          </template>

          <!-- 工作状态列 -->
          <template v-slot:body-cell-workStatus="props">
            <q-td :props="props">
              <div class="flex items-center">
                <q-icon
                  :name="props.value === 0 ? 'power_settings_new' : 'check_circle'"
                  :color="props.value === 0 ? 'warning' : 'positive'"
                  size="sm"
                  class="q-mr-xs"
                />
                {{ props.value === 0 ? t('standby') : t('running') }}
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
                  @click="editDevice(props.row)"
                >
                  <q-tooltip>{{ t('edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="info"
                  icon="visibility"
                  size="sm"
                  @click="viewDevice(props.row)"
                >
                  <q-tooltip>{{ t('view') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="deleteDevice(props.row)"
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
              label="返回"
              icon="arrow_back"
              @click="goBack"
            />
          </div>
          <div class="col-auto">
            <span class="text-grey-6">
              总共 {{ totalDevices }} 个设备
            </span>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>

  <!-- 设备编辑对话框 -->
  <DeviceEditDialog
    v-model:visible="editDialogVisible"
    :device="currentDevice"
    :deviceTypes="deviceTypes"
    @save="onDeviceSave"
    @error="onDeviceError"
  />

  <!-- 设备查看对话框 -->
  <DeviceViewDialog
    v-model:visible="viewDialogVisible"
    :device="currentDevice"
    :deviceTypeName="getDeviceTypeName(currentDevice?.type_id)"
  />
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API } from 'src/api/api.js';
import { Notify, useQuasar } from 'quasar';
import DeviceEditDialog from './DeviceEditDialog.vue';
import DeviceViewDialog from './DeviceViewDialog.vue';

export default defineComponent({
  name: 'DeviceManagement',
  components: {
    DeviceEditDialog,
    DeviceViewDialog
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const $q = useQuasar();
    const devices = ref([]);
    const deviceTypes = ref([]);
    const loading = ref(false);
    const editDialogVisible = ref(false);
    const viewDialogVisible = ref(false);
    const currentDevice = ref(null);

    // 搜索和筛选状态
    const searchText = ref('');
    const typeFilter = ref(null);

    // 设备类型筛选选项
    const deviceTypeOptions = computed(() => {
      return [
        { label: t('all_device_types'), value: null },
        ...deviceTypes.value.map(type => ({
          label: type.name,
          value: type.id
        }))
      ];
    });

    // 分页配置
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    });

    // 表格列配置 - 国际化处理
    const columns = computed(() => [
      { name: "serialNum", label: t('device_serial_number'), field: "serialNum", align: "left", sortable: true },
      { name: "name", label: t('device_name'), field: "name", align: "left", sortable: true },
      { name: "type_id", label: t('device_type'), field: "type_id", align: "left", sortable: true },
      { name: "model", label: t('device_model'), field: "model", align: "left", sortable: true },
      { name: "manufacturer", label: t('manufacturer'), field: "manufacturer", align: "left", sortable: true },
      { name: "connectionStatus", label: t('connection_status'), field: "connectionStatus", align: "left", sortable: true },
      { name: "workStatus", label: t('work_status'), field: "workStatus", align: "left", sortable: true },
      { name: "ipAddress", label: t('ip_address'), field: "ipAddress", align: "left", sortable: true },
      { name: "updatedAt", label: t('update_time'), field: "updatedAt", align: "left", sortable: true },
      { name: "actions", label: t('actions'), field: "id", align: "right", width: 150, sortable: false }
    ]);

    // 获取设备数据
    const fetchDevices = async () => {
      loading.value = true;
      try {
        const response = await axios.get(API.DEVICES.DEVICES.LIST);
        devices.value = response.data.data || [];
        // 确保设备数据中的状态值是数字类型，以便正确匹配选项
        devices.value = devices.value.map(device => ({
          ...device,
          type_id: device.type_id !== undefined ? Number(device.type_id) : null,
          connectionStatus: device.connectionStatus !== undefined ? Number(device.connectionStatus) : 0,
          workStatus: device.workStatus !== undefined ? Number(device.workStatus) : 0
        }));
        console.log('设备数据加载成功:', devices.value);
      } catch (error) {
        console.error('获取设备数据失败:', error);
        devices.value = [];
        Notify.create({
          message: t('fetch_device_data_failed') + ': ' + (error.message || t('unknown_error')),
          color: 'negative',
          timeout: 2000
        });
      } finally {
        loading.value = false;
      }
    };

    // 获取设备类型数据
    const fetchDeviceTypes = async () => {
      try {
        const response = await axios.get(API.DEVICES.DEVICE_TYPES.LIST);
        deviceTypes.value = response.data.data || [];
        // 确保设备类型ID是数字类型，以便正确匹配
        deviceTypes.value = deviceTypes.value.map(type => ({
          ...type,
          id: Number(type.id)
        }));
        console.log('设备类型数据加载成功:', deviceTypes.value);
      } catch (error) {
        console.error('获取设备类型数据失败:', error);
        deviceTypes.value = [];
        Notify.create({
          message: t('fetch_device_types_failed') + ': ' + (error.message || t('unknown_error')),
          color: 'negative',
          timeout: 2000
        });
      }
    };

    // 搜索和筛选功能
    const handleSearch = () => {
      console.log('搜索:', searchText.value);
    };

    const handleFilterChange = () => {
      console.log('筛选变更:', typeFilter.value);
    };

    const resetFilters = () => {
      searchText.value = '';
      typeFilter.value = null;
    };

    // 表格请求处理
    const onRequest = (props) => {
      const { page, rowsPerPage } = props.pagination;
      pagination.value.page = page;
      pagination.value.rowsPerPage = rowsPerPage;
    };

    // 显示的设备数据（带搜索和筛选）
    const displayDevices = computed(() => {
      let filtered = devices.value || [];

      // 搜索筛选
      if (searchText.value) {
        const search = searchText.value.toLowerCase();
        filtered = filtered.filter(device =>
          (device.name && device.name.toLowerCase().includes(search)) ||
          (device.serialNum && device.serialNum.toLowerCase().includes(search)) ||
          (device.model && device.model.toLowerCase().includes(search)) ||
          (device.ipAddress && device.ipAddress.toLowerCase().includes(search))
        );
      }

      // 设备类型筛选
      if (typeFilter.value !== null) {
        // 确保类型ID比较时类型一致
        const numericTypeId = Number(typeFilter.value);
        filtered = filtered.filter(device => Number(device.type_id) === numericTypeId);
      }

      return filtered;
    });

    // 总设备数
    const totalDevices = computed(() => displayDevices.value.length);

    // 获取设备类型名称
    const getDeviceTypeName = (typeId) => {
      if (!typeId) return '未设置';

      const deviceType = deviceTypes.value.find(type => type.id == typeId);
      return deviceType ? deviceType.name : `ID:${typeId}`;
    };

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN');
      } catch (e) {
        return dateString;
      }
    };

    // 返回上一页
    const goBack = () => {
      router.push('/');
    };

    // 前往设备类型管理页面
    const goToDeviceTypeManagement = () => {
      router.push('/iotdevices/types');
    };

    // 添加设备
    const addDevice = () => {
      currentDevice.value = null;
      editDialogVisible.value = true;
    };

    // 编辑设备
    const editDevice = (device) => {
      // 确保传递给编辑对话框的数据类型正确
      currentDevice.value = {
        ...device,
        type_id: device.type_id !== undefined ? Number(device.type_id) : null,
        connectionStatus: device.connectionStatus !== undefined ? Number(device.connectionStatus) : 0,
        workStatus: device.workStatus !== undefined ? Number(device.workStatus) : 0
      };
      editDialogVisible.value = true;
    };

    // 查看设备
    const viewDevice = (device) => {
      currentDevice.value = { ...device };
      viewDialogVisible.value = true;
    };

    // 设备保存成功处理
    const onDeviceSave = (updatedDevice) => {
      // 确保更新的设备数据类型正确
      const normalizedDevice = {
        ...updatedDevice,
        type_id: updatedDevice.type_id !== undefined ? Number(updatedDevice.type_id) : null,
        connectionStatus: updatedDevice.connectionStatus !== undefined ? Number(updatedDevice.connectionStatus) : 0,
        workStatus: updatedDevice.workStatus !== undefined ? Number(updatedDevice.workStatus) : 0
      };

      const index = devices.value.findIndex(d => d.id === updatedDevice.id);
      if (index !== -1) {
        devices.value[index] = normalizedDevice;
      } else {
        devices.value.push(normalizedDevice);
      }

      Notify.create({
        message: t('save_success'),
        color: 'positive',
        timeout: 2000
      });

      setTimeout(() => {
        fetchDevices();
      }, 500);
    };

    // 设备保存失败处理
    const onDeviceError = (error) => {
      Notify.create({
        message: t('save_failed') + ': ' + (error.message || t('unknown_error')),
        color: 'negative',
        timeout: 2000
      });
    };

    // 删除设备
    const deleteDevice = (device) => {
      $q.dialog({
        title: t('confirm_delete'),
        message: t('confirm_delete_device') + ': ' + device.name + '?',
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
          const deleteUrl = API.DEVICES.DEVICES.DELETE(device.id);
          console.log('DELETE请求URL:', deleteUrl);

          const deleteResponse = await axios.delete(deleteUrl, {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          console.log('删除设备成功:', deleteResponse.data);

          devices.value = devices.value.filter(d => d.id !== device.id);

          Notify.create({
            message: t('delete_success'),
            color: 'positive',
            timeout: 2000
          });

          fetchDevices();
        } catch (error) {
          console.error('删除设备失败:', error);

          Notify.create({
            message: t('delete_failed') + ': ' + (error.message || t('unknown_error')),
            color: 'negative',
            timeout: 2000
          });
        }
      }).onCancel(() => {
        console.log('用户取消删除设备:', device.name);
      });
    };

    // 生命周期钩子
    onMounted(async () => {
      await Promise.all([fetchDevices(), fetchDeviceTypes()]);
    });

    return {
      devices,
      displayDevices,
      deviceTypes,
      columns,
      loading,
      editDialogVisible,
      viewDialogVisible,
      currentDevice,
      searchText,
      typeFilter,
      deviceTypeOptions,
      pagination,
      totalDevices,
      t,
      goBack,
      goToDeviceTypeManagement,
      addDevice,
      editDevice,
      viewDevice,
      deleteDevice,
      onDeviceSave,
      onDeviceError,
      handleSearch,
      handleFilterChange,
      resetFilters,
      onRequest,
      getDeviceTypeName,
      formatDate
    };
  }
});
</script>

<style scoped>
  .device-management-container {
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

  .device-management-table {
    width: 100% !important;
    min-width: 100% !important;
    overflow-x: auto;
    table-layout: auto !important;
  }

  .device-management-table .q-table__container {
    width: 100% !important;
    overflow-x: visible;
  }

  .device-management-table th,
  .device-management-table td {
    padding: 12px 16px !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 设备信息单元格样式 */
  .device-info-cell {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .device-info-cell:hover {
    color: #1976d2;
  }
</style>
