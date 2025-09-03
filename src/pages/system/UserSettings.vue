<template>
  <div>
    <div class="row items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-grey-700">{{ $t('user_settings') }}</h3>
    </div>

    <div class="bg-white shadow-md rounded-lg p-6">
      <div class="flex flex-col items-center justify-center h-48 text-center">
        <q-icon name="settings" size="48px" color="primary" class="q-mb-4" />
        <p class="text-grey-600">{{ $t('user_settings_page_placeholder') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from "vue-i18n";

export default {
  name: "UserSettings",
  setup() {
    const { t } = useI18n();

    return {
      t
    };
  }
};
</script>
