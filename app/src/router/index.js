import Vue from 'vue'
import VueRouter from 'vue-router'


// 路由懒加载
const Login = () => import('../views/login.vue')
const Register = () => import('../views/register.vue')
const Forget = () => import('../views/forget.vue')
const Home = () => import('../views/home.vue')
const Content = () => import('../components/file/content.vue')
const Recycle = () => import('../components/file/recycle.vue')
const Record = () => import('../components/file/record.vue')

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
      {path: 'recycle-bin', component: Recycle},
      {path: 'record', component: Record},
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login' || to.path === '/register' || to.path === '/forget') return next()
  // 获取token
  console.log(localStorage.getItem('token'))
  const tokenStr = localStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
