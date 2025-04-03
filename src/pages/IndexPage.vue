<template>
  <q-page class="flex flex-center">
    <div margin-left="100px" margin-right="100px">
   <div data-zone-id="0" data-line-index="0" data-line="true">
    <h2>{{ $t("home_title_1") }}</h2>
    </div>
    <div data-zone-id="0" data-line-index="1" data-line="true"><img src="./imgs/home_bg.jpg" alt="" image="true" source="null" uuid="iL1Of5wV" /></div>
    <div data-zone-id="0" data-line-index="2" data-line="true">
      <h3>{{ $t("home_title_2") }}</h3>
    </div>
    <div data-zone-id="0" data-line-index="3" data-line="true">{{ $t("home_title_2_content") }}</div>
    <div data-zone-id="0" data-line-index="4" data-line="true">
      <h3>{{ $t("home_title_3") }}</h3>
    </div>
    <div data-zone-id="0" data-line-index="5" data-line="true">{{ $t("home_title_3_content") }}</div>
    <!--
    <div data-zone-id="0" data-line-index="6" data-line="true">[{{ $t("home_more") }}]</div>
    -->
    <div data-zone-id="0" data-line-index="7" data-line="true"></div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { LocalStorage } from "quasar";

export default defineComponent({
  setup() {
    console.log("IndexPage");
    //console.log(LocalStorage.getItem("userInfo"));
  },

  name: "IndexPage",
  //getUserInfo() { return LocalStorage.getItem("userInfo"); },
});
</script>
