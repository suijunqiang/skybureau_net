<template>
  <div class="branch-container">
    <q-card>
      <q-card-section>
        <h2 class="text-xl font-semibold mb-4">{{ $t('branch_page_title') }}</h2>
        <p class="text-base mb-6">{{ $t('branch_page_description') }}</p>
        
        <div class="branch-content">
          <q-card>
            <q-card-section class="bg-primary text-white">
              <h3 class="text-lg font-medium">{{ $t('position_information') }}</h3>
            </q-card-section>
            <q-card-section>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-gray-50 p-4 rounded">
                  <p class="text-sm text-gray-500">{{ $t('position_title') }}</p>
                  <p class="text-base font-medium">{{ $t('position_sample_title') }}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded">
                  <p class="text-sm text-gray-500">{{ $t('position_department') }}</p>
                  <p class="text-base font-medium">{{ $t('position_sample_department') }}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded">
                  <p class="text-sm text-gray-500">{{ $t('position_level') }}</p>
                  <p class="text-base font-medium">{{ $t('position_sample_level') }}</p>
                </div>
                <div class="bg-gray-50 p-4 rounded">
                  <p class="text-sm text-gray-500">{{ $t('position_status') }}</p>
                  <p class="text-base font-medium">{{ $t('position_sample_status') }}</p>
                </div>
              </div>
            </q-card-section>
          </q-card>
          
          <div class="mt-6">
            <q-card>
              <q-card-section class="bg-primary text-white">
                <h3 class="text-lg font-medium">{{ $t('position_responsibilities') }}</h3>
              </q-card-section>
              <q-card-section>
                <ul class="list-disc pl-5 space-y-2">
                  <li>{{ $t('position_responsibility_1') }}</li>
                  <li>{{ $t('position_responsibility_2') }}</li>
                  <li>{{ $t('position_responsibility_3') }}</li>
                  <li>{{ $t('position_responsibility_4') }}</li>
                </ul>
              </q-card-section>
            </q-card>
          </div>
        </div>
        
        <div class="mt-6">
          <q-btn color="primary" label="{{ $t('back_to_list') }}" @click="goBack"/>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'BranchPage',
  setup() {
    const { t } = useI18n();
    const router = useRouter();
    
    const goBack = () => {
      router.push('/system/userManagement/userList');
    };
    
    return {
      t,
      goBack
    };
  }
});
</script>

<style scoped>
.branch-container {
  max-width: 1000px;
  margin: 0 auto;
}

.branch-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>