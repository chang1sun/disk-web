import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'

// 实现路由懒加载
const Login = () => import('../views/login.vue')
const Register = () => import('../views/register.vue')
const Forget = () => import('../views/forget.vue')
const Home = () => import('../views/home.vue')
const Content = () => import('../components/file/content.vue')
const Uploader = () => import ('../components/file/uploader/global-uploader.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/forget', component: Forget },
  { 
    path: '/:userId',
    component: Home,
    children: [
      {path: 'contents/:path', component: Content},
      {path: 'upload', component: Uploader},
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to and from are Route Object,next() must be called to resolve the hook}
  // to将要访问的路径 from代表从哪个路径跳转而来
  // next 是一个函数，表示放行 next() 放行 next('/login') 强制跳转到登录页面
  // 如果是登录页，直接放行即可
  if (to.path === '/login' || to.path === '/register' || to.path === '/forget') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('userId')
  if (!tokenStr) return next('/login')
  next()
})

export default router
