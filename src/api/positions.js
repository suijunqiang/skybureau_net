import axios from 'axios';
import { API } from './api.js';
import { useUserInfoStore } from '../stores/userInfo.js';
import { usePositionInfoStore } from '../stores/positionInfo.js';

// 获取用户职位信息
export const getUserPosition = async () => {
  try {
    // 从用户信息存储中获取position_id
    const userInfoStore = useUserInfoStore();
    const userInfo = userInfoStore.userInfo;

    // 调试：打印完整的用户信息以了解数据结构
    console.log('完整用户信息:', userInfo);

    if (!userInfo) {
      console.error('无法获取用户信息，请确保用户已登录');
      return null;
    }

    // 尝试从不同可能的路径获取position_id
    let positionId = null;
    if (userInfo.position_id) {
      positionId = userInfo.position_id;
    } else if (userInfo.user && userInfo.user.position_id) {
      positionId = userInfo.user.position_id;
    } else if (userInfo.user && userInfo.user.position && userInfo.user.position.id) {
      positionId = userInfo.user.position.id;
    }

    if (!positionId) {
      console.error('用户信息中未找到position_id，请检查数据结构');
      return null;
    }

    // 构建请求URL
    const url = `${API.USER.POSITION.LIST}?filters[position_id][$eq]=${positionId}`;

    // 发送请求
    const response = await axios.get(url);

    // 在控制台输出结果
    console.log('用户职位信息查询结果:', response.data);

    // 将职位信息保存到本地存储（使用专门的positionInfo存储）
    if (response.data && response.data.data && response.data.data.length > 0) {
      const positionData = response.data.data[0];
      const positionInfoStore = usePositionInfoStore();
      positionInfoStore.setPositionInfo(positionData);
      console.log('用户职位信息已保存到本地存储');
    }

    // 移除无条件获取所有菜单的代码，菜单数据应该在组件中根据职位信息按需获取

    return response.data;
  } catch (error) {
    console.error('查询用户职位信息失败:', error);
    return null;
  }
}

// 导出函数，便于在其他组件中使用
export default {
  getUserPosition
};
