<template>
  <q-dialog
      v-model="localVisible"
      persistent
      class="device-edit-dialog"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
    <q-card class="dialog-card">
      <q-card-section class="q-pa-lg">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ isEdit ? t('edit_device') : t('add_device') }}</h3>
          <q-btn
            flat
            round
            color="grey"
            icon="close"
            @click="closeDialog"
            size="sm"
          />
        </div>
      </q-card-section>

      <q-card-section class="q-pa-lg q-pb-0">
        <q-form
          ref="deviceForm"
          v-model="formValid"
          @submit.prevent="submitForm"
        >
          <!-- 基本信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="col">
              <q-input
                v-model="form.name"
                :label="t('device_name')"
                outlined
                dense
                :rules="[val => !!val || t('device_name_required')]"
              />
            </div>

            <div class="col">
              <q-input
                v-model="form.serialNum"
                :label="t('device_serial_number')"
                outlined
                dense
                :rules="[val => !!val || t('device_serial_number_required')]"
                :readonly="isEdit"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div class="col">
              <q-select
                v-model="form.type_id"
                :label="t('device_type')"
                outlined
                dense
                :options="deviceTypesOptions"
                option-label="label"
                option-value="value"
                use-input
                emit-value
                map-options
                :rules="[val => val !== null && val !== undefined && val !== '' || t('device_type_required')]"
              />
            </div>

            <div class="col">
              <q-input
                v-model="form.model"
                :label="t('device_model')"
                outlined
                dense
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div class="col">
              <q-input
                v-model="form.manufacturer"
                :label="t('manufacturer')"
                outlined
                dense
              />
            </div>

            <div class="col">
              <q-select
                v-model="form.connectionStatus"
                :label="t('connection_status')"
                outlined
                dense
                :options="connectionStatusOptions"
                option-label="label"
                option-value="value"
                use-input
                emit-value
                :rules="[val => val !== null && val !== undefined && val !== '' || t('connection_status_required')]"
              >
                <template v-slot:option="scope">
                  <div class="flex items-center">
                    <q-icon
                      :name="scope.opt.value === 0 ? 'wifi_off' : 'wifi'"
                      :color="scope.opt.value === 0 ? 'negative' : 'positive'"
                      size="sm"
                      class="q-mr-2"
                    />
                    {{ scope.opt.label }}
                  </div>
                </template>
                <template v-slot:selected-item="scope">
                  <div class="flex items-center">
                    <q-icon
                      :name="scope.opt.value === 0 ? 'wifi_off' : 'wifi'"
                      :color="scope.opt.value === 0 ? 'negative' : 'positive'"
                      size="sm"
                      class="q-mr-2"
                    />
                    {{ scope.opt.label }}
                  </div>
                </template>
              </q-select>
            </div>
          </div>

          <!-- 网络信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div class="col">
              <q-input
                v-model="form.ipAddress"
                :label="t('ip_address')"
                outlined
                dense
              />
            </div>

            <div class="col">
              <q-input
                v-model="form.macAddress"
                :label="t('mac_address')"
                outlined
                dense
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div class="col">
              <q-select
                v-model="form.networkType"
                :label="t('network_type')"
                outlined
                dense
                :options="networkTypeOptions"
                option-label="label"
                option-value="value"
                use-input
                emit-value
                map-options
                :rules="[val => val !== null && val !== undefined && val !== '' || t('network_type_required')]"
              />
            </div>

            <div class="col">
              <q-input
                v-model="form.signalStrength"
                :label="t('signal_strength')"
                outlined
                dense
              />
            </div>
          </div>

          <!-- 其他信息 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div class="col">
              <q-select
                v-model="form.workStatus"
                :label="t('work_status')"
                outlined
                dense
                :options="workStatusOptions"
                option-label="label"
                option-value="value"
                use-input
                emit-value
                :rules="[val => val !== null && val !== undefined && val !== '' || t('work_status_required')]"
              >
                <template v-slot:option="scope">
                  <div class="flex items-center">
                    <q-icon
                      :name="scope.opt.value === 0 ? 'power_settings_new' : 'check_circle'"
                      :color="scope.opt.value === 0 ? 'warning' : 'positive'"
                      size="sm"
                      class="q-mr-2"
                    />
                    {{ scope.opt.label }}
                  </div>
                </template>
                <template v-slot:selected-item="scope">
                  <div class="flex items-center">
                    <q-icon
                      :name="scope.opt.value === 0 ? 'power_settings_new' : 'check_circle'"
                      :color="scope.opt.value === 0 ? 'warning' : 'positive'"
                      size="sm"
                      class="q-mr-2"
                    />
                    {{ scope.opt.label }}
                  </div>
                </template>
              </q-select>
            </div>

            <div class="col">
              <q-input
                v-model="form.location"
                :label="t('device_location')"
                outlined
                dense
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div class="col">
              <q-input
                v-model="form.version"
                :label="t('firmware_version')"
                outlined
                dense
              />
            </div>
          </div>

          <!-- 备注信息 -->
          <div class="mt-4">
            <q-input
              v-model="form.notes"
              :label="t('notes')"
              outlined
              dense
              type="textarea"
              rows="3"
              resize="vertical"
            />
          </div>
        </q-form>
      </q-card-section>

      <q-card-section class="q-pa-lg q-pt-4 q-px-xl">
        <div class="flex justify-end q-gutter-md">
          <q-btn
            :label="t('cancel')"
            flat
            @click="closeDialog"
            class="min-w-[80px]"
          />
          <q-btn
            :label="t('save')"
            color="primary"
            :disabled="!formValid || saving"
            @click="submitForm"
            class="min-w-[80px]"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { API } from 'src/api/api.js';
