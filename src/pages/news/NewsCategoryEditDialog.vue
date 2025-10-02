<template>
  <q-dialog :model-value="visible" @update:model-value="handleVisibleChange" @hide="handleHide" persistent>
    <q-card style="max-width: 600px; width: 90vw; max-height: 90vh; overflow: hidden;">
      <q-card-section class="q-pa-lg bg-primary text-white">
        <div class="flex justify-between items-center">
          <h2 class="text-h5 q-my-none">
            {{ isNew ? t('add_news_category') : t('edit_news_category') }}
          </h2>
          <q-btn flat round icon="close" text-white @click="closeDialog" />
        </div>
      </q-card-section>

      <q-card-section class="q-pa-lg" style="max-height: 70vh; overflow-y: auto;">
        <form @submit.prevent="handleSubmit">
          <!-- 分类信息区域 -->
          <div class="q-mb-lg">
            <h3 class="text-h6 q-mb-md">{{ t('category_information') }}</h3>
            
            <!-- 分类ID (仅新建时可编辑) -->
            <q-input
              v-model="formData.new_category_id"
              :label="t('category_id')"
              outlined
              dense
              :required="isNew"
              :rules="isNew ? [val => !!val || t('category_id_required')] : []"
              :disable="!isNew"
              class="q-mb-md"
            />

            <!-- 分类名称 -->
            <q-input
              v-model="formData.new_category_name"
              :label="t('category_name')"
              outlined
              dense
              required
              :rules="[val => !!val || t('category_name_required')]"
              class="q-mb-md"
            />

            <!-- 父分类选择 -->
            <q-select
              v-model="formData.new_parent_category_id"
              :label="t('parent_category')"
              :options="parentCategoryOptions"
              option-value="new_category_id"
              option-label="new_category_name"
              outlined
              dense
              class="q-mb-md"
              :disable="!isNew && formData.new_parent_category_id === 0 && hasSubcategories"
            >
              <template v-slot:before-options>
                <q-item
                  v-if="!isNew || !props.category?.new_parent_category_id"
                  clickable
                  v-close-popup
                  @click="formData.new_parent_category_id = 0"
                >
                  <q-item-section>
                    <q-item-label>{{ t('no_parent') }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-separator />
              </template>
            </q-select>
            <p v-if="!isNew && formData.new_parent_category_id === 0 && hasSubcategories" class="text-sm text-warning q-mt-xs">
              {{ t('cannot_change_parent_of_category_with_subcategories') }}
            </p>
          </div>
        </form>
      </q-card-section>

      <q-card-actions class="q-pa-lg bg-grey-1 flex justify-end">
        <q-btn
          :label="t('cancel')"
          @click="closeDialog"
          class="q-mr-md"
        />
        <q-btn
          :label="isNew ? t('add') : t('save')"
          color="primary"
          @click="handleSubmit"
          :loading="saving"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { API } from 'src/api/api.js';
import request from 'src/utils/request.js';

export default defineComponent({
  name: 'NewsCategoryEditDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    category: {
      type: Object,
      default: null
    },
    categories: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:visible', 'save', 'error'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const $q = useQuasar();
    
    // 响应式数据
    const saving = ref(false);
    const formData = ref({
      new_category_id: '',
      new_category_name: '',
      new_parent_category_id: 0
    });
    const hasSubcategories = ref(false);

    // 是否为新建分类
    const isNew = computed(() => !props.category || !props.category.id);

    // 父分类选项（排除当前分类及其子分类）
    const parentCategoryOptions = computed(() => {
      if (!props.categories || !Array.isArray(props.categories)) {
        return [];
      }

      // 如果是新建分类，返回所有分类
      if (isNew.value) {
        return props.categories.filter(cat => cat.new_parent_category_id === 0);
      }

      // 如果是编辑分类，排除当前分类及其子分类
      const currentCategoryId = props.category.new_category_id;
      const excludeCategoryIds = [currentCategoryId];
      
      // 查找当前分类的所有子分类
      const findSubcategories = (categoryId) => {
        const subcategories = props.categories.filter(cat => cat.new_parent_category_id === categoryId);
        subcategories.forEach(cat => {
          excludeCategoryIds.push(cat.new_category_id);
          findSubcategories(cat.new_category_id);
        });
      };
      
      findSubcategories(currentCategoryId);
      
      // 返回排除后的父分类选项
      return props.categories.filter(cat => 
        cat.new_parent_category_id === 0 && 
        !excludeCategoryIds.includes(cat.new_category_id)
      );
    });

    // 初始化表单数据
    const initFormData = () => {
      if (isNew.value) {
        formData.value = {
          new_category_id: '',
          new_category_name: '',
          new_parent_category_id: 0
        };
      } else if (props.category) {
        formData.value = {
          new_category_id: props.category.new_category_id || '',
          new_category_name: props.category.new_category_name || '',
          new_parent_category_id: props.category.new_parent_category_id || 0
        };
        
        // 检查当前分类是否有子分类
        checkHasSubcategories();
      }
    };

    // 检查当前分类是否有子分类
    const checkHasSubcategories = () => {
      if (!props.category || !props.categories || !Array.isArray(props.categories)) {
        hasSubcategories.value = false;
        return;
      }
      
      const currentCategoryId = props.category.new_category_id;
      hasSubcategories.value = props.categories.some(cat => cat.new_parent_category_id === currentCategoryId);
    };

    // 处理提交
    const handleSubmit = async () => {
      try {
        // 表单验证
        if (!formData.value.new_category_name.trim()) {
          $q.notify({
            message: t('category_name_required'),
            color: 'warning',
            timeout: 2000
          });
          return;
        }

        saving.value = true;

        // 准备提交数据
        const submitData = {
          ...formData.value,
          // 确保分类名称不为空
          new_category_name: formData.value.new_category_name.trim()
        };

        let response;
        if (isNew.value) {
          // 新建分类
          console.log('新建分类数据:', submitData);
          // 将数据包装在data对象下
          response = await request.post(API.NEWS.NEWS_CATEGORIES.CREATE, { data: submitData });
        } else {
          // 更新分类
          const updateUrl = API.NEWS.NEWS_CATEGORIES.UPDATE(props.category.documentId || props.category.id || props.category.new_category_id);
          console.log('更新分类URL:', updateUrl);
          console.log('更新分类数据:', submitData);
          // 将数据包装在data对象下
          response = await request.put(updateUrl, { data: submitData });
        }

        if (response.data) {
          // 如果响应数据没有id，使用new_category_id作为id
          if (!response.data.id && response.data.new_category_id) {
            response.data.id = response.data.new_category_id;
          }
          
          // 合并原始数据和新数据
          const resultData = {
            ...(props.category || {}),
            ...response.data
          };
          
          emit('save', resultData);
          closeDialog();
        } else {
          throw new Error(t('response_data_missing'));
        }
      } catch (error) {
        console.error('保存分类失败:', error);
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

    // 监听category属性变化
    watch(() => props.category, () => {
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

    // 监听categories属性变化，重新检查子分类
    watch(() => props.categories, () => {
      if (!isNew.value && props.visible) {
        checkHasSubcategories();
      }
    }, { deep: true });

    // 组件挂载时初始化
    onMounted(() => {
      if (props.visible) {
        initFormData();
      }
    });

    return {
      t,
      saving,
      formData,
      isNew,
      parentCategoryOptions,
      hasSubcategories,
      handleSubmit,
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