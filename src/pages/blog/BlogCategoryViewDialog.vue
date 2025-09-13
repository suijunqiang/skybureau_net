<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="min-width: 600px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ t('view_category') || '查看类别' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div v-if="category" class="q-gutter-md">
          <div class="row q-gutter-md">
            <div class="col-5">
              <q-field label="类别ID" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ category.category_id }}</div>
                </template>
              </q-field>
            </div>
            <div class="col">
              <q-field :label="t('category_name') || '类别名称'" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ category.b_category_name }}</div>
                </template>
              </q-field>
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col">
              <q-field :label="t('parent_category') || '父类别'" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ parentCategoryName || t('no_parent_category') }}</div>
                </template>
              </q-field>
            </div>
            <div class="col">
              <q-field :label="t('parent_category_id') || '父类别ID'" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ category.parent_category_id || t('not_set') }}</div>
                </template>
              </q-field>
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col">
              <q-field :label="t('created_at') || '创建时间'" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ formatDate(category.createdAt) }}</div>
                </template>
              </q-field>
            </div>
            <div class="col">
              <q-field :label="t('updated_at') || '更新时间'" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ formatDate(category.updatedAt) }}</div>
                </template>
              </q-field>
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col">
              <q-field :label="t('document_id') || '文档ID'" readonly>
                <template v-slot:control>
                  <div class="self-center font-mono text-sm break-all">{{ category.documentId || t('not_set') }}</div>
                </template>
              </q-field>
            </div>
            <div class="col">
              <q-field :label="t('internal_id') || '内部ID'" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ category.id }}</div>
                </template>
              </q-field>
            </div>
          </div>
        </div>
        <div v-else class="text-center text-grey-5 q-py-lg">
          {{ t('no_category_data') || '无类别数据' }}
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="t('close') || '关闭'" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'BlogCategoryViewDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    category: {
      type: Object,
      default: null
    },
    parentCategoryName: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { t } = useI18n();

    // 使用computed函数创建计算属性，用于v-model双向绑定
    const visible = computed({
      get() {
        return props.modelValue;
      },
      set(value) {
        emit('update:modelValue', value);
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

    return {
      t,
      visible,
      formatDate
    };
  }
});
</script>

<style scoped>
  .q-card {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .q-card-section {
    padding: 20px;
  }

  .q-field {
    margin-bottom: 16px;
  }

  .q-field__control {
    background-color: #f8f9fa;
    border-radius: 6px;
  }

  .q-card-actions {
    padding: 16px 20px;
    border-top: 1px solid #e0e0e0;
  }

  /* 响应式调整 */
  @media (max-width: 600px) {
    .q-card {
      min-width: auto !important;
      margin: 10px;
    }
  }
</style>