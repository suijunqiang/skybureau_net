<template>
  <q-dialog v-model="visible" persistent>
    <q-card style="min-width: 600px;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ t('view_branch') || '查看部门' }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div v-if="branch" class="q-gutter-md">
          <div class="row q-gutter-md">
            <div class="col-5">
              <q-field label="部门ID" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ branch.branch_id }}</div>
                </template>
              </q-field>
            </div>
            <div class="col">
              <q-field :label="t('branch_name')" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ branch.name }}</div>
                </template>
              </q-field>
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col">
              <q-field :label="t('code')" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ branch.code || t('not_set') }}</div>
                </template>
              </q-field>
            </div>
            <div class="col-4">
              <q-field :label="t('parent_id')" readonly>
                <template v-slot:control>
                  <div class="self-center">
                    <q-chip 
                      v-if="branch.parent_id === 0"
                      color="info"
                      text-color="white"
                      :label="t('root_branch')"
                      size="sm"
                    />
                    <span v-else>{{ branch.parent_id }}</span>
                  </div>
                </template>
              </q-field>
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col-3">
              <q-field :label="t('level')" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ branch.level }}</div>
                </template>
              </q-field>
            </div>
            <div class="col-3">
              <q-field :label="t('sort')" readonly>
                <template v-slot:control>
                  <div class="self-center flex items-center">
                    <q-icon name="sort" size="xs" class="q-mr-xs text-grey-6" />
                    {{ branch.sort || 0 }}
                  </div>
                </template>
              </q-field>
            </div>
            <div class="col">
              <q-field :label="t('status')" readonly>
                <template v-slot:control>
                  <div class="self-center">
                    <q-chip
                      color="positive"
                      text-color="white"
                      :label="t('active')"
                      size="sm"
                    />
                  </div>
                </template>
              </q-field>
            </div>
          </div>

          <div v-if="branch.description" class="row q-gutter-md">
            <div class="col">
              <q-field :label="t('description')" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ branch.description }}</div>
                </template>
              </q-field>
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col">
              <q-field :label="t('created_at')" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ formatDate(branch.createdAt) }}</div>
                </template>
              </q-field>
            </div>
            <div class="col">
              <q-field :label="t('updated_at')" readonly>
                <template v-slot:control>
                  <div class="self-center">{{ formatDate(branch.updatedAt) }}</div>
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
  name: 'BranchViewDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    branch: {
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