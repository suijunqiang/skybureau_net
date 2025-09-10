<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="min-width: 600px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ t('view_position') || '查看职位' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div v-if="position" class="q-gutter-md">
          <div class="row q-gutter-md">
            <div class="col-5">
              <q-field label="职位ID" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ position.position_id }}</div>
                </template>
              </q-field>
            </div>
            <div class="col">
              <q-field :label="t('position_name') || '职位名称'" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ position.name }}</div>
                </template>
              </q-field>
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col">
              <q-field :label="t('branch_name') || '部门名称'" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ position.branch_name || t('not_set') }}</div>
                </template>
              </q-field>
            </div>
            <div class="col">
              <q-field :label="t('branch_id') || '部门ID'" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ position.branch_id || t('not_set') }}</div>
                </template>
              </q-field>
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col">
              <q-field :label="t('menu_permissions') || '菜单权限'" readonly>
                <template v-slot:control>
                  <div class="self-center full-width">
                    <div v-if="position.menu_id" class="menu-permissions-display">
                      <q-chip
                        v-for="(menuName, index) in getMenuNamesArray(position.menu_id)"
                        :key="index"
                        size="sm"
                        color="primary"
                        text-color="white"
                        :label="menuName"
                        class="q-ma-xs"
                      />
                    </div>
                    <div v-else class="text-grey-5">{{ t('no_permissions') || '无权限' }}</div>
                  </div>
                </template>
              </q-field>
            </div>
          </div>

          <div v-if="position.description" class="row q-gutter-md">
            <div class="col">
              <q-field :label="t('description') || '描述'" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ position.description }}</div>
                </template>
              </q-field>
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col">
              <q-field :label="t('created_at') || '创建时间'" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ formatDate(position.createdAt) }}</div>
                </template>
              </q-field>
            </div>
            <div class="col">
              <q-field :label="t('updated_at') || '更新时间'" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ formatDate(position.updatedAt) }}</div>
                </template>
              </q-field>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="t('close') || '关闭'" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'PositionViewDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    position: {
      type: Object,
      default: null
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { t } = useI18n();

    const visible = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value)
    });

    const formatDate = (dateString) => {
      if (!dateString) return t('unknown_date') || '未知日期';
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    };

    const getMenuNames = (menuIds) => {
      if (!menuIds) return t('no_permissions') || '无权限';
      
      // 简单显示菜单ID，实际应用中可以从菜单列表中获取名称
      const ids = menuIds.split(',').map(id => id.trim());
      return ids.map(id => `菜单ID: ${id}`).join(', ');
    };
    
    const getMenuNamesArray = (menuIds) => {
      if (!menuIds) return [];
      
      // 返回菜单名称数组，用于显示为chip
      const ids = menuIds.split(',').map(id => id.trim());
      return ids.map(id => `菜单ID: ${id}`);
    };

    return {
      t,
      visible,
      formatDate,
      getMenuNames,
      getMenuNamesArray
    };
  }
});
</script>

<style scoped>
.menu-permissions-display {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.menu-permissions-display .q-chip {
  margin: 2px !important;
  font-size: 12px;
}

.full-width {
  width: 100%;
}
</style>