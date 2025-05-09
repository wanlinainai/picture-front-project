import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UserLoginPage from '@/pages/user/UserLoginPage.vue'
import UserRegisterPage from '@/pages/user/UserRegisterPage.vue'
import UserManagePage from '@/pages/admin/UserManagePage.vue'
import HomePage from '@/pages/HomePage.vue'
import AddPicturePage from '@/pages/AddPicturePage.vue'
import PictureManagePage from '@/pages/admin/PictureManagePage.vue'
import PictureDetailPage from '@/pages/PictureDetailPage.vue'
import AddPictureBatchPageVue from '@/pages/AddPictureBatchPage.vue'
import SpaceManagePage from '@/pages/admin/SpaceManagePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/user/login',
      name: 'Login',
      component: UserLoginPage,
    },
    {
      path: '/user/register',
      name: 'Register',
      component: UserRegisterPage,
    },
    {
      path: '/admin/userManage',
      name: 'adminManage',
      component: UserManagePage,
    },
    {
      path: '/admin/pictureManage',
      name: '图片管理',
      component: PictureManagePage
    },
    {
      path: '/admin/spaceManage',
      name: '空间管理',
      component: SpaceManagePage
    },
    {
      path: '/picture/:id',
      name: '图片详情',
      component: PictureDetailPage,
      props: true
    },
    {
      path: '/add_picture',
      name: '创建图片',
      component: AddPicturePage
    },
    {
      path: '/add_picture/batch',
      name: '批量创建图片',
      component: AddPictureBatchPageVue
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
