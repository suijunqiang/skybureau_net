<template>
  <q-layout view="lHh Lpr lFf" class="theme-background">
    <q-header elevated class="theme-surface">
      <q-toolbar class="theme-surface">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title> {{ $t("skybureau") }}</q-toolbar-title>

        <HeadBar />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="theme-surface">
      <q-toolbar class="flex flex-center theme-surface">
        <div>Skybureau Net @Copyright 2001-2025</div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import HeadBar from "components/HeadBar.vue";
//import FootBar from "components/FootBar.vue";

export default defineComponent({
  name: "BlogLayout",

  components: {
    HeadBar,
    //FootBar,
  },

  setup() {
    const leftDrawerOpen = ref(false);

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
