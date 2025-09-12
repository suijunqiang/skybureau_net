<template>
  <div class="blog-list-container theme-background full-width full-height">
    <q-card class="full-width full-height shadow-0">
      <q-card-section class="q-pa-lg full-width" style="margin: 0 !important; padding-left: 24px !important; padding-right: 24px !important;">
        <!-- 顶部标题栏 -->
        <div class="row items-center q-mb-lg">
          <div class="col">
            <h2 class="text-h4 q-my-none text-weight-medium text-primary">{{ t('blog_list_title') }}</h2>
            <p class="text-grey-6 q-mb-none q-mt-xs text-body1">{{ t('blog_list_subtitle') }}</p>
          </div>
        </div>

        <!-- 搜索和筛选栏 -->
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-12 col-md-6">
            <q-input
              v-model="searchText"
              :placeholder="t('search_blogs_placeholder')"
              outlined
              dense
              clearable
              @input="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="categoryFilter"
              :options="categoryOptions"
              :label="t('filter_by_category')"
              outlined
              dense
              clearable
              emit-value
              map-options
              @update:model-value="handleFilterChange"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-btn
              flat
              color="primary"
              :label="t('reset_filters')"
              @click="resetFilters"
              size="md"
            />
          </div>
        </div>

        <!-- 博客列表表格 - Row Style -->
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
          :rows-per-page-options="[5, 10, 15, 20]"
          hide-header
        >
          <!-- 自定义行内容 -->
          <template v-slot:body-cell="props">
            <q-td :props="props" class="q-pa-none full-width">
              <q-card class="blog-row-card theme-card q-ma-md" flat bordered @click="viewBlog(props.row)">
                <div class="row no-wrap items-center q-pa-lg cursor-pointer">
                  <!-- 封面图片 -->
                  <div class="col-auto q-mr-md">
                    <q-avatar size="200px" class="rounded-borders">
                      <q-img
                        :src="getImageUrl(props.row)"
                        :alt="props.row.b_title"
                        fit="cover"
                        loading="lazy"
                      >
                        <template v-slot:error>
                          <div class="absolute-full flex flex-center bg-grey-3 text-grey-6">
                            <q-icon name="image" size="80px" />
                          </div>
                        </template>
                      </q-img>
                    </q-avatar>
                  </div>

                  <!-- 内容区域 -->
                  <div class="col">
                    <div class="row items-start">
                      <!-- 主要内容 -->
                      <div class="col">
                        <!-- 标题和标签 -->
                        <div class="row items-center q-mb-sm">
                          <div class="col">
                            <div class="text-h6 text-weight-medium text-primary blog-row-title theme-text">
                              {{ props.row.b_title || t('untitled') }}
                            </div>
                          </div>
                          <div class="col-auto q-ml-md">
                            <div class="flex items-center q-gutter-sm">
                              <!-- 推荐标志 -->
                              <q-chip
                                v-if="props.row.b_is_recommend"
                                color="amber"
                                text-color="white"
                                icon="star"
                                size="sm"
                              >
                                {{ t('recommended') }}
                              </q-chip>
                              <!-- 分类标签 -->
                              <q-chip
                                v-if="props.row.b_category_name"
                                color="primary"
                                text-color="white"
                                :label="props.row.b_category_name"
                                size="sm"
                              />
                              <!-- 发布状态 -->
                              <q-chip
                                color="positive"
                                text-color="white"
                                :label="t('published')"
                                size="sm"
                              />
                            </div>
                          </div>
                        </div>

                        <!-- 描述 -->
                        <div class="text-body2 text-grey-7 q-mb-md blog-row-description theme-text-light" v-html="props.row.b_description">
                        </div>

                        <!-- 元信息和操作 -->
                        <div class="row items-center justify-between">
                          <div class="col-auto">
                            <div class="flex items-center q-gutter-md text-caption text-grey-6">
                              <div class="flex items-center">
                                <q-icon name="schedule" size="xs" class="q-mr-xs" />
                                {{ formatDate(props.row.createdAt) }}
                              </div>
                              <div class="flex items-center">
                                <q-icon name="visibility" size="xs" class="q-mr-xs" />
                                {{ props.row.b_views || 0 }} {{ t('views') }}
                              </div>
                              <div class="flex items-center">
                                <q-icon name="access_time" size="xs" class="q-mr-xs" />
                                {{ props.row.b_read_time || 0 }} {{ t('minutes') }}
                              </div>
                            </div>
                          </div>
                          <div class="col-auto">
                            <q-btn
                              color="primary"
                              :label="t('read_more')"
                              size="md"
                              outline
                              class="theme-button"
                              @click.stop="viewBlog(props.row)"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </q-card>
            </q-td>
          </template>

          <!-- 无数据状态 -->
          <template v-slot:no-data>
            <div class="full-width row flex-center q-gutter-sm q-py-xl">
              <q-icon size="2em" name="sentiment_dissatisfied" />
              <span class="text-subtitle1">{{ t('no_blogs_found') }}</span>
            </div>
          </template>
        </q-table>

        <!-- 底部统计信息 -->
        <div class="row justify-center q-mt-lg">
          <div class="col-auto">
            <span class="text-grey-6">
              {{ t('total_blogs', { count: totalBlogs }) }}
            </span>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 博客查看对话框 -->
    <BlogViewDialog
      v-model:visible="viewDialogVisible"
      :blog="currentBlog"
    />
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { API, BASE_URL } from 'src/api/api.js';
import axios from 'axios';
import { Notify } from 'quasar';
import BlogViewDialog from './blog/BlogViewDialog.vue';

