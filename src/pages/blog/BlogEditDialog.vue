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
            {{ isEditing ? t('edit_blog') : t('add_blog') }}
          </div>
          <div class="text-caption opacity-70">
            {{ isEditing ? t('edit_blog_subtitle') : t('add_blog_subtitle') }}
          </div>
        </div>
        <div class="col-auto">
          <q-btn flat round dense icon="close" @click="closeDialog" />
        </div>
      </q-card-section>

      <!-- 对话框内容 -->
      <q-card-section class="q-pa-md" style="height: calc(100vh - 120px); overflow-y: auto;">
        <q-form @submit="handleSubmit" class="full-width">
          <!-- 基本信息区域 -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12">
              <div class="text-h6 q-mb-md text-primary">{{ t('basic_info') }}</div>
            </div>
            
            <!-- 标题和封面图 -->
            <div class="col-12 col-md-8">
              <q-input
                v-model="form.b_title"
                :label="t('blog_title')"
                :placeholder="t('blog_title_placeholder')"
                outlined
                dense
                :rules="[val => !!val || t('blog_title_required')]"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.b_first_pic"
                :label="t('cover_image_url')"
                :placeholder="t('cover_image_placeholder')"
                outlined
                dense
              />
            </div>
          </div>

          <!-- 内容区域 -->
          <div class="row q-mb-lg">
            <div class="col-12">
              <div class="text-h6 q-mb-md text-primary">{{ t('content_section') }}</div>
            </div>
            
            <!-- 描述 -->
            <div class="col-12 q-mb-md">
              <div class="text-subtitle2 q-mb-sm">{{ t('blog_description') }}</div>
              <q-editor
                v-model="form.b_description"
                :toolbar="editorToolbar"
                :placeholder="t('blog_description_placeholder')"
                min-height="150px"
                class="editor-container"
              />
            </div>
            
            <!-- 正文内容 -->
            <div class="col-12">
              <div class="text-subtitle2 q-mb-sm">{{ t('blog_content') }}</div>
              <q-editor
                v-model="form.b_content"
                :toolbar="editorToolbar"
                :placeholder="t('blog_content_placeholder')"
                min-height="300px"
                class="editor-container"
              />
            </div>
          </div>

          <!-- 设置区域 -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12">
              <div class="text-h6 q-mb-md text-primary">{{ t('blog_settings') }}</div>
            </div>
            
            <!-- 分类和标签 -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.b_category_id"
                :label="t('category_id')"
                :placeholder="t('category_id_placeholder')"
                outlined
                dense
                type="number"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.b_tags"
                :label="t('tags')"
                :placeholder="t('tags_placeholder')"
                outlined
                dense
              />
            </div>
            
            <!-- 阅读时间和密码 -->
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="form.b_read_time"
                :label="t('read_time_minutes')"
                :placeholder="t('read_time_placeholder')"
                outlined
                dense
                type="number"
                min="0"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.b_password"
                :label="t('blog_password')"
                :placeholder="t('blog_password_placeholder')"
                outlined
                dense
                type="password"
              />
            </div>
          </div>

          <!-- 开关设置区域 -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12">
              <div class="text-h6 q-mb-md text-primary">{{ t('publish_settings') }}</div>
            </div>
            
            <div class="col-12 col-sm-6 col-md-4">
              <q-toggle
                v-model="form.b_is_published"
                :label="t('is_published')"
                color="positive"
                size="md"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-toggle
                v-model="form.b_is_recommend"
                :label="t('is_recommend')"
                color="orange"
                size="md"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-toggle
                v-model="form.b_is_top"
                :label="t('is_top')"
                color="red"
                size="md"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-toggle
                v-model="form.b_is_appreciation"
                :label="t('is_appreciation')"
                color="pink"
                size="md"
              />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <q-toggle
                v-model="form.b_is_comment_enabled"
                :label="t('is_comment_enabled')"
                color="blue"
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
          :label="t('cancel')"
          color="grey"
          @click="closeDialog"
          size="md"
        />
        <q-btn
          :label="t('save')"
          color="primary"
          @click="handleSubmit"
          :loading="isSubmitting"
          size="md"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { API } from 'src/api/api.js';
import request from 'src/utils/request.js';

export default defineComponent({
  name: 'BlogEditDialog',
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
  emits: ['update:visible', 'save', 'error'],
  setup(props, { emit }) {
    const { t } = useI18n();
    
    const isSubmitting = ref(false);
    
    // 表单数据
    const form = ref({
      b_title: '',
      b_first_pic: '',
      b_description: '',
      b_content: '',
      b_category_id: '',
      b_tags: '',
      b_read_time: 0,
      b_views: 0,
      words: 0,
      b_is_published: true,
      b_is_recommend: false,
      b_is_appreciation: false,
      b_is_comment_enabled: true,
      b_is_top: false,
      b_password: null,
      b_user_id: null
    });

    // 编辑器工具栏配置
    const editorToolbar = [
      ['bold', 'italic', 'underline', 'strike'],
      ['subscript', 'superscript'],
      ['quote', 'unordered', 'ordered'],
      ['link', 'image'],
      ['code', 'code-block'],
      ['undo', 'redo'],
      ['fullscreen']
    ];

    // 对话框可见状态
    const dialogVisible = computed({
      get: () => props.visible,
      set: (value) => emit('update:visible', value)
    });

    // 是否为编辑模式
    const isEditing = computed(() => {
      return props.blog && props.blog.id;
    });

    // 重置表单
    const resetForm = () => {
      form.value = {
        b_title: '',
        b_first_pic: '',
        b_description: '',
        b_content: '',
        b_category_id: '',
        b_tags: '',
        b_read_time: 0,
        b_views: 0,
        words: 0,
        b_is_published: true,
        b_is_recommend: false,
        b_is_appreciation: false,
        b_is_comment_enabled: true,
        b_is_top: false,
        b_password: null,
        b_user_id: null
      };
    };

    // 监听blog prop变化，初始化表单
    watch(() => props.blog, (newBlog) => {
      if (newBlog) {
        // 编辑模式：填充现有数据
        Object.keys(form.value).forEach(key => {
          if (newBlog[key] !== undefined) {
            form.value[key] = newBlog[key];
          }
        });
      } else {
        // 新增模式：重置表单
        resetForm();
      }
    }, { immediate: true });

    // 计算字数
    const calculateWords = () => {
      const contentText = (form.value.b_content || '').replace(/<[^>]*>/g, '');
      const descriptionText = (form.value.b_description || '').replace(/<[^>]*>/g, '');
      return contentText.length + descriptionText.length;
    };

    // 处理表单提交
    const handleSubmit = async () => {
      try {
        isSubmitting.value = true;

        // 计算字数和阅读时间
        const words = calculateWords();
        const readTime = Math.max(1, Math.round(words / 200)); // 每分钟200字

        // 准备提交数据
        const submitData = {
          data: {
            ...form.value,
            words: words,
            b_read_time: form.value.b_read_time || readTime,
            b_views: form.value.b_views || 0
          }
        };

        console.log('提交博客数据:', submitData);

        let response;
        if (isEditing.value) {
          // 更新博客
          const updateUrl = API.BLOG.B_BLOG.UPDATE(props.blog.documentId || props.blog.id);
          response = await request.put(updateUrl, submitData);
        } else {
          // 创建博客
          response = await request.post(API.BLOG.B_BLOG.CREATE, submitData);
        }

        console.log('博客保存成功:', response.data);
        
        // 发送保存成功事件
        emit('save', response.data.data);
        
        // 关闭对话框
        closeDialog();

      } catch (error) {
        console.error('博客保存失败:', error);
        
        // 发送错误事件
        emit('error', error);
      } finally {
        isSubmitting.value = false;
      }
    };

    // 关闭对话框
    const closeDialog = () => {
      dialogVisible.value = false;
      // 延迟重置表单，避免关闭动画时看到表单重置
      setTimeout(() => {
        if (!isEditing.value) {
          resetForm();
        }
      }, 300);
    };

    return {
      t,
      form,
      isSubmitting,
      editorToolbar,
      dialogVisible,
      isEditing,
      handleSubmit,
      closeDialog
    };
  }
});
</script>

<style scoped>
.editor-container {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.editor-container :deep(.q-editor__content) {
  min-height: 150px;
}

/* 确保全屏对话框的表单元素正确显示 */
.q-dialog .q-card {
  display: flex;
  flex-direction: column;
}

.q-dialog .q-card-section {
  flex: 1;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .q-pa-md {
    padding: 8px;
  }
}
</style>