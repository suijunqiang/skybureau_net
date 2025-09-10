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
            {{ user ? t('edit_user') : t('add_user') }}
          </div>
          <div class="text-caption opacity-70">
            {{ user ? t('edit_user_subtitle') || '编辑用户信息和权限' : t('add_user_subtitle') || '创建新的系统用户账号' }}
          </div>
        </div>
        <div class="col-auto">
          <q-btn flat round dense icon="close" @click="closeDialog" />
        </div>
      </q-card-section>

      <!-- 对话框内容 -->
      <q-card-section class="q-pa-md" style="height: calc(100vh - 120px); overflow-y: auto;">
        <q-form ref="form" @submit="onSubmit" class="full-width">
          <!-- 基本信息区域 -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12">
              <div class="text-h6 q-mb-md text-primary">{{ t('basic_info') || '基本信息' }}</div>
            </div>
            
            <!-- 用户名和邮箱 -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.username"
                :label="t('login_name') || '登录名'"
                :placeholder="t('username_placeholder') || '请输入用户名'"
                outlined
                dense
                :rules="[val => !!val || t('field_required')]"
                maxlength="50"
                :disabled="!!user"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.email"
                :label="t('email') || '邮箱'"
                :placeholder="t('email_placeholder') || '请输入邮箱地址'"
                outlined
                dense
                type="email"
                :rules="[val => !!val || t('field_required'), val => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || t('invalid_email'))]"
                maxlength="100"
              />
            </div>
            
            <!-- 真实姓名和手机号 -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.real_name"
                :label="t('real_name') || '真实姓名'"
                :placeholder="t('real_name_placeholder') || '请输入真实姓名'"
                outlined
                dense
                maxlength="50"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.mobile"
                :label="t('mobile') || '手机号'"
                :placeholder="t('mobile_placeholder') || '请输入手机号码'"
                outlined
                dense
                maxlength="20"
              />
            </div>
          </div>

          <!-- 职位信息区域 -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12">
              <div class="text-h6 q-mb-md text-primary">{{ t('position_info') || '职位信息' }}</div>
            </div>
            
            <!-- 职位和部门 -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="formData.position_id"
                :label="t('position') || '职位'"
                :placeholder="t('select_position') || '请选择职位'"
                :options="positions"
                option-value="id"
                :option-label="(opt) => opt.position_name || opt.name || opt.label || JSON.stringify(opt)"
                outlined
                dense
                emit-value
                map-options
                clearable
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="formData.branch_id"
                :label="t('department') || '部门'"
                :placeholder="t('select_department') || '请选择部门'"
                :options="branches"
                option-value="id"
                :option-label="(opt) => opt.branch_name || opt.name || opt.label || JSON.stringify(opt)"
                outlined
                dense
                emit-value
                map-options
                clearable
              />
            </div>
            
            <!-- 状态 -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="formData.is_enabled"
                :label="t('status') || '状态'"
                :placeholder="t('select_status') || '请选择状态'"
                :options="statusOptions"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
          </div>

          <!-- 安全设置区域 -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12">
              <div class="text-h6 q-mb-md text-primary">{{ t('security_settings') || '安全设置' }}</div>
            </div>
            
            <!-- 密码设置 -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.password"
                :label="user ? (t('password') || '密码') + ' (' + (t('leave_blank_to_keep') || '留空保持原密码') + ')' : t('password') || '密码'"
                :placeholder="user ? t('password_optional_placeholder') || '留空则不修改密码' : t('password_placeholder') || '请输入密码'"
                outlined
                dense
                type="password"
                :rules="user ? [] : [val => !!val || t('field_required'), val => val.length >= 6 || t('password_too_short')]"
                maxlength="50"
              />
            </div>
            <div class="col-12 col-md-6" v-if="!user || formData.password">
              <q-input
                v-model="formData.confirmPassword"
                :label="t('confirm_password') || '确认密码'"
                :placeholder="t('confirm_password_placeholder') || '请再次输入密码'"
                outlined
                dense
                type="password"
                :rules="[val => val === formData.password || t('passwords_not_match')]"
                maxlength="50"
              />
            </div>
          </div>

          <!-- 权限设置区域 -->
          <div class="row q-col-gutter-md q-mb-lg" v-if="!user">
            <div class="col-12">
              <div class="text-h6 q-mb-md text-primary">{{ t('permission_settings') || '权限设置' }}</div>
            </div>
            
            <div class="col-12">
              <q-toggle
                v-model="formData.confirmed"
                :label="t('email_confirmed') || '邮箱已验证'"
                color="positive"
                size="md"
              />
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
import { defineComponent, reactive, ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { API } from 'src/api/api.js';

export default defineComponent({
  name: 'UserEditDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      default: null
    },
    users: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:visible', 'save', 'error'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const form = ref(null);
    const positions = ref([]);
    const branches = ref([]);
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

    // 表单数据
    const formData = reactive({
      id: '',
      documentId: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      real_name: '',
      position_id: '',
      branch_id: '',
      mobile: '',
      is_enabled: true,
      confirmed: false
    });

    // 状态选项
    const statusOptions = [
      { label: t('active') || '激活', value: true },
      { label: t('inactive') || '非激活', value: false }
    ];

    // 关闭对话框
    const closeDialog = () => {
      dialogVisible.value = false;
    };

    // 获取职位列表
    const fetchPositions = async () => {
      try {
        const response = await axios.get(API.USER.POSITION.LIST);
        console.log('职位数据结构:', response.data.data);
        positions.value = response.data.data;
      } catch (error) {
        console.error('获取职位数据失败:', error);
      }
    };

    // 获取部门列表
    const fetchBranches = async () => {
      try {
        const response = await axios.get(API.USER.BRANCH.LIST);
        console.log('部门数据结构:', response.data.data);
        branches.value = response.data.data;
      } catch (error) {
        console.error('获取部门数据失败:', error);
      }
    };

    // 重置表单
    const resetForm = () => {
      Object.assign(formData, {
        id: '',
        documentId: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        real_name: '',
        position_id: '',
        branch_id: '',
        mobile: '',
        is_enabled: true
      });
    };

    // 监听用户数据变化，更新表单
    watch(() => props.user, (newUser) => {
      if (newUser) {
        // 确保所有数值类型正确转换
        Object.assign(formData, {
          ...newUser,
          // 确保documentId被正确设置
          documentId: newUser.documentId || newUser.id,
          position_id: newUser.position_id || '',
          branch_id: newUser.branch_id || '',
          is_enabled: newUser.is_enabled !== undefined ? newUser.is_enabled : true,
          // 清空密码字段，避免在编辑时显示
          password: '',
          confirmPassword: ''
        });
      } else {
        resetForm();
      }
    }, { immediate: true });

    // 监听visible变化，当对话框打开时重置表单
    watch(() => props.visible, (newVisible) => {
      if (newVisible && !props.user) {
        resetForm();
      }
    });

    // 表单提交处理
    const onSubmit = async () => {
      if (!form.value) return;

      if (await form.value.validate()) {
        saving.value = true;
        try {
          let response;
          const submitData = {
            ...formData,
            // 移除不需要提交的字段
            documentId: undefined,
            confirmPassword: undefined
          };

          // 如果没有填写密码且是编辑用户，移除password字段
          if (props.user && !submitData.password) {
            delete submitData.password;
          }

          if (props.user) {
            // 编辑用户
            const updateUrl = API.USER.USERS.UPDATE(formData.id);
            console.log("SJQ EDIT USER:", submitData);
            response = await axios.put(updateUrl, submitData, {
              headers: {
                'Content-Type': 'application/json'
              }
            });
          } else {
            // 新增用户 - 移除不需要的字段
            delete submitData.id;
            delete submitData.documentId;
            // 添加role_id字段，值为1
            submitData.role = 1;
            console.log('SJQ 新增用户数据:', submitData);

            response = await axios.post(API.USER.USERS.CREATE, submitData, {
              headers: {
                'Content-Type': 'application/json'
              }
            });
          }

          // 发送保存成功事件
          emit('save', response.data);
          // 关闭对话框
          closeDialog();
        } catch (error) {
          console.error('保存用户数据失败:', error);
          // 发送错误事件
          emit('error', error);
        } finally {
          saving.value = false;
        }
      }
    };

    // 组件挂载时获取职位和部门数据
    onMounted(async () => {
      await Promise.all([fetchPositions(), fetchBranches()]);
    });

    return {
      t,
      dialogVisible,
      form,
      formData,
      positions,
      branches,
      statusOptions,
      saving,
      closeDialog,
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
</style>
