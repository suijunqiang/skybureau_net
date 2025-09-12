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
        />
        <q-toolbar-title> {{ $t("skybureau") }}</q-toolbar-title>

        <HeadBar />
        <!--
        <div>Quasar v{{ $q.version }}</div>
        -->
      </q-toolbar>
    </q-header>
    <!--
    <q-drawer v-model="leftDrawerOpen" false bordered>
      -->
    <q-drawer v-model="leftDrawerOpen" :show-if-above="false" bordered>
      <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
        <!--
        <QMFilterNode v-bind="link" />
        -->
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="theme-surface">
      <q-toolbar class="flex flex-center theme-surface">
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
import EssentialLink from "components/EssentialLink.vue";
import HeadBar from "components/HeadBar.vue";
import FootBar from "components/FootBar.vue";
//import QMFilterNode from "components/QMFilterNode.vue";
//import MenuTree from "components/myMenu.vue";
//import MenuTree from "components/my-q-menu-item.vue";
import LoginRegister from "src/pages/LoginRegister.vue";

const linksList = [
  {
    title: "Docs",
    caption: "quasar.dev",
    icon: "school",
    link: "https://quasar.dev",
  },
  {
    title: "Github",
    caption: "github.com/quasarframework",
    icon: "code",
    link: "https://github.com/quasarframework",
  },
  {
    title: "Discord Chat Channel",
    caption: "chat.quasar.dev",
    icon: "chat",
    link: "https://chat.quasar.dev",
  },
  {
    title: "Forum",
    caption: "forum.quasar.dev",
    icon: "record_voice_over",
    link: "https://forum.quasar.dev",
  },
  {
    title: "Twitter",
    caption: "@quasarframework",
    icon: "rss_feed",
    link: "https://twitter.quasar.dev",
  },
  {
    title: "Facebook",
    caption: "@QuasarFramework",
    icon: "public",
    link: "https://facebook.quasar.dev",
  },
  {
    title: "Quasar Awesome",
    caption: "Community Quasar projects",
    icon: "favorite",
    link: "https://awesome.quasar.dev",
  },
  {
    title: "Login / Register",
    caption: "Login / Register",
    icon: "public",
    link: "/login",
  },
];

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
    HeadBar,
    FootBar,
    //QMFilterNode,
  },

  setup() {
    const leftDrawerOpen = ref(false);

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },

      toLogin() {
        //alert("Login");
        this.$router.push("/loginRegister");
      },
    };
  },
});
</script>
