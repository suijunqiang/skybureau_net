<template>
  <div class="q-pa-md">
    <q-table
      :rows="displayUsers"
      :columns="displayColumns"
      row-key="id"
      flat bordered
    >
      <template v-slot:body-cell-actions="props">
        <q-btn-group flat size="sm">
          <q-btn color="primary" @click="editUser(props.row)">编辑</q-btn>
          <q-btn color="negative" @click="deleteUser(props.row)">删除</q-btn>
        </q-btn-group>
      </template>
    </q-table>
  </div>
</template>

<script>
import { ref, computed } from "vue";

// 默认的示例数据
const defaultUsers = [
  {
    id: 1,
    username: "admin",
    realname: "管理员",
    department: "信息部",
    position: "软件开发",
    status: true
  },
  {
    id: 2,
    username: "test",
    realname: "测试1",
    department: "信息部",
    position: "软件测试",
    status: true
  }
];

// 默认的列配置
const defaultColumns = [
  { name: "id", label: "ID", field: "id", align: "left", sortable: true, width: 80 },
  { name: "username", label: "Login Name", field: "username", align: "left", sortable: true },
  { name: "realname", label: "Real Name", field: "realname", align: "left", sortable: true },
  { name: "department", label: "Department", field: "department", align: "left", sortable: true },
  { name: "position", label: "Position", field: "position", align: "left", sortable: true },
  { name: "status", label: "status", field: "status", align: "left", sortable: true, format: (val) => val ? "Active" : "Inactive" },
  { name: "actions", label: "Operation", field: "id", align: "right", width: 120, sortable: false }
];

export default {
  name: "UserList",
  props: {
    users: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => []
    },
    pagination: {
      type: Object,
      default: () => ({ page: 1, pages: 1, rowsPerPage: 10 })
    }
  },
  emits: ['edit-user', 'delete-user', 'switch-to-add-user', 'update-pagination'],
  setup(props, { emit }) {
    // 显示的用户数据 - 优先使用props中的数据，没有则使用默认数据
    const displayUsers = computed(() => {
      return props.users && props.users.length > 0 ? props.users : defaultUsers;
    });

    // 显示的列配置 - 优先使用props中的配置，没有则使用默认配置
    const displayColumns = computed(() => {
      return props.columns && props.columns.length > 0 ? props.columns : defaultColumns;
    });

    // 编辑用户方法
    const editUser = (user) => {
      emit('edit-user', user);
    };

    // 删除用户方法
    const deleteUser = (user) => {
      emit('delete-user', user);
    };

    return {
      displayUsers,
      displayColumns,
      editUser,
      deleteUser
    };
  }
};
</script>
