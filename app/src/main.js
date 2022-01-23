import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import router from './router';
// 导入axios包
import axios from 'axios'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'

// 导入NProgress包对应的js和css
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

Vue.config.productionTip = false

Vue.use(ElementUI);

// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8001/v1/'

// 在 request 拦截器中，显示进度条 NProgress.start()
// 设置axios请求拦截器
axios.interceptors.request.use(config => {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // console.log(config)
  return config
})
// 在 response 拦截器中，隐藏进度条 NProgress.done()
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
// 将axios挂载到Vue原型对象上
Vue.prototype.$http = axios

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');