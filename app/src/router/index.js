import Vue from 'vue'
import VueRouter from 'vue-router'


// 路由懒加载
const Login = () => import('../views/login.vue')
const Register = () => import('../views/register.vue')
const Forget = () => import('../views/forget.vue')
const Home = () => import('../views/home.vue')
const Content = () => import('../components/file/content.vue')
const Recycle = () => import('../components/file/recycle.vue')
const Record = () => import('../components/share/record.vue')
const Class = () => import('../components/file/class.vue')
const Share = () => import('../components/share/share.vue')

Vue.use(VueRouter)

const routes = [
  { path: '/index', redirect: {name: 'Content'}},
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/forget', component: Forget },
  { path: '/share/:token', redirect: {name: 'Share'}},
  {
    path: '/home',
    component: Home,
    children: [
      {path: 'contents/:path', component: Content, name: 'Content'},
      {path: 'recycle-bin', component: Recycle},
      {path: 'record', component: Record},
      {path: 'class/:class', component: Class},
      {path: 'share/:token', component: Share, name: 'Share'},
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  routes: routes,
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  const tokenStr = window.localStorage.getItem('token');
  if (to.path === '/login' || to.path === '/register' || to.path === '/forget') {
    if (tokenStr == null) {
      next();
    } else {
      next('home/contents/' + encodeURIComponent('/'));
      alert('请先退出登录');
    }
  }
  else {
    if (tokenStr == null) {
      window.localStorage.setItem('prePath', from.path);
      next('/login');
    }
    else next();
  }
})

export default router
