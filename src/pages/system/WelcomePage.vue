<template>
  <div class="welcome-page theme-background q-pa-lg">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner q-mb-xl">
      <div class="row items-center q-col-gutter-lg">
        <div class="col-12 col-md-8">
          <div class="welcome-content">
            <h1 class="welcome-title">{{ t('welcome_title') || '欢迎回到天局网管理系统' }}</h1>
            <p class="welcome-subtitle">{{ t('welcome_subtitle') || '强大的内容管理和系统配置平台' }}</p>
            <div class="welcome-meta q-mt-md">
              <q-chip 
                icon="schedule" 
                color="primary" 
                text-color="white" 
                size="sm"
              >
                {{ t('last_login') || '最后登录' }}: {{ formatDate(new Date()) }}
              </q-chip>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="welcome-illustration">
            <q-icon name="dashboard" size="120px" color="primary" class="welcome-icon" />
          </div>
        </div>
      </div>
    </div>

    <!-- 系统统计卡片 -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stats-card theme-card stats-card-users">
          <q-card-section class="flex items-center justify-between">
            <div>
              <div class="stats-number">{{ systemStats.totalUsers }}</div>
              <div class="stats-label">{{ t('total_users_stat') || '总用户数' }}</div>
            </div>
            <q-icon name="people" size="40px" class="stats-icon" />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stats-card theme-card stats-card-content">
          <q-card-section class="flex items-center justify-between">
            <div>
              <div class="stats-number">{{ systemStats.totalContent }}</div>
              <div class="stats-label">{{ t('total_content_stat') || '内容总数' }}</div>
            </div>
            <q-icon name="article" size="40px" class="stats-icon" />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stats-card theme-card stats-card-visits">
          <q-card-section class="flex items-center justify-between">
            <div>
              <div class="stats-number">{{ systemStats.todayVisits }}</div>
              <div class="stats-label">{{ t('today_visits_stat') || '今日访问' }}</div>
            </div>
            <q-icon name="trending_up" size="40px" class="stats-icon" />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stats-card theme-card stats-card-system">
          <q-card-section class="flex items-center justify-between">
            <div>
              <div class="stats-number">{{ systemStats.systemHealth }}%</div>
              <div class="stats-label">{{ t('system_health_stat') || '系统健康度' }}</div>
            </div>
            <q-icon name="health_and_safety" size="40px" class="stats-icon" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 快速操作和最近活动 -->
    <div class="row q-col-gutter-lg">
      <!-- 快速操作 -->
      <div class="col-12 col-md-6">
        <q-card class="quick-actions-card theme-card">
          <q-card-section>
            <div class="card-header">
              <q-icon name="flash_on" size="24px" color="primary" />
              <h3 class="card-title">{{ t('quick_actions') || '快速操作' }}</h3>
            </div>
            <div class="quick-actions-grid q-mt-md">
              <q-btn 
                v-for="action in quickActions" 
                :key="action.name"
                :icon="action.icon"
                :label="action.label"
                :color="action.color"
                class="quick-action-btn"
                @click="handleQuickAction(action.action)"
                no-caps
                unelevated
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 最近活动 -->
      <div class="col-12 col-md-6">
        <q-card class="recent-activity-card theme-card">
          <q-card-section>
            <div class="card-header">
              <q-icon name="history" size="24px" color="primary" />
              <h3 class="card-title">{{ t('recent_activities') || '最近活动' }}</h3>
            </div>
            <q-list class="q-mt-md">
              <q-item 
                v-for="(activity, index) in recentActivities" 
                :key="index"
                class="activity-item"
              >
                <q-item-section avatar>
                  <q-avatar :color="activity.color" text-color="white" size="32px">
                    <q-icon :name="activity.icon" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="activity-title">{{ activity.title }}</q-item-label>
                  <q-item-label caption class="activity-time">{{ activity.time }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 系统信息和帮助 -->
    <div class="row q-col-gutter-lg q-mt-lg">
      <!-- 系统信息 -->
      <div class="col-12 col-md-6">
        <q-card class="system-info-card theme-card">
          <q-card-section>
            <div class="card-header">
              <q-icon name="info" size="24px" color="primary" />
              <h3 class="card-title">{{ t('system_information') || '系统信息' }}</h3>
            </div>
            <div class="system-info-list q-mt-md">
              <div v-for="info in systemInfo" :key="info.label" class="info-row">
                <span class="info-label">{{ info.label }}:</span>
                <span class="info-value">{{ info.value }}</span>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 帮助和文档 -->
      <div class="col-12 col-md-6">
        <q-card class="help-card theme-card">
          <q-card-section>
            <div class="card-header">
              <q-icon name="help" size="24px" color="primary" />
              <h3 class="card-title">{{ t('help_documentation') || '帮助文档' }}</h3>
            </div>
            <div class="help-links q-mt-md">
              <q-btn 
                v-for="link in helpLinks" 
                :key="link.name"
                :icon="link.icon"
                :label="link.label"
                flat
                class="help-link-btn"
                @click="openHelpLink(link.url)"
                no-caps
              />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: "WelcomePage",
  emits: ['switch-page'],
  setup(props, { emit }) {
    const { t } = useI18n();
    const router = useRouter();

    // 系统统计数据
    const systemStats = ref({
      totalUsers: 0,
      totalContent: 0,
      todayVisits: 0,
      systemHealth: 95
    });

    // 快速操作按钮
    const quickActions = ref([
      {
        name: 'add_user',
        icon: 'person_add',
        label: t('add_user') || '新增用户',
        color: 'primary',
        action: 'addUser'
      },
      {
        name: 'create_blog',
        icon: 'article',
        label: t('create_blog') || '创建博客',
        color: 'secondary',
        action: 'createBlog'
      },
      {
        name: 'manage_menus',
        icon: 'menu',
        label: t('manage_menus') || '管理菜单',
        color: 'accent',
        action: 'manageMenus'
      },
      {
        name: 'system_settings',
        icon: 'settings',
        label: t('system_settings') || '系统设置',
        color: 'warning',
        action: 'systemSettings'
      }
    ]);

    // 最近活动
    const recentActivities = ref([
      {
        icon: 'person_add',
        color: 'green',
        title: t('user_registered') || '新用户注册',
        time: '2 ' + (t('minutes_ago') || '分钟前')
      },
      {
        icon: 'article',
        color: 'blue',
        title: t('blog_published') || '博客发布',
        time: '15 ' + (t('minutes_ago') || '分钟前')
      },
      {
        icon: 'security',
        color: 'orange',
        title: t('security_scan') || '安全扫描完成',
        time: '1 ' + (t('hour_ago') || '小时前')
      },
      {
        icon: 'backup',
        color: 'purple',
        title: t('system_backup') || '系统备份',
        time: '3 ' + (t('hours_ago') || '小时前')
      }
    ]);

    // 系统信息
    const systemInfo = ref([
      {
        label: t('version') || '版本',
        value: 'v2.18.1'
      },
      {
        label: t('database') || '数据库',
        value: 'MySQL 8.0'
      },
      {
        label: t('server_time') || '服务器时间',
        value: new Date().toLocaleString()
      },
      {
        label: t('uptime') || '运行时间',
        value: '15 ' + (t('days') || '天')
      }
    ]);

    // 帮助链接
    const helpLinks = ref([
      {
        name: 'user_guide',
        icon: 'book',
        label: t('user_guide') || '用户指南',
        url: '#'
      },
      {
        name: 'api_docs',
        icon: 'code',
        label: t('api_documentation') || 'API文档',
        url: '#'
      },
      {
        name: 'support',
        icon: 'support',
        label: t('technical_support') || '技术支持',
        url: '#'
      },
      {
        name: 'feedback',
        icon: 'feedback',
        label: t('feedback') || '意见反馈',
        url: '#'
      }
    ]);

    // 处理快速操作
    const handleQuickAction = (action) => {
      console.log('Quick action clicked:', action);
      switch (action) {
        case 'addUser':
          emit('switch-page', 'addUser');
          break;
        case 'createBlog':
          emit('switch-page', 'blogCreate');
          break;
        case 'manageMenus':
          emit('switch-page', 'menu');
          break;
        case 'systemSettings':
          emit('switch-page', 'userSettings');
          break;
        default:
          console.warn('Unknown action:', action);
      }
    };

    // 打开帮助链接
    const openHelpLink = (url) => {
      if (url && url !== '#') {
        window.open(url, '_blank');
      } else {
        console.log('Help link clicked, but no URL provided');
      }
    };

    // 格式化日期
    const formatDate = (date) => {
      return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };

    // 加载系统统计数据
    const loadSystemStats = async () => {
      try {
        // 模拟加载统计数据
        // 在实际项目中，这里应该调用真实的API
        setTimeout(() => {
          systemStats.value = {
            totalUsers: 1247,
            totalContent: 892,
            todayVisits: 3456,
            systemHealth: 98
          };
        }, 1000);
      } catch (error) {
        console.error('Failed to load system stats:', error);
      }
    };

    // 组件挂载后加载数据
    onMounted(() => {
      loadSystemStats();
    });

    return {
      t,
      systemStats,
      quickActions,
      recentActivities,
      systemInfo,
      helpLinks,
      handleQuickAction,
      openHelpLink,
      formatDate
    };
  }
});
</script>

