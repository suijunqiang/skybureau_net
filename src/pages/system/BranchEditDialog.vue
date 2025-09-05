<template>
  <q-dialog :model-value="visible" @update:model-value="(value) => $emit('update:visible', value)" persistent class="custom-dialog-width">
    <q-card>
      <q-card-section class="custom-header-height">
        <h3 class="text-center m-0">
          {{ branch ? 'EDIT BRANCH' : 'ADD BRANCH' }}
        </h3>
      </q-card-section>
      <q-card-section>
        <q-form ref="formRef" @submit="onSubmit" class="custom-form">
          <!-- 分支ID 字段 -->
          <q-input
            v-model="form.branch_id"
            label="BRANCH ID"
            class="custom-input-height"
            :disabled="!branch"
          />

          <!-- 分支名称字段 -->
          <q-input
            v-model="form.name"
            label="BRANCH NAME"
            required
            :rules="[val => !!val || 'Please input branch name']"
            class="custom-input-height"
          />

          <!-- 分支代码字段 -->
          <q-input
            v-model="form.code"
            label="CODE"
            required
            :rules="[val => !!val || 'Please input branch code']"
            class="custom-input-height"
          />

          <!-- 上级分支选择字段 -->
          <q-select
            v-model="form.parent_id"
            label="PARENT BRANCH"
            placeholder="Select a parent branch"
            :options="parentOptions"
            :option-label="'name'"
            :option-value="'branch_id'"
            :disable="isEditing && form.level === 0"
            class="custom-input-height"
          />

          <!-- 排序字段 -->
          <q-input
            v-model.number="form.sort"
            label="SORT"
            type="number"
            :rules="[val => !!val || 'Please input sort number']"
            class="custom-input-height"
          />

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
  name: 'BranchEditDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    branch: {
      type: Object,
      default: null
    },
    branches: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:visible', 'save', 'error'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const form = reactive({
      branch_id: '',
      name: '',
      code: '',
      parent_id: 0,
      level: 0,
      sort: 0
    });
    const formRef = ref(null);
    const isEditing = computed(() => !!props.branch);

    // 上级分支选项
    const parentOptions = computed(() => {
      let options = [...props.branches];

      if (isEditing.value && props.branch) {
        const getDescendantIds = (branchId) => {
          const ids = [branchId];
          const children = props.branches.filter(b => b.parent_id === branchId);
          children.forEach(child => {
            ids.push(...getDescendantIds(child.branch_id));
          });
          return ids;
        };

        const descendantIds = getDescendantIds(props.branch.branch_id);
        options = options.filter(branch => !descendantIds.includes(branch.branch_id));
      }

      const rootOption = { id: -1, branch_id: 0, name: 'ROOT', code: '0', parent_id: 0, level: 0, sort: 0 };
      return [rootOption, ...options];
    });

    // 监听branch数据变化
    watch(() => props.branch, (newBranch) => {
      if (newBranch) {
        Object.assign(form, {
          ...newBranch,
          parent_id: Number(newBranch.parent_id) || 0,
          level: Number(newBranch.level) || 0,
          sort: Number(newBranch.sort) || 0
        });
      } else {
        Object.assign(form, {
          branch_id: '',
          name: '',
          code: '',
          parent_id: 0,
          level: 0,
          sort: 0
        });
      }
    }, { immediate: true });

    // 关闭对话框
    const close = () => {
      emit('update:visible', false);
    };

    // 提交表单
    const onSubmit = async () => {
      if (!formRef.value) return;

      try {
        const isValid = await formRef.value.validate();
        if (!isValid) return;

        // 处理parent_id，确保只传递branch_id值
        const parentIdValue = typeof form.parent_id === 'object' && form.parent_id !== null ? form.parent_id.branch_id : form.parent_id;
        const submitData = {
          data: {
            name: form.name,
            code: form.code,
            branch_id: form.branch_id, // 添加branch_id字段
            parent_id: Number(parentIdValue) || 0,
            sort: Number(form.sort),
            level: parentIdValue === 0 ? 0 : (props.branches.find(b => b.branch_id === parentIdValue)?.level || 0) + 1
          }
        };

        // 详细调试日志
        console.log('提交数据结构:', submitData);

        let response;
        if (isEditing.value && props.branch) {
          // 编辑模式
          const updateUrl = API.USER.BRANCH.UPDATE(props.branch.documentId || props.branch.id);
          response = await axios.put(updateUrl, submitData, {
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          // 新增模式
          response = await axios.post(API.USER.BRANCH.CREATE, submitData, {
            headers: { 'Content-Type': 'application/json' }
          });
        }

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
      isEditing,
      parentOptions,
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
