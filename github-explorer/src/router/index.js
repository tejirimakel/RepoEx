import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("../views/Home.vue"),
    meta: { title: "Home — GitHub Explorer" }
  },
  {
    path: "/repo/:owner/:name",
    component: () => import("../views/RepoDetail.vue"),
    meta: { title: "Repository — GitHub Explorer" }
  },
  {
    path: "/favorite",
    component: () => import("../views/Favorite.vue"),
    meta: { title: "Favorites — GitHub Explorer" }
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import("../views/NotFound.vue"),
    meta: { title: "Not Found — GitHub Explorer" }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.afterEach((to) => {
  document.title = to.meta.title || "GitHub Explorer";
});

export default router;
