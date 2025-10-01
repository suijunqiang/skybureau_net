<template>
  <div class="auth-container theme-background">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="auth-main">
      <!-- 左侧品牌区域 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="brand-logo">
            <q-icon name="flight_takeoff" size="60px" color="white" />
          </div>
          <h1 class="brand-title">{{ $t('skybureau') || '天局网' }}</h1>
          <p class="brand-subtitle">{{ $t('welcome_back_subtitle') || '探索航天与无人机技术的专业平台' }}</p>
          <div class="brand-features">
            <div class="feature-item">
              <q-icon name="security" size="20px" />
              <span>{{ $t('secure_authentication') || '安全认证' }}</span>
            </div>
            <div class="feature-item">
              <q-icon name="cloud" size="20px" />
              <span>{{ $t('cloud_based') || '云端服务' }}</span>
            </div>
            <div class="feature-item">
              <q-icon name="speed" size="20px" />
              <span>{{ $t('high_performance') || '高性能' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧认证表单区域 -->
      <div class="form-section">
        <div class="form-container">
          <!-- 表单切换标签 -->
          <div class="form-tabs">
            <button 
              :class="['tab-button', { active: isLogin }]"
              @click="setLoginMode(true)"
            >
              {{ $t('login') || '登录' }}
            </button>
            <button 
              :class="['tab-button', { active: !isLogin }]"
              @click="setLoginMode(false)"
            >
              {{ $t('register') || '注册' }}
            </button>
            <div class="tab-indicator" :class="{ 'tab-indicator-right': !isLogin }"></div>
          </div>

          <!-- 登录表单 -->
          <div v-if="isLogin" class="auth-form login-form">
            <div class="form-header">
              <h2 class="form-title">{{ $t('welcome_back') || '欢迎回来' }}</h2>
              <p class="form-subtitle">{{ $t('login_subtitle') || '请登录您的账户以继续' }}</p>
            </div>

            <div class="form-content">
              <div class="input-group">
                <label class="input-label">{{ $t('user_name') || '用户名' }}</label>
                <div class="input-wrapper">
                  <q-icon name="person" class="input-icon" />
                  <input 
                    ref="usernameInput"
                    type="text" 
                    :placeholder="$t('username_placeholder') || '请输入用户名'"
                    v-model="form.username"
                    class="auth-input"
                    autofocus
                  />
                </div>
              </div>

              <div class="input-group">
                <label class="input-label">{{ $t('password') || '密码' }}</label>
                <div class="input-wrapper">
                  <q-icon name="lock" class="input-icon" />
                  <input 
                    type="password" 
                    :placeholder="$t('password_placeholder') || '请输入您的密码'"
                    v-model="form.userpwd"
                    class="auth-input"
                    :class="{ 'input-error': passwordError }"
                    @keyup.enter="login"
                  />
                </div>
                <span v-if="passwordError" class="error-message">
                  <q-icon name="error" size="16px" />
                  {{ $t('password_format_error') || '密码格式不正确' }}
                </span>
              </div>

              <div class="form-options">
                <label class="checkbox-wrapper">
                  <input type="checkbox" v-model="rememberMe">
                  <span class="checkmark"></span>
                  {{ $t('remember_me') || '记住我' }}
                </label>
                <a href="#" class="forgot-password">{{ $t('forgot_password') || '忘记密码？' }}</a>
              </div>

              <button class="auth-button primary" @click="login" :disabled="isLoading">
                <q-spinner v-if="isLoading" size="20px" color="white" />
                <span v-else>{{ $t('login') || '登录' }}</span>
              </button>
            </div>
          </div>

          <!-- 注册表单 -->
          <div v-else class="auth-form register-form">
            <div class="form-header">
              <h2 class="form-title">{{ $t('create_account') || '创建账户' }}</h2>
              <p class="form-subtitle">{{ $t('register_subtitle') || '加入天局网，开启您的航天之旅' }}</p>
            </div>

            <div class="form-content">
              <div class="input-group">
                <label class="input-label">{{ $t('username') || '用户名' }}</label>
                <div class="input-wrapper">
                  <q-icon name="person" class="input-icon" />
                  <input 
                    type="text" 
                    :placeholder="$t('username_placeholder') || '请输入用户名'"
                    v-model="form.username"
                    class="auth-input"
                    :class="{ 'input-error': existed }"
                  />
                </div>
                <span v-if="existed" class="error-message">
                  <q-icon name="error" size="16px" />
                  {{ $t('user_name_exists') || '用户名已存在' }}
                </span>
              </div>

              <div class="input-group">
                <label class="input-label">{{ $t('email') || '邮箱' }}</label>
                <div class="input-wrapper">
                  <q-icon name="email" class="input-icon" />
                  <input 
                    type="email" 
                    :placeholder="$t('email_placeholder') || '请输入您的邮箱地址'"
                    v-model="form.useremail"
                    class="auth-input"
                  />
                </div>
              </div>

              <div class="input-group">
                <label class="input-label">{{ $t('password') || '密码' }}</label>
                <div class="input-wrapper">
                  <q-icon name="lock" class="input-icon" />
                  <input 
                    type="password" 
                    :placeholder="$t('password_placeholder') || '请输入您的密码'"
                    v-model="form.userpwd"
                    class="auth-input"
                  />
                </div>
              </div>

              <div class="form-options">
                <label class="checkbox-wrapper">
                  <input type="checkbox" v-model="agreeTerms">
                  <span class="checkmark"></span>
                  {{ $t('agree_terms') || '我同意' }}
                  <a href="#" class="terms-link">{{ $t('terms_and_conditions') || '用户协议和隐私政策' }}</a>
                </label>
              </div>

              <button class="auth-button primary" @click="register" :disabled="isLoading || !agreeTerms">
                <q-spinner v-if="isLoading" size="20px" color="white" />
                <span v-else>{{ $t('register') || '注册' }}</span>
              </button>
            </div>
          </div>

          <!-- 第三方登录 -->
          <div class="social-auth">
            <div class="divider">
              <span>{{ $t('or_continue_with') || '或使用以下方式继续' }}</span>
            </div>
            <div class="social-buttons">
              <button class="social-button google">
                <q-icon name="fab fa-google" />
              </button>
              <button class="social-button github">
                <q-icon name="fab fa-github" />
              </button>
              <button class="social-button wechat">
                <q-icon name="fab fa-weixin" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { login, register } from "../api/users";
import { LocalStorage, SessionStorage } from "quasar";
import { useCounterStore } from "../stores/counter";
import { API } from "../api/api";
import { useTokenStore } from "../stores/myToken";
import { useUserInfoStore } from "../stores/userInfo";
import { getUserPosition } from "../api/positions.js";

export default {
  name: "loginRegister",
  data() {
    return {
      isLogin: true,
      emailError: false,
      passwordError: false,
      existed: false,
      rememberMe: false,
      agreeTerms: false,
      isLoading: false,
      form: {
        username: "",
        useremail: "",
        userpwd: "",
      },
    };
  },
  mounted() {
    // 确保输入框获取焦点
    if (this.isLogin && this.$refs.usernameInput) {
      this.$refs.usernameInput.focus();
    }
  },
  methods: {
    setLoginMode(isLoginMode) {
      this.isLogin = isLoginMode;
      this.form.username = "";
      this.form.useremail = "";
      this.form.userpwd = "";
      this.emailError = false;
      this.passwordError = false;
      this.existed = false;
    },
    changeType() {
      this.isLogin = !this.isLogin;
      this.form.username = "";
      this.form.useremail = "";
      this.form.userpwd = "";
    },
    login() {
      const self = this;
      const tokenStore = useTokenStore();
      const userInfoStore = useUserInfoStore();
      
      if (self.form.username != "" && self.form.userpwd != "") {
        self.isLoading = true;
        login({
          identifier: self.form.username,  // 使用用户名登录
          password: self.form.userpwd,
        })
          .then((res) => {
            if (isNull(res.data.jwt)) {
              // token为空，登录失败
              console.log("登录失败：未返回token");
              self.isLoading = false;
            } else {
              // 存储token
              tokenStore.saveToken(res.data.jwt);
              // 存储用户信息
              userInfoStore.setUserInfo(res.data);
              
              console.log("登录成功，用户信息：" + JSON.stringify(res.data));
              
              // 尝试查询用户职位信息，但即使失败也继续跳转
              getUserPosition().then(() => {
                console.log("职位信息查询完成，准备跳转");
                self.$router.push("/system/userManagement");
              }).catch((error) => {
                console.error("查询职位信息失败：", error);
                // 即使职位信息查询失败，也进行页面跳转
                self.$router.push("/system/userManagement");
              }).finally(() => {
                self.isLoading = false;
              });
            }
          })
          .catch((err) => {
            console.error("登录请求失败：", err);
            alert("登录失败，请检查网络连接或用户名密码");
          })
          .finally(() => {
            self.isLoading = false;
          });
      } else {
        alert("用户名和密码不能为空！");
      }
    },
    register() {
      const self = this;
      const tokenStore = useTokenStore();
      const userInfoStore = useUserInfoStore();
      
      if (!self.agreeTerms) {
        return;
      }
      
      if (
        self.form.username != "" &&
        self.form.useremail != "" &&
        self.form.userpwd != ""
      ) {
        self.isLoading = true;
        register({
          username: self.form.username,
          email: self.form.useremail,
          password: self.form.userpwd
        })
          .then((res) => {
            if (isNull(res.data.jwt)) {
              // alert("Error！");
            } else {
              // alert("注册成功！\r\n" + JSON.stringify(res.data));
              console.log("userInfo:" + JSON.stringify(res.data));
              // 存储token
              tokenStore.saveToken(res.data.jwt);
              // 存储用户信息
              userInfoStore.setUserInfo(res.data);
              self.$router.push("/system/userManagement");
            }
          })
          .catch((err) => {
            if (!isNull(err.response.data.error)) {
              console.log(err.response.data);
              // alert("Error！" + err.response.data.error.message);
              if (err.response.data.error.message.includes('Username')) {
                self.existed = true;
              }
              self.$router.push("/");
            }

            console.log(err);
          })
          .finally(() => {
            self.isLoading = false;
          });
      } else {
        // alert("填写不能为空！");
      }
    },
  },
};

let isNull = (str) => {
  if (str === null || str === undefined || str.length === 0) {
    return true;
  }
  return false;
};
let onSubmit = async (userInfo) => {
  //   console.log(userInfo);
  //   return;
  //
};
</script>

<style scoped>
/* 主容器样式 */
.auth-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--theme-background);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 30px;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: -2s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 20%;
  right: 15%;
  animation-delay: -4s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: -1s;
}

