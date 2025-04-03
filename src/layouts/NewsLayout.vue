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
    <!--
    <q-drawer v-model="leftDrawerOpen" false bordered>
      -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>News Type </q-item-label>

        <QMFilterNode v-bind="link" />
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
//import EssentialLink from "components/EssentialLink.vue";
import HeadBar from "components/HeadBar.vue";
import QMFilterNode from "components/QMFilterNode.vue";
//import MenuTree from "components/myMenu.vue";
//import MenuTree from "components/my-q-menu-item.vue";
import LoginRegister from "src/pages/LoginRegister.vue";

export default defineComponent({
  name: "MainLayout",

  components: {
    //EssentialLink,
    HeadBar,
    QMFilterNode,
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
