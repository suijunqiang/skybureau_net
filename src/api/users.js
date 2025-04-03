import reques from "src/utils/request";

//Login api
export const login = (userInfo) => {
  return reques({
    url: "/auth/local",
    method: "post",
    data: userInfo,
  });
};
