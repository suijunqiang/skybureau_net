<template>
  <q-dialog :model-value="visible" @update:model-value="(value) => $emit('update:visible', value)" persistent>
    <q-card class="w-full md:w-4/5 lg:w-4/5 custom-dialog-width">
      <q-card-section class="bg-primary text-white custom-header-height">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-semibold">编辑菜单</h3>
          <q-btn icon="close" text-color="white" flat round dense @click="close" />
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- 菜单ID -->
            <div class="col-span-1">
              <q-input
                v-model.number="form.menu_id"
                label="* 菜单ID"
                required
                type="number"
                :rules="[val => !!val || '菜单ID不能为空']"
                placeholder="请输入菜单ID"
                class="w-full custom-input-height"
                :min="1"
              />
            </div>

            <!-- 菜单名称 -->
            <div class="col-span-1">
              <q-input
                v-model="form.name"
                label="* 菜单名称"
                required
                :rules="[val => !!val || '菜单名称不能为空']"
                placeholder="请输入菜单名称"
                class="w-full custom-input-height"
              />
            </div>

            <!-- 上级节点 -->
            <div class="col-span-1">
              <q-select
                v-model="form.parent_id"
                label="* 上级节点"
                required
                :options="parentOptions"
                option-label="name"
                option-value="menu_id"
                placeholder="请选择上级节点"
                class="w-full custom-input-height"
              />
            </div>

            <!-- 菜单地址 -->
            <div class="col-span-1">
              <q-input
                v-model="form.page_url"
                label="菜单地址"
                placeholder="请输入菜单地址"
                class="w-full custom-input-height"
              />
            </div>

            <!-- 控件地址 -->
            <div class="col-span-1">
              <q-input
                v-model="form.control_url"
                label="控件地址"
                placeholder="请输入控件地址"
                class="w-full custom-input-height"
              />
            </div>

            <!-- 图标 -->
            <div class="col-span-1">
              <q-input
                v-model="form.icon"
                label="图标"
                placeholder="请输入图标名称（如：home）"
                class="w-full custom-input-height"
              />
            </div>

            <!-- 排序 -->
            <div class="col-span-1">
              <q-input
                v-model.number="form.sort"
                label="排序"
                type="number"
                placeholder="请输入排序号"
                class="w-full custom-input-height"
                :min="0"
              />
            </div>

            <!-- 是否显示 -->
            <div class="col-span-1">
              <q-select
                v-model="form.is_show"
                label="是否显示"
                :options="showOptions"
                option-label="label"
                option-value="value"
                class="w-full custom-input-height"
              />
            </div>

            <!-- 是否启用 -->
            <div class="col-span-1 md:col-span-2">
              <q-select
                v-model="form.is_enable"
                label="是否启用"
                :options="enableOptions"
                option-label="label"
                option-value="value"
                class="w-full custom-input-height"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="bg-gray-100">
        <q-btn color="primary" label="确认" @click="onSubmit" />
        <q-btn color="negative" label="关闭" @click="close" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, watch, reactive, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import request from 'src/utils/request';
import { API } from 'src/api/api.js';

