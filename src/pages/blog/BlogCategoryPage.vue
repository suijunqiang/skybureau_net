<template>
  <div class="blog-category-container full-width full-height">
    <q-card class="full-width full-height shadow-0">
      <q-card-section class="q-pa-lg full-width">
        <!-- 顶部操作栏 -->
        <div class="row items-center q-mb-lg">
          <div class="col">
            <h2 class="text-h5 q-my-none text-weight-medium">{{ t('category_management_title') || '博客类别管理' }}</h2>
            <p class="text-grey-6 q-mb-none q-mt-xs">{{ t('category_management_subtitle') || '管理博客文章类别信息' }}</p>
          </div>
          <div class="col-auto">
            <q-btn 
              color="primary" 
              :label="t('add_category') || '新增类别'"
              icon="add"
              @click="addCategory"
              size="md"
              class="q-px-lg"
            />
          </div>
        </div>

        <!-- 搜索和筛选栏 -->
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-12 col-md-4">
            <q-input
              v-model="searchText"
              :placeholder="t('search_categories_placeholder') || '搜索类别...'"
              outlined
              dense
              clearable
              @input="handleSearch"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="parentFilter"
              :options="parentOptions"
              :label="t('filter_by_parent') || '按父类别筛选'"
              outlined
              dense
              clearable
              @update:model-value="handleFilterChange"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-btn
              flat
              color="primary"
              :label="t('reset_filters') || '重置筛选'"
              @click="resetFilters"
              size="md"
            />
          </div>
        </div>

        <!-- 类别列表表格 -->
        <q-table
          :rows="displayCategories"
          :columns="columns"
          :loading="loading"
          row-key="id"
          flat
          bordered
          class="blog-category-table"
          :pagination="pagination"
          @request="onRequest"
        >
          <!-- 类别名称列自定义显示 -->
          <template v-slot:body-cell-b_category_name="props">
            <q-td :props="props">
              <div class="category-info-cell">
                <div class="text-weight-medium text-primary cursor-pointer" @click="viewCategory(props.row)">
                  {{ props.value || t('unnamed_category') || '未命名类别' }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  {{ t('category_id') }}: {{ props.row.category_id || t('not_set') }}
                </div>
              </div>
            </q-td>
          </template>

          <!-- 父类别列 -->
          <template v-slot:body-cell-parent_category_name="props">
            <q-td :props="props">
              <div class="flex items-center">
                <q-icon name="folder" size="xs" class="q-mr-xs text-grey-6" />
                {{ props.value || t('no_parent_category') || '无父类别' }}
              </div>
            </q-td>
          </template>

          <!-- 更新时间列 -->
          <template v-slot:body-cell-updatedAt="props">
            <q-td :props="props">
              <div class="text-caption text-grey-6">
                {{ formatDate(props.value) }}
              </div>
            </q-td>
          </template>

          <!-- 操作列 -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="flex justify-end q-gutter-xs">
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="edit"
                  size="sm"
                  @click="editCategory(props.row)"
                >
                  <q-tooltip>{{ t('edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="info"
                  icon="visibility"
                  size="sm"
                  @click="viewCategory(props.row)"
                >
                  <q-tooltip>{{ t('view') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="deleteCategory(props.row)"
                  :disabled="hasChildCategories(props.row.category_id)"
                >
                  <q-tooltip>{{ t('delete') }}</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>

        <!-- 底部操作栏 -->
        <div class="row justify-between items-center q-mt-lg">
          <div class="col-auto">
            <q-btn
              flat
              color="primary"
              :label="t('back_to_list') || '返回列表'"
              icon="arrow_back"
              @click="goBack"
            />
          </div>
          <div class="col-auto">
            <span class="text-grey-6">
              {{ t('total_categories', { count: totalCategories }) || `总共 ${totalCategories} 个类别` }}
            </span>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>

  <!-- 类别编辑对话框 -->
  <BlogCategoryEditDialog
    v-model:visible="editDialogVisible"
    :category="currentCategory"
    :allCategories="categories"
    @save="onCategorySave"
    @error="onCategoryError"
  />

  <!-- 类别查看对话框 -->
  <BlogCategoryViewDialog
    v-model:visible="viewDialogVisible"
    :category="currentCategory"
    :parentCategoryName="getParentCategoryName(currentCategory?.parent_category_id)"
  />
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API } from 'src/api/api.js';
import { Notify, useQuasar } from 'quasar';
import BlogCategoryEditDialog from './BlogCategoryEditDialog.vue';
import BlogCategoryViewDialog from './BlogCategoryViewDialog.vue';

export default defineComponent({
  name: 'BlogCategoryPage',
  components: {
    BlogCategoryEditDialog,
    BlogCategoryViewDialog
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const $q = useQuasar();
    const categories = ref([]);
    const loading = ref(false);
    const editDialogVisible = ref(false);
    const viewDialogVisible = ref(false);
    const currentCategory = ref(null);
    
    // 搜索和筛选状态
    const searchText = ref('');
    const parentFilter = ref(null);
    
    // 筛选选项 - 父类别选项
    const parentOptions = computed(() => {
      return [
        { label: t('all_parents') || '所有父类别', value: null },
        { label: t('no_parent_category') || '无父类别', value: 0 },
        ...categories.value.filter(cat => !cat.parent_category_id || cat.parent_category_id === 0)
          .map(category => ({
            label: category.b_category_name,
            value: category.category_id
          }))
      ];
    });
    
    // 分页配置
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    });

    // 表格列配置
    const columns = ref([
      { name: "category_id", label: t("category_id") || "类别ID", field: "category_id", align: "left", sortable: true, width: 80 },
      { name: "b_category_name", label: t("category_name") || "类别名称", field: "b_category_name", align: "left", sortable: true },
      { name: "parent_category_name", label: t("parent_category") || "父类别", field: "parent_category_id", align: "left", sortable: true },
      { name: "updatedAt", label: t("update_time") || "更新时间", field: "updatedAt", align: "left", sortable: true },
      { name: "actions", label: t("operations") || "操作", field: "id", align: "right", width: 150, sortable: false }
    ]);

    // 获取类别数据
    const fetchCategories = async () => {
      loading.value = true;
      try {
        const response = await axios.get(API.BLOG.B_CATEGORIES.LIST);
        categories.value = response.data.data;
        console.log('类别数据加载成功:', categories.value);
      } catch (error) {
        console.error('获取类别数据失败:', error);
        categories.value = [];
        Notify.create({
          message: t('fetch_categories_failed') + ': ' + (error.message || t('unknown_error')),
          color: 'negative',
          timeout: 2000
        });
      } finally {
        loading.value = false;
      }
    };

    // 搜索和筛选功能
    const handleSearch = () => {
      console.log('Searching for:', searchText.value);
    };
    
    const handleFilterChange = () => {
      console.log('Filter changed:', parentFilter.value);
    };
    
    const resetFilters = () => {
      searchText.value = '';
      parentFilter.value = null;
    };
    
    // 表格请求处理
    const onRequest = (props) => {
      const { page, rowsPerPage } = props.pagination;
      pagination.value.page = page;
      pagination.value.rowsPerPage = rowsPerPage;
    };

    // 显示的类别数据（带搜索和筛选）
    const displayCategories = computed(() => {
      let filtered = categories.value || [];
      
      // 搜索筛选
      if (searchText.value) {
        const search = searchText.value.toLowerCase();
        filtered = filtered.filter(category => 
          (category.b_category_name && category.b_category_name.toLowerCase().includes(search)) ||
          (category.category_id && category.category_id.toString().includes(search))
        );
      }
      
      // 父类别筛选
      if (parentFilter.value !== null) {
        if (parentFilter.value === 0) {
          filtered = filtered.filter(category => !category.parent_category_id || category.parent_category_id === 0);
        } else {
          filtered = filtered.filter(category => category.parent_category_id === parentFilter.value);
        }
      }
      
      return filtered;
    });
    
    // 总类别数
    const totalCategories = computed(() => displayCategories.value.length);
    
    // 获取父类别名称
    const getParentCategoryName = (parentId) => {
      if (!parentId || parentId === 0) return t('no_parent_category') || '无父类别';
      
      const parent = categories.value.find(cat => cat.category_id == parentId);
      return parent ? parent.b_category_name : `ID:${parentId}`;
    };
    
    // 判断类别是否有子类别
    const hasChildCategories = (categoryId) => {
      return categories.value.some(cat => cat.parent_category_id == categoryId);
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

    // 返回博客列表
    const goBack = () => {
      router.push('/blog');
    };

    // 添加类别
    const addCategory = () => {
      currentCategory.value = null;
      editDialogVisible.value = true;
    };

    // 编辑类别
    const editCategory = (category) => {
      currentCategory.value = { ...category };
      editDialogVisible.value = true;
    };
    
    // 查看类别
    const viewCategory = (category) => {
      currentCategory.value = { ...category };
      viewDialogVisible.value = true;
    };

    // 类别保存成功处理
    const onCategorySave = (updatedCategory) => {
      const index = categories.value.findIndex(c => c.id === updatedCategory.id);
      if (index !== -1) {
        categories.value[index] = updatedCategory;
      } else {
        categories.value.push(updatedCategory);
      }

      Notify.create({
        message: t('save_success'),
        color: 'positive',
        timeout: 2000
      });

      setTimeout(() => {
        fetchCategories();
      }, 500);
    };

    // 类别保存失败处理
    const onCategoryError = (error) => {
      Notify.create({
        message: t('save_failed') + ': ' + (error.message || t('unknown_error')),
        color: 'negative',
        timeout: 2000
      });
    };

    // 删除类别
    const deleteCategory = (category) => {
      // 检查是否有子类别
      if (hasChildCategories(category.category_id)) {
        Notify.create({
          message: t('cannot_delete_has_children') || '该类别下有子类别，无法删除',
          color: 'warning',
          timeout: 2000
        });
        return;
      }

      $q.dialog({
        title: t('confirm_delete'),
        message: t('confirm_delete_category') + ': ' + category.b_category_name + '?',
        ok: {
          push: true,
          color: 'positive'
        },
        cancel: {
          push: true,
          color: 'negative'
        },
        persistent: true
      }).onOk(async () => {
        try {
          const deleteUrl = API.BLOG.B_CATEGORIES.DELETE(category.documentId || category.id);
          console.log('DELETE请求URL:', deleteUrl);

          const deleteResponse = await axios.delete(deleteUrl, {
            headers: {
              'Content-Type': 'application/json'
            }
          });

          console.log('删除类别成功:', deleteResponse.data);

          categories.value = categories.value.filter(c => c.id !== category.id);

          Notify.create({
            message: t('delete_success'),
            color: 'positive',
            timeout: 2000
          });

          fetchCategories();
        } catch (error) {
          console.error('删除类别失败:', error);

          Notify.create({
            message: t('delete_failed') + ': ' + (error.message || t('unknown_error')),
            color: 'negative',
            timeout: 2000
          });
        }
      }).onCancel(() => {
        console.log('用户取消删除类别:', category.b_category_name);
      });
    };

    // 生命周期钩子
    onMounted(async () => {
      await fetchCategories();
    });

    return {
      t,
      categories,
      displayCategories,
      columns,
      loading,
      editDialogVisible,
      viewDialogVisible,
      currentCategory,
      searchText,
      parentFilter,
      parentOptions,
      pagination,
      totalCategories,
      goBack,
      addCategory,
      editCategory,
      viewCategory,
      deleteCategory,
      onCategorySave,
      onCategoryError,
      handleSearch,
      handleFilterChange,
      resetFilters,
      onRequest,
      getParentCategoryName,
      hasChildCategories,
      formatDate
    };
  }
});
</script>

<style scoped>
  .blog-category-container {
    width: 100% !important;
    height: 100% !important;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    max-width: none !important;
  }

  .full-width {
    width: 100% !important;
    max-width: none !important;
  }

  .full-height {
    height: 100% !important;
    min-height: 100% !important;
  }

  .q-card {
    width: 100% !important;
    max-width: none !important;
    border-radius: 0 !important;
  }

  .q-card-section {
    width: 100% !important;
    max-width: none !important;
  }

  .blog-category-table {
    width: 100% !important;
    min-width: 100% !important;
    overflow-x: auto;
    table-layout: auto !important;
  }

  .blog-category-table .q-table__container {
    width: 100% !important;
    overflow-x: visible;
  }

  .blog-category-table th,
  .blog-category-table td {
    padding: 12px 16px !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 类别信息单元格样式 */
  .category-info-cell {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .category-info-cell:hover {
    color: #1976d2;
  }
</style>