export default defineComponent({
  name: 'BlogList',
  components: {
    BlogViewDialog
  },
  setup() {
    const { t } = useI18n();
    
    // 响应式数据
    const blogs = ref([]);
    const loading = ref(false);
    const viewDialogVisible = ref(false);
    const currentBlog = ref(null);
    const searchText = ref('');
    const categoryFilter = ref(null);
    const totalBlogs = ref(0);
    const categories = ref([]);

    // 分页配置
    const pagination = ref({
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    });

    // 分类选项
    const categoryOptions = computed(() => {
      return [
        { label: t('all_categories'), value: null },
        ...categories.value.map(cat => ({
          label: cat.b_category_name || `Category ${cat.category_id}`,
          value: cat.category_id
        }))
      ];
    });

    // 表格列配置（只需要一列来显示完整的行内容）
    const columns = [
      {
        name: 'content',
        label: '',
        field: 'id',
        align: 'left',
        style: 'width: 100%'
      }
    ];

    // 创建无需Token的axios实例
    const publicRequest = axios.create({
      baseURL: BASE_URL,
      timeout: 10000
    });

    // 获取分类数据
    const fetchCategories = async () => {
      try {
        const response = await publicRequest.get('/api/b-categories');
        if (response.data && response.data.data) {
          categories.value = response.data.data;
        }
      } catch (error) {
        console.error('获取分类列表失败:', error);
      }
    };

    // 获取博客数据（公开访问，无需Token）
    const fetchBlogs = async (props = {}) => {
      loading.value = true;
      try {
        const { page = 1, rowsPerPage = 10 } = props.pagination || pagination.value;
        
        // 构建请求参数
        const params = new URLSearchParams({
          'pagination[page]': page,
          'pagination[pageSize]': rowsPerPage,
          'sort': 'createdAt:desc',
          'populate': 'b_blog_picture_profile',
          'filters[b_is_published][$eq]': 'true'  // 只获取已发布的博客
        });

        // 添加搜索条件
        if (searchText.value) {
          params.append('filters[b_title][$containsi]', searchText.value);
        }

        // 添加分类筛选
        if (categoryFilter.value !== null && categoryFilter.value !== undefined) {
          params.append('filters[b_category_id][$eq]', categoryFilter.value);
          console.log('添加分类过滤:', categoryFilter.value);
        }

        const url = `/api/b-blogs?${params}`;
        console.log('请求博客数据URL:', url);

        const response = await publicRequest.get(url);
        
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
    const handleFilterChange = (newValue) => {
      console.log('分类过滤变化:', newValue);
      categoryFilter.value = newValue;
      pagination.value.page = 1;
      fetchBlogs();
    };

    // 重置筛选
    const resetFilters = () => {
      console.log('重置过滤条件');
      searchText.value = '';
      categoryFilter.value = null;
      pagination.value.page = 1;
      // 等待下一个事件循环后再获取数据
      setTimeout(() => {
        fetchBlogs();
      }, 50);
    };

    // 获取图片URL的辅助函数
    const getImageUrl = (row, format = 'small') => {
      if (!row) return null;
      
      // 1. 优先尝试Current Profile Picture (b_first_pic)
      if (row.b_first_pic !== null && row.b_first_pic && row.b_first_pic.trim() !== '') {
        if (row.b_first_pic.startsWith('http')) {
          return row.b_first_pic;
        }
        return `${BASE_URL}${row.b_first_pic}`;
      }
      
      // 2. 使用b_blog_picture_profile中的url字段
      const blogPictureProfile = row.b_blog_picture_profile;
      if (!blogPictureProfile) return null;
      
      if (blogPictureProfile.url) {
        return `${BASE_URL}${blogPictureProfile.url}`;
      }
      
      // 3. 尝试使用格式化的图片
      if (blogPictureProfile.formats && blogPictureProfile.formats[format]) {
        return `${BASE_URL}${blogPictureProfile.formats[format].url}`;
      }
      
      if (blogPictureProfile.formats && blogPictureProfile.formats.small) {
        return `${BASE_URL}${blogPictureProfile.formats.small.url}`;
      }
      
      if (blogPictureProfile.formats && blogPictureProfile.formats.thumbnail) {
        return `${BASE_URL}${blogPictureProfile.formats.thumbnail.url}`;
      }
      
      return null;
    };

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    };

    // 查看博客
    const viewBlog = (blog) => {
      currentBlog.value = { ...blog };
      viewDialogVisible.value = true;
    };

    // 组件挂载时获取数据
    onMounted(async () => {
      await Promise.all([
        fetchCategories(),
        fetchBlogs()
      ]);
    });

    // 监听搜索变化
    watch(searchText, () => {
      pagination.value.page = 1;
      fetchBlogs();
    }, { debounce: 300 });

    return {
      t,
      blogs,
      loading,
      viewDialogVisible,
      currentBlog,
      searchText,
      categoryFilter,
      totalBlogs,
      pagination,
      categoryOptions,
      columns,
      displayBlogs,
      onRequest,
      handleSearch,
      handleFilterChange,
      resetFilters,
      getImageUrl,
      formatDate,
      viewBlog
    };
  }
});
</script>

<style scoped>
.blog-list-container {
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box;
  max-width: none !important;
}

.full-width {
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

.full-height {
  height: 100% !important;
  min-height: 100% !important;
}

.q-card {
  width: 100% !important;
  max-width: none !important;
  border-radius: 0 !important;
  margin: 0 !important;
}

.q-card-section {
  width: 100% !important;
  max-width: none !important;
}

.blog-table {
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

.blog-table .q-table__container {
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

.blog-table td {
  width: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
}

.blog-row-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  margin: 16px 0;
  min-height: 240px;
}

.blog-row-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.blog-row-title {
  line-height: 1.4;
  color: #1976d2;
  cursor: pointer;
}

.blog-row-title:hover {
  text-decoration: underline;
}

.blog-row-description {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.6;
  max-height: 6.4em;
  font-size: 1rem;
}

/* 去除HTML标签的样式影响 */
.blog-row-description :deep(p) {
  margin: 0;
  padding: 0;
}

.blog-row-description :deep(h1),
.blog-row-description :deep(h2),
.blog-row-description :deep(h3),
.blog-row-description :deep(h4),
.blog-row-description :deep(h5),
.blog-row-description :deep(h6) {
  font-size: inherit;
  font-weight: inherit;
  margin: 0;
  padding: 0;
}

/* 响应式调整 */
@media (max-width: 599px) {
  .q-pa-lg {
    padding: 16px !important;
  }
  
  .blog-row-card {
    margin: 8px 0 !important;
    min-height: 180px;
  }
  
  .blog-row-card .row {
    flex-direction: column;
  }
  
  .blog-row-card .q-avatar {
    width: 120px !important;
    height: 120px !important;
    margin-bottom: 16px;
  }
}

@media (max-width: 1023px) {
  .blog-row-card {
    margin: 12px 0 !important;
    min-height: 200px;
  }
  
  .blog-row-card .q-avatar {
    width: 160px !important;
    height: 160px !important;
  }
}
</style>