<template>
  <q-dialog
    v-model="dialogVisible"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="full-width full-height">
      <!-- 对话框头部 -->
      <q-card-section class="row items-center q-pb-none bg-primary text-white">
        <div class="col">
          <div class="text-h6">
            {{ position ? t('edit_position') || '编辑职位' : t('add_position') || '添加职位' }}
          </div>
          <div class="text-caption opacity-70">
            {{ position ? t('edit_position_subtitle') || '编辑职位信息和权限配置' : t('add_position_subtitle') || '创建新的系统职位' }}
          </div>
        </div>
        <div class="col-auto">
          <q-btn flat round dense icon="close" @click="closeDialog" />
        </div>
      </q-card-section>

      <!-- 对话框内容 -->
      <q-card-section class="q-pa-md" style="height: calc(100vh - 120px); overflow-y: auto;">
        <q-form ref="formRef" @submit="onSubmit" class="full-width">
          <!-- 基本信息区域 -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12">
              <div class="text-h6 q-mb-md text-primary">{{ t('basic_info') || '基本信息' }}</div>
            </div>
            
            <!-- 职位ID和职位名称 -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.position_id"
                :label="t('position_id') || '职位ID'"
                :placeholder="t('position_id_placeholder') || '请输入职位ID'"
                outlined
                dense
                :disabled="!!position"
                maxlength="20"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.name"
                :label="t('position_name') || '职位名称'"
                :placeholder="t('position_name_placeholder') || '请输入职位名称'"
                outlined
                dense
                required
                :rules="[val => !!val || t('field_required') || '此字段为必填项']"
                maxlength="50"
              />
            </div>
          </div>

          <!-- 部门信息区域 -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12">
              <div class="text-h6 q-mb-md text-primary">{{ t('department_info') || '部门信息' }}</div>
            </div>
            
            <!-- 部门选择 -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.branch_id"
                :label="t('department') || '部门'"
                :placeholder="t('select_department') || '请选择部门'"
                :options="branchOptions"
                option-value="branch_id"
                :option-label="(opt) => opt.name || opt.branch_name || opt.label || JSON.stringify(opt)"
                outlined
                dense
                emit-value
                map-options
                clearable
                required
                :rules="[val => !!val || t('field_required') || '此字段为必填项']"
              />
            </div>
            <div class="col-12 col-md-6">
              <!-- 预留位置，可以添加其他部门相关字段 -->
            </div>
          </div>

          <!-- 权限配置区域 -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12">
              <div class="text-h6 q-mb-md text-primary">{{ t('permission_settings') || '权限设置' }}</div>
            </div>
            
            <!-- 菜单权限选择 -->
            <div class="col-12">
              <div class="q-mb-sm">
                <label class="text-subtitle2 text-weight-medium">{{ t('menu_permissions') || '菜单权限' }}</label>
              </div>
              <div class="menu-permissions-container">
                <div v-if="menus && menus.length > 0" class="menu-permissions-grid">
                  <div 
                    v-for="menu in menus" 
                    :key="menu.menu_id" 
                    class="menu-permission-item"
                  >
                    <q-checkbox
                      v-model="form.menu_id"
                      :val="menu.menu_id"
                      :label="menu.name"
                      color="primary"
                      size="md"
                      class="menu-checkbox"
                    />
                  </div>
                </div>
                <div v-else class="text-center text-grey-5 q-py-lg">
                  {{ t('no_available_menus') || '无可用菜单权限' }}
                </div>
                
                <!-- 权限统计 -->
                <div class="q-mt-md q-pa-sm bg-grey-1 rounded-borders">
                  <div class="row items-center">
                    <div class="col">
                      <span class="text-caption text-grey-7">
                        {{ t('selected_permissions') || '已选择权限' }}: 
                        <span class="text-weight-bold text-primary">{{ form.menu_id.length }}</span> / {{ menus ? menus.length : 0 }}
                      </span>
                    </div>
                    <div class="col-auto">
                      <q-btn 
                        flat 
                        size="sm" 
                        color="primary" 
                        :label="t('select_all') || '全选'"
                        @click="selectAllPermissions"
                        v-if="form.menu_id.length < (menus ? menus.length : 0)"
                      />
                      <q-btn 
                        flat 
                        size="sm" 
                        color="negative" 
                        :label="t('clear_all') || '清空'"
                        @click="clearAllPermissions"
                        v-if="form.menu_id.length > 0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>

      <!-- 对话框操作按钮 -->
      <q-card-section class="row justify-end q-pt-none q-gutter-sm bg-grey-1">
        <q-btn
          flat
          :label="t('cancel') || '取消'"
          color="grey"
          @click="closeDialog"
          size="md"
        />
        <q-btn
          :label="t('save') || '保存'"
          color="primary"
          @click="onSubmit"
          size="md"
          :loading="saving"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, watch, computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { API } from 'src/api/api.js';

