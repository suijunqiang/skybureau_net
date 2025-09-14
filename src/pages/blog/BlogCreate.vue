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
                class="full-width-input"
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
                class="full-width-input"
              />
            </div>

            <!-- 图片上传区域 -->
            <div class="col-12">
              <div class="text-subtitle2 q-mb-sm">{{ t('upload_cover_image') }}</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-file
                    v-model="selectedFile"
                    :label="t('select_image_file')"
                    outlined
                    dense
                    accept="image/*"
                    max-file-size="5242880"
                    @update:model-value="onFileSelected"
                    @rejected="onFileRejected"
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_file" />
                    </template>
                  </q-file>
                </div>
                <div class="col-12 col-md-6">
                  <q-btn
                    :label="t('upload_image')"
                    color="primary"
                    icon="cloud_upload"
                    @click="uploadImage"
                    :loading="isUploading"
                    :disable="!selectedFile"
                    size="md"
                  />
                </div>
              </div>
              <div class="text-caption text-grey-6 q-mt-xs">
                {{ t('upload_image_hint') }}
              </div>
            </div>

            <!-- 封面图片预览 -->
            <div v-if="getImageUrl(form, null)" class="col-12">
              <div class="text-subtitle2 q-mb-sm">{{ t('cover') }}</div>
              <q-img
                :src="getImageUrl(form, null, 'small')"
                :alt="form.b_title"
                style="max-height: 200px; max-width: 300px"
                class="rounded-borders q-mb-md"
                fit="contain"
              >
                <template v-slot:error>
                  <div class="absolute-full flex flex-center bg-grey-3 text-grey-6">
                    <q-icon name="broken_image" size="32px" />
                  </div>
                </template>
              </q-img>
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
                class="editor-container full-width-editor"
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
                class="editor-container full-width-editor"
              />
            </div>
          </div>

          <!-- 设置区域 -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12">
              <div class="text-h6 q-mb-md text-primary">{{ t('blog_settings') }}</div>
            </div>

            <!-- 分类选择 -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.b_category_id"
                :options="categoryOptions"
                :label="t('category')"
                :placeholder="t('select_category_placeholder')"
                outlined
                dense
                emit-value
                map-options
                option-value="category_id"
                option-label="b_category_name"
                clearable
                :loading="isLoadingCategories"
                class="full-width-select"
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
                class="full-width-input"
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
                class="full-width-input"
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

          <!-- 统计信息 -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12">
              <div class="text-h6 q-mb-md text-primary">{{ t('statistics') }}</div>
            </div>
            <div class="col-12 col-md-4">
              <div class="q-pa-md bg-grey-1 rounded-borders stats-container">
                <div class="text-caption text-grey-7">{{ t('reading_time_minutes') }}</div>
                <div class="text-h6 q-mb-xs">{{ readingTime }}</div>
                <div class="text-caption text-grey-7">{{ t('view_count') }}</div>
                <div class="text-h6">{{ form.b_views || 0 }}</div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="row justify-end q-gutter-sm">
            <q-btn
              flat
              :label="t('cancel')"
              color="grey"
              @click="() => emit('goBackToWelcome')"
              size="md"
            />
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
import { API, BASE_URL } from '../../api/api.js';
import request from '../../utils/request';
import { Notify } from 'quasar';

