<template>
  <q-dialog
    v-model="localVisible"
    persistent
    class="device-view-dialog"
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="dialog-card">
      <q-card-section class="q-pa-lg">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">设备详情</h3>
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
        <div v-if="device" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 基本信息 -->
          <div class="col">
            <div class="q-mb-xl">
              <h4 class="text-md font-medium text-grey-700 q-mb-sm">基本信息</h4>
              <div class="space-y-3">
                <div class="flex">
                  <div class="w-24 text-grey-600">设备名称:</div>
                  <div class="text-weight-medium">{{ device.name || '-' }}</div>
                </div>
                <div class="flex">
                  <div class="w-24 text-grey-600">设备序列号:</div>
                  <div class="text-weight-medium">{{ device.serialNum || '-' }}</div>
                </div>
                <div class="flex">
                  <div class="w-24 text-grey-600">设备类型:</div>
                  <div class="text-weight-medium">{{ deviceTypeName || '-' }}</div>
                </div>
                <div class="flex">
                  <div class="w-24 text-grey-600">设备型号:</div>
                  <div class="text-weight-medium">{{ device.model || '-' }}</div>
                </div>
                <div class="flex">
                  <div class="w-24 text-grey-600">制造商:</div>
                  <div class="text-weight-medium">{{ device.manufacturer || '-' }}</div>
                </div>
              </div>
            </div>

            <!-- 状态信息 -->
            <div class="q-mb-xl">
              <h4 class="text-md font-medium text-grey-700 q-mb-sm">状态信息</h4>
              <div class="space-y-3">
                <div class="flex items-center">
                  <div class="w-24 text-grey-600">连接状态:</div>
                  <div class="flex items-center">
                    <q-icon
                      :name="device.connectionStatus === 0 ? 'wifi_off' : 'wifi'"
                      :color="device.connectionStatus === 0 ? 'negative' : 'positive'"
                      size="sm"
                      class="q-mr-xs"
                    />
                    <span class="text-weight-medium">{{ device.connectionStatus === 0 ? '离线' : '在线' }}</span>
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="w-24 text-grey-600">工作状态:</div>
                  <div class="flex items-center">
                    <q-icon
                      :name="device.workStatus === 0 ? 'power_settings_new' : 'check_circle'"
                      :color="device.workStatus === 0 ? 'warning' : 'positive'"
                      size="sm"
                      class="q-mr-xs"
                    />
                    <span class="text-weight-medium">
                      {{ device.workStatus === 0 ? '待机' :
                         device.workStatus === 1 ? '运行中' :
                         device.workStatus === 2 ? '维护中' : '故障' }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center">
                  <div class="w-24 text-grey-600">信号强度:</div>
                  <div class="text-weight-medium">{{ device.signalStrength || '-' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 网络信息 -->
          <div class="col">
            <div class="q-mb-xl">
              <h4 class="text-md font-medium text-grey-700 q-mb-sm">网络信息</h4>
              <div class="space-y-3">
                <div class="flex">
                  <div class="w-24 text-grey-600">IP地址:</div>
                  <div class="text-weight-medium">{{ device.ipAddress || '-' }}</div>
                </div>
                <div class="flex">
                  <div class="w-24 text-grey-600">MAC地址:</div>
                  <div class="text-weight-medium">{{ device.macAddress || '-' }}</div>
                </div>
                <div class="flex">
                  <div class="w-24 text-grey-600">网络类型:</div>
                  <div class="text-weight-medium">
                    {{ device.networkType === 0 ? '有线' :
                       device.networkType === 1 ? 'WiFi' :
                       device.networkType === 2 ? '4G' :
                       device.networkType === 3 ? '5G' : '-' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 其他信息 -->
            <div class="q-mb-xl">
              <h4 class="text-md font-medium text-grey-700 q-mb-sm">其他信息</h4>
              <div class="space-y-3">
                <div class="flex">
                  <div class="w-24 text-grey-600">设备位置:</div>
                  <div class="text-weight-medium">{{ device.location || '-' }}</div>
                </div>
                <div class="flex">
                  <div class="w-24 text-grey-600">固件版本:</div>
                  <div class="text-weight-medium">{{ device.version || '-' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 备注信息 -->
          <div class="col-12">
            <h4 class="text-md font-medium text-grey-700 q-mb-sm">备注信息</h4>
            <div class="q-pa-4 bg-grey-50 rounded-lg">
              <pre class="whitespace-pre-wrap text-sm text-grey-700">{{ device.notes || '-' }}</pre>
            </div>
          </div>

          <!-- 时间信息 -->
          <div class="col-12">
            <h4 class="text-md font-medium text-grey-700 q-mb-sm">时间信息</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="q-pa-3 bg-grey-50 rounded-lg">
                <div class="text-xs text-grey-500">创建时间</div>
                <div class="text-sm text-weight-medium mt-1">{{ formatDate(device.createdAt) || '-' }}</div>
              </div>
              <div class="q-pa-3 bg-grey-50 rounded-lg">
                <div class="text-xs text-grey-500">更新时间</div>
                <div class="text-sm text-weight-medium mt-1">{{ formatDate(device.updatedAt) || '-' }}</div>
              </div>
              <div class="q-pa-3 bg-grey-50 rounded-lg">
                <div class="text-xs text-grey-500">发布时间</div>
                <div class="text-sm text-weight-medium mt-1">{{ formatDate(device.publishedAt) || '-' }}</div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center text-grey-500 py-8">
          无设备信息
        </div>
      </q-card-section>

      <q-card-section class="q-pa-lg q-pt-4">
        <div class="flex justify-center">
          <q-btn
            label="关闭"
            color="primary"
            @click="closeDialog"
            class="min-w-[100px]"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, computed, ref, watch } from 'vue';

export default defineComponent({
  name: 'DeviceViewDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    device: {
      type: Object,
      default: null
    },
    deviceTypeName: {
      type: String,
      default: ''
    }
  },
  emits: ['update:visible'],
  setup(props, { emit }) {
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

    // 关闭对话框
    const closeDialog = () => {
      localVisible.value = false;
    };

    return {
      formatDate,
      closeDialog,
      localVisible
    };
  }
});
</script>

<style scoped>
  .device-view-dialog {
    max-width: 900px !important;
    width: 90vw !important;
  }

  .dialog-card {
    max-height: 90vh !important;
    overflow-y: auto;
  }

  /* 优化列表样式 */
  .space-y-3 > div {
    padding: 2px 0;
  }

  /* 优化备注显示 */
  pre {
    font-family: inherit;
    margin: 0;
  }
</style>