<style scoped>
/* 欢迎页整体布局 */
.welcome-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 24px;
}

/* 欢迎横幅 */
.welcome-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0;
  line-height: 1.5;
}

.welcome-meta {
  margin-top: 24px;
}

.welcome-illustration {
  text-align: center;
  padding: 20px;
}

.welcome-icon {
  opacity: 0.8;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* 统计卡片 */
.stats-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: none;
  overflow: hidden;
  position: relative;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.stats-card-users {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stats-card-content {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stats-card-visits {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.stats-card-system {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stats-number {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stats-label {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-top: 4px;
}

.stats-icon {
  opacity: 0.8;
}

/* 卡片通用样式 */
.quick-actions-card,
.recent-activity-card,
.system-info-card,
.help-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: none;
  transition: all 0.3s ease;
}

.quick-actions-card:hover,
.recent-activity-card:hover,
.system-info-card:hover,
.help-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #2c3e50;
}

/* 快速操作 */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.quick-action-btn {
  height: 60px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.quick-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* 最近活动 */
.activity-item {
  border-radius: 8px;
  padding: 12px 8px;
  transition: background-color 0.3s ease;
}

.activity-item:hover {
  background-color: #f8f9fa;
}

.activity-title {
  font-weight: 500;
  color: #2c3e50;
}

.activity-time {
  color: #6c757d;
  font-size: 0.875rem;
}

/* 系统信息 */
.system-info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #495057;
}

.info-value {
  color: #6c757d;
  font-family: 'Monaco', 'Menlo', monospace;
}

/* 帮助链接 */
.help-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.help-link-btn {
  justify-content: flex-start;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.help-link-btn:hover {
  background-color: #e3f2fd;
  color: #1976d2;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-page {
    padding: 16px;
  }
  
  .welcome-banner {
    padding: 24px;
  }
  
  .welcome-title {
    font-size: 2rem;
  }
  
  .welcome-subtitle {
    font-size: 1rem;
  }
  
  .stats-number {
    font-size: 1.5rem;
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .help-links {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .welcome-title {
    font-size: 1.75rem;
  }
  
  .card-title {
    font-size: 1.1rem;
  }
  
  .help-links {
    grid-template-columns: 1fr;
  }
}

/* 动画效果 */
.welcome-page > * {
  animation: fadeInUp 0.6s ease-out;
}

.welcome-page > *:nth-child(2) {
  animation-delay: 0.1s;
}

.welcome-page > *:nth-child(3) {
  animation-delay: 0.2s;
}

.welcome-page > *:nth-child(4) {
  animation-delay: 0.3s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