export default defineComponent({
  name: 'PositionEditDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    position: {
      type: Object,
      default: null
    },
    branches: {
      type: Array,
      default: () => []
    },
    menus: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:visible', 'save', 'error'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const formRef = ref(null);
    const saving = ref(false);
    
    // 使用本地状态控制对话框显示/隐藏
    const dialogVisible = ref(props.visible);

    // 监听props.visible变化，同步到本地状态
    watch(() => props.visible, (newValue) => {
      dialogVisible.value = newValue;
    });

    // 监听本地状态变化，通知父组件
    watch(dialogVisible, (newValue) => {
      emit('update:visible', newValue);
    });
    
    const form = reactive({
      id: '',
      documentId: '',
      position_id: '',
      name: '',
      branch_id: '',
      menu_id: [],
      sort: 1,
      level: 1
    });

    // 重置表单 - 必须在使用之前声明
    const resetForm = () => {
      Object.assign(form, {
        id: '',
        documentId: '',
        position_id: '',
        name: '',
        branch_id: '',
        menu_id: [],
        sort: 1,
        level: 1
      });
    };

    // 关闭对话框
    const closeDialog = () => {
      dialogVisible.value = false;
    };

    // 部门选项
    const branchOptions = computed(() => {
      return props.branches || [];
    });

    // 监听position数据变化
    watch(() => props.position, (newPosition) => {
      if (newPosition) {
        Object.assign(form, {
          ...newPosition,
          documentId: newPosition.documentId || newPosition.id,
          // 将menu_id字符串转换为数组
          menu_id: newPosition.menu_id ? newPosition.menu_id.split(',').map(id => id.trim()) : [],
          // 确保branch_id是数值类型
          branch_id: newPosition.branch_id ? Number(newPosition.branch_id) : '',
          sort: newPosition.sort || 1,
          level: newPosition.level || 1
        });
      } else {
        resetForm();
      }
    }, { immediate: true });
    
    // 全选权限
    const selectAllPermissions = () => {
      if (props.menus && props.menus.length > 0) {
        form.menu_id = props.menus.map(menu => menu.menu_id);
      }
    };
    
    // 清空权限
    const clearAllPermissions = () => {
      form.menu_id = [];
    };

    // 提交表单
    const onSubmit = async () => {
      try {
        // 验证表单
        if (!formRef.value.validate()) {
          return;
        }

        console.log('准备提交表单 - 原始branch_id:', form.branch_id, '类型:', typeof form.branch_id);

        // 确保branch_id是有效的branch_id值
        // 处理form.branch_id可能是对象的情况，提取其中的branch_id
        let submitBranchId = 0;

        // 类型检查和转换
        if (form.branch_id === undefined || form.branch_id === null) {
          submitBranchId = 0;
          console.warn('branch_id为空，使用默认值0');
        } else if (typeof form.branch_id === 'object') {
          // 如果是对象，提取其中的branch_id属性
          submitBranchId = form.branch_id.branch_id || 0;
          console.log('从branch_id对象中提取branch_id:', submitBranchId);
        } else if (typeof form.branch_id !== 'number') {
          // 如果不是数字，尝试转换
          submitBranchId = Number(form.branch_id);
          // 检查转换后是否为有效数字
          if (isNaN(submitBranchId)) {
            submitBranchId = 0;
            console.warn('branch_id转换失败，使用默认值0');
          }
        } else {
          // 如果已经是数字，直接使用
          submitBranchId = form.branch_id;
        }

        console.log('转换后的branch_id值:', submitBranchId, '类型:', typeof submitBranchId);

        const submitData = {
          position_id: form.position_id || null, // 将code改回position_id
          name: form.name,
          branch_id: submitBranchId, // 使用转换后的branch_id值
          menu_id: form.menu_id ? form.menu_id.join(',') : '', // 确保是逗号分隔的字符串
        };

        console.log('提交的branch_id值:', submitData.branch_id, '类型:', typeof submitData.branch_id);
        console.log('表单中的branch_id原始值:', form.branch_id, '类型:', typeof form.branch_id);

        // 根据参考格式，将数据包装在data对象中
        const formattedData = {
          data: submitData
        };

        console.log('提交数据:', formattedData);

        // 提交API调用，使用axios
        let response;
        if (form.documentId) {
          // 编辑操作
          const url = `${API.USER.POSITION.CREATE}/${form.documentId}`;
          console.log('PUT请求URL:', url);
          response = await axios.put(url, formattedData, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } else {
          // 新增操作
          const url = API.USER.POSITION.CREATE;
          console.log('POST请求URL:', url);
          response = await axios.post(url, formattedData, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }

        console.log('提交成功:', response.data);
        emit('save', response.data.data);
        closeDialog();
      } catch (error) {
        console.error('提交失败:', error);
        if (error.response) {
          console.error('错误响应数据:', error.response.data);
          console.error('错误状态码:', error.response.status);
        } else if (error.request) {
          console.error('没有收到响应:', error.request);
        } else {
          console.error('请求配置错误:', error.message);
        }
        emit('error', error);
      }
    };

    return {
      t,
      dialogVisible,
      form,
      formRef,
      branchOptions,
      saving,
      closeDialog,
      resetForm,
      selectAllPermissions,
      clearAllPermissions,
      onSubmit
    };
  }
});
</script>

