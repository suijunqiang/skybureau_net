<template>
  <q-dialog :model-value="visible" @update:model-value="handleVisibleChange" @hide="handleHide" persistent>
    <q-card style="max-width: 800px; width: 90vw; max-height: 90vh; overflow: hidden;">
      <q-card-section class="q-pa-lg bg-primary text-white">
        <div class="flex justify-between items-center">
          <h2 class="text-h5 q-my-none">
            {{ isNew ? t('add_news') : t('edit_news') }}
          </h2>
          <q-btn flat round icon="close" text-white @click="closeDialog" />
        </div>
      </q-card-section>

      <q-card-section class="q-pa-lg" style="max-height: 70vh; overflow-y: auto;">
        <form @submit.prevent="handleSubmit">
          <!-- 基本信息区域 -->
          <div class="q-mb-lg">
            <h3 class="text-h6 q-mb-md">{{ t('basic_information') }}</h3>
            
            <!-- 标题 -->
            <q-input
              v-model="formData.title"
              :label="t('news_title')"
              outlined
              dense
              required
              :rules="[val => !!val || t('title_required')]"
              class="q-mb-md"
            />

            <!-- 封面图URL输入 -->
            <q-input
              v-model="formData.fisrt_pic"
              :label="t('cover_image_url')"
              outlined
              dense
              placeholder="https://example.com/image.jpg"
              class="q-mb-md"
              @input="handleImageUrlChange"
            >
              <template v-slot:prepend>
                <q-icon name="image" />
              </template>
              <template v-slot:after>
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="check"
                  size="sm"
                  :disable="!formData.fisrt_pic"
                  @click="previewImage"
                />
              </template>
            </q-input>

            <!-- 图片上传组件 -->
            <div class="q-mb-md">
              <label class="block text-base q-mb-sm">{{ t('upload_cover_image') }}</label>
              <div class="border-2 border-dashed border-grey-3 rounded-md p-4 text-center" @click="triggerFileInput">
                <q-icon name="cloud_upload" size="32px" class="text-grey-4 q-mb-2" />
                <p class="text-sm text-grey-5">{{ t('click_to_upload') }}</p>
                <p class="text-xs text-grey-4 q-mt-1">{{ t('supported_formats') }}</p>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  style="display: none"
                  @change="handleFileSelect"
                />
              </div>
            </div>

            <!-- 已上传的图片预览 -->
            <div v-if="previewUrl" class="q-mb-md">
              <p class="text-sm q-mb-sm">{{ t('current_cover_image') }}</p>
              <div class="relative">
                <q-img 
                  :src="previewUrl"
                  alt="{{ t('cover_image_preview') }}"
                  fit="cover"
                  style="max-height: 200px; border-radius: 4px"
                >
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center bg-grey-3 text-grey-6">
                      <q-icon name="broken_image" size="40px" />
                    </div>
                  </template>
                </q-img>
                <q-btn
                  absolute
                  top="8px"
                  right="8px"
                  flat
                  round
                  color="negative"
                  text-color="white"
                  icon="delete"
                  size="sm"
                  @click="clearImage"
                />
              </div>
            </div>
          </div>

          <!-- 内容区域 -->
          <div class="q-mb-lg">
            <h3 class="text-h6 q-mb-md">{{ t('content') }}</h3>
            
            <!-- 描述 -->
            <q-input
              v-model="formData.description"
              :label="t('news_description')"
              outlined
              dense
              type="textarea"
              rows="2"
              placeholder="{{ t('news_description_placeholder') }}"
              class="q-mb-md"
            />

            <!-- 正文编辑器 -->
            <div class="q-mb-md">
              <label class="block text-base q-mb-sm">{{ t('news_content') }}</label>
              <div class="border-2 border-grey-3 rounded-md p-3 min-h-[200px] bg-white" contenteditable="true" @input="handleContentChange">
                <template v-if="!formData.content">{{ t('click_to_edit_content') }}</template>
                <div v-else v-html="formData.content"></div>
              </div>
            </div>
          </div>

          <!-- 设置区域 -->
          <div class="q-mb-lg">
            <h3 class="text-h6 q-mb-md">{{ t('settings') }}</h3>
            
            <!-- 分类选择 -->
            <q-select
              v-model="formData.category_id"
              :label="t('category')"
              :options="categories"
              option-value="id"
              option-label="name"
              outlined
              dense
              class="q-mb-md"
            />

            <!-- 阅读时间 -->
            <q-input
              v-model="formData.read_time"
              :label="t('read_time')"
              type="number"
              min="0"
              max="999"
              outlined
              dense
              class="q-mb-md"
            >
              <template v-slot:after>
                <span class="text-grey-5 text-sm q-ml-2">{{ t('minutes') }}</span>
              </template>
            </q-input>

            <!-- 密码 -->
            <q-input
              v-model="formData.password"
              :label="t('password')"
              type="password"
              outlined
              dense
              clearable
              placeholder="{{ t('password_optional') }}"
              class="q-mb-md"
            />
          </div>

          <!-- 开关设置 -->
          <div class="q-mb-lg">
            <h3 class="text-h6 q-mb-md">{{ t('status_settings') }}</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- 发布开关 -->
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-base">{{ t('publish_status') }}</div>
                  <div class="text-sm text-grey-5">{{ t('publish_status_desc') }}</div>
                </div>
                <q-toggle
                  v-model="formData.is_published"
                  color="primary"
                  checked-icon="done"
                  unchecked-icon="close"
                />
              </div>

              <!-- 推荐开关 -->
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-base">{{ t('recommend_status') }}</div>
                  <div class="text-sm text-grey-5">{{ t('recommend_status_desc') }}</div>
                </div>
                <q-toggle
                  v-model="formData.is_recommend"
                  color="amber"
                  checked-icon="star"
                  unchecked-icon="star_border"
                />
              </div>

              <!-- 赞赏开关 -->
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-base">{{ t('appreciation_status') }}</div>
                  <div class="text-sm text-grey-5">{{ t('appreciation_status_desc') }}</div>
                </div>
                <q-toggle
                  v-model="formData.is_appreciation"
                  color="pink"
                  checked-icon="favorite"
                  unchecked-icon="favorite_border"
                />
              </div>


            </div>
          </div>
        </form>
      </q-card-section>

      <q-card-actions class="q-pa-lg bg-grey-1 flex justify-end">
        <q-btn
          :label="t('cancel')"
          flat
          @click="closeDialog"
          class="q-mr-md"
        />
        <q-btn
          :label="isNew ? t('add') : t('save')"
          color="primary"
          :loading="saving"
          @click="handleSubmit"
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
  name: 'NewsEditDialog',
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
  emits: ['update:visible', 'save', 'error'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const $q = useQuasar();
    const fileInput = ref(null);
    
    // 响应式数据
    const saving = ref(false);
    const previewUrl = ref('');
    const categories = ref([
      { id: 0, name: t('uncategorized') }
    ]);
    
    // 表单数据
    const formData = ref({
      title: '',
      fisrt_pic: null,
      content: '',
      description: '',
      is_published: false,
      is_recommend: false,
      is_appreciation: false,
      views: 0,
      words: 0,
      read_time: 0,
      category_id: 0,
      is_top: false,
      password: null,
      user_id: 0,
      new_id: 0
    });

    // 是否为新建
    const isNew = computed(() => !props.news || !props.news.id);

    // 初始化表单数据
    const initFormData = () => {
      if (props.news && props.news.id) {
        formData.value = {
          ...formData.value,
          ...props.news
        };
        
        // 设置预览URL
        if (props.news.fisrt_pic) {
          previewUrl.value = getImageUrl(props.news.fisrt_pic);
        }
      } else {
        // 重置表单
        formData.value = {
          title: '',
          fisrt_pic: null,
          content: '',
          description: '',
          is_published: false,
          is_recommend: false,
          is_appreciation: false,
          views: 0,
          words: 0,
          read_time: 0,
          category_id: 0,
          is_top: false,
          password: null,
          user_id: 0,
          new_id: 0
        };
        previewUrl.value = '';
      }
    };

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

    // 获取分类数据
    const fetchCategories = async () => {
      try {
        const response = await request.get(API.NEWS.NEWS_CATEGORIES.LIST);
        if (response.data && response.data.data) {
          categories.value = [...categories.value, ...response.data.data];
        }
      } catch (error) {
        console.error('获取分类数据失败:', error);
        // 继续使用默认分类
      }
    };

    // 处理图片URL变化
    const handleImageUrlChange = () => {
      if (formData.value.fisrt_pic) {
        previewUrl.value = getImageUrl(formData.value.fisrt_pic);
      } else {
        previewUrl.value = '';
      }
    };

    // 触发文件选择
    const triggerFileInput = () => {
      fileInput.value?.click();
    };

    // 处理文件选择
    const handleFileSelect = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        // 这里应该调用实际的文件上传API
        console.log('文件选择:', file);
        
        // 简单预览
        const reader = new FileReader();
        reader.onload = (e) => {
          previewUrl.value = e.target.result;
          formData.value.fisrt_pic = previewUrl.value; // 实际项目中应该是上传后的URL
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('文件上传失败:', error);
        $q.notify({
          message: t('upload_failed') + ': ' + (error.message || t('unknown_error')),
          color: 'negative',
          timeout: 3000
        });
      } finally {
        // 清空文件输入
        event.target.value = '';
      }
    };

    // 预览图片
    const previewImage = () => {
      if (formData.value.fisrt_pic) {
        previewUrl.value = getImageUrl(formData.value.fisrt_pic);
      }
    };

    // 清除图片
    const clearImage = () => {
      formData.value.fisrt_pic = null;
      previewUrl.value = '';
    };

    // 处理内容变化
    const handleContentChange = (event) => {
      const content = event.target.innerHTML;
      formData.value.content = content;
      
      // 计算字数
      const textContent = content.replace(/<[^>]*>/g, '').trim();
      formData.value.words = textContent.length;
      
      // 估算阅读时间（假设每分钟300字）
      formData.value.read_time = Math.ceil(textContent.length / 300) || 1;
    };

    // 处理提交
    const handleSubmit = async () => {
      try {
        // 表单验证
        if (!formData.value.title.trim()) {
          $q.notify({
            message: t('title_required'),
            color: 'warning',
            timeout: 2000
          });
          return;
        }

        saving.value = true;

        // 准备提交数据
        const submitData = {
          ...formData.value,
          // 确保fisrt_pic是null或字符串
          fisrt_pic: formData.value.fisrt_pic || null,
          // 如果是null，应该转换为空字符串
          description: formData.value.description || '',
          content: formData.value.content || '',
          // 如果是空字符串，应该转换为null
          password: formData.value.password === '' ? null : formData.value.password
        };

        // 计算字数
        const textContent = submitData.content.replace(/<[^>]*>/g, '').trim();
        submitData.words = textContent.length;
        
        // 估算阅读时间（假设每分钟300字）
        if (!submitData.read_time || submitData.read_time < 1) {
          submitData.read_time = Math.ceil(textContent.length / 300) || 1;
        }

        let response;
        if (isNew.value) {
          // 新建新闻
          console.log('新建新闻数据:', submitData);
          // 将数据包装在data对象下
          response = await request.post(API.NEWS.NEWS.CREATE, { data: submitData });
        } else {
          // 更新新闻
          const updateUrl = API.NEWS.NEWS.UPDATE(props.news.documentId || props.news.id);
          console.log('更新新闻URL:', updateUrl);
          console.log('更新新闻数据:', submitData);
          // 将数据包装在data对象下
          response = await request.put(updateUrl, { data: submitData });
        }

        if (response.data) {
          emit('save', response.data);
          closeDialog();
        } else {
          throw new Error(t('response_data_missing'));
        }
      } catch (error) {
        console.error('保存新闻失败:', error);
        emit('error', error);
      } finally {
        saving.value = false;
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
      // 清空表单数据
      initFormData();
    };

    // 监听news属性变化
    watch(() => props.news, () => {
      if (props.visible) {
        initFormData();
      }
    }, { deep: true });

    // 监听visible属性变化
    watch(() => props.visible, (newVal) => {
      if (newVal) {
        initFormData();
      }
    });

    // 组件挂载时获取分类数据
    onMounted(() => {
      fetchCategories();
    });

    return {
      t,
      saving,
      previewUrl,
      categories,
      formData,
      isNew,
      fileInput,
      handleSubmit,
      closeDialog,
      handleVisibleChange,
      handleHide,
      handleImageUrlChange,
      triggerFileInput,
      handleFileSelect,
      previewImage,
      clearImage,
      handleContentChange
    };
  }
});
</script>

<style scoped>
/* 内容编辑区样式 */
[contenteditable="true"] {
  outline: none;
  min-height: 200px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
}

[contenteditable="true"]:empty:before {
  content: attr(placeholder);
  color: #ccc;
  pointer-events: none;
}

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

/* 上传区域样式 */
.border-dashed {
  transition: all 0.3s ease;
}

.border-dashed:hover {
  border-color: #2196F3 !important;
  background-color: rgba(33, 150, 243, 0.05);
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
  
  .grid-cols-1.md\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>