<template>
  <q-dialog
    v-model="dialogVisible"
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="full-width" style="max-width: 600px;">
      <!-- 对话框头部 -->
      <q-card-section class="row items-center q-pb-none bg-primary text-white">
        <div class="col">
          <div class="text-h6">
            {{ tag ? t('edit_tag') || '编辑标签' : t('add_tag') || '添加标签' }}
          </div>
          <div class="text-caption opacity-70">
            {{ tag ? t('edit_tag_subtitle') || '编辑博客标签信息' : t('add_tag_subtitle') || '创建新的博客标签关联' }}
          </div>
        </div>
        <div class="col-auto">
          <q-btn flat round dense icon="close" @click="closeDialog" />
        </div>
      </q-card-section>

      <!-- 对话框内容 -->
      <q-card-section class="q-pa-md">
        <q-form ref="formRef" @submit="onSubmit" class="full-width">
          <!-- 基本信息区域 -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12">
              <div class="text-h6 q-mb-md text-primary">{{ t('basic_info') || '基本信息' }}</div>
            </div>
            
            <!-- 博客选择 -->
            <div class="col-12">
              <q-select
                v-model="form.b_blog_id"
                :label="t('blog_id') || '博客ID'"
                :placeholder="t('select_blog') || '请选择博客'"
                :options="blogOptions"
                outlined
                dense
                emit-value
                required
                :rules="[val => !!val || t('field_required') || '此字段为必填项']"
              />
            </div>
            
            <!-- 标签ID输入 -->
            <div class="col-12">
              <q-input
                v-model="form.b_tag_id"
                :label="t('tag_id') || '标签ID'"
                :placeholder="t('tag_id_placeholder') || '请输入标签ID'"
                outlined
                dense
                required
                :rules="[val => !!val || t('field_required') || '此字段为必填项']"
                maxlength="50"
              />
            </div>
          </div>

          <!-- 时间信息显示 -->
          <div v-if="tag" class="row q-col-gutter-md">
            <div class="col-12">
              <div class="text-h6 q-mb-md text-primary">{{ t('time_info') || '时间信息' }}</div>
            </div>
            
            <div class="col-12 col-md-6">
              <q-field :label="t('created_at') || '创建时间'" readonly>
                <template v-slot:control>
                  <div class="self-center text-caption text-grey-6">{{ formatDate(tag.createdAt) }}</div>
                </template>
              </q-field>
            </div>
            
            <div class="col-12 col-md-6">
              <q-field :label="t('updated_at') || '更新时间'" readonly>
                <template v-slot:control>
                  <div class="self-center text-caption text-grey-6">{{ formatDate(tag.updatedAt) }}</div>
                </template>
              </q-field>
            </div>
          </div>
        </q-form>
      </q-card-section>

      <!-- 对话框底部按钮 -->
      <q-card-actions class="q-px-md q-pb-md q-pt-none justify-between">
        <q-btn 
          flat 
          :label="t('cancel') || '取消'"
          @click="closeDialog"
        />
        <div class="q-gutter-sm">
          <q-btn 
            flat 
            color="primary"
            :label="t('reset') || '重置'"
            @click="resetForm"
          />
          <q-btn 
            color="primary"
            :label="t('submit') || '提交'"
            @click="onSubmit"
            type="submit"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { API } from 'src/api/api.js';
import { Notify } from 'quasar';

export default defineComponent({
  name: 'BlogTagEditDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    tag: {
      type: Object,
      default: null
    },
    allTags: {
      type: Array,
      default: () => []
    },
    allBlogs: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'save', 'error'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const formRef = ref(null);
    
    // 表单数据
    const form = ref({
      b_blog_id: '',
      b_tag_id: ''
    });

    // 计算属性，用于v-model双向绑定
    const dialogVisible = computed({
      get() {
        return props.modelValue;
      },
      set(value) {
        emit('update:modelValue', value);
      }
    });

    // 博客选项
    const blogOptions = computed(() => {
      return props.allBlogs.map(blog => ({
        label: `Blog ${blog.id}`,
        value: blog.id
      }));
    });

    // 重置表单
    const resetForm = () => {
      form.value = {
        b_blog_id: '',
        b_tag_id: ''
      };
      if (formRef.value) {
        formRef.value.resetValidation();
      }
    };

    // 当标签数据变化时，更新表单数据
    watch(() => props.tag, (newTag) => {
      if (newTag) {
        form.value = {
          b_blog_id: newTag.b_blog_id,
          b_tag_id: newTag.b_tag_id
        };
      } else {
        resetForm();
      }
    }, { immediate: true });

    // 当对话框显示状态变化时，重置或初始化表单
    watch(() => props.modelValue, (newValue) => {
      if (newValue) {
        if (props.tag) {
          form.value = {
            b_blog_id: props.tag.b_blog_id,
            b_tag_id: props.tag.b_tag_id
          };
        } else {
          resetForm();
        }
      }
    });

    // 关闭对话框
    const closeDialog = () => {
      dialogVisible.value = false;
    };

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

    // 提交表单
    const onSubmit = async () => {
      if (!formRef.value || !(await formRef.value.validate())) {
        return;
      }

      try {
        let response;
        if (props.tag) {
          // 更新现有标签
          response = await axios.put(API.BLOG.B_BLOG_TAGS.UPDATE(props.tag.id), form.value);
        } else {
          // 创建新标签
          response = await axios.post(API.BLOG.B_BLOG_TAGS.CREATE, form.value);
        }

        // 触发保存成功事件
        emit('save', response.data.data);
        
        // 关闭对话框
        closeDialog();
      } catch (error) {
        console.error('保存标签失败:', error);
        Notify.create({
          message: t('save_failed') + ': ' + (error.message || t('unknown_error')),
          color: 'negative',
          timeout: 2000
        });
        emit('error', error);
      }
    };

    return {
      t,
      formRef,
      form,
      dialogVisible,
      blogOptions,
      resetForm,
      closeDialog,
      formatDate,
      onSubmit
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

  .q-card-actions {
    padding: 16px 20px;
    border-top: 1px solid #e0e0e0;
  }

  /* 响应式调整 */
  @media (max-width: 600px) {
    .q-card {
      max-width: none !important;
      margin: 10px;
    }
  }
</style>