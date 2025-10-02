<template>
  <q-dialog :model-value="visible" @update:model-value="handleVisibleChange" @hide="handleHide" persistent>
    <q-card style="max-width: 900px; width: 95vw; max-height: 90vh; overflow: hidden;">
      <q-card-section class="q-pa-lg bg-primary text-white">
        <div class="flex justify-between items-center">
          <h2 class="text-h5 q-my-none">
            {{ t('view_news') }}
          </h2>
          <q-btn flat round icon="close" text-white @click="closeDialog" />
        </div>
      </q-card-section>

      <q-card-section class="q-pa-lg" style="max-height: 70vh; overflow-y: auto;">
        <!-- 新闻头部信息 -->
        <div class="mb-6">
          <!-- 标题 -->
          <h1 class="text-2xl font-bold q-mb-4 text-dark">{{ news?.title || t('untitled') }}</h1>
          
          <!-- 元信息 -->
          <div class="flex flex-wrap items-center text-sm text-grey-6 q-mb-4">
            <span class="q-mr-4">
              <q-icon name="calendar_today" size="16px" class="q-mr-1" /> {{ formatDate(news?.createdAt) }}
            </span>
            <span class="q-mr-4">
              <q-icon name="visibility" size="16px" class="q-mr-1" /> {{ news?.views || 0 }}
            </span>
            <span class="q-mr-4">
              <q-icon name="timer" size="16px" class="q-mr-1" /> {{ news?.read_time || 1 }} {{ t('minutes') }}
            </span>
            <span class="q-mr-4">
              <q-icon name="text_fields" size="16px" class="q-mr-1" /> {{ news?.words || 0 }}
            </span>
          </div>
          
          <!-- 状态标签 -->
          <div class="flex flex-wrap q-mb-4">
            <q-chip
              v-if="news?.is_published"
              color="positive"
              text-color="white"
              label="{{ t('published') }}"
              class="q-mr-2 q-mb-2"
            />
            <q-chip
              v-else
              color="orange"
              text-color="white"
              label="{{ t('draft') }}"
              class="q-mr-2 q-mb-2"
            />
            <q-chip
              v-if="news?.is_recommend"
              color="amber"
              text-color="white"
              label="{{ t('recommended') }}"
              class="q-mr-2 q-mb-2"
              icon="star"
            />
            <q-chip
              v-if="news?.is_top"
              color="negative"
              text-color="white"
              label="{{ t('top') }}"
              class="q-mr-2 q-mb-2"
              icon="vertical_align_top"
            />
          </div>
        </div>

        <!-- 封面图片 -->
        <div v-if="news?.fisrt_pic" class="q-mb-6">
          <q-img
            :src="getImageUrl(news.fisrt_pic)"
            :alt="news.title"
            fit="cover"
            style="width: 100%; max-height: 400px; border-radius: 8px;"
          >
            <template v-slot:error>
              <div class="absolute-full flex flex-center bg-grey-3 text-grey-6">
                <q-icon name="broken_image" size="60px" />
              </div>
            </template>
          </q-img>
        </div>

        <!-- 描述 -->
        <div v-if="news?.description" class="q-mb-6">
          <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <p class="text-blue-800">{{ news.description }}</p>
          </div>
        </div>

        <!-- 正文内容 -->
        <div class="news-content q-mb-6">
          <div v-if="news?.content" v-html="news.content"></div>
          <div v-else class="text-grey-5 text-center py-8">
            {{ t('no_content') }}
          </div>
        </div>

        <!-- 元数据区域 -->
        <div class="bg-grey-50 p-4 rounded-lg text-sm text-grey-6 q-mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div><strong>{{ t('news_id') }}:</strong> {{ news?.id || '-' }}</div>
            <div><strong>{{ t('document_id') }}:</strong> {{ news?.documentId || '-' }}</div>
            <div><strong>{{ t('category_id') }}:</strong> {{ news?.category_id || '-' }}</div>
            <div><strong>{{ t('user_id') }}:</strong> {{ news?.user_id || '-' }}</div>
            <div><strong>{{ t('new_id') }}:</strong> {{ news?.new_id || '-' }}</div>
            <div><strong>{{ t('updated_at') }}:</strong> {{ formatDate(news?.updatedAt) }}</div>
          </div>
        </div>

        <!-- 开关状态显示 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 q-mb-6">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-base">{{ t('appreciation_status') }}</div>
              <div class="text-sm text-grey-5">{{ t('appreciation_status_desc') }}</div>
            </div>
            <q-toggle
              v-model="appreciationStatus"
              color="pink"
              checked-icon="favorite"
              unchecked-icon="favorite_border"
              disabled
            />
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
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { API, BASE_URL } from 'src/api/api.js';
import request from 'src/utils/request.js';

export default defineComponent({
  name: 'NewsViewDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    news: {
      type: Object,
      default: null
    }
  },
  emits: ['update:visible'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const $q = useQuasar();
    
    // 响应式数据
    const appreciationStatus = ref(false);

    // 获取图片URL
    const getImageUrl = (path) => {
      if (!path) return '';
      // 如果是完整URL，直接返回
      if (path.startsWith('http')) {
        return path;
      }
      // 如果是相对路径，拼接base URL
      return `${BASE_URL}${path}`;
    };

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



    // 更新浏览量
    const updateViewCount = async () => {
      if (!props.news?.id) return;
      
      try {
        const url = API.NEWS.NEWS.VIEW(props.news.documentId || props.news.id);
        await request.post(url);
      } catch (error) {
        console.error('更新浏览量失败:', error);
        // 浏览量更新失败不影响用户体验，所以不显示错误提示
      }
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
      // 重置状态
    };

    // 监听新闻数据变化
    watch(() => props.news, (newVal) => {
      if (newVal && props.visible) {
        // 更新开关状态
        appreciationStatus.value = newVal.is_appreciation || false;
        
        // 更新浏览量
        updateViewCount();
      }
    }, { deep: true });

    // 监听visible变化
    watch(() => props.visible, (newVal) => {
      if (newVal && props.news) {
        // 更新开关状态
        appreciationStatus.value = props.news.is_appreciation || false;
        
        // 更新浏览量
        updateViewCount();
      }
    });

    return {
      t,
      appreciationStatus,
      getImageUrl,
      formatDate,
      closeDialog,
      handleHide,
      handleVisibleChange
    };
  }
});
</script>

<style scoped>
/* 新闻内容样式 */
.news-content {
  font-size: 16px;
  line-height: 1.8;
}

.news-content h1, .news-content h2, .news-content h3 {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
}

.news-content h1 { font-size: 1.8em; }
.news-content h2 { font-size: 1.6em; }
.news-content h3 { font-size: 1.4em; }

.news-content p {
  margin-bottom: 1em;
}

.news-content img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 1em 0;
}

.news-content a {
  color: #2196F3;
  text-decoration: none;
}

.news-content a:hover {
  text-decoration: underline;
}

.news-content ul, .news-content ol {
  margin-left: 1.5em;
  margin-bottom: 1em;
}

.news-content ul { list-style-type: disc; }
.news-content ol { list-style-type: decimal; }

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
    width: 98vw !important;
    max-width: 98vw !important;
    max-height: 98vh !important;
  }
  
  .q-pa-lg {
    padding: 16px;
  }
  
  .grid-cols-1.md\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .news-content {
    font-size: 14px;
  }
}
</style>