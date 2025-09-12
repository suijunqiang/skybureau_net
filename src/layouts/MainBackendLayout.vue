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
        <q-toolbar-title> {{ $t("skybureauBackend") }}</q-toolbar-title>

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
        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
        -->
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import HeadBar from "components/HeadBar.vue";
import QMFilterNode from "components/QMFilterNode.vue";
//import MenuTree from "components/myMenu.vue";
//import MenuTree from "components/my-q-menu-item.vue";
import LoginRegister from "src/pages/LoginRegister.vue";

const linksList = [
  {
    title: "Skybureau",
    caption: "Skybureau Net",
    icon: "home",
    link: "/",
  },
  {
    title: "Github",
    caption: "https://github.com/suijunqiang/skybureau_quassar",
    icon: "code",
    link: "https://github.com/suijunqiang/skybureau_quassar",
  },
  {
    title: "Discord Chat Channel",
    caption: "chat.skybureau.net",
    icon: "chat",
    link: "http://www.skybureau.net:9000",
  },
  {
    title: "Forum",
    caption: "Forum.skybureau.net",
    icon: "record_voice_over",
    link: "http://www.skybureau.net:9000",
  },
  {
    title: "Twitter",
    caption: "Skybureau Net",
    icon: "rss_feed",
    link: "http://www.skybureau.net:9000",
  },
  {
    title: "Facebook",
    caption: "Skybureau Net",
    icon: "public",
    link: "http://www.skybureau.net:9000",
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
