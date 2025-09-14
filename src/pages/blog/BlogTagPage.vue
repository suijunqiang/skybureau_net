<template>
  <div class="blog-tag-container full-width full-height">
    <q-card class="full-width full-height shadow-0">
      <q-card-section class="q-pa-lg full-width">
        <!-- 顶部操作栏 -->
        <div class="row items-center q-mb-lg">
          <div class="col">
            <h2 class="text-h5 q-my-none text-weight-medium">{{ t('tag_management_title') || '博客标签管理' }}</h2>
            <p class="text-grey-6 q-mb-none q-mt-xs">{{ t('tag_management_subtitle') || '管理博客文章标签信息' }}</p>
          </div>
          <div class="col-auto">
            <q-btn
              color="primary"
              :label="t('add_tag') || '新增标签'"
              icon="add"
              @click="addTag"
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
              :placeholder="t('search_tags_placeholder') || '搜索标签...'"
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
              v-model="blogFilter"
              :options="blogOptions"
              :label="t('filter_by_blog') || '按博客筛选'"
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

        <!-- 标签列表表格 -->
        <q-table
          :rows="displayTags"
          :columns="columns"
          :loading="loading"
          row-key="id"
          flat
          bordered
          class="blog-tag-table"
          :pagination="pagination"
          @request="onRequest"
        >
          <!-- 博客ID列自定义显示 -->
          <template v-slot:body-cell-b_blog_id="props">
            <q-td :props="props">
              <div class="text-primary cursor-pointer" @click="viewBlog(props.value)">
                {{ props.value || t('not_set') }}
              </div>
            </q-td>
          </template>

          <!-- 标签ID列自定义显示 -->
          <template v-slot:body-cell-b_tag_id="props">
            <q-td :props="props">
              <div class="text-primary cursor-pointer" @click="viewTag(props.value)">
                {{ props.value || t('not_set') }}
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
                  @click="editTag(props.row)"
                >
                  <q-tooltip>{{ t('edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="info"
                  icon="visibility"
                  size="sm"
                  @click="viewTag(props.row)"
                >
                  <q-tooltip>{{ t('view') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="deleteTag(props.row)"
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
              {{ t('total_tags', { count: totalTags }) || `总共 ${totalTags} 个标签` }}
            </span>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>

  <!-- 标签编辑对话框 -->
  <BlogTagEditDialog
    v-model:visible="editDialogVisible"
    :tag="currentTag"
    :allTags="tags"
    :allBlogs="blogs"
    @save="onTagSave"
    @error="onTagError"
  />
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API } from 'src/api/api.js';
import { Notify, useQuasar } from 'quasar';
import BlogTagEditDialog from './BlogTagEditDialog.vue';

export default defineComponent({
  name: 'BlogTagPage',
  components: {
    BlogTagEditDialog
  },
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    const $q = useQuasar();
    const tags = ref([]);
    const blogs = ref([]);
    const loading = ref(false);
    const editDialogVisible = ref(false);
    const currentTag = ref(null);

    // 搜索和筛选状态
    const searchText = ref('');
    const blogFilter = ref(null);

    // 筛选选项 - 博客选项
    const blogOptions = computed(() => {
      return [
        { label: t('all_blogs') || '所有博客', value: null },
        ...blogs.value.map(blog => ({
          label: `Blog ${blog.id}`,
          value: blog.id
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
      { name: "b_blog_id", label: t("blog_id") || "博客ID", field: "b_blog_id", align: "left", sortable: true, width: 100 },
      { name: "b_tag_id", label: t("tag_id") || "标签ID", field: "b_tag_id", align: "left", sortable: true, width: 100 },
      { name: "documentId", label: t("document_id") || "文档ID", field: "documentId", align: "left", sortable: true },
      { name: "updatedAt", label: t("update_time") || "更新时间", field: "updatedAt", align: "left", sortable: true },
      { name: "actions", label: t("operations") || "操作", field: "id", align: "right", width: 150, sortable: false }
    ]);

    // 获取标签数据
    const fetchTags = async () => {
      loading.value = true;
      try {
        const response = await axios.get(API.BLOG.B_BLOG_TAGS.LIST);
        tags.value = response.data.data;
        console.log('标签数据加载成功:', tags.value);
      } catch (error) {
        console.error('获取标签数据失败:', error);
        tags.value = [];
        Notify.create({
          message: t('fetch_tags_failed') + ': ' + (error.message || t('unknown_error')),
          color: 'negative',
          timeout: 2000
        });
      } finally {
        loading.value = false;
      }
    };

    // 获取博客数据
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(API.BLOG.B_BLOG.LIST);
        blogs.value = response.data.data;
        console.log('博客数据加载成功:', blogs.value);
      } catch (error) {
        console.error('获取博客数据失败:', error);
        blogs.value = [];
      }
    };

    // 搜索和筛选功能
    const handleSearch = () => {
      console.log('Searching for:', searchText.value);
    };

    const handleFilterChange = () => {
      console.log('Filter changed:', blogFilter.value);
    };

    const resetFilters = () => {
      searchText.value = '';
      blogFilter.value = null;
    };

    // 表格请求处理
    const onRequest = (props) => {
      const { page, rowsPerPage } = props.pagination;
      pagination.value.page = page;
      pagination.value.rowsPerPage = rowsPerPage;
    };

    // 显示的标签数据（带搜索和筛选）
    const displayTags = computed(() => {
      let filtered = tags.value || [];

      // 搜索筛选
      if (searchText.value) {
        const search = searchText.value.toLowerCase();
        filtered = filtered.filter(tag =>
          (tag.b_blog_id && tag.b_blog_id.toString().toLowerCase().includes(search)) ||
          (tag.b_tag_id && tag.b_tag_id.toString().toLowerCase().includes(search)) ||
          (tag.documentId && tag.documentId.toLowerCase().includes(search))
        );
      }

      // 博客筛选
      if (blogFilter.value !== null) {
        filtered = filtered.filter(tag => tag.b_blog_id == blogFilter.value);
      }

      return filtered;
    });

    // 总标签数
    const totalTags = computed(() => displayTags.value.length);

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

    // 添加标签
    const addTag = () => {
      currentTag.value = null;
      editDialogVisible.value = true;
    };

    // 编辑标签
    const editTag = (tag) => {
      currentTag.value = { ...tag };
      editDialogVisible.value = true;
    };

    // 查看标签
    const viewTag = (tag) => {
      // 可以实现查看标签详情的功能
      console.log('查看标签:', tag);
      // 这里可以打开查看对话框或者跳转到详情页
    };

    // 查看博客
    const viewBlog = (blogId) => {
      // 可以实现查看博客详情的功能
      console.log('查看博客:', blogId);
      // 这里可以打开查看对话框或者跳转到博客详情页
    };

    // 删除标签
    const deleteTag = (tag) => {
      $q.dialog({
        title: t('confirm_delete') || '确认删除',
        message: t('confirm_delete_tag', { blogId: tag.b_blog_id, tagId: tag.b_tag_id }) || `确定要删除博客ID ${tag.b_blog_id} 的标签ID ${tag.b_tag_id} 吗？`,
        cancel: true,
        persistent: true
      }).onOk(async () => {
        try {
          await axios.delete(API.BLOG.B_BLOG_TAGS.DELETE(tag.id));
          const index = tags.value.findIndex(t => t.id === tag.id);
          if (index !== -1) {
            tags.value.splice(index, 1);
          }

          Notify.create({
            message: t('delete_success'),
            color: 'positive',
            timeout: 2000
          });
        } catch (error) {
          console.error('删除标签失败:', error);
          Notify.create({
            message: t('delete_failed') + ': ' + (error.message || t('unknown_error')),
            color: 'negative',
            timeout: 2000
          });
        }
      });
    };

    // 标签保存成功处理
    const onTagSave = (updatedTag) => {
      const index = tags.value.findIndex(t => t.id === updatedTag.id);
      if (index !== -1) {
        tags.value[index] = updatedTag;
      } else {
        tags.value.push(updatedTag);
      }

      Notify.create({
        message: t('save_success'),
        color: 'positive',
        timeout: 2000
      });
    };

    // 标签保存失败处理
    const onTagError = (error) => {
      Notify.create({
        message: t('save_failed') + ': ' + (error.message || t('unknown_error')),
        color: 'negative',
        timeout: 2000
      });
    };

    // 页面加载时获取数据
    onMounted(async () => {
      await fetchTags();
      await fetchBlogs();
    });

    return {
      t,
      tags,
      blogs,
      loading,
      editDialogVisible,
      currentTag,
      searchText,
      blogFilter,
      blogOptions,
      pagination,
      columns,
      displayTags,
      totalTags,
      handleSearch,
      handleFilterChange,
      resetFilters,
      onRequest,
      formatDate,
      goBack,
      addTag,
      editTag,
      viewTag,
      viewBlog,
      deleteTag,
      onTagSave,
      onTagError
    };
  }
});
</script>

<style scoped>
  .blog-tag-container {
    height: 100%;
    min-height: 100%;
  }

  .full-width {
    width: 100% !important;
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

  .blog-tag-table {
    width: 100% !important;
    min-width: 100% !important;
    overflow-x: auto;
    table-layout: auto !important;
  }

  .blog-tag-table .q-table__container {
    width: 100% !important;
    overflow-x: visible;
  }

  .blog-tag-table th,
  .blog-tag-table td {
    padding: 12px 16px !important;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
