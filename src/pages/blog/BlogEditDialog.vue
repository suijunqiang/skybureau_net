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
            <div v-if="getImageUrl(form, isEditing ? blog : null)" class="col-12">
              <div class="text-subtitle2 q-mb-sm">{{ t('cover') }}</div>
              <q-img
                :src="getImageUrl(form, isEditing ? blog : null, 'small')"
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
                :loading="loadingCategories"
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
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { API, BASE_URL } from 'src/api/api.js';
import request from 'src/utils/request.js';
import { Notify } from 'quasar';

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
    const selectedFile = ref(null);
    const isUploading = ref(false);
    const categories = ref([]);
    const loadingCategories = ref(false);

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

    // 获取图片URL的辅助函数 - 修正字段处理逻辑
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

      // 3. 如果b_first_pic都为null或空，使用b_blog_picture_profile中的url字段
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

    // 表单数据 - 移除 b_tags 字段
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
      b_blog_picture_profile: null // 现在存储图片的 ID，而不是完整的图片对象
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

    // 重置表单 - 移除 b_tags 字段
    const resetForm = () => {
      form.value = {
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
        b_blog_picture_profile: null // 现在存储图片的 ID，而不是完整的图片对象
      };
      // 清空上传相关状态
      selectedFile.value = null;
      isUploading.value = false;
    };

    // 监听blog prop变化，初始化表单
    watch(() => props.blog, (newBlog) => {
      console.log('博客数据变化:', newBlog);
      if (newBlog) {
        // 编辑模式：填充现有数据
        Object.keys(form.value).forEach(key => {
          if (newBlog[key] !== undefined) {
            form.value[key] = newBlog[key];
            console.log(`设置字段 ${key}:`, newBlog[key]);
          } else {
            console.log(`博客数据中缺少字段: ${key}`);
          }
        });
        // 保持 b_blog_picture_profile 的引用（现在可能是 ID 或对象）
        if (newBlog.b_blog_picture_profile !== undefined) {
          // 如果是对象格式，提取 ID；如果已经是 ID，直接使用
          if (typeof newBlog.b_blog_picture_profile === 'object' && newBlog.b_blog_picture_profile !== null) {
            form.value.b_blog_picture_profile = newBlog.b_blog_picture_profile.id || newBlog.b_blog_picture_profile;
            console.log('设置 b_blog_picture_profile （从对象提取ID）:', form.value.b_blog_picture_profile);
          } else {
            form.value.b_blog_picture_profile = newBlog.b_blog_picture_profile;
            console.log('设置 b_blog_picture_profile （直接使用ID）:', newBlog.b_blog_picture_profile);
          }
        }
        console.log('编辑模式表单数据:', form.value);
      } else {
        // 新增模式：重置表单
        console.log('新增模式，重置表单');
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

        // 准备提交数据 - 确保不包含 b_tags 字段
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
      // 清空上传相关状态
      selectedFile.value = null;
      isUploading.value = false;
      // 延迟重置表单，避免关闭动画时看到表单重置
      setTimeout(() => {
        if (!isEditing.value) {
          resetForm();
        }
      }, 300);
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

          // 清空选择的文件
          selectedFile.value = null;

          Notify.create({
            message: t('upload_success'),
            color: 'positive',
            timeout: 3000
          });

        } else if (response.data && !Array.isArray(response.data)) {
          // 如果响应不是数组格式，尝试直接使用
          console.log('响应不是数组格式，尝试直接使用:', response.data);

          // 修改逻辑：只保存图片的 id
          if (response.data.id) {
            form.value.b_blog_picture_profile = response.data.id;
            console.log('图片上传成功，保存图片ID到 b_blog_picture_profile:', response.data.id);
          } else {
            console.error('上传文件缺少 id 字段:', response.data);
            throw new Error('上传文件响应缺少 id 字段');
          }

          selectedFile.value = null;

          Notify.create({
            message: t('upload_success'),
            color: 'positive',
            timeout: 3000
          });
        } else {
          console.error('上传响应格式错误:', response.data);
          throw new Error('上传响应格式错误: ' + JSON.stringify(response.data));
        }

      } catch (error) {
        console.error('上传文件失败:', error);

        if (error.response) {
          console.error('响应错误:');
          console.error('- 状态码:', error.response.status);
          console.error('- 状态文本:', error.response.statusText);
          console.error('- 响应数据:', error.response.data);
          console.error('- 响应头:', error.response.headers);
        } else if (error.request) {
          console.error('请求错误:', error.request);
          console.error('没有收到响应');
        } else {
          console.error('请求设置错误:', error.message);
        }

        Notify.create({
          message: t('upload_failed') + ': ' + (error.response?.data?.error?.message || error.message || t('unknown_error')),
          color: 'negative',
          timeout: 5000
        });
      } finally {
        console.log('上传流程结束');
        isUploading.value = false;
      }
    };

    // 监听对话框可见性变化，加载分类数据
    watch(dialogVisible, (newValue) => {
      if (newValue) {
        fetchCategories();
      }
    });

    return {
      t,
      form,
      isSubmitting,
      selectedFile,
      isUploading,
      categories,
      loadingCategories,
      categoryOptions,
      editorToolbar,
      dialogVisible,
      isEditing,
      handleSubmit,
      closeDialog,
      getImageUrl,
      onFileSelected,
      onFileRejected,
      uploadImage
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
