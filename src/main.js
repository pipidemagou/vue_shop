// Vue实例
import Vue from 'vue'
// 渲染
import App from './App.vue'
// 路由
import router from './router'
// element-ui
import './plugins/element.js'
// 全局css
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
import axios from 'axios'

import TreeTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.component('tree-table', TreeTable)
// 注册为全局可用的组件
Vue.use(VueQuillEditor)
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.config.productionTip = false
Vue.prototype.$http = axios
Vue.filter('dataFormat', function (originVal) {
  const date = new Date(originVal)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1 + '').padStart(2, '0')
  const day = (date.getDate() + '').padStart(2, '0')
  const hh = (date.getHours() + '').padStart(2, '0')
  const mm = (date.getMinutes() + '').padStart(2, '0')
  const ss = (date.getSeconds() + '').padStart(2, '0')
  return `${year}/${month}/${day} ${hh}:${mm}:${ss}`
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