<style scoped>
  /* 全屏对话框样式 */
  .full-width {
    width: 100% !important;
  }

  .full-height {
    height: 100% !important;
  }

  /* 表单区域样式 */
  .q-input,
  .q-select {
    margin-bottom: 0;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .q-card-section {
      padding: 16px !important;
    }
  }

  /* 类似 BlogEditDialog 的专业样式 */
  .q-card {
    border-radius: 0 !important;
  }

  .bg-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  }

  .text-primary {
    color: #1976d2 !important;
  }

  /* 表单分组样式 */
  .text-h6 {
    font-weight: 600;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 8px;
  }

  /* 输入框样式优化 */
  .q-field--outlined .q-field__control {
    border-radius: 8px;
  }

  .q-field--outlined .q-field__control:hover {
    border-color: #1976d2;
  }

  /* 按钮样式 */
  .q-btn {
    border-radius: 8px;
    font-weight: 500;
  }

  /* 底部操作栏 */
  .bg-grey-1 {
    border-top: 1px solid #e0e0e0;
  }

  /* 菜单权限选择样式 */
  .menu-permissions-container {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    background-color: #fafafa;
  }

  .menu-permissions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 8px;
  }

  .menu-permission-item {
    background: white;
    border-radius: 6px;
    padding: 8px;
    border: 1px solid #e0e0e0;
    transition: all 0.2s ease;
  }

  .menu-permission-item:hover {
    border-color: #1976d2;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .menu-checkbox {
    width: 100%;
  }

  .menu-checkbox :deep(.q-checkbox__label) {
    word-break: break-word;
    font-size: 14px;
    line-height: 1.4;
  }

  /* 移动设备优化 */
  @media (max-width: 768px) {
    .menu-permissions-grid {
      grid-template-columns: 1fr;
    }
    
    .menu-permission-item {
      padding: 12px;
    }
  }
</style>
