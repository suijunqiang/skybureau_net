<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
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
        <!--
        <div>Quasar v{{ $q.version }}</div>
        -->
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated>
      <q-toolbar class="flex flex-center">
        <FootBar />
        <!--
        <div>Quasar v{{ $q.version }}</div>
        -->
        <div>Skybureau Net @Copyright 2001-2025</div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
//import EssentialLink from "components/EssentialLink.vue";
import HeadBar from "components/HeadBar.vue";
//import MenuTree from "components/myMenu.vue";
//import MenuTree from "components/my-q-menu-item.vue";
import LoginRegister from "src/pages/LoginRegister.vue";

export default defineComponent({
  name: "MainLayout",

  components: {
    //EssentialLink,
    HeadBar,
  },

  setup() {
    const leftDrawerOpen = ref(false);

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },

      toLogin() {
        alert("Login");
        this.router.push("/#/LoginRegister");
        //self.$router.push("/LoginRegister");
      },
    };
  },
});
</script>