export default defineComponent({
  name: 'BlogCreate',
  emits: ['goBackToWelcome'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const tokenStore = useTokenStore();

    // 表单数据 - 匹配 BlogEditDialog 的字段结构
    const form = ref({
      b_title: '',
      b_first_pic: '',
      b_description: '',
      b_content: '',
      b_category_id: 0, // 设置默认值为 0
      b_read_time: 0,
      b_views: 0,
      words: 0,
      b_is_published: true,
      b_is_recommend: false,
      b_is_appreciation: false,
      b_is_comment_enabled: true,
      b_is_top: false,
      b_password: null,
      b_user_id: null,
      b_blog_picture_profile: null // 存储图片的 ID
    });

    // 加载状态
    const isSubmitting = ref(false);
    const isLoadingCategories = ref(false);
    const selectedFile = ref(null);
    const isUploading = ref(false);
    const categories = ref([]);
    const loadingCategories = ref(false);

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

    // 分类选项计算属性
    const categoryOptions = computed(() => {
      return categories.value.map(category => ({
        label: category.b_category_name || `Category ${category.category_id}`,
        value: category.category_id,
        category_id: category.category_id,
        b_category_name: category.b_category_name
      }));
    });

    // 获取分类列表
    const fetchCategories = async () => {
      try {
        loadingCategories.value = true;
        const response = await request.get(API.BLOG.B_CATEGORIES.LIST);
        if (response.data && response.data.data) {
          categories.value = response.data.data;
          console.log('分类数据加载成功:', categories.value);
        }
      } catch (error) {
        console.error('获取分类列表失败:', error);
      } finally {
        loadingCategories.value = false;
      }
    };

    // 获取图片URL的辅助函数
    const getImageUrl = (formData, blogData, format = 'thumbnail') => {
      // 1. 优先尝试Current Profile Picture (b_first_pic) 从表单数据
      if (formData && formData.b_first_pic !== null && formData.b_first_pic && formData.b_first_pic.trim() !== '') {
        // 如果是完整URL，直接返回
        if (formData.b_first_pic.startsWith('http')) {
          return formData.b_first_pic;
        }
        // 如果是相对路径，拼接base URL
        return `${BASE_URL}${formData.b_first_pic}`;
      }

      // 2. 如果表单中的Current Profile Picture为空，尝试从原始博客数据获取
      if (blogData && blogData.b_first_pic !== null && blogData.b_first_pic && blogData.b_first_pic.trim() !== '') {
        if (blogData.b_first_pic.startsWith('http')) {
          return blogData.b_first_pic;
        }
        return `${BASE_URL}${blogData.b_first_pic}`;
      }

      // 3. 如枟b_first_pic都为null或空，使用b_blog_picture_profile中的url字段
      let blogPictureProfile = null;
      if (formData && formData.b_blog_picture_profile) {
        blogPictureProfile = formData.b_blog_picture_profile;
      } else if (blogData && blogData.b_blog_picture_profile) {
        blogPictureProfile = blogData.b_blog_picture_profile;
      }

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

    // 计算阅读时长（基于内容的字数）
    const readingTime = computed(() => {
      const contentLength = (form.value.b_content || '').replace(/<[^>]*>/g, '').length;
      const descriptionLength = (form.value.b_description || '').replace(/<[^>]*>/g, '').length;
      const totalLength = contentLength + descriptionLength;
      // 按每分钟200字计算
      return Math.max(1, Math.round(totalLength / 200));
    });



    // 计算字数
    const calculateWords = () => {
      const contentText = (form.value.b_content || '').replace(/<[^>]*>/g, '');
      const descriptionText = (form.value.b_description || '').replace(/<[^>]*>/g, '');
      return contentText.length + descriptionText.length;
    };

    // 文件选择处理
    const onFileSelected = (file) => {
      console.log('选择的文件:', file);
    };

    // 文件拒绝处理
    const onFileRejected = (rejectedEntries) => {
      console.log('文件被拒绝:', rejectedEntries);
      Notify.create({
        message: t('file_upload_rejected'),
        color: 'negative',
        timeout: 3000
      });
    };

    // 上传图片
    const uploadImage = async () => {
      console.log('上传函数被调用');

      if (!selectedFile.value) {
        console.log('没有选择文件');
        Notify.create({
          message: t('please_select_file'),
          color: 'warning',
          timeout: 3000
        });
        return;
      }

      try {
        isUploading.value = true;
        console.log('开始上传流程...');

        // 创建 FormData 对象
        const formData = new FormData();
        formData.append('files', selectedFile.value);

        console.log('上传文件信息:');
        console.log('- 文件名:', selectedFile.value.name);
        console.log('- 文件大小:', selectedFile.value.size);
        console.log('- 文件类型:', selectedFile.value.type);
        console.log('- API地址:', API.UPLOAD);

        // 检查 FormData 内容
        console.log('FormData 条目:');
        for (let [key, value] of formData.entries()) {
          console.log(`- ${key}:`, value);
        }

        // 发送上传请求
        console.log('发送 POST 请求到:', API.UPLOAD);
        const response = await request.post(API.UPLOAD, formData, {
          headers: {
            // 不设置 Content-Type，让浏览器自动处理 multipart/form-data
          },
          timeout: 30000 // 30秒超时
        });

        console.log('上传响应状态:', response.status);
        console.log('上传响应数据:', response.data);

        // 检查响应格式
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const uploadedFile = response.data[0];
          console.log('解析上传文件:', uploadedFile);

          // 修改逻辑：只保存图片的 id 到 b_blog_picture_profile 字段
          if (uploadedFile.id) {
            form.value.b_blog_picture_profile = uploadedFile.id;
            console.log('图片上传成功，保存图片ID到 b_blog_picture_profile:', uploadedFile.id);
          } else {
            console.error('上传文件缺少 id 字段:', uploadedFile);
            throw new Error('上传文件响应缺少 id 字段');
          }

          Notify.create({
            message: t('upload_success'),
            color: 'positive',
            timeout: 2000
          });
        } else {
          console.error('上传响应格式异常:', response.data);
          throw new Error('上传响应格式异常');
        }

      } catch (error) {
        console.error('图片上传失败:', error);

        let errorMessage = t('upload_failed');
        if (error.response) {
          console.error('错误响应数据:', error.response.data);
          console.error('错误状态码:', error.response.status);
          errorMessage += `：${error.response.data?.message || error.response.statusText}`;
        } else if (error.request) {
          console.error('没有收到响应:', error.request);
          errorMessage += '：网络错误或服务器无响应';
        } else {
          console.error('请求配置错误:', error.message);
          errorMessage += `：${error.message}`;
        }

        Notify.create({
          message: errorMessage,
          color: 'negative',
          timeout: 5000
        });
      } finally {
        isUploading.value = false;
      }
    };

    // 处理表单提交
    const handleSubmit = async () => {
      try {
        isSubmitting.value = true;

        // 检查token（由request拦截器自动处理，但这里可以做额外检查）
        const token = tokenStore.token;
        if (!token) {
          console.error('未找到token');
          Notify.create({
            message: t('login_required'),
            color: 'negative',
            timeout: 3000
          });
          return;
        }

        // 计算字数和阅读时间
        const words = calculateWords();
        const readTime = Math.max(1, Math.round(words / 200)); // 每分钟200字

        // 准备提交数据 - 使用与 BlogEditDialog 相同的数据结构
        const submitData = {
          data: {
            b_title: form.value.b_title,
            b_first_pic: form.value.b_first_pic,
            b_description: form.value.b_description,
            b_content: form.value.b_content,
            b_category_id: form.value.b_category_id,
            b_read_time: form.value.b_read_time || readTime,
            b_views: form.value.b_views || 0,
            words: words,
            b_is_published: form.value.b_is_published,
            b_is_recommend: form.value.b_is_recommend,
            b_is_appreciation: form.value.b_is_appreciation,
            b_is_comment_enabled: form.value.b_is_comment_enabled,
            b_is_top: form.value.b_is_top,
            b_password: form.value.b_password,
            b_user_id: form.value.b_user_id,
            b_blog_picture_profile: form.value.b_blog_picture_profile
          }
        };

        console.log('提交博客数据:', submitData);

        // 调用API保存数据
        const response = await request.post(API.BLOG.B_BLOG.CREATE, submitData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('博客保存成功:', response.data);

        // 显示成功提示
        Notify.create({
          message: t('document_save_success'),
          color: 'positive',
          timeout: 2000
        });

        // 返回到欢迎页面
        emit('goBackToWelcome');

      } catch (error) {
        console.error('博客保存失败:', error);

        // 显示错误提示
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
      await fetchCategories();
      console.log('数据获取完成');
    });

    return {
      t,
      form,
      isSubmitting,
      isLoadingCategories: loadingCategories,
      editorToolbar,
      categoryOptions,
      readingTime,
      handleSubmit,
      selectedFile,
      isUploading,
      onFileSelected,
      onFileRejected,
      uploadImage,
      getImageUrl
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




