<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="min-width: 600px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ t('view_menu') || '查看菜单' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div v-if="menu" class="q-gutter-md">
          <div class="row q-gutter-md">
            <div class="col-5">
              <q-field label="菜单ID" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ menu.menu_id }}</div>
                </template>
              </q-field>
            </div>
            <div class="col">
              <q-field :label="t('menu_name')" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ menu.name }}</div>
                </template>
              </q-field>
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col">
              <q-field :label="t('page_url')" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ menu.page_url || t('not_set') }}</div>
                </template>
              </q-field>
            </div>
            <div class="col-4">
              <q-field :label="t('parent_id')" readonly>
                <template v-slot:control>
                  <div class="self-center">
                    <q-chip 
                      v-if="menu.parent_id === 0"
                      color="info"
                      text-color="white"
                      :label="t('root_menu')"
                      size="sm"
                    />
                    <span v-else>{{ menu.parent_id }}</span>
                  </div>
                </template>
              </q-field>
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col-3">
              <q-field :label="t('level')" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ menu.level }}</div>
                </template>
              </q-field>
            </div>
            <div class="col-3">
              <q-field :label="t('sort')" readonly>
                <template v-slot:control>
                  <div class="self-center flex items-center">
                    <q-icon name="sort" size="xs" class="q-mr-xs text-grey-6" />
                    {{ menu.sort || 0 }}
                  </div>
                </template>
              </q-field>
            </div>
            <div class="col">
              <q-field :label="t('icon')" readonly>
                <template v-slot:control>
                  <div class="self-center flex items-center">
                    <q-icon v-if="menu.icon" :name="menu.icon" size="sm" class="q-mr-xs" />
                    {{ menu.icon || t('not_set') }}
                  </div>
                </template>
              </q-field>
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col">
              <q-field :label="t('is_show')" readonly>
                <template v-slot:control>
                  <div class="self-center">
                    <q-chip
                      :color="menu.is_show === 1 ? 'positive' : 'grey'"
                      text-color="white"
                      :label="menu.is_show === 1 ? t('visible') : t('hidden')"
                      size="sm"
                    />
                  </div>
                </template>
              </q-field>
            </div>
            <div class="col">
              <q-field :label="t('is_enable')" readonly>
                <template v-slot:control>
                  <div class="self-center">
                    <q-icon
                      :name="menu.is_enable === 1 ? 'check_circle' : 'cancel'"
                      :color="menu.is_enable === 1 ? 'positive' : 'negative'"
                      size="sm"
                    />
                    {{ menu.is_enable === 1 ? t('enabled') : t('disabled') }}
                  </div>
                </template>
              </q-field>
            </div>
          </div>

          <div v-if="menu.description" class="row q-gutter-md">
            <div class="col">
              <q-field :label="t('description')" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ menu.description }}</div>
                </template>
              </q-field>
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col">
              <q-field :label="t('created_at')" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ formatDate(menu.createdAt) }}</div>
                </template>
              </q-field>
            </div>
            <div class="col">
              <q-field :label="t('updated_at')" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ formatDate(menu.updatedAt) }}</div>
                </template>
              </q-field>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat :label="t('close')" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, computed } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'MenuViewDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    menu: {
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

    return {
      t,
      visible,
      formatDate
    };
  }
});
</script>