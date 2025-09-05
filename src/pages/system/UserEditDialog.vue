<template>
  <q-dialog v-model="dialogVisible" :maximized="false">
    <q-card class="w-full md:w-4/5 lg:w-4/5 custom-dialog-width">
      <q-card-section>
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-semibold text-center flex-1">{{ user ? $t('edit_user') : $t('add_user') }}</h3>
          <q-btn flat dense round icon="close" @click="closeDialog" color="primary" />
        </div>
      </q-card-section>

      <q-card-section>
        <q-form ref="form" @submit="onSubmit">
          <!-- 用户名 -->
          <q-input
            v-model="formData.username"
            :label="$t('login_name')"
            :rules="[val => !!val || $t('field_required')]"
            dense
            maxlength="50"
            :disabled="!!user"
          />

          <!-- 真实姓名 -->
          <q-input
            v-model="formData.real_name"
            :label="$t('real_name')"
            dense
            maxlength="50"
          />

          <!-- 邮箱 -->
          <q-input
            v-model="formData.email"
            :label="$t('email')"
            type="email"
            :rules="[val => !!val || $t('field_required'), val => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || $t('invalid_email'))]"
            dense
            maxlength="100"
          />

          <!-- 手机号 -->
          <q-input
            v-model="formData.mobile"
            :label="$t('mobile')"
            dense
            maxlength="20"
          />

          <!-- 职位 -->
          <q-select
            v-model="formData.position_id"
            :label="$t('position')"
            :options="positions"
            option-value="id"
            :option-label="(opt) => opt.position_name || opt.name || opt.label || JSON.stringify(opt)"
            dense
            emit-value
            map-options
          />

          <!-- 部门 -->
          <q-select
            v-model="formData.branch_id"
            :label="$t('department')"
            :options="branches"
            option-value="id"
            :option-label="(opt) => opt.branch_name || opt.name || opt.label || JSON.stringify(opt)"
            dense
            emit-value
            map-options
          />

          <!-- 是否启用 -->
          <q-select
            v-model="formData.is_enabled"
            :label="$t('status')"
            :options="statusOptions"
            dense
            emit-value
            map-options
          />

          <!-- 密码（新增用户时显示，编辑用户时可选填） -->
          <div v-if="!user">
            <q-input
              v-model="formData.password"
              :label="$t('password')"
              type="password"
              :rules="[val => !!val || $t('field_required'), val => val.length >= 6 || $t('password_too_short')]"
              dense
              maxlength="50"
            />
          </div>

          <div v-else>
            <q-input
              v-model="formData.password"
              :label="$t('password') + ' (' + $t('leave_blank_to_keep') + ')'"
              type="password"
              dense
              maxlength="50"
            />
          </div>

          <!-- 确认密码 -->
          <div v-if="!user || formData.password">
            <q-input
              v-model="formData.confirmPassword"
              :label="$t('confirm_password')"
              type="password"
              :rules="[val => val === formData.password || $t('passwords_not_match')]"
              dense
              maxlength="50"
            />
          </div>

          <!-- 底部按钮 -->
          <div class="flex justify-end mt-6 gap-2">
            <q-btn :label="$t('cancel')" @click="closeDialog" />
            <q-btn :label="$t('save')" type="submit" color="primary" />
          </div>
        </q-form>
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
      is_enabled: true
    });

    // 状态选项
    const statusOptions = [
      { label: t('active'), value: true },
      { label: t('inactive'), value: false }
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
        }
      }
    };

    // 组件挂载时获取职位和部门数据
    onMounted(async () => {
      await Promise.all([fetchPositions(), fetchBranches()]);
    });

    return {
      dialogVisible,
      form,
      formData,
      positions,
      branches,
      statusOptions,
      closeDialog,
      onSubmit
    };
  }
});
</script>

<style scoped>
  /* 设置标题高度 */
  .q-card-section:first-child {
    padding-bottom: 12px;
  }

  /* 设置标题字号 */
  .q-card-section:first-child h3 {
    font-size: 18px;
  }

  /* 设置输入项目的高度 */
  .q-input,
  .q-select {
    margin-bottom: 16px;
  }

  /* 设置对话框宽度 */
  .custom-dialog-width {
    max-width: 400px;
    width: 90%;
  }
</style>
