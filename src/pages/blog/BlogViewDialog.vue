<template>
  <q-dialog
    v-model="dialogVisible"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="full-width full-height">
      <!-- 对话框头部 -->
      <q-card-section class="row items-center q-pb-none bg-grey-9 text-white">
        <div class="col">
          <div class="text-h6">
            {{ t('view_blog') }}
          </div>
          <div class="text-caption opacity-70">
            {{ blog?.b_title || t('untitled') }}
          </div>
        </div>
        <div class="col-auto q-gutter-sm">
          <q-btn
            flat
            round
            dense
            icon="edit"
            @click="editBlog"
            :tooltip="t('edit')"
          />
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="closeDialog"
          />
        </div>
      </q-card-section>

      <!-- 对话框内容 -->
      <q-card-section class="q-pa-md" style="height: calc(100vh - 80px); overflow-y: auto;">
        <div v-if="blog" class="blog-content">
          <!-- 博客头部信息 -->
          <div class="blog-header q-mb-lg">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <h1 class="text-h4 q-my-none">{{ blog.b_title || t('untitled') }}</h1>
              </div>
              <div class="col-12">
                <div class="row items-center q-gutter-md text-grey-6">
                  <div class="flex items-center q-gutter-xs">
                    <q-icon name="schedule" size="sm" />
                    <span>{{ formatDate(blog.createdAt) }}</span>
                  </div>
                  <div class="flex items-center q-gutter-xs">
                    <q-icon name="visibility" size="sm" />
                    <span>{{ blog.b_views || 0 }} {{ t('views') }}</span>
                  </div>
                  <div class="flex items-center q-gutter-xs">
                    <q-icon name="access_time" size="sm" />
                    <span>{{ blog.b_read_time || 0 }} {{ t('minutes') }}</span>
                  </div>
                  <div class="flex items-center q-gutter-xs">
                    <q-icon name="text_fields" size="sm" />
                    <span>{{ blog.words || 0 }} {{ t('words') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 封面图片 - 优先显示b_first_pic，再显示b_blog_picture_profile -->
          <div v-if="getImageUrl(blog)" class="blog-cover q-mb-lg">
            <div class="text-h6 q-mb-md text-primary">{{ t('cover') }}</div>
            <q-img
              :src="getImageUrl(blog, 'small')"
              :alt="blog.b_title"
              style="max-height: 400px"
              class="rounded-borders"
              fit="cover"
            >
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-grey-3 text-grey-6">
                  <q-icon name="broken_image" size="48px" />
                </div>
              </template>
            </q-img>
          </div>

          <!-- 博客状态标签 -->
          <div class="blog-status q-mb-lg">
            <div class="row q-gutter-sm">
              <q-chip
                :color="blog.b_is_published ? 'positive' : 'orange'"
                text-color="white"
                :label="blog.b_is_published ? t('published') : t('draft')"
                icon="public"
              />
              <q-chip
                v-if="blog.b_is_recommend"
                color="amber"
                text-color="white"
                :label="t('recommended')"
                icon="star"
              />
              <q-chip
                v-if="blog.b_is_top"
                color="red"
                text-color="white"
                :label="t('pinned')"
                icon="push_pin"
              />
              <q-chip
                v-if="blog.b_password"
                color="purple"
                text-color="white"
                :label="t('password_protected')"
                icon="lock"
              />
              <q-chip
                :color="blog.b_is_comment_enabled ? 'blue' : 'grey'"
                text-color="white"
                :label="blog.b_is_comment_enabled ? t('comments_enabled') : t('comments_disabled')"
                icon="comment"
              />
              <q-chip
                v-if="blog.b_is_appreciation"
                color="pink"
                text-color="white"
                :label="t('appreciation_enabled')"
                icon="favorite"
              />
            </div>
          </div>

          <!-- 原来的封面图片区域已移动到上面 -->

          <!-- 博客描述 -->
          <div v-if="blog.b_description && blog.b_description !== 'NULL'" class="blog-description q-mb-lg">
            <div class="text-h6 q-mb-md text-primary">{{ t('description') }}</div>
            <div class="content-html" v-html="blog.b_description"></div>
          </div>

          <!-- 博客正文 -->
          <div v-if="blog.b_content && blog.b_content !== 'NULL'" class="blog-content-main">
            <div class="text-h6 q-mb-md text-primary">{{ t('content') }}</div>
            <div class="content-html" v-html="blog.b_content"></div>
          </div>

          <!-- 博客元数据 -->
          <div class="blog-metadata q-mt-xl q-pt-lg border-top">
            <div class="text-h6 q-mb-md text-primary">{{ t('metadata') }}</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-list dense>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ t('blog_id') }}</q-item-label>
                      <q-item-label>{{ blog.blog_id || blog.id }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ t('serial_number') }}</q-item-label>
                      <q-item-label>{{ blog.serialNum || '-' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ t('category_id') }}</q-item-label>
                      <q-item-label>{{ blog.b_category_id || '-' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ t('tags') }}</q-item-label>
                      <q-item-label>{{ blog.b_tags || '-' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
              <div class="col-12 col-md-6">
                <q-list dense>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ t('created_at') }}</q-item-label>
                      <q-item-label>{{ formatDate(blog.createdAt) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ t('updated_at') }}</q-item-label>
                      <q-item-label>{{ formatDate(blog.updatedAt) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ t('published_at') }}</q-item-label>
                      <q-item-label>{{ formatDate(blog.publishedAt) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ t('user_id') }}</q-item-label>
                      <q-item-label>{{ blog.b_user_id || '-' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="flex flex-center full-height">
          <div class="text-center text-grey-6">
            <q-icon name="article" size="64px" class="q-mb-md" />
            <div>{{ t('no_blog_selected') }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { BASE_URL } from 'src/api/api.js';

export default defineComponent({
  name: 'BlogViewDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    blog: {
      type: Object,
      default: null
    }
  },
  emits: ['update:visible', 'edit'],
  setup(props, { emit }) {
    const { t } = useI18n();

    // 获取图片URL的辅助函数 - 修正字段处理逻辑
    const getImageUrl = (blog, format = 'thumbnail') => {
      if (!blog) return null;
      
      // 1. 优先尝试Current Profile Picture (b_first_pic)，但如果为null则跳过
      if (blog.b_first_pic !== null && blog.b_first_pic && blog.b_first_pic.trim() !== '') {
        // 如果是完整URL，直接返回
        if (blog.b_first_pic.startsWith('http')) {
          return blog.b_first_pic;
        }
        // 如果是相对路径，拼接base URL
        return `${BASE_URL}${blog.b_first_pic}`;
      }
      
      // 2. 如果b_first_pic为null或空，使用b_blog_picture_profile中的url字段
      const blogPictureProfile = blog.b_blog_picture_profile;
      if (!blogPictureProfile) return null;
      
      // 关键修正：当b_first_pic为null时，直接使用url字段显示图片
      if (blogPictureProfile.url) {
        return `${BASE_URL}${blogPictureProfile.url}`;
      }
      
      // 备用：如果url字段也没有，尝试使用previewURL
      if (blogPictureProfile.previewURL && blogPictureProfile.previewURL !== null) {
        return `${BASE_URL}${blogPictureProfile.previewURL}`;
      }
      
      // 如果有指定格式的图片，使用它
      if (blogPictureProfile.formats && blogPictureProfile.formats[format]) {
        return `${BASE_URL}${blogPictureProfile.formats[format].url}`;
      }
      
      // 如果没有指定格式，尝试使用小尺寸图片
      if (blogPictureProfile.formats && blogPictureProfile.formats.small) {
        return `${BASE_URL}${blogPictureProfile.formats.small.url}`;
      }
      
      // 如果没有小尺寸图片，尝试使用缩略图
      if (blogPictureProfile.formats && blogPictureProfile.formats.thumbnail) {
        return `${BASE_URL}${blogPictureProfile.formats.thumbnail.url}`;
      }
      
      return null;
    };

    // 对话框可见状态
    const dialogVisible = computed({
      get: () => props.visible,
      set: (value) => emit('update:visible', value)
    });

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

    // 编辑博客
    const editBlog = () => {
      emit('edit', props.blog);
      closeDialog();
    };

    // 关闭对话框
    const closeDialog = () => {
      dialogVisible.value = false;
    };

    return {
      t,
      dialogVisible,
      formatDate,
      editBlog,
      closeDialog,
      getImageUrl
    };
  }
});
</script>

<style scoped>
.blog-content {
  max-width: 800px;
  margin: 0 auto;
}

.blog-header h1 {
  line-height: 1.2;
  word-break: break-word;
}

.blog-status {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 16px;
}

.content-html {
  line-height: 1.6;
  font-size: 16px;
}

.content-html :deep(p) {
  margin-bottom: 16px;
}

.content-html :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.content-html :deep(blockquote) {
  border-left: 4px solid #1976d2;
  padding-left: 16px;
  margin: 16px 0;
  color: #666;
  font-style: italic;
}

.content-html :deep(code) {
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.content-html :deep(pre) {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
}

.content-html :deep(ul), 
.content-html :deep(ol) {
  padding-left: 24px;
  margin-bottom: 16px;
}

.content-html :deep(li) {
  margin-bottom: 8px;
}

.border-top {
  border-top: 1px solid #e0e0e0;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .blog-content {
    max-width: 100%;
  }
  
  .q-pa-md {
    padding: 8px;
  }
}
</style>