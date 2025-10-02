<template>
  <q-dialog :model-value="visible" @update:model-value="handleVisibleChange" @hide="handleHide" persistent>
    <q-card style="max-width: 600px; width: 90vw; max-height: 90vh; overflow: hidden;">
      <q-card-section class="q-pa-lg bg-primary text-white">
        <div class="flex justify-between items-center">
          <h2 class="text-h5 q-my-none">
            {{ t('view_news_category') }}
          </h2>
          <q-btn flat round icon="close" text-white @click="closeDialog" />
        </div>
      </q-card-section>

      <q-card-section class="q-pa-lg" style="max-height: 70vh; overflow-y: auto;">
        <!-- 分类基本信息 -->
        <div class="mb-6">
          <!-- 分类名称 -->
          <h1 class="text-2xl font-bold q-mb-4 text-dark">{{ category?.new_category_name || t('untitled') }}</h1>
          
          <!-- 元信息 -->
          <div class="flex flex-wrap items-center text-sm text-grey-6 q-mb-4">
            <span class="q-mr-4">
              <q-icon name="calendar_today" size="16px" class="q-mr-1" /> {{ formatDate(category?.createdAt) }}
            </span>
            <span class="q-mr-4">
              <q-icon name="edit" size="16px" class="q-mr-1" /> {{ formatDate(category?.updatedAt) }}
            </span>
          </div>
        </div>

        <!-- 分类详细信息 -->
        <div class="bg-grey-50 p-4 rounded-lg text-sm text-grey-6 q-mb-6">
          <div class="grid grid-cols-1 gap-2">
            <div><strong>{{ t('category_id') }}:</strong> {{ category?.new_category_id || '-' }}</div>
            <div><strong>{{ t('document_id') }}:</strong> {{ category?.documentId || '-' }}</div>
            <div><strong>{{ t('parent_category_id') }}:</strong> {{ category?.new_parent_category_id === 0 ? t('no_parent') : (category?.new_parent_category_id || '-') }}</div>
            <div><strong>{{ t('created_at') }}:</strong> {{ formatDate(category?.createdAt) }}</div>
            <div><strong>{{ t('updated_at') }}:</strong> {{ formatDate(category?.updatedAt) }}</div>
            <div><strong>{{ t('published_at') }}:</strong> {{ formatDate(category?.publishedAt) }}</div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="q-pa-lg bg-grey-1 flex justify-end">
        <q-btn
          :label="t('close')"
          color="primary"
          @click="closeDialog"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'NewsCategoryViewDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    category: {
      type: Object,
      default: null
    }
  },
  emits: ['update:visible'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const $q = useQuasar();
    
    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // 关闭对话框
    const closeDialog = () => {
      emit('update:visible', false);
    };

    // 处理对话框显示状态变化
    const handleVisibleChange = (value) => {
      emit('update:visible', value);
    };

    // 处理对话框隐藏
    const handleHide = () => {
      // 可以在这里添加清理逻辑
    };

    return {
      t,
      formatDate,
      closeDialog,
      handleVisibleChange,
      handleHide
    };
  }
});
</script>

<style scoped>
/* 对话框样式调整 */
.q-card {
  border-radius: 8px !important;
  overflow: hidden !important;
}

.q-card-section.bg-primary {
  border-radius: 8px 8px 0 0 !important;
}

.q-card-actions.bg-grey-1 {
  border-radius: 0 0 8px 8px !important;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .q-card {
    width: 95vw !important;
    max-width: 95vw !important;
    max-height: 95vh !important;
  }
  
  .q-pa-lg {
    padding: 16px;
  }
}
</style>