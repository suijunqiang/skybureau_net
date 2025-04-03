<template>
  <div class="login-register">
    <div class="contain">
      <div class="big-box" :class="{ active: isLogin }">
        <div class="big-contain" key="bigContainLogin" v-if="isLogin">
          <div class="btitle">{{ $t("user_name") }}</div>
          <div class="bform">
            <input type="email" placeholder= "$t('email')" v-model="form.useremail" />
            <span class="errTips" v-if="emailError">{{$t('email_format_error')}}</span>
            <input type="password" placeholder="$t('password')" v-model="form.userpwd" />
            <span class="errTips" v-if="emailError">{{ $t("password_format_error") }}</span>
          </div>
          <button class="bbutton" @click="login">{{ $t("login") }}</button>
        </div>
        <div class="big-contain" key="bigContainRegister" v-else>
          <div class="btitle">{{ $t("create_new_account") }}</div>
          <div class="bform">
            <input type="text" placeholder="$t('user_name')" v-model="form.username" />
            <span class="errTips" v-if="existed">{{$t('user_name_exist')}}</span>
            <input type="email" placeholder="$t('email')" v-model="form.useremail" />
            <input type="password" placeholder="$t('password')" v-model="form.userpwd" />
          </div>
          <button class="bbutton" @click="register">{{ $t("register") }}</button>
        </div>
      </div>
      <div class="small-box" :class="{ active: isLogin }">
        <div class="small-contain" key="smallContainRegister" v-if="isLogin">
          <div class="stitle">{{ $t("welcome") }}</div>
          <p class="scontent">{{ $t("create_new_account") }}</p>
          <button class="sbutton" @click="changeType">{{ $t("register") }}</button>
        </div>
        <div class="small-contain" key="smallContainLogin" v-else>
          <div class="stitle">{{ $t("welcome") }}</div>
          <p class="scontent">{{ $t("keep_login") }}</p>
          <button class="sbutton" @click="changeType">{{ $t("login") }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { login } from "../api/users";
import { LocalStorage, SessionStorage } from "quasar";
import { useCounterStore } from "../stores/counter";

export default {
  name: "loginRegister",
  data() {
    return {
      isLogin: false,
      emailError: false,
      passwordError: false,
      existed: false,
      form: {
        username: "",
        useremail: "",
        userpwd: "",
      },
    };
  },
  methods: {
    changeType() {
      this.isLogin = !this.isLogin;
      this.form.username = "";
      this.form.useremail = "";
      this.form.userpwd = "";
    },
    login() {
      const self = this;
      //const store = useCounterStore();
      //const storeUserInfo = store();
      if (self.form.useremail != "" && self.form.userpwd != "") {
        self
          .$axios({
            method: "post",
            url: "http://www.suijunqiang.top:1337/api/auth/local",
            //url: "http://192.168.0.111:1337/api/auth/local",
            contentType: "application/x-www-form-urlencoded",
            data: {
              email: self.form.useremail,
              identifier: self.form.useremail,
              password: self.form.userpwd,
            },
          })
          .then((res) => {
            if (isNull(res.data.jwt)) {
              alert("Error！");
            } else {
              alert("succses！\r\n" + JSON.stringify(res.data));
              console.log("userInfo:" + JSON.stringify(res.data));
              LocalStorage.set("userInfo", res.data);
              //store.setToken(res.data.jwt);
              self.$router.push("/");
            }

          })
          .catch((err) => {
            alert("Error \r\n Login faild！");
            console.log(err);
          });
      } else {
        alert("填写不能为空！");
      }
    },
    register() {
      const self = this;
      if (
        self.form.username != "" &&
        self.form.useremail != "" &&
        self.form.userpwd != ""
      ) {
        self
          .$axios({
            method: "post",
            url: "http://www.suijunqiang.top:1337/api/auth/local/register",
            //url: "http://192.168.0.111:1337/api/auth/local/register",
            contentType: "application/x-www-form-urlencoded",
            data: {
              username: self.form.username,
              email: self.form.useremail,
              password: self.form.userpwd,
            },
          })
          .then((res) => {
            switch (res.data.jwt) {
              case 0:
                alert("注册成功！");
                self.$router.push("/");
                //this.login();
                break;
              case -1:
                this.existed = true;
                break;
            }
          })
          .catch((err) => {
            if (!isNull(err.response.data.error)) {
              console.log(err.response.data);
              alert("Error！" + err.response.data.error.message);
              self.$router.push("/");
            }

            console.log(err);
          });
      } else {
        alert("填写不能为空！");
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

<style scoped="scoped">
.login-register {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
}
.contain {
  width: 60%;
  height: 60%;
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 0 3px #f0f0f0, 0 0 6px #f0f0f0;
}
.big-box {
  width: 70%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 30%;
  transform: translateX(0%);
  transition: all 1s;
}
.big-contain {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.btitle {
  font-size: 1.5em;
  font-weight: bold;
  color: rgb(57, 167, 176);
}
.bform {
  width: 100%;
  height: 40%;
  padding: 2em 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}
.bform .errTips {
  display: block;
  width: 50%;
  text-align: left;
  color: red;
  font-size: 0.7em;
  margin-left: 1em;
}
.bform input {
  width: 50%;
  height: 30px;
  border: none;
  outline: none;
  border-radius: 10px;
  padding-left: 2em;
  background-color: #f0f0f0;
}
.bbutton {
  width: 20%;
  height: 40px;
  border-radius: 24px;
  border: none;
  outline: none;
  background-color: rgb(57, 167, 176);
  color: #fff;
  font-size: 0.9em;
  cursor: pointer;
}
.small-box {
  width: 30%;
  height: 100%;
  background: linear-gradient(135deg, rgb(57, 167, 176), rgb(56, 183, 145));
  position: absolute;
  top: 0;
  left: 0;
  transform: translateX(0%);
  transition: all 1s;
  border-top-left-radius: inherit;
  border-bottom-left-radius: inherit;
}
.small-contain {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.stitle {
  font-size: 1.5em;
  font-weight: bold;
  color: #fff;
}
.scontent {
  font-size: 0.8em;
  color: #fff;
  text-align: center;
  padding: 2em 4em;
  line-height: 1.7em;
}
.sbutton {
  width: 60%;
  height: 40px;
  border-radius: 24px;
  border: 1px solid #fff;
  outline: none;
  background-color: transparent;
  color: #fff;
  font-size: 0.9em;
  cursor: pointer;
}

.big-box.active {
  left: 0;
  transition: all 0.5s;
}
.small-box.active {
  left: 100%;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-top-right-radius: inherit;
  border-bottom-right-radius: inherit;
  transform: translateX(-100%);
  transition: all 1s;
}
</style>
