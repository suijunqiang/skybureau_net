<template>
  <div class="blog-container full-width full-height">
    <q-card class="full-width full-height shadow-0">
      <q-card-section class="q-pa-lg full-width">
        <!-- 顶部操作栏 -->
        <div class="row items-center q-mb-lg">
          <div class="col">
            <h2 class="text-h5 q-my-none text-weight-medium">{{ t('blog_management_title') }}</h2>
            <p class="text-grey-6 q-mb-none q-mt-xs">{{ t('blog_management_subtitle') }}</p>
          </div>
          <div class="col-auto">
            <q-btn 
              color="primary" 
              :label="t('add_blog')" 
              icon="add"
              @click="addBlog"
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
              :placeholder="t('search_blogs_placeholder')"
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
              v-model="statusFilter"
              :options="statusOptions"
              :label="t('filter_by_status')"
              outlined
              dense
              clearable
              @update:model-value="handleFilterChange"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="publishedFilter"
              :options="publishedOptions"
              :label="t('filter_by_published')"
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
              :label="t('reset_filters')"
              @click="resetFilters"
              size="md"
            />
          </div>
        </div>

        <!-- 博客列表表格 -->
        <q-table
          :rows="displayBlogs"
          :columns="columns"
          :loading="loading"
          row-key="id"
          flat
          bordered
          class="blog-table"
          :pagination="pagination"
          @request="onRequest"
        >
          <!-- 标题列自定义显示 -->
          <template v-slot:body-cell-b_title="props">
            <q-td :props="props">
              <div class="blog-title-cell">
                <div class="text-weight-medium text-primary cursor-pointer" @click="viewBlog(props.row)">
                  {{ props.value || t('untitled') }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  {{ formatDate(props.row.createdAt) }}
                </div>
              </div>
            </q-td>
          </template>

          <!-- 发布状态列 -->
          <template v-slot:body-cell-b_is_published="props">
            <q-td :props="props">
              <q-chip
                :color="props.value ? 'positive' : 'orange'"
                text-color="white"
                :label="props.value ? t('published') : t('draft')"
                size="sm"
              />
            </q-td>
          </template>

          <!-- 推荐状态列 -->
          <template v-slot:body-cell-b_is_recommend="props">
            <q-td :props="props">
              <q-icon
                :name="props.value ? 'star' : 'star_border'"
                :color="props.value ? 'amber' : 'grey'"
                size="sm"
              />
            </q-td>
          </template>

          <!-- 浏览量列 -->
          <template v-slot:body-cell-b_views="props">
            <q-td :props="props">
              <div class="flex items-center">
                <q-icon name="visibility" size="xs" class="q-mr-xs text-grey-6" />
                {{ props.value || 0 }}
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
                  @click="editBlog(props.row)"
                >
                  <q-tooltip>{{ t('edit') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="info"
                  icon="visibility"
                  size="sm"
                  @click="viewBlog(props.row)"
                >
                  <q-tooltip>{{ t('view') }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click="deleteBlog(props.row)"
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
              :label="t('back_to_list')"
              icon="arrow_back"
              @click="goBack"
            />
          </div>
          <div class="col-auto">
            <span class="text-grey-6">
              {{ t('total_blogs', { count: totalBlogs }) }}
            </span>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>

  <!-- 博客编辑对话框 -->
  <BlogEditDialog
    v-model:visible="editDialogVisible"
    :blog="currentBlog"
    @save="onBlogSave"
    @error="onBlogError"
  />

  <!-- 博客查看对话框 -->
  <BlogViewDialog
    v-model:visible="viewDialogVisible"
    :blog="currentBlog"
  />
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { API } from 'src/api/api.js';
import request from 'src/utils/request.js';
import { Notify, useQuasar } from 'quasar';
import BlogEditDialog from './BlogEditDialog.vue';
import BlogViewDialog from './BlogViewDialog.vue';

export default defineComponent({
  name: 'BlogManagement',
  components: {
    BlogEditDialog,
    BlogViewDialog
  },
  emits: ['goBackToWelcome'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const router = useRouter();
    const $q = useQuasar();
    
    // 响应式数据
    const blogs = ref([]);
    const loading = ref(false);
    const editDialogVisible = ref(false);
    const viewDialogVisible = ref(false);
    const currentBlog = ref(null);
    const searchText = ref('');
    const statusFilter = ref(null);
    const publishedFilter = ref(null);
    const totalBlogs = ref(0);

    // 分页配置
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    });

    // 筛选选项
    const statusOptions = [
      { label: t('all_status'), value: null },
      { label: t('published'), value: true },
      { label: t('draft'), value: false }
    ];

    const publishedOptions = [
      { label: t('all_types'), value: null },
      { label: t('recommended'), value: true },
      { label: t('normal'), value: false }
    ];

    // 表格列配置
    const columns = [
      {
        name: 'serialNum',
        label: t('serial_number'),
        field: 'serialNum',
        align: 'left',
        sortable: true,
        style: 'width: 80px'
      },
      {
        name: 'b_title',
        label: t('blog_title'),
        field: 'b_title',
        align: 'left',
        sortable: true,
        style: 'min-width: 200px'
      },
      {
        name: 'b_is_published',
        label: t('status'),
        field: 'b_is_published',
        align: 'center',
        sortable: true,
        style: 'width: 100px'
      },
      {
        name: 'b_is_recommend',
        label: t('recommend'),
        field: 'b_is_recommend',
        align: 'center',
        sortable: true,
        style: 'width: 80px'
      },
      {
        name: 'b_views',
        label: t('views'),
        field: 'b_views',
        align: 'center',
        sortable: true,
        style: 'width: 100px'
      },
      {
        name: 'b_read_time',
        label: t('read_time'),
        field: 'b_read_time',
        align: 'center',
        sortable: true,
        style: 'width: 100px',
        format: (val) => `${val || 0} ${t('minutes')}`
      },
      {
        name: 'actions',
        label: t('operations'),
        field: 'id',
        align: 'right',
        sortable: false,
        style: 'width: 120px'
      }
    ];

    // 获取博客数据
    const fetchBlogs = async (props = {}) => {
      loading.value = true;
      try {
        const { page = 1, rowsPerPage = 10 } = props.pagination || pagination.value;
        
        // 构建请求参数
        const params = new URLSearchParams({
          'pagination[page]': page,
          'pagination[pageSize]': rowsPerPage,
          'sort': 'createdAt:desc'
        });

        // 添加搜索条件
        if (searchText.value) {
          params.append('filters[b_title][$containsi]', searchText.value);
        }

        // 添加筛选条件
        if (statusFilter.value !== null) {
          params.append('filters[b_is_published][$eq]', statusFilter.value);
        }

        if (publishedFilter.value !== null) {
          params.append('filters[b_is_recommend][$eq]', publishedFilter.value);
        }

        const url = `${API.BLOG.B_BLOG.LIST}?${params}`;
        console.log('请求博客数据URL:', url);

        const response = await request.get(url);
        
        if (response.data && response.data.data) {
          blogs.value = response.data.data;
          totalBlogs.value = response.data.meta?.pagination?.total || 0;
          
          // 更新分页信息
          pagination.value = {
            page: response.data.meta?.pagination?.page || 1,
            rowsPerPage: response.data.meta?.pagination?.pageSize || 10,
            rowsNumber: totalBlogs.value
          };
          
          console.log('博客数据加载成功:', blogs.value);
        }
      } catch (error) {
        console.error('获取博客数据失败:', error);
        Notify.create({
          message: t('fetch_blogs_failed') + ': ' + (error.message || t('unknown_error')),
          color: 'negative',
          timeout: 3000
        });
      } finally {
        loading.value = false;
      }
    };

    // 显示的博客数据
    const displayBlogs = computed(() => {
      return blogs.value || [];
    });

    // 分页请求处理
    const onRequest = (props) => {
      fetchBlogs(props);
    };

    // 搜索处理
    const handleSearch = () => {
      pagination.value.page = 1;
      fetchBlogs();
    };

    // 筛选变化处理
    const handleFilterChange = () => {
      pagination.value.page = 1;
      fetchBlogs();
    };

    // 重置筛选
    const resetFilters = () => {
      searchText.value = '';
      statusFilter.value = null;
      publishedFilter.value = null;
      pagination.value.page = 1;
      fetchBlogs();
    };

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // 添加博客
    const addBlog = () => {
      currentBlog.value = null;
      editDialogVisible.value = true;
    };

    // 编辑博客
    const editBlog = (blog) => {
      currentBlog.value = { ...blog };
      editDialogVisible.value = true;
    };

    // 查看博客
    const viewBlog = (blog) => {
      currentBlog.value = { ...blog };
      viewDialogVisible.value = true;
    };

    // 博客保存成功处理
    const onBlogSave = (updatedBlog) => {
      const index = blogs.value.findIndex(b => b.id === updatedBlog.id);
      if (index !== -1) {
        blogs.value[index] = updatedBlog;
      } else {
        blogs.value.unshift(updatedBlog);
        totalBlogs.value += 1;
      }

      Notify.create({
        message: t('save_success'),
        color: 'positive',
        timeout: 2000
      });

      // 刷新数据
      setTimeout(() => {
        fetchBlogs();
      }, 500);
    };

    // 博客保存失败处理
    const onBlogError = (error) => {
      Notify.create({
        message: t('save_failed') + ': ' + (error.message || t('unknown_error')),
        color: 'negative',
        timeout: 3000
      });
    };

    // 删除博客
    const deleteBlog = (blog) => {
      $q.dialog({
        title: t('confirm_delete'),
        message: t('confirm_delete_blog') + ': ' + (blog.b_title || t('untitled')) + '?',
        ok: {
          push: true,
          color: 'negative',
          label: t('delete')
        },
        cancel: {
          push: true,
          color: 'grey',
          label: t('cancel')
        },
        persistent: true
      }).onOk(async () => {
        try {
          const deleteUrl = API.BLOG.B_BLOG.DELETE(blog.documentId || blog.id);
          console.log('删除博客请求URL:', deleteUrl);

          await request.delete(deleteUrl);
          
          // 从列表中移除
          blogs.value = blogs.value.filter(b => b.id !== blog.id);
          totalBlogs.value -= 1;

          Notify.create({
            message: t('delete_success'),
            color: 'positive',
            timeout: 2000
          });

          // 刷新数据
          fetchBlogs();
        } catch (error) {
          console.error('删除博客失败:', error);
          Notify.create({
            message: t('delete_failed') + ': ' + (error.message || t('unknown_error')),
            color: 'negative',
            timeout: 3000
          });
        }
      });
    };

    // 返回
    const goBack = () => {
      // 使用路由导航，参考MenuPage.vue的做法
      // 根据当前路由决定导航方式
      const currentPath = router.currentRoute.value.path;
      if (currentPath.includes('/blog/list')) {
        // 如果是通过/blog/list路由访问，返回到用户列表页面（与MenuPage保持一致）
        router.push('/system/userManagement/userList');
      } else {
        // 如果是在UserManagement中作为子组件，发送事件
        emit('goBackToWelcome');
      }
    };

    // 组件挂载时获取数据
    onMounted(() => {
      fetchBlogs();
    });

    return {
      t,
      blogs,
      loading,
      editDialogVisible,
      viewDialogVisible,
      currentBlog,
      searchText,
      statusFilter,
      publishedFilter,
      totalBlogs,
      pagination,
      statusOptions,
      publishedOptions,
      columns,
      displayBlogs,
      onRequest,
      handleSearch,
      handleFilterChange,
      resetFilters,
      formatDate,
      addBlog,
      editBlog,
      viewBlog,
      deleteBlog,
      goBack,
      onBlogSave,
      onBlogError
    };
  }
});
</script>

<style scoped>
.blog-container {
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

.blog-table {
  width: 100% !important;
  min-width: 100% !important;
  overflow-x: auto;
  table-layout: auto !important;
}

.blog-table .q-table__container {
  width: 100% !important;
  overflow-x: visible;
}

.blog-table th,
.blog-table td {
  padding: 8px 16px !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.blog-table th:not(:last-child),
.blog-table td:not(:last-child) {
  width: auto;
  min-width: 120px;
}

.blog-table th:last-child,
.blog-table td:last-child {
  width: 120px;
  min-width: 120px;
  text-align: right;
}

.blog-title-cell {
  max-width: 300px;
}

.blog-title-cell .text-primary:hover {
  text-decoration: underline;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .q-pa-lg {
    padding: 16px;
  }
}
</style>