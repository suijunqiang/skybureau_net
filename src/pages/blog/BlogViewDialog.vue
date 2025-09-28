<template>
  <q-dialog
    v-model="dialogVisible"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="full-width full-height">
      <!-- 对话框头部 -->
      <q-card-section class="row items-center q-pb-none bg-grey-9 text-white">
        <div class="col">
          <div class="text-h6">
            {{ t('view_blog') }}
          </div>
          <div class="text-caption opacity-70">
            {{ blog?.b_title || t('untitled') }}
          </div>
        </div>
        <div class="col-auto q-gutter-sm">
          <q-btn
            flat
            round
            dense
            icon="edit"
            @click="editBlog"
            :tooltip="t('edit')"
          />
          <q-btn
            flat
            round
            dense
            icon="close"
            @click="closeDialog"
          />
        </div>
      </q-card-section>

      <!-- 对话框内容 -->
      <q-card-section class="w-full q-pa-md" style="height: calc(100vh - 80px); overflow-y: auto;">
        <div v-if="blog" class="blog-content">
          <!-- 博客头部信息 -->
          <div class="blog-header q-mb-lg">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <h1 class="text-h4 q-my-none">{{ blog.b_title || t('untitled') }}</h1>
              </div>
              <div class="col-12">
                <div class="row items-center q-gutter-md text-grey-6">
                  <div class="flex items-center q-gutter-xs">
                    <q-icon name="schedule" size="sm" />
                    <span>{{ formatDate(blog.createdAt) }}</span>
                  </div>
                  <div class="flex items-center q-gutter-xs">
                    <q-icon name="visibility" size="sm" />
                    <span>{{ blog.b_views || 0 }} {{ t('views') }}</span>
                  </div>
                  <div class="flex items-center q-gutter-xs">
                    <q-icon name="access_time" size="sm" />
                    <span>{{ blog.b_read_time || 0 }} {{ t('minutes') }}</span>
                  </div>
                  <div class="flex items-center q-gutter-xs">
                    <q-icon name="text_fields" size="sm" />
                    <span>{{ blog.words || 0 }} {{ t('words') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 封面图片 - 优先显示b_first_pic，再显示b_blog_picture_profile -->
          <div v-if="getImageUrl(blog)" class="blog-cover q-mb-lg">
            <div class="text-h6 q-mb-md text-primary">{{ t('cover') }}</div>
            <q-img
              :src="getImageUrl(blog, 'small')"
              :alt="blog.b_title"
              style="max-height: 400px"
              class="rounded-borders"
              fit="cover"
            >
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-grey-3 text-grey-6">
                  <q-icon name="broken_image" size="48px" />
                </div>
              </template>
            </q-img>
          </div>

          <!-- 博客状态标签 -->
          <div class="blog-status q-mb-lg">
            <div class="row q-gutter-sm">
              <q-chip
                :color="blog.b_is_published ? 'positive' : 'orange'"
                text-color="white"
                :label="blog.b_is_published ? t('published') : t('draft')"
                icon="public"
              />
              <q-chip
                v-if="blog.b_is_recommend"
                color="amber"
                text-color="white"
                :label="t('recommended')"
                icon="star"
              />
              <q-chip
                v-if="blog.b_is_top"
                color="red"
                text-color="white"
                :label="t('pinned')"
                icon="push_pin"
              />
              <q-chip
                v-if="blog.b_password"
                color="purple"
                text-color="white"
                :label="t('password_protected')"
                icon="lock"
              />
              <q-chip
                :color="blog.b_is_comment_enabled ? 'blue' : 'grey'"
                text-color="white"
                :label="blog.b_is_comment_enabled ? t('comments_enabled') : t('comments_disabled')"
                icon="comment"
              />
              <q-chip
                v-if="blog.b_is_appreciation"
                color="pink"
                text-color="white"
                :label="t('appreciation_enabled')"
                icon="favorite"
              />
            </div>
          </div>

          <!-- 原来的封面图片区域已移动到上面 -->

          <!-- 博客描述 -->
          <div v-if="blog.b_description && blog.b_description !== 'NULL'" class="blog-description q-mb-lg">
            <div class="text-h6 q-mb-md text-primary">{{ t('description') }}</div>
            <div class="content-html" v-html="blog.b_description"></div>
          </div>

          <!-- 博客正文 -->
          <div v-if="blog.b_content && blog.b_content !== 'NULL'" class="blog-content-main">
            <div class="text-h6 q-mb-md text-primary">{{ t('content') }}</div>
            <div class="content-html" v-html="blog.b_content"></div>
          </div>

          <!-- 博客元数据 -->
          <div class="blog-metadata q-mt-xl q-pt-lg border-top">
            <div class="text-h6 q-mb-md text-primary">{{ t('metadata') }}</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-list dense>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ t('blog_id') }}</q-item-label>
                      <q-item-label>{{ blog.blog_id || blog.id }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ t('serial_number') }}</q-item-label>
                      <q-item-label>{{ blog.serialNum || '-' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ t('category_id') }}</q-item-label>
                      <q-item-label>{{ blog.b_category_id || '-' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ t('tags') }}</q-item-label>
                      <q-item-label>{{ blog.b_tags || '-' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
              <div class="col-12 col-md-6">
                <q-list dense>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ t('created_at') }}</q-item-label>
                      <q-item-label>{{ formatDate(blog.createdAt) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ t('updated_at') }}</q-item-label>
                      <q-item-label>{{ formatDate(blog.updatedAt) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ t('published_at') }}</q-item-label>
                      <q-item-label>{{ formatDate(blog.publishedAt) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>{{ t('user_id') }}</q-item-label>
                      <q-item-label>{{ blog.b_user_id || '-' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="flex flex-center full-height">
          <div class="text-center text-grey-6">
            <q-icon name="article" size="64px" class="q-mb-md" />
            <div>{{ t('no_blog_selected') }}</div>
          </div>
        </div>

        <!-- 评论区域 -->
        <div v-if="blog" class="comments-section q-mt-xl q-pt-xl border-t">
          <div class="text-h6 q-mb-md text-primary">{{ t('comments') }}</div>

          <!-- 评论表单 -->
          <div class="w-full comment-form q-mb-lg">
            <textarea
              v-model="commentForm.content"
              :placeholder="t('comment_hint')"
              class="w-full p-3 border rounded-lg resize-none"
              rows="3"
            ></textarea>
            <div class="row q-mt-md q-gutter-md">
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="commentForm.nickname"
                  :placeholder="t('nickname_placeholder')"
                  dense
                  class="w-full"
                  prefix="person"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="commentForm.email"
                  :placeholder="t('email_placeholder')"
                  dense
                  class="w-full"
                  type="email"
                  prefix="mail"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="commentForm.website"
                  :placeholder="t('website_placeholder')"
                  dense
                  class="w-full"
                  prefix="link"
                />
              </div>
            </div>
            <div class="row items-center q-mt-md">
                <div class="flex-1 flex items-center space-x-4">
                  <q-checkbox v-model="commentForm.subscribe" :label="t('subscribe_reply')" />
                  <q-btn
                    v-if="commentForm.parentCommentId !== '0'"
                    flat
                    text-color="primary"
                    @click="cancelReply"
                    :label="t('cancel_reply')"
                  />
                </div>
                <div class="self-end">
                  <q-btn
                    color="primary"
                    @click="submitComment"
                    :disabled="isSubmitting"
                    :loading="isSubmitting"
                    :label="isSubmitting ? '提交中...' : t('submit_comment')"
                  />
                </div>
              </div>
          </div>

          <!-- 评论列表 -->
          <div class="comments-list">
            <div class="text-subtitle2 q-mb-md">{{ t('total_comments', { total: totalComments }) }}</div>

            <!-- 无评论状态 -->
            <div v-if="comments.length === 0 && !loadingComments" class="text-center text-grey-5 q-py-lg">
              暂无评论
            </div>

            <!-- 根评论 -->
            <div v-for="comment in comments" :key="comment.id" class="comment-item q-mb-md p-4 bg-grey-5 rounded-lg">
              <div class="flex items-start">
                <div class="comment-avatar q-avatar bg-primary text-white mr-3">
                  {{ comment.nickname ? comment.nickname.charAt(0).toUpperCase() : '?' }}
                </div>
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <div class="font-medium text-primary">{{ comment.nickname || '匿名用户' }}</div>
                    <div class="text-xs text-grey-5">{{ formatDate(comment.createdAt) }}</div>
                  </div>
                  <div class="comment-content q-mt-sm">
                    {{ comment.comment_content }}
                  </div>
                  <div class="comment-actions q-mt-sm">
                    <q-btn
                      flat
                      dense
                      size="sm"
                      @click="replyToComment(comment)"
                      :label="t('reply')"
                      class="text-grey-5"
                    />
                  </div>
                </div>
              </div>

              <!-- 回复列表 -->
              <div v-if="comment.replies && comment.replies.length > 0" class="replies-list ml-10 mt-4">
                <div v-for="reply in comment.replies" :key="reply.id" class="reply-item q-mb-md p-3 bg-grey-100 rounded-lg">
                  <div class="flex items-start">
                    <div class="comment-avatar q-avatar bg-primary/80 text-white mr-3" style="width: 28px; height: 28px;">
                      {{ reply.nickname ? reply.nickname.charAt(0).toUpperCase() : '?' }}
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center justify-between">
                        <div class="font-medium text-primary">{{ reply.nickname || '匿名用户' }}</div>
                        <div class="text-xs text-grey-5">{{ formatDate(reply.createdAt) }}</div>
                      </div>
                      <div class="comment-content q-mt-sm">
                        {{ reply.comment_content }}
                      </div>
                      <div class="comment-actions q-mt-sm">
                        <q-btn
                          flat
                          dense
                          size="sm"
                          @click="replyToComment(reply)"
                          :label="t('reply')"
                          class="text-grey-5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div class="flex justify-center q-mt-lg">
              <q-pagination
                v-model="pagination.page"
                :max="pagination.pageCount"
                :max-pages="5"
                @input="loadComments"
              />
            </div>
          </div>
          <div v-if="loadingComments" class="flex justify-center q-mt-lg">
            <q-spinner size="32px" color="primary" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, computed, ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { BASE_URL, API } from 'src/api/api.js';
import request from 'src/utils/request.js';
import { Notify } from 'quasar';

export default defineComponent({
  name: 'BlogViewDialog',
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
  emits: ['update:visible', 'edit'],

  setup(props, { emit }) {
    const { t } = useI18n();

    // 评论相关数据
    const comments = ref([]);
    const loadingComments = ref(false);
    const isSubmitting = ref(false);
    const totalComments = ref(0);
    const pagination = ref({
      page: 1,
      pageSize: 25,
      pageCount: 1
    });

    const commentForm = ref({
      nickname: '',
      email: '',
      content: '',
      website: '',
      subscribe: false,
      parentCommentId: '0'
    });

    // 获取图片URL的辅助函数 - 修正字段处理逻辑
    const getImageUrl = (blog, format = 'thumbnail') => {
      if (!blog) return null;

      // 1. 优先尝试Current Profile Picture (b_first_pic)，但如果为null则跳过
      if (blog.b_first_pic !== null && blog.b_first_pic && blog.b_first_pic.trim() !== '') {
        // 如果是完整URL，直接返回
        if (blog.b_first_pic.startsWith('http')) {
          return blog.b_first_pic;
        }
        // 如果是相对路径，拼接base URL
        return `${BASE_URL}${blog.b_first_pic}`;
      }

      // 2. 如果b_first_pic为null或空，使用b_blog_picture_profile中的url字段
      const blogPictureProfile = blog.b_blog_picture_profile;
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

    // 加载评论
    const loadComments = async () => {
      console.log('尝试加载评论，博客数据:', props.blog);
      // 只使用blog_id来查询评论
      const blogId = props.blog?.blog_id;
      console.log('博客ID:', blogId);
      if (!props.blog || !blogId) {
        console.log('没有博客数据或博客ID，无法加载评论');
        return;
      }

      loadingComments.value = true;
      try {
        // 简化API调用参数，与其他API调用保持一致
        const params = {
          'pagination[page]': pagination.value.page,
          'pagination[pageSize]': pagination.value.pageSize,
          'sort': 'createdAt:desc',
          'filters[blog_id][$eq]': blogId
        };

        console.log('加载评论的请求参数:', params);
        // 构建并记录完整URL，用于调试
        const url = `${API.BLOG.B_COMMENTS.LIST}?${new URLSearchParams(params).toString()}`;
        console.log('加载评论的完整URL:', url);
        // 使用request.get的params参数，而不是字符串拼接
        const response = await request.get(API.BLOG.B_COMMENTS.LIST, { params });
        console.log('加载评论的响应数据:', response.data);

        // 增强错误处理，检查响应格式
        if (!response || typeof response !== 'object') {
          throw new Error('无效的响应数据');
        }

        if (response.data && response.data.data) {
          // 处理嵌套回复
          const allComments = response.data.data;
          const rootComments = [];

          // 创建评论映射表
          const commentMap = {};
          allComments.forEach(comment => {
            commentMap[comment.id] = { ...comment, replies: [] };
          });

          // 构建嵌套评论结构
          allComments.forEach(comment => {
            // 处理不同格式的parent_comment_id
            const isRootComment = comment.parent_comment_id === '0' || comment.parent_comment_id === 0 || !comment.parent_comment_id;
            if (isRootComment) {
              // 根评论
              rootComments.push(commentMap[comment.id]);
            } else if (commentMap[comment.parent_comment_id]) {
              // 回复评论
              commentMap[comment.parent_comment_id].replies.push(commentMap[comment.id]);
            } else {
              console.warn('找不到父评论，将其作为根评论处理:', comment);
              rootComments.push(commentMap[comment.id]);
            }
          });

          console.log('处理后的评论数据:', rootComments);
          console.log('评论数量:', rootComments.length);
          comments.value = rootComments;
          console.log('更新后的comments数组:', comments.value);
          totalComments.value = response.data.meta?.pagination?.total || 0;
          pagination.value.pageCount = response.data.meta?.pagination?.pageCount || 1;
        } else {
          console.log('响应数据格式不正确或为空');
          comments.value = [];
          totalComments.value = 0;
        }
      } catch (error) {
        console.error('加载评论失败:', error);
        // 更详细的错误提示
        let errorMessage = '加载评论失败，请稍后重试';
        if (error.message && error.message.includes('Unexpected token < in JSON at position 0')) {
          errorMessage = '服务器返回了错误，请稍后重试';
        }
        Notify.create({
          message: errorMessage,
          color: 'negative',
          timeout: 3000
        });
        comments.value = [];
        totalComments.value = 0;
      } finally {
        loadingComments.value = false;
      }
    };

    // 提交评论
    const submitComment = async () => {
      // 表单验证
      if (!commentForm.value.nickname.trim()) {
        Notify.create({
          message: t('nickname_required'),
          color: 'negative',
          timeout: 3000
        });
        return;
      }

      if (!commentForm.value.email.trim()) {
        Notify.create({
          message: t('email_required'),
          color: 'negative',
          timeout: 3000
        });
        return;
      }

      if (!commentForm.value.content.trim()) {
        Notify.create({
          message: t('content_required'),
          color: 'negative',
          timeout: 3000
        });
        return;
      }

      if (!props.blog || !props.blog.blog_id) return;

      isSubmitting.value = true;
      try {
        const submitData = {
          data: {
            nickname: commentForm.value.nickname,
            email: commentForm.value.email,
            comment_content: commentForm.value.content,
            comment_website: commentForm.value.website || 'NULL',
            comment_is_notice: commentForm.value.subscribe ? '1' : '0',
            blog_id: props.blog.blog_id,
            parent_comment_id: commentForm.value.parentCommentId,
            comment_is_published: true,
            comment_page: 0
          }
        };

        // 添加日志输出提交的JSON数据
        console.log('提交的评论数据:', JSON.stringify(submitData, null, 2));

        await request.post(API.BLOG.B_COMMENTS.CREATE, submitData);

        // 重置表单
        commentForm.value = {
          nickname: '',
          email: '',
          content: '',
          website: '',
          subscribe: false,
          parentCommentId: '0'
        };

        // 重新加载评论
        pagination.value.page = 1;
        await loadComments();

        // 提示评论提交成功
        Notify.create({
          message: t('submit_comment_success'),
          color: 'positive',
          timeout: 3000
        });
      } catch (error) {
        console.error('提交评论失败:', error);
        // 提示评论提交失败
        Notify.create({
          message: t('submit_comment_failed'),
          color: 'negative',
          timeout: 3000
        });
      } finally {
        isSubmitting.value = false;
      }
    };

    // 回复评论
    const replyToComment = (comment) => {
      commentForm.value.parentCommentId = comment.id.toString();
      commentForm.value.content = `@${comment.nickname} `;
      // 滚动到评论框
      const commentFormElement = document.querySelector('.comment-form textarea');
      if (commentFormElement) {
        commentFormElement.focus();
      }
    };

    // 取消回复
    const cancelReply = () => {
      commentForm.value.parentCommentId = '0';
      // 保留原有内容但移除@开头的回复标记
      if (commentForm.value.content.startsWith('@')) {
        const firstSpaceIndex = commentForm.value.content.indexOf(' ');
        if (firstSpaceIndex > 0) {
          commentForm.value.content = commentForm.value.content.substring(firstSpaceIndex + 1);
        } else {
          commentForm.value.content = '';
        }
      }
    };

    // 监听博客变化，加载评论
    watch(() => props.blog, async (newBlog) => {
      console.log('博客数据变化，新博客数据:', newBlog);
      // 只使用blog_id来查询评论
      const blogId = newBlog?.blog_id;
      if (newBlog && blogId) {
        pagination.value.page = 1;
        await loadComments();
      } else {
        console.log('博客数据为空或没有博客ID，清空评论');
        comments.value = [];
        totalComments.value = 0;
      }
    }, { immediate: true });

    // 监听对话框可见状态，加载评论并增加浏览量
    watch(() => props.visible, async (visible) => {
      console.log('对话框可见状态变化:', visible);
      // 只使用blog_id来查询评论
      const blogId = props.blog?.blog_id;
      if (visible && props.blog && blogId) {
        console.log('对话框可见且有博客数据，加载评论');
        await loadComments();

        // 增加浏览量
        try {
          const updateUrl = API.BLOG.B_BLOG.UPDATE(props.blog.documentId || props.blog.id);
          const submitData = {
            data: {
              b_views: (props.blog.b_views || 0) + 1
            }
          };
          await request.put(updateUrl, submitData);
          console.log('浏览量更新成功');
        } catch (error) {
          console.error('浏览量更新失败:', error);
        }
      }
    });

    // 对话框可见状态
    const dialogVisible = computed({
      get: () => props.visible,
      set: (value) => emit('update:visible', value)
    });

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

    // 编辑博客
    const editBlog = () => {
      emit('edit', props.blog);
      closeDialog();
    };

    // 关闭对话框
    const closeDialog = () => {
      dialogVisible.value = false;
    };

    return {
      t,
      dialogVisible,
      formatDate,
      editBlog,
      closeDialog,
      getImageUrl,
      comments,
      loadingComments,
      isSubmitting,
      totalComments,
      pagination,
      commentForm,
      loadComments,
      submitComment,
      replyToComment
    };
  }
});
</script>

<style scoped>
.blog-content {
  margin: 0;
}

.blog-header h1 {
  line-height: 1.2;
  word-break: break-word;
}

.blog-status {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 16px;
}

/* 封面图片容器样式 */
.blog-cover {
  overflow: visible; /* 确保内容不被截断 */
}

/* 封面图片样式 */
.blog-cover .q-img {
  display: block;
  margin: 0 auto;
  border-radius: 4px;
  overflow: hidden;
}

/* 修复图片上方边缘被截断的问题 */
.rounded-borders {
  padding-top: 4px; /* 添加顶部内边距 */
  background-color: white; /* 确保背景色不会影响显示 */
}

.content-html {
  line-height: 1.6;
  font-size: 16px;
}

.content-html :deep(p) {
  margin-bottom: 16px;
}

.content-html :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.content-html :deep(blockquote) {
  border-left: 4px solid #1976d2;
  padding-left: 16px;
  margin: 16px 0;
  color: #666;
  font-style: italic;
}

.content-html :deep(code) {
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.content-html :deep(pre) {
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
}

.content-html :deep(ul),
.content-html :deep(ol) {
  padding-left: 24px;
  margin-bottom: 16px;
}

.content-html :deep(li) {
  margin-bottom: 8px;
}

.border-top {
  border-top: 1px solid #e0e0e0;
}

/* 评论区域样式 */
.comments-section {
  margin: 0;
}

.comment-form textarea {
  border: 1px solid #e0e0e0;
  transition: border-color 0.3s;
}

.comment-form textarea:focus {
  outline: none;
  border-color: #1976d2;
}

.comment-item {
  transition: box-shadow 0.3s;
}

.comment-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.comment-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.comment-content {
  word-break: break-word;
  line-height: 1.5;
}

/* 嵌套回复样式 */
.replies-list {
  position: relative;
}

.replies-list::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e0e0e0;
}

.reply-item {
  transition: background-color 0.3s;
  position: relative;
}

.reply-item:hover {
  background-color: #f5f5f5;
}

.reply-item::before {
  content: '';
  position: absolute;
  left: -40px;
  top: 15px;
  width: 24px;
  height: 2px;
  background-color: #e0e0e0;
}

/* 响应式调整 */
@media (max-width: 600px) {
  .blog-content {
    max-width: 100%;
  }

  .q-pa-md {
    padding: 8px;
  }

  .comments-section {
    max-width: 100%;
  }

  .comment-form .row {
    flex-direction: column;
  }

  .comment-form .col-12 {
    margin-bottom: 8px;
  }

  /* 嵌套回复在移动端的调整 */
  .replies-list {
    margin-left: 20px !important;
  }

  .replies-list::before {
    left: 5px;
  }

  .reply-item::before {
    left: -20px;
    width: 14px;
  }
}
</style>