.shape-4 {
  width: 180px;
  height: 180px;
  bottom: 15%;
  right: 10%;
  animation-delay: -3s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

/* 主要内容区域 */
.auth-main {
  display: flex;
  width: 100%;
  max-width: 1200px;
  height: calc(100vh - 60px);
  max-height: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 10;
}

/* 左侧品牌区域 */
.brand-section {
  flex: 0 0 40%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.brand-section::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.brand-content {
  text-align: center;
  color: white;
  z-index: 2;
  position: relative;
}

.brand-logo {
  margin-bottom: 15px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.brand-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(45deg, #fff, #f0f8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 0.95rem;
  margin-bottom: 20px;
  opacity: 0.9;
  line-height: 1.6;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.feature-item:hover {
  opacity: 1;
}

/* 右侧表单区域 */
.form-section {
  flex: 0 0 60%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #fff;
  overflow-y: auto;
}

.form-container {
  width: 100%;
  max-width: 400px;
  max-height: 100%;
  overflow-y: auto;
}

/* 表单切换标签 */
.form-tabs {
  position: relative;
  display: flex;
  background: #f8f9fa;
  border-radius: 50px;
  padding: 4px;
  margin-bottom: 25px;
}

.tab-button {
  flex: 1;
  padding: 12px 24px;
  border: none;
  background: transparent;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

.tab-button.active {
  color: #667eea;
}

.tab-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: white;
  border-radius: 50px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.tab-indicator-right {
  transform: translateX(100%);
}

/* 表单样式 */
.auth-form {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-header {
  text-align: center;
  margin-bottom: 20px;
}

.form-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 6px;
}

.form-subtitle {
  color: #7f8c8d;
  font-size: 0.95rem;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 输入组样式 */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #34495e;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #7f8c8d;
  z-index: 2;
}

.auth-input {
  width: 100%;
  padding: 12px 12px 12px 45px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #fff;
}

.auth-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.auth-input.input-error {
  border-color: #e74c3c;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #e74c3c;
  font-size: 0.85rem;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #34495e;
  cursor: pointer;
}

.checkbox-wrapper input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #667eea;
}

.forgot-password,
.terms-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.forgot-password:hover,
.terms-link:hover {
  color: #764ba2;
}

/* 认证按钮 */
.auth-button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.auth-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.auth-button.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* 第三方登录 */
.social-auth {
  margin-top: 18px;
  padding-bottom: 10px;
}

.divider {
  position: relative;
  text-align: center;
  margin: 15px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e9ecef;
}

.divider span {
  background: #fff;
  padding: 0 15px;
  color: #7f8c8d;
  font-size: 0.85rem;
}

.social-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 10px;
}

.social-button {
  width: 45px;
  height: 45px;
  border: 2px solid #e9ecef;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 18px;
}

.social-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.social-button.google:hover {
  border-color: #db4437;
  color: #db4437;
}

.social-button.github:hover {
  border-color: #333;
  color: #333;
}

.social-button.wechat:hover {
  border-color: #07c160;
  color: #07c160;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .auth-container {
    padding: 20px;
  }
  
  .auth-main {
    flex-direction: column;
    width: 100%;
    height: calc(100vh - 40px);
  }
  
  .brand-section {
    flex: 0 0 120px;
    padding: 15px;
  }
  
  .brand-title {
    font-size: 1.5rem;
  }
  
  .brand-subtitle {
    font-size: 0.85rem;
    margin-bottom: 10px;
  }
  
  .brand-features {
    flex-direction: row;
    justify-content: center;
    gap: 15px;
  }
  
  .feature-item {
    font-size: 0.75rem;
  }
  
  .form-section {
    padding: 20px;
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .auth-container {
    padding: 15px;
  }
  
  .auth-main {
    width: 100%;
    height: calc(100vh - 30px);
    border-radius: 10px;
  }
  
  .brand-section {
    flex: 0 0 80px;
    padding: 10px;
  }
  
  .brand-title {
    font-size: 1.2rem;
  }
  
  .brand-subtitle {
    display: none;
  }
  
  .brand-features {
    flex-direction: row;
    gap: 8px;
  }
  
  .feature-item {
    font-size: 0.7rem;
  }
  
  .form-section {
    padding: 15px;
    overflow-y: auto;
  }
  
  .social-auth {
    margin-top: 15px;
  }
}
</style>
