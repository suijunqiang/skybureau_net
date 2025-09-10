<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="min-width: 500px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ t('view_user') || '查看用户' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div v-if="user" class="q-gutter-md">
          <div class="row q-gutter-md">
            <div class="col-5">
              <q-field label="ID" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ user.id }}</div>
                </template>
              </q-field>
            </div>
            <div class="col">
              <q-field :label="t('username')" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ user.username }}</div>
                </template>
              </q-field>
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col">
              <q-field :label="t('email')" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ user.email }}</div>
                </template>
              </q-field>
            </div>
            <div class="col">
              <q-field :label="t('real_name')" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ user.real_name || t('not_set') }}</div>
                </template>
              </q-field>
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col">
              <q-field :label="t('position_name')" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ user.position_name || t('not_set') }}</div>
                </template>
              </q-field>
            </div>
            <div class="col">
              <q-field :label="t('branch_name')" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ user.branch_name || t('not_set') }}</div>
                </template>
              </q-field>
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col">
              <q-field :label="t('mobile')" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ user.mobile || t('not_set') }}</div>
                </template>
              </q-field>
            </div>
            <div class="col">
              <q-field :label="t('confirmed')" readonly>
                <template v-slot:control>
                  <div class="self-center">
                    <q-chip 
                      :color="user.confirmed ? 'positive' : 'orange'" 
                      text-color="white" 
                      :label="user.confirmed ? t('confirmed') : t('unconfirmed')"
                      size="sm"
                    />
                  </div>
                </template>
              </q-field>
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col">
              <q-field :label="t('is_enabled')" readonly>
                <template v-slot:control>
                  <div class="self-center">
                    <q-icon 
                      :name="user.is_enabled ? 'check_circle' : 'cancel'" 
                      :color="user.is_enabled ? 'positive' : 'negative'"
                      size="sm"
                    />
                    {{ user.is_enabled ? t('enabled') : t('disabled') }}
                  </div>
                </template>
              </q-field>
            </div>
            <div class="col">
              <q-field :label="t('created_at')" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ formatDate(user.createdAt) }}</div>
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
  name: 'UserViewDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    user: {
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