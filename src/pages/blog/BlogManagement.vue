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
              @click="handleSearch"
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

          <!-- 封面图片列自定义显示 -->
          <template v-slot:body-cell-b_blog_picture_profile="props">
            <q-td :props="props">
              <div class="flex justify-center">
                <q-avatar 
                  v-if="getImageUrl(props.row)" 
                  size="40px" 
                  class="rounded-borders"
                >
                  <q-img 
                    :src="getImageUrl(props.row)" 
                    :alt="props.row.b_title"
                    fit="cover"
                  >
                    <template v-slot:error>
                      <div class="absolute-full flex flex-center bg-grey-3 text-grey-6">
                        <q-icon name="broken_image" size="20px" />
                      </div>
                    </template>
                  </q-img>
                </q-avatar>
                <q-avatar v-else size="40px" class="bg-grey-3 text-grey-6">
                  <q-icon name="image" size="20px" />
                </q-avatar>
              </div>
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
import { API, BASE_URL } from 'src/api/api.js';
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

    // 获取图片URL的辅助函数 - 增强版，添加更严格的空值检查
    const getImageUrl = (row, format = 'thumbnail') => {
      if (!row || typeof row !== 'object') {
        console.warn('getImageUrl接收到无效的row参数');
        return null;
      }
      
      // 1. 优先尝试Current Profile Picture (b_first_pic)，但如果为null则跳过
      if (row.b_first_pic !== null && row.b_first_pic && row.b_first_pic.trim() !== '') {
        // 如果是完整URL，直接返回
        if (row.b_first_pic.startsWith('http')) {
          return row.b_first_pic;
        }
        // 如果是相对路径，拼接base URL
        return `${BASE_URL}${row.b_first_pic}`;
      }
      
      // 2. 如果b_first_pic为null或空，使用b_blog_picture_profile中的url字段
      const blogPictureProfile = row.b_blog_picture_profile;
      if (!blogPictureProfile || typeof blogPictureProfile !== 'object') {
        return null;
      }
      
      // 关键修正：当b_first_pic为null时，直接使用url字段显示图片
      if (blogPictureProfile.url) {
        return `${BASE_URL}${blogPictureProfile.url}`;
      }
      
      // 备用：如果url字段也没有，尝试使用previewURL
      if (blogPictureProfile.previewURL && blogPictureProfile.previewURL !== null) {
        return `${BASE_URL}${blogPictureProfile.previewURL}`;
      }
      
      // 如果有指定格式的图片，使用它
      if (blogPictureProfile.formats && typeof blogPictureProfile.formats === 'object' && blogPictureProfile.formats[format]) {
        return `${BASE_URL}${blogPictureProfile.formats[format].url}`;
      }
      
      // 如果没有指定格式，尝试使用小尺寸图片
      if (blogPictureProfile.formats && typeof blogPictureProfile.formats === 'object' && blogPictureProfile.formats.small) {
        return `${BASE_URL}${blogPictureProfile.formats.small.url}`;
      }
      
      // 如果没有小尺寸图片，尝试使用缩略图
      if (blogPictureProfile.formats && typeof blogPictureProfile.formats === 'object' && blogPictureProfile.formats.thumbnail) {
        return `${BASE_URL}${blogPictureProfile.formats.thumbnail.url}`;
      }
      
      return null;
    };

    // 表格列配置
    const columns = [
      {
        name: 'blog_id',
        label: t('serial_number'),
        field: 'blog_id',
        align: 'left',
        sortable: true,
        style: 'width: 80px'
      },
      {
        name: 'b_blog_picture_profile',
        label: t('cover'),
        field: 'b_blog_picture_profile',
        align: 'center',
        sortable: false,
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
          'sort': 'createdAt:desc',
          'populate': 'b_blog_picture_profile'
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
        console.log('BASE_URL配置:', BASE_URL);

        // 记录请求前的状态
        console.log('请求前的筛选条件:', {
          searchText: searchText.value,
          statusFilter: statusFilter.value,
          publishedFilter: publishedFilter.value,
          page: page,
          rowsPerPage: rowsPerPage
        });

        const startTime = Date.now();
        const response = await request.get(url);
        const endTime = Date.now();
        
        console.log('API请求耗时:', endTime - startTime, 'ms');
        console.log('完整响应对象:', response);
        console.log('响应状态码:', response.status);
        console.log('响应头部:', response.headers);
        console.log('响应数据结构:', {
          hasData: !!response.data,
          dataType: typeof response.data,
          hasDataArray: response.data && !!response.data.data,
          dataArrayType: response.data && response.data.data ? typeof response.data.data : 'undefined',
          dataArrayLength: response.data && response.data.data && Array.isArray(response.data.data) ? response.data.data.length : 'N/A'
        });

        // 直接打印数据以查看详情
        if (response && response.data && response.data.data) {
          console.log('博客数据详情:', JSON.stringify(response.data.data, null, 2));
          console.log('元数据:', JSON.stringify(response.data.meta, null, 2));
          
          blogs.value = response.data.data || [];
          totalBlogs.value = response.data.meta?.pagination?.total || 0;
          
          // 更新分页信息
          pagination.value = {
            page: response.data.meta?.pagination?.page || 1,
            rowsPerPage: response.data.meta?.pagination?.pageSize || 10,
            rowsNumber: totalBlogs.value
          };
          
          console.log('博客数据加载成功，共', blogs.value.length, '条数据');
          console.log('设置后的博客数组:', blogs.value);
        } else {
          console.log('未获取到博客数据，详细原因:', {
            responseExists: !!response,
            dataExists: response ? !!response.data : false,
            dataArrayExists: response && response.data ? !!response.data.data : false,
            responseText: response ? JSON.stringify(response, null, 2).substring(0, 500) : '无响应'
          });
          blogs.value = [];
          totalBlogs.value = 0;
        }
      } catch (error) {
        console.error('获取博客数据失败:', error);
        console.error('错误详情:', {
          message: error.message,
          stack: error.stack,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          } : '无响应对象'
        });
        
        // 尝试直接使用fetch API作为备选方案
        try {
          const altUrl = `${API.BLOG.B_BLOG.LIST}?${new URLSearchParams({
            'pagination[page]': 1,
            'pagination[pageSize]': 10,
            'sort': 'createdAt:desc',
            'populate': 'b_blog_picture_profile'
          })}`;
          console.log('尝试使用原生fetch API:', altUrl);
          
          const fetchResponse = await fetch(altUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              // 添加可能需要的认证头
              'Authorization': `Bearer ${useTokenStore().token || ''}`
            },
            credentials: 'include' // 包含cookies
          });
          
          const fetchData = await fetchResponse.json();
          console.log('原生fetch响应:', fetchData);
          
          if (fetchData && fetchData.data) {
            blogs.value = fetchData.data || [];
            totalBlogs.value = fetchData.meta?.pagination?.total || 0;
            console.log('通过原生fetch获取到', blogs.value.length, '条数据');
          }
        } catch (fetchError) {
          console.error('原生fetch也失败:', fetchError);
        }
        
        Notify.create({
          message: t('fetch_blogs_failed') + ': ' + (error.message || t('unknown_error')),
          color: 'negative',
          timeout: 3000
        });
        // 确保在错误情况下也有数据显示
        blogs.value = [];
        totalBlogs.value = 0;
      } finally {
        console.log('请求完成后的博客数据状态:', {
          blogsLength: blogs.value.length,
          totalBlogs: totalBlogs.value,
          displayBlogsLength: displayBlogs.value.length
        });
        loading.value = false;
      }
    };

    // 显示的博客数据 - 确保总是返回有效的数组
    const displayBlogs = computed(() => {
      // 添加防御性检查，确保blogs.value是一个数组
      if (!Array.isArray(blogs.value)) {
        console.warn('blogs.value不是一个数组，返回空数组');
        return [];
      }
      return blogs.value;
    });

    // 分页请求处理 - 添加参数检查
    const onRequest = (props) => {
      if (!props || typeof props !== 'object') {
        console.warn('onRequest接收到无效的props参数');
        fetchBlogs();
        return;
      }
      fetchBlogs(props);
    };

    // 搜索处理 - 防止事件对象未定义的情况
    const handleSearch = (event) => {
      // 防御性编程，确保即使没有event参数也能正常工作
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      pagination.value.page = 1;
      fetchBlogs();
    };

    // 筛选变化处理 - 防止事件对象未定义的情况
    const handleFilterChange = (event) => {
      // 防御性编程，确保即使没有event参数也能正常工作
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
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
      emit('goBackToWelcome');
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
      onBlogError,
      getImageUrl
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