import { Notify } from 'quasar';

export default defineComponent({
  name: 'DeviceEditDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    device: {
      type: Object,
      default: null
    },
    deviceTypes: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:visible', 'save', 'error'],
  setup(props, { emit }) {
    const { t } = useI18n();
    // 创建本地状态跟踪对话框可见性
    const localVisible = ref(false);

    // 同步props.visible到localVisible
    watch(() => props.visible, (newVisible) => {
      localVisible.value = newVisible;
    });

    // 当localVisible变化时，通知父组件
    watch(localVisible, (newVisible) => {
      if (newVisible !== props.visible) {
        emit('update:visible', newVisible);
      }
    });

    const form = ref({
      id: null,
      documentId: null,
      name: '',
      serialNum: '',
      type_id: null,
      model: '',
          manufacturer: '',
          connectionStatus: null,
          ipAddress: '',
          macAddress: null,
          signalStrength: '',
          networkType: null,
          location: '',
          notes: '',
          workStatus: null,
          version: '',
          createdAt: null,
      updatedAt: null,
      publishedAt: null
    });

    const deviceForm = ref(null);
    const formValid = ref(false);
    const saving = ref(false);

    // 设备类型选项
    const deviceTypesOptions = computed(() => {
      if (!props.deviceTypes || props.deviceTypes.length === 0) {
        return [];
      }
      return props.deviceTypes.map(type => ({
        label: type.type_name,
        value: type.type_id
      }));
    });

    // 连接状态选项
    const connectionStatusOptions = [
      { label: t('offline'), value: 0 },
      { label: t('online'), value: 1 }
    ];

    // 网络类型选项
    const networkTypeOptions = [
      { label: t('wired'), value: 0 },
      { label: t('wifi'), value: 1 },
      { label: t('4g'), value: 2 },
      { label: t('5g'), value: 3 }
    ];

    // 工作状态选项
    const workStatusOptions = [
      { label: t('standby'), value: 0 },
      { label: t('running'), value: 1 },
      { label: t('maintenance'), value: 2 },
      { label: t('fault'), value: 3 }
    ];

    // 是否为编辑模式
    const isEdit = computed(() => {
      return props.device !== null && props.device.id !== undefined;
    });

    // 重置表单
    const resetForm = () => {
      form.value = {
        id: null,
        documentId: null,
        name: '',
        serialNum: '',
        type_id: null,
        model: '',
        manufacturer: '',
        connectionStatus: null,
        ipAddress: '',
        macAddress: null,
        signalStrength: '',
        networkType: null,
        location: '',
        notes: '',
        workStatus: null,
        version: '',
        createdAt: null,
        updatedAt: null,
        publishedAt: null
      };
    };

    // 加载设备数据到表单
    const loadDeviceData = () => {
      if (props.device) {
        // 确保所有值类型正确，特别是数字类型
        form.value = {
          ...props.device,
          type_id: props.device.type_id !== undefined ? Number(props.device.type_id) : null,
          connectionStatus: props.device.connectionStatus !== undefined ? Number(props.device.connectionStatus) : null,
          networkType: props.device.networkType !== undefined ? Number(props.device.networkType) : null,
          workStatus: props.device.workStatus !== undefined ? Number(props.device.workStatus) : null
        };
      }
    };

    // 关闭对话框
    const closeDialog = () => {
      localVisible.value = false;
      setTimeout(() => {
        resetForm();
        formValid.value = false;
      }, 300);
    };

    // 提交表单
    const submitForm = async () => {
      saving.value = true;
      try {
        let response;

        if (isEdit.value) {
          // 编辑模式 - 使用PUT请求
          const updateUrl = API.DEVICES.DEVICES.UPDATE(props.device.id);
          response = await axios.put(updateUrl, form.value);
          Notify.create({
            message: t('device_update_success'),
            color: 'positive',
            timeout: 2000
          });
        } else {
          // 新增模式 - 使用POST请求
          response = await axios.post(API.DEVICES.DEVICES.CREATE, form.value);
          Notify.create({
            message: t('device_create_success'),
            color: 'positive',
            timeout: 2000
          });
        }

        // 通知父组件保存成功
        emit('save', response.data.data);
        closeDialog();
      } catch (error) {
        console.error('保存设备失败:', error);
        Notify.create({
          message: t('save_failed') + ': ' + (error.message || t('unknown_error')),
          color: 'negative',
          timeout: 2000
        });
        emit('error', error);
      } finally {
        saving.value = false;
      }
    };

    // 监听设备数据变化
    watch(() => props.device, (newDevice) => {
      if (props.visible && newDevice) {
        loadDeviceData();
      }
    });

    // 监听对话框可见性
    watch(() => props.visible, (newVisible) => {
      if (newVisible) {
        if (props.device) {
          loadDeviceData();
        } else {
          resetForm();
        }
      }
    });

    return {
      t,
      form,
      deviceForm,
      formValid,
      saving,
      isEdit,
      deviceTypesOptions,
      connectionStatusOptions,
      networkTypeOptions,
      workStatusOptions,
      closeDialog,
      submitForm,
      localVisible
    };
  }
});
</script>

<style scoped>
  .device-edit-dialog {
    max-width: 900px !important;
    width: 90vw !important;
  }

  .dialog-card {
    max-height: 90vh !important;
    overflow-y: auto;
  }

  /* 表单样式优化 */
  .q-field {
    margin-bottom: 0 !important;
  }
</style>

