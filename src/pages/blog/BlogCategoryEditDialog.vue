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
            {{ category ? t('edit_category') || '编辑类别' : t('add_category') || '添加类别' }}
          </div>
          <div class="text-caption opacity-70">
            {{ category ? t('edit_category_subtitle') || '编辑博客类别信息' : t('add_category_subtitle') || '创建新的博客类别' }}
          </div>
        </div>
        <div class="col-auto">
          <q-btn flat round dense icon="close" @click="closeDialog" />
        </div>
      </q-card-section>

      <!-- 对话框内容 -->
      <q-card-section class="q-pa-md" style="height: calc(100vh - 120px); overflow-y: auto;">
        <q-form ref="formRef" @submit="onSubmit" class="full-width">
          <!-- 基本信息区域 -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12">
              <div class="text-h6 q-mb-md text-primary">{{ t('basic_info') || '基本信息' }}</div>
            </div>
            
            <!-- 类别ID和类别名称 -->
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.category_id"
                :label="t('category_id') || '类别ID'"
                :placeholder="t('category_id_placeholder') || '请输入类别ID'"
                outlined
                dense
                :disabled="!!category"
                maxlength="20"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.b_category_name"
                :label="t('category_name') || '类别名称'"
                :placeholder="t('category_name_placeholder') || '请输入类别名称'"
                outlined
                dense
                required
                :rules="[val => !!val || t('field_required') || '此字段为必填项']"
                maxlength="50"
              />
            </div>
          </div>

          <!-- 父类别信息区域 -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12">
              <div class="text-h6 q-mb-md text-primary">{{ t('parent_category_info') || '父类别信息' }}</div>
            </div>
            
            <!-- 父类别选择 -->
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.parent_category_id"
                :label="t('parent_category') || '父类别'"
                :placeholder="t('select_parent_category') || '请选择父类别'"
                :options="parentCategoryOptions"
                option-value="category_id"
                option-label="b_category_name"
                outlined
                dense
                emit-value
                map-options
                clearable
                :disabled="category && hasChildCategories(category.category_id)"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" :style="{ 'padding-left': `${scope.option.level || 0 * 20}px` }">
                    <q-item-section>
                      <q-item-label>{{ scope.option.b_category_name }}</q-item-label>
                      <q-item-label caption>{{ t('category_id') }}: {{ scope.option.category_id }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <div v-if="category && hasChildCategories(category.category_id)" class="text-caption text-grey-5 q-mt-sm">
                {{ t('cannot_change_parent_has_children') || '该类别下有子类别，无法更改父类别' }}
              </div>
            </div>
            <div class="col-12 col-md-6">
              <!-- 预留位置，可以添加其他字段 -->
            </div>
          </div>
        </q-form>
      </q-card-section>

      <!-- 对话框操作按钮 -->
      <q-card-section class="row justify-end q-pt-none q-gutter-sm bg-grey-1">
        <q-btn
          flat
          :label="t('cancel') || '取消'"
          color="grey"
          @click="closeDialog"
          size="md"
        />
        <q-btn
          :label="t('save') || '保存'"
          color="primary"
          @click="onSubmit"
          size="md"
          :loading="saving"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, watch, computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { API } from 'src/api/api.js';
import { Notify } from 'quasar';

export default defineComponent({
  name: 'BlogCategoryEditDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    category: {
      type: Object,
      default: null
    },
    allCategories: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:visible', 'save', 'error'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const formRef = ref(null);
    const saving = ref(false);
    
    // 使用本地状态控制对话框显示/隐藏
    const dialogVisible = ref(props.visible);

    // 监听props.visible变化，同步到本地状态
    watch(() => props.visible, (newValue) => {
      dialogVisible.value = newValue;
    });

    // 监听本地状态变化，通知父组件
    watch(dialogVisible, (newValue) => {
      emit('update:visible', newValue);
    });
    
    const form = reactive({
      id: '',
      documentId: '',
      category_id: '',
      b_category_name: '',
      parent_category_id: 0,
      publishedAt: new Date().toISOString()
    });

    // 重置表单 - 必须在使用之前声明
    const resetForm = () => {
      Object.assign(form, {
        id: '',
        documentId: '',
        category_id: '',
        b_category_name: '',
        parent_category_id: 0,
        publishedAt: new Date().toISOString()
      });
    };

    // 关闭对话框
    const closeDialog = () => {
      dialogVisible.value = false;
    };

    // 判断当前类别是否有子类别
    const hasChildCategories = (categoryId) => {
      return props.allCategories.some(cat => cat.parent_category_id == categoryId);
    };

    // 获取父类别选项
    const parentCategoryOptions = computed(() => {
      // 获取所有顶级类别（没有父类别的类别）
      let options = props.allCategories
        .filter(cat => !cat.parent_category_id || cat.parent_category_id === 0)
        .map(cat => ({
          ...cat,
          level: 0
        }));

      // 递归添加子类别
      const addChildren = (parentCategories, level = 1) => {
        parentCategories.forEach(parent => {
          const children = props.allCategories
            .filter(cat => cat.parent_category_id == parent.category_id && (!props.category || cat.id !== props.category.id))
            .map(cat => ({
              ...cat,
              level: level
            }));
          
          if (children.length > 0) {
            options = [...options, ...children];
            addChildren(children, level + 1);
          }
        });
      };

      addChildren(options);

      // 添加无父类别选项
      options.unshift({
        category_id: 0,
        b_category_name: t('no_parent_category') || '无父类别',
        level: 0
      });

      return options;
    });

    // 监听category数据变化
    watch(() => props.category, (newCategory) => {
      if (newCategory) {
        Object.assign(form, {
          ...newCategory,
          documentId: newCategory.documentId || newCategory.id,
          parent_category_id: newCategory.parent_category_id || 0
        });
      } else {
        resetForm();
      }
    }, { immediate: true });

    // 提交表单
    const onSubmit = async () => {
      try {
        // 验证表单
        if (!formRef.value.validate()) {
          return;
        }

        // 确保category_id和parent_category_id是有效的值
        const submitData = {
          category_id: form.category_id || null,
          b_category_name: form.b_category_name,
          parent_category_id: form.parent_category_id || 0
        };

        console.log('提交数据:', submitData);

        // 根据参考格式，将数据包装在data对象中
        const formattedData = {
          data: submitData
        };

        console.log('格式化后的数据:', formattedData);

        // 提交API调用，使用axios
        let response;
        if (form.documentId) {
          // 编辑操作
          const url = `${API.BLOG.B_CATEGORIES.CREATE}/${form.documentId}`;
          console.log('PUT请求URL:', url);
          response = await axios.put(url, formattedData, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } else {
          // 新增操作
          const url = API.BLOG.B_CATEGORIES.CREATE;
          console.log('POST请求URL:', url);
          response = await axios.post(url, formattedData, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        }

        console.log('提交成功:', response.data);
        emit('save', response.data.data);
        closeDialog();
      } catch (error) {
        console.error('提交失败:', error);
        if (error.response) {
          console.error('错误响应数据:', error.response.data);
          console.error('错误状态码:', error.response.status);
        } else if (error.request) {
          console.error('没有收到响应:', error.request);
        } else {
          console.error('请求配置错误:', error.message);
        }
        emit('error', error);
      }
    };

    return {
      t,
      dialogVisible,
      form,
      formRef,
      parentCategoryOptions,
      saving,
      closeDialog,
      resetForm,
      onSubmit,
      hasChildCategories
    };
  }
});
</script>

<style scoped>
  /* 全屏对话框样式 */
  .full-width {
    width: 100% !important;
  }

  .full-height {
    height: 100% !important;
  }

  /* 表单区域样式 */
  .q-input,
  .q-select {
    margin-bottom: 0;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .q-card-section {
      padding: 16px !important;
    }
  }

  /* 类似 BlogEditDialog 的专业样式 */
  .q-card {
    border-radius: 0 !important;
  }

  .bg-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  }

  .text-primary {
    color: #1976d2 !important;
  }

  /* 表单分组样式 */
  .text-h6 {
    font-weight: 600;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 8px;
  }

  /* 输入框样式优化 */
  .q-field--outlined .q-field__control {
    border-radius: 8px;
  }

  .q-field--outlined .q-field__control:hover {
    border-color: #1976d2;
  }

  /* 按钮样式 */
  .q-btn {
    border-radius: 8px;
    font-weight: 500;
  }

  /* 底部操作栏 */
  .bg-grey-1 {
    border-top: 1px solid #e0e0e0;
  }
</style>