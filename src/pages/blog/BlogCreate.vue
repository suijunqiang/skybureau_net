<template>
  <div class="page-container full-width full-height">
    <q-card class="full-width full-height shadow-1 no-border-radius">
      <q-card-section class="q-pa-lg full-width">
        <!-- 顶部标题栏 -->
        <div class="row q-mb-lg">
          <div class="col-12">
            <h4 class="text-h5 q-my-none text-weight-medium">{{ t('create_new_document') }}</h4>
          </div>
        </div>

        <!-- 表单内容 -->
        <q-form @submit="handleSubmit" class="full-width form-container">
          <!-- 第一行：文档标题和文档首图URL -->
          <div class="row q-col-gutter-md q-mb-md full-width-row">
            <div class="col-12 col-md-6 input-col">
              <q-input
                v-model="form.title"
                :label="t('document_title')"
                :placeholder="t('document_title_placeholder')"
                outlined
                dense
                class="full-width-input"
                :rules="[val => !!val || t('document_title') + t('field_required')]"
              />
            </div>
            <div class="col-12 col-md-6 input-col">
              <q-input
                v-model="form.coverUrl"
                :label="t('document_cover_url')"
                :placeholder="t('document_cover_url_placeholder')"
                outlined
                dense
                class="full-width-input"
              />
            </div>
          </div>

          <!-- 第二行：文档描述 -->
          <div class="row q-mb-md full-width-row">
            <div class="col-12 editor-col">
              <div class="text-subtitle2 q-mb-sm">{{ t('document_description') }}</div>
              <q-editor
                v-model="form.description"
                :toolbar="editorToolbar"
                :placeholder="t('document_description_placeholder')"
                class="editor-container full-width-editor"
                min-height="150px"
              />
            </div>
          </div>

          <!-- 第三行：文档正文编辑器 -->
          <div class="row q-mb-md full-width-row">
            <div class="col-12 editor-col">
              <div class="text-subtitle2 q-mb-sm">{{ t('document_content') }}</div>
              <q-editor
                v-model="form.content"
                :toolbar="editorToolbar"
                :placeholder="t('document_content_placeholder')"
                class="editor-container full-width-editor"
                min-height="300px"
              />
            </div>
          </div>

          <!-- 第五行：分类、标签、字数统计 -->
          <div class="row q-col-gutter-md q-mb-lg full-width-row">
            <!-- 分类 -->
            <div class="col-12 col-md-4 select-col">
              <q-select
                v-model="form.category"
                :options="categoryOptions"
                :label="t('category')"
                :placeholder="t('category_placeholder')"
                outlined
                dense
                class="full-width-select"
                use-input
                input-debounce="0"
                new-value-mode="add-unique"
                @filter="filterCategories"
                :loading="isLoadingCategories"
                option-label="label"
                option-value="value"
              />
            </div>
            <!-- 标签 -->
            <div class="col-12 col-md-4 select-col">
              <q-select
                v-model="form.tags"
                :options="tagOptions"
                :label="t('tags')"
                :placeholder="t('tags_placeholder')"
                outlined
                dense
                class="full-width-select"
                multiple
                use-input
                use-chips
                input-debounce="0"
                new-value-mode="add-unique"
                @filter="filterTags"
                :loading="isLoadingTags"
                option-label="label"
                option-value="value"
              />
            </div>
            <!-- 统计信息 -->
            <div class="col-12 col-md-4 stats-col">
              <div class="q-pa-md bg-grey-1 rounded-borders stats-container">
                <div class="text-caption text-grey-7">{{ t('reading_time_minutes') }}</div>
                <div class="text-h6 q-mb-xs">{{ readingTime }}</div>
                <div class="text-caption text-grey-7">{{ t('view_count') }}</div>
                <div class="text-h6">{{ form.viewCount || 0 }}</div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="row justify-end">
            <q-btn
              type="submit"
              color="primary"
              :label="t('save')"
              size="md"
              :loading="isSubmitting"
              class="q-px-xl"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTokenStore } from '../../stores/myToken';
import { API } from '../../api/api.js';
import request from '../../utils/request';
import { Notify } from 'quasar';

export default defineComponent({
  name: 'BlogCreate',
  emits: ['goBackToWelcome'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const tokenStore = useTokenStore();
    
    // 表单数据
    const form = ref({
      title: '',
      coverUrl: '',
      description: '',
      content: '',
      category: null,
      tags: [],
      viewCount: 0
    });

    // 加载状态
    const isSubmitting = ref(false);
    const isLoadingCategories = ref(false);
    const isLoadingTags = ref(false);

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

    // 分类选项（从API获取）
    const categoryOptions = ref([]);
    const allCategories = ref([]); // 存储所有分类数据

    // 标签选项（从API获取）
    const tagOptions = ref([]);
    const allTags = ref([]); // 存储所有标签数据

    // 获取分类数据
    const fetchCategories = async () => {
      try {
        isLoadingCategories.value = true;
        console.log('开始获取分类数据, URL:', API.BLOG.B_CATEGRORIES.LIST);
        
        const response = await request.get(API.BLOG.B_CATEGRORIES.LIST);
        console.log('分类数据响应:', response);
        
        if (response.data && response.data.data) {
          allCategories.value = response.data.data;
          // 根据实际API响应结构转换为选项格式
          categoryOptions.value = response.data.data.map(category => ({
            label: category.b_category_name || '未命名分类',
            value: category.category_id,
            ...category // 保留原始数据
          }));
          console.log('分类选项处理完成:', categoryOptions.value);
        } else {
          console.warn('分类数据格式异常:', response.data);
          // 使用默认分类
          categoryOptions.value = [
            { label: '技术分享', value: 'tech' },
            { label: '生活随笔', value: 'life' },
            { label: '学习笔记', value: 'study' },
            { label: '项目总结', value: 'project' },
            { label: '工具推荐', value: 'tools' }
          ];
        }
      } catch (error) {
        console.error('获取分类数据失败:', error);
        // 使用默认分类
        categoryOptions.value = [
          { label: '技术分享', value: 'tech' },
          { label: '生活随笔', value: 'life' },
          { label: '学习笔记', value: 'study' },
          { label: '项目总结', value: 'project' },
          { label: '工具推荐', value: 'tools' }
        ];
      } finally {
        isLoadingCategories.value = false;
      }
    };

    // 获取标签数据
    const fetchTags = async () => {
      try {
        isLoadingTags.value = true;
        console.log('开始获取标签数据, URL:', API.BLOG.B_BLOG_TAGS.LIST);
        
        const response = await request.get(API.BLOG.B_BLOG_TAGS.LIST);
        console.log('标签数据响应:', response);
        
        if (response.data && response.data.data) {
          allTags.value = response.data.data;
          // 根据实际API响应结构转换为选项格式
          // 注意：当前API只返回 b_tag_id，没有标签名称
          // 这里需要根据 b_tag_id 生成标签显示名称或者调用其他API获取标签名称
          tagOptions.value = response.data.data.map(tag => ({
            label: `标签 ${tag.b_tag_id}`, // 临时显示方案，实际应该有标签名称
            value: tag.b_tag_id,
            ...tag // 保留原始数据
          }));
          console.log('标签选项处理完成:', tagOptions.value);
          console.warn('当前标签API只返回ID，建议后端提供标签名称字段');
        } else {
          console.warn('标签数据格式异常:', response.data);
          // 使用默认标签
          tagOptions.value = [
            { label: 'Vue.js', value: 'vue' },
            { label: 'JavaScript', value: 'js' },
            { label: 'CSS', value: 'css' },
            { label: 'Node.js', value: 'nodejs' },
            { label: '前端开发', value: 'frontend' },
            { label: '后端开发', value: 'backend' }
          ];
        }
      } catch (error) {
        console.error('获取标签数据失败:', error);
        // 使用默认标签
        tagOptions.value = [
          { label: 'Vue.js', value: 'vue' },
          { label: 'JavaScript', value: 'js' },
          { label: 'CSS', value: 'css' },
          { label: 'Node.js', value: 'nodejs' },
          { label: '前端开发', value: 'frontend' },
          { label: '后端开发', value: 'backend' }
        ];
      } finally {
        isLoadingTags.value = false;
      }
    };

    // 计算阅读时长（基于内容的字数）
    const readingTime = computed(() => {
      const contentLength = (form.value.content || '').replace(/<[^>]*>/g, '').length;
      const descriptionLength = (form.value.description || '').replace(/<[^>]*>/g, '').length;
      const totalLength = contentLength + descriptionLength;
      // 按每分钟200字计算
      return Math.max(1, Math.round(totalLength / 200));
    });

    // 过滤分类选项
    const filterCategories = (val, update) => {
      update(() => {
        if (val === '') {
          categoryOptions.value = allCategories.value.map(category => ({
            label: category.b_category_name || '未命名分类',
            value: category.category_id,
            ...category
          }));
        } else {
          const needle = val.toLowerCase();
          categoryOptions.value = allCategories.value
            .filter(category => {
              const name = category.b_category_name || '';
              return name.toLowerCase().indexOf(needle) > -1;
            })
            .map(category => ({
              label: category.b_category_name || '未命名分类',
              value: category.category_id,
              ...category
            }));
        }
      });
    };

    // 过滤标签选项
    const filterTags = (val, update) => {
      update(() => {
        if (val === '') {
          tagOptions.value = allTags.value.map(tag => ({
            label: `标签 ${tag.b_tag_id}`,
            value: tag.b_tag_id,
            ...tag
          }));
        } else {
          const needle = val.toLowerCase();
          tagOptions.value = allTags.value
            .filter(tag => {
              const tagLabel = `标签 ${tag.b_tag_id}`;
              return tagLabel.toLowerCase().indexOf(needle) > -1;
            })
            .map(tag => ({
              label: `标签 ${tag.b_tag_id}`,
              value: tag.b_tag_id,
              ...tag
            }));
        }
      });
    };

    // 处理表单提交
    const handleSubmit = async () => {
      try {
        isSubmitting.value = true;

        // 检查token（由request拦截器自动处理，但这里可以做额外检查）
        const token = tokenStore.token;
        if (!token) {
          console.error('未找到token');
          // 可以显示错误提示或跳转到登录页面
          return;
        }

        // 准备提交数据
        const submitData = {
          data: {
            b_title: form.value.title,
            b_first_pic: form.value.coverUrl,
            b_description: form.value.description,
            b_content: form.value.content,
            b_category_id: form.value.category?.value || form.value.category,
            b_read_time: readingTime.value,
            b_views: form.value.viewCount || 0,
            words: (form.value.content || '').replace(/<[^>]*>/g, '').length, // 计算去除HTML标签后的字数
            b_is_published: true, // 默认发布
            b_is_recommend: false, // 默认不推荐
            b_is_appreciation: false, // 默认不开启赞赏
            b_is_comment_enabled: true, // 默认允许评论
            b_is_top: false, // 默认不置顶
            b_password: null, // 默认无密码
            b_user_id: null // 由后端根据token确定用户ID
          }
        };

        console.log('提交文档数据:', submitData);

        // 调用API保存数据
        const response = await request.post(API.BLOG.B_BLOG.CREATE, submitData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('文档保存成功:', response.data);
        
        // 显示成功提示，使用Quasar notify组件，2秒自动关闭
        Notify.create({
          message: t('document_save_success'),
          color: 'positive',
          timeout: 2000
        });
        
        // 返回到欢迎页面
        emit('goBackToWelcome');

      } catch (error) {
        console.error('文档保存失败:', error);
        
        // 显示错误提示，使用Quasar notify组件，3秒自动关闭
        Notify.create({
          message: t('document_save_failed') + '：' + (error.response?.data?.message || error.message || t('unknown_error')),
          color: 'negative',
          timeout: 3000
        });
        
        // 详细错误日志
        if (error.response) {
          console.error('错误响应数据:', error.response.data);
          console.error('错误状态码:', error.response.status);
          console.error('错误头部信息:', error.response.headers);
        } else if (error.request) {
          console.error('没有收到响应:', error.request);
        } else {
          console.error('请求配置错误:', error.message);
        }
      } finally {
        isSubmitting.value = false;
      }
    };

    // 组件挂载时获取数据
    onMounted(async () => {
      console.log('BlogCreate组件已挂载，开始获取数据...');
      await Promise.all([
        fetchCategories(),
        fetchTags()
      ]);
      console.log('数据获取完成');
    });

    return {
      t,
      form,
      isSubmitting,
      isLoadingCategories,
      isLoadingTags,
      editorToolbar,
      categoryOptions,
      tagOptions,
      readingTime,
      filterCategories,
      filterTags,
      handleSubmit
    };
  }
});
</script>

<style scoped>
.page-container {
  width: 100% !important;
  height: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  display: flex;
  flex-direction: column;
  max-width: none !important;
  box-sizing: border-box !important;
}

/* 确保填满父容器 */
.full-width {
  width: 100% !important;
  max-width: none !important;
}

.full-height {
  height: 100% !important;
  min-height: 100% !important;
}

/* 移除卡片的边距和圆角，确保填满整个空间 */
.no-border-radius {
  border-radius: 0 !important;
}

.q-card {
  max-width: none !important;
  width: 100% !important;
}

.q-card-section {
  max-width: none !important;
  width: 100% !important;
  padding: 24px !important;
  box-sizing: border-box !important;
}

/* 编辑器样式 */
.editor-container {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  width: 100%;
}

.editor-container :deep(.q-editor__content) {
  min-height: 200px;
}

/* 统计信息卡片样式 */
.bg-grey-1 {
  background-color: #fafafa;
}

.rounded-borders {
  border-radius: 8px;
}

/* 确保行和列填满宽度 */
.row {
  width: 100%;
  max-width: none !important;
}

/* 响应式调整 */
@media (max-width: 599px) {
  .q-pa-lg {
    padding: 16px;
  }
  
  .q-col-gutter-md > div {
    padding: 8px;
  }
}

/* 确保表单元素间距 */
.q-mb-md {
  margin-bottom: 16px;
}

.q-mb-lg {
  margin-bottom: 24px;
}

.q-mb-sm {
  margin-bottom: 8px;
}

.q-mb-xs {
  margin-bottom: 4px;
}

.q-px-xl {
  padding-left: 32px;
  padding-right: 32px;
}

/* 强制宽度填满 - 最高优先级重写 */
* {
  box-sizing: border-box;
}

/* 表单容器强制全宽 */
.form-container {
  width: 100% !important;
  max-width: none !important;
}

/* 行容器强制全宽 */
.full-width-row {
  width: 100% !important;
  max-width: none !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

/* 列容器强制全宽利用 */
.input-col,
.editor-col,
.select-col,
.stats-col {
  width: 100% !important;
  max-width: none !important;
  padding-left: 8px !important;
  padding-right: 8px !important;
}

/* 输入框和选择框强制全宽 */
.full-width-input,
.full-width-select,
.full-width-editor {
  width: 100% !important;
  max-width: none !important;
}

/* Quasar 组件强制全宽重写 */
.q-field,
.q-input,
.q-select,
.q-editor {
  width: 100% !important;
  max-width: none !important;
}

/* 输入框控制器强制全宽 */
.q-field__control {
  width: 100% !important;
  max-width: none !important;
}

/* 编辑器容器强制全宽 */
.editor-container {
  width: 100% !important;
  max-width: none !important;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

/* 编辑器内容区域 */
.editor-container :deep(.q-editor__content) {
  min-height: 200px;
  width: 100% !important;
}

/* 统计信息容器 */
.stats-container {
  width: 100% !important;
  height: 100%;
}

/* 响应式调整 - 手机端强制全宽 */
@media (max-width: 1023px) {
  .col-md-6,
  .col-md-4 {
    width: 100% !important;
    max-width: 100% !important;
    flex: 0 0 100% !important;
  }
}

/* 桌面端也强制全宽利用 */
@media (min-width: 1024px) {
  .col-md-6 {
    width: 50% !important;
    max-width: 50% !important;
    flex: 0 0 50% !important;
  }
  
  .col-md-4 {
    width: 33.333333% !important;
    max-width: 33.333333% !important;
    flex: 0 0 33.333333% !important;
  }
  
  /* 确保列内的内容也占满宽度 */
  .col-md-6 .q-field,
  .col-md-6 .q-input,
  .col-md-6 .q-select,
  .col-md-4 .q-field,
  .col-md-4 .q-input,
  .col-md-4 .q-select {
    width: 100% !important;
    max-width: none !important;
  }
}

/* 确保按钮区域右对齐但按钮本身不占满宽度 */
.row.justify-end .q-btn {
  width: auto !important;
  min-width: 120px;
}
</style>




