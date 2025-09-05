<template>
  <q-dialog :model-value="visible" @update:model-value="(value) => $emit('update:visible', value)" persistent class="custom-dialog-width">
    <q-card>
      <q-card-section class="custom-header-height">
        <h3 class="text-center m-0">
          {{ position ? 'EDIT POSITION' : 'ADD POSITION' }}
        </h3>
      </q-card-section>
      <q-card-section>
        <q-form ref="formRef" @submit="onSubmit" class="custom-form">
          <!-- 职位ID 字段 -->
          <q-input
            v-model="form.position_id"
            label="POSITION ID"
            class="custom-input-height"
            :disabled="!!position"
          />

          <!-- 职位名称字段 -->
          <q-input
            v-model="form.name"
            label="POSITION NAME"
            required
            :rules="[val => !!val || 'Please input position name']"
            class="custom-input-height"
          />

          <!-- 部门选择字段 -->
          <q-select
            v-model="form.branch_id"
            label="BRANCH"
            placeholder="Select a branch"
            :options="branchOptions"
            :option-label="'name'"
            :option-value="'branch_id'"
            required
            :rules="[val => !!val || 'Please select a branch']"
            class="custom-input-height"
          />

          <!-- 菜单权限选择 -->
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">MENU PERMISSIONS</label>
            <div class="bg-gray-50 p-4 rounded-md">
              <div v-for="menu in menus" :key="menu.menu_id" class="mb-2">
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    :value="menu.menu_id"
                    v-model="form.menu_id"
                    class="form-checkbox h-4 w-4 text-primary rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700">{{ menu.name }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- 表单操作按钮 -->
          <div class="flex justify-center mt-6">
            <q-btn-group>
              <q-btn color="negative" label="CANCEL" @click="close" style="margin-right: 8px;" />
              <q-btn color="primary" label="SAVE" type="submit" />
            </q-btn-group>
          </div>
        </q-form>
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
    const formRef = ref(null);

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
      }
    }, { immediate: true });

    // 关闭对话框
    const close = () => {
      emit('update:visible', false);
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
        close();
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
      form,
      formRef,
      branchOptions,
      close,
      onSubmit
    };
  }
});
</script>

<style scoped>
  .custom-dialog-width {
    max-width: 400px;
    width: 90%;
  }

  .custom-header-height {
    padding: 4px 16px;
  }

  .custom-header-height h3 {
    font-size: 1rem;
    margin: 0;
  }

  .custom-input-height .q-field__native {
    min-height: 36px;
  }

  .custom-input-height .q-field__control {
    min-height: 36px;
  }

  .custom-form {
    width: 100%;
  }
</style>