export default defineComponent({
  name: 'MenuEditDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    menu: {
      type: Object,
      default: null
    },
    menus: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:visible', 'save', 'error'],
  setup(props, { emit }) {
    const { t } = useI18n();

    // 表单数据
    const form = reactive({
      id: '',
      documentId: '',
      menu_id: '',
      name: '',
      icon: '',
      page_url: '',
      control_url: '',
      parent_id: 0,
      sort: 0,
      is_show: 1,
      is_enable: 1
    });

    // 上级节点选项
    const parentOptions = ref([
      { menu_id: 0, name: '根节点' }
    ]);

    // 显示选项
    const showOptions = [
      { label: '显示', value: 1 },
      { label: '隐藏', value: 0 }
    ];

    // 启用选项
    const enableOptions = [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ];

    // 监听菜单数据变化，更新表单
    watch(() => props.menu, (newMenu) => {
      if (newMenu) {
        // 确保所有数值类型正确转换
        const parsedParentId = newMenu.parent_id !== undefined && newMenu.parent_id !== null
          ? Number(newMenu.parent_id)
          : 0;

        Object.assign(form, {
          ...newMenu,
          // 确保documentId被正确设置
          documentId: newMenu.documentId || newMenu.id,
          // 确保数值类型正确
          parent_id: parsedParentId || 0,
          sort: Number(newMenu.sort) || 0,
          is_show: Number(newMenu.is_show) || 0,
          is_enable: Number(newMenu.is_enable) || 0
        });

        console.log('设置表单parent_id:', form.parent_id, '类型:', typeof form.parent_id);
      } else {
        // 重置表单
        Object.assign(form, {
          id: '',
          documentId: '',
          menu_id: '',
          name: '',
          icon: '',
          page_url: '',
          control_url: '',
          parent_id: 0,
          sort: 0,
          is_show: 1,
          is_enable: 1
        });
      }

      // 确保上级节点选项已更新后，重新设置parent_id以触发正确显示
      nextTick(() => {
        // 这个重新赋值会触发q-select重新匹配选项
        form.parent_id = form.parent_id;
        console.log('重新设置parent_id以确保正确显示:', form.parent_id);
      });
    }, { immediate: true });

    // 监听菜单列表变化，更新上级节点选项
    watch(() => props.menus, (newMenus) => {
      if (newMenus && newMenus.length > 0) {
        // 过滤掉当前编辑的菜单（避免选择自己作为父节点）
        const availableMenus = newMenus.filter(
          m => !props.menu || m.menu_id !== props.menu.menu_id
        );

        parentOptions.value = [
          { menu_id: 0, name: '根节点' },
          ...availableMenus.map(m => ({
            menu_id: Number(m.menu_id),
            name: m.name
          }))
        ];
      } else {
        // 即使没有菜单数据，也要确保有根节点选项
        parentOptions.value = [{ menu_id: 0, name: '根节点' }];
      }

      console.log('上级节点选项更新:', parentOptions.value);

      // 菜单选项更新后，重新设置parent_id以确保正确显示
      nextTick(() => {
        const currentParentId = form.parent_id;
        // 这个重新赋值会触发q-select重新匹配选项
        form.parent_id = null;
        form.parent_id = currentParentId;
        console.log('菜单选项更新后，重新设置parent_id:', form.parent_id);
      });
    }, { immediate: true });

    // 关闭对话框
    const close = () => {
      emit('update:visible', false);
    };

    // 提交表单
    const onSubmit = async () => {
      try {
        // 验证必需字段
        if (!form.name || form.parent_id === undefined) {
          console.error('缺少必需字段');
          return;
        }

        console.log('准备提交表单 - 原始parent_id:', form.parent_id, '类型:', typeof form.parent_id);

        // 确保parent_id是有效的menu_id值
        // 处理form.parent_id可能是对象的情况，提取其中的menu_id
        let submitParentId = 0;

        // 类型检查和转换
        if (form.parent_id === undefined || form.parent_id === null) {
          submitParentId = 0;
          console.warn('parent_id为空，使用默认值0');
        } else if (typeof form.parent_id === 'object') {
          // 如果是对象，提取其中的menu_id属性
          submitParentId = form.parent_id.menu_id || 0;
          console.log('从parent_id对象中提取menu_id:', submitParentId);
        } else if (typeof form.parent_id !== 'number') {
          // 如果不是数字，尝试转换
          submitParentId = Number(form.parent_id);
          // 检查转换后是否为有效数字
          if (isNaN(submitParentId)) {
            submitParentId = 0;
            console.warn('parent_id转换失败，使用默认值0');
          }
        } else {
          // 如果已经是数字，直接使用
          submitParentId = form.parent_id;
        }

        console.log('转换后的parent_id值:', submitParentId, '类型:', typeof submitParentId);

        const submitData = {
          name: form.name,
          menu_id: form.menu_id ? Number(form.menu_id) : null,
          icon: form.icon || '',
          page_url: form.page_url || '',
          control_url: form.control_url || '',
          parent_id: submitParentId, // 使用转换后的parent_id值
          sort: Number(form.sort) || 0,
          is_show: Number(form.is_show),
          is_enable: Number(form.is_enable)
        };

        console.log('提交的parent_id值:', submitData.parent_id, '类型:', typeof submitData.parent_id);
        console.log('表单中的parent_id原始值:', form.parent_id, '类型:', typeof form.parent_id);

        // 根据参考格式，将数据包装在data对象中
        const formattedData = {
          data: submitData
        };

        // 确保documentId正确
        console.log('当前documentId:', form.documentId);
        console.log('表单数据:', form);

        // 根据是否有documentId判断是新增还是编辑
        if (form.documentId) {
          // 编辑操作 - 使用正确的API常量
          const url = `${API.USER.MENU.CREATE}/${form.documentId}`;
          console.log('PUT请求URL:', url);
          console.log('PUT请求数据:', formattedData);
          console.log('提交数据中的parent_id:', submitData.parent_id);
          const response = await request.put(url, formattedData, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          emit('save', response.data.data);
        } else {
          // 新增操作
          const url = API.USER.MENU.CREATE;
          console.log('POST请求URL:', url);
          console.log('POST请求数据:', formattedData);
          const response = await request.post(url, formattedData, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          emit('save', response.data.data);
        }

        // 关闭对话框
        close();
      } catch (error) {
        console.error('保存菜单失败:', error);
        // 输出更详细的错误信息，帮助排查问题
        if (error.response) {
          console.error('错误响应数据:', error.response.data);
          console.error('错误状态码:', error.response.status);
          console.error('错误头部信息:', error.response.headers);
        } else if (error.request) {
          console.error('没有收到响应:', error.request);
        } else {
          console.error('请求配置错误:', error.message);
        }
        console.error('请求配置:', error.config);
        emit('error', error);
      }
    };

    return {
      form,
      parentOptions,
      showOptions,
      enableOptions,
      close,
      onSubmit
    };
  }
});
</script>

<style scoped>
  .space-y-4 > div {
    margin-bottom: 1rem;
  }

  /* 调整窗口宽度 - 缩小到之前的1/3 */
  .custom-dialog-width {
    max-width: 400px; /* 原来的1/3 (1200px / 3) */
    width: 90%;
  }

  /* 缩小标题高度和字号 - 进一步减少padding并缩小字体 */
  .custom-header-height {
    padding: 4px 16px; /* 原来的1/4（之前已经是1/2，现在再缩小到一半） */
  }

  .custom-header-height h3 {
    font-size: 1rem; /* 原来的一半（之前是1.5rem） */
    margin: 0;
  }

  /* 缩小输入项目高度 */
  .custom-input-height .q-field__control {
    min-height: 36px; /* 原来的大约一半 */
    height: 36px;
  }

  .custom-input-height .q-field__input {
    min-height: 36px;
    height: 36px;
    padding-top: 6px;
    padding-bottom: 6px;
  }

  /* 确保选择框也适应新的高度 */
  .custom-input-height .q-select__control {
    min-height: 36px;
    height: 36px;
  }
</style>
