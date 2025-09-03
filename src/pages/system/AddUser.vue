<template>
  <div>
    <div class="row items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-grey-700">{{ $t('add_user') }}</h3>
      <q-btn color="secondary" @click="switchToUserList">
        {{ $t("back_to_list") }}
        <q-icon name="arrow_back" class="q-ml-xs" />
      </q-btn>
    </div>

    <div class="bg-white shadow-md rounded-lg p-6">
      <q-form @submit="handleAddUser">
        <q-input v-model="newUser.username" :label="$t('login_name')" required />
        <q-input v-model="newUser.realname" :label="$t('real_name')" required />
        <q-input v-model="newUser.department" :label="$t('department')" required />
        <q-input v-model="newUser.position" :label="$t('position')" required />
        <div class="row items-center mt-4">
          <q-checkbox v-model="newUser.status" :label="$t('active')" checked />
        </div>
        <div class="row justify-end mt-6">
          <q-btn type="reset" flat color="grey" class="q-mr-md">
            {{ $t("reset") }}
          </q-btn>
          <q-btn type="submit" color="primary">
            {{ $t("submit") }}
          </q-btn>
        </div>
      </q-form>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useI18n } from "vue-i18n";

export default {
  name: "AddUser",
  emits: ['add-user', 'switch-to-user-list'],
  setup(props, { emit }) {
    const { t } = useI18n();

    // 新用户表单数据
    const newUser = ref({
      username: '',
      realname: '',
      department: '',
      position: '',
      status: true
    });

    // 切换到用户列表页面
    const switchToUserList = () => {
      emit('switch-to-user-list');
    };

    // 处理添加用户表单提交
    const handleAddUser = () => {
      // 验证表单数据
      if (!newUser.value.username || !newUser.value.realname || !newUser.value.department || !newUser.value.position) {
        alert(t("please_fill_all_required_fields"));
        return;
      }

      // 触发添加用户事件
      emit('add-user', { ...newUser.value });

      // 重置表单
      newUser.value = {
        username: '',
        realname: '',
        department: '',
        position: '',
        status: true
      };
    };

    return {
      t,
      newUser,
      switchToUserList,
      handleAddUser
    };
  }
};
</script>
