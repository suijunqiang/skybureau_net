const routes = [
{
path: "/",
component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "IndexTest", component: () => import("pages/IndexTest.vue") },
      { path: "", component: () => import("pages/IndexPage.vue") },
      // { path: "/login", component: () => import("pages/LoginRegister.vue") },
      {
        path: "loginRegister",
        component: () => import("pages/LoginRegister.vue"),
      },
    ],
  },
  {
    path: "/aboutus",
    component: () => import("layouts/AboutUsLayout.vue"),
    children: [
      { path: "", component: () => import("pages/AboutUs.vue") },
    ],
  }
  ,
  {
    path: "/news",
    component: () => import("layouts/NewsLayout.vue"),
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
      // { path: "/login", component: () => import("pages/LoginRegister.vue") },
      {
        path: "loginRegister",
        component: () => import("pages/LoginRegister.vue"),
      },
    ],
  },
  {    path: "/mainBackend",
       component: () => import("layouts/MainBackendLayout.vue"),
       children: [
        { path: "", component: () => import("pages/IndexPage.vue") },
        { path: "", component: () => import("pages/IndexTest.vue") },
        // { path: "/login", component: () => import("pages/LoginRegister.vue") },
        {
        path: "loginRegister",
        component: () => import("pages/LoginRegister.vue"),
        },
    ],
  },
  {    path: "/system/userManagement",
       component: () => import("layouts/MainBackendLayout.vue"),
       children: [
        { path: "", component: () => import("pages/system/UserManagement.vue") },
        { path: "welcome", component: () => import("pages/system/UserManagement.vue") },
        { path: "addUser", component: () => import("pages/system/UserManagement.vue") },
        { path: "userSettings", component: () => import("pages/system/UserManagement.vue") },
        { path: "userStatistics", component: () => import("pages/system/UserManagement.vue") },
        { path: "branch", component: () => import("pages/system/UserManagement.vue") },
        { path: "position", component: () => import("pages/system/UserManagement.vue") },
        { path: "menu", component: () => import("pages/system/UserManagement.vue") },
        { path: "users", component: () => import("pages/system/UserManagement.vue") },
      ],  },
  {    path: "/blog/create",
       component: () => import("layouts/MainBackendLayout.vue"),
       children: [
        { path: "", component: () => import("pages/system/UserManagement.vue") }
      ],  },
  {    path: "/blog/list",
       component: () => import("layouts/MainBackendLayout.vue"),
       children: [
        { path: "", component: () => import("pages/system/UserManagement.vue") }
      ],  },

  /*
  {
    path: "/login",
    component: () => import("pages/LoginRegister.vue"),
  },
  */
  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
