<template>
  <div class="q-pa-md q-gutter-sm">
    <q-input ref="filterRef" filled v-model="filter" label="Filter">
      <template v-slot:append>
        <q-icon
          v-if="filter !== ''"
          name="clear"
          class="cursor-pointer"
          @click="resetFilter"
        />
      </template>
    </q-input>

    <q-tree
      :nodes="nodes_tree"
      node-key="value"
      :filter="filter"
      v-model:selected="selected"
      default-expand-all
      @click="handleClick"
    />
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";

export default {
  setup() {
    const filter = ref("");
    const filterRef = ref(null);
    const selected = ref(null);
    const router = useRouter();

    return {
      filter,
      filterRef,
      selected,

      unselectNode() {
        selected.value = null;
      },

      nodes_tree: [
        {
          label: "Satisfied customers",
          children: [
            {
              label: "Good food",
              children: [
                { label: "Quality ingredients", value: 1 },
                { label: "Good recipe", value: 2 },
              ],
            },
            {
              label: "Good service (disabled node)",
              //disabled: true,
              children: [
                { label: "Prompt attention", value: 3 },
                { label: "Professional waiter", value: 4 },
              ],
            },
            {
              label: "Pleasant surroundings",
              children: [
                { label: "Happy atmosphere", value: 5 },
                { label: "Good table presentation", value: 6 },
                { label: "Pleasing decor", value: 7 },
              ],
            },
          ],
        },
      ],

      resetFilter() {
        filter.value = "";
        filterRef.value.focus();
      },
      toLogin() {
        router.push("/loginRegister");
      },
      handleClick() {
        console.log("您当前所选择的是：", selected.value);
        switch (selected.value) {
          case 1:
            //props..self.$router.push("/login");
            router.push("/loginRegister");
            break;
          case 2:
            router.push("/");
            break;
          case 3:
            router.push("/IndexTest");
            break;
          case 4:
            router.push("/");
            break;
          case 5:
            router.push("/");
            break;
          case 6:
            router.push("/");
            break;
          case 7:
            router.push("/");
            break;
          default:
            break;
        }
      },
    };
  },
};
</script>
