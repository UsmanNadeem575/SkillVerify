import Vue from 'vue'
import VueRouter from 'vue-router'
import HelloWorld from '@/components/HelloWorld.vue'
import SeekerDashboard from '@/components/SeekerDashboard.vue'
import CompanyDashboard from '@/components/CompanyDashboard.vue'
import SecureExamWindow from '@/components/SecureExamWindow.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'helloworld',
    component: HelloWorld
  },
    {
    path: '/seeker-dashboard',
    name: 'seeker-dashboard',
    component: SeekerDashboard
  },
    {
    path: '/company-dashboard',
    name: 'company-dashboard',
    component: CompanyDashboard
  },
    {
    path: '/secure-exam',
    name: 'SecureExam',
    component: SecureExamWindow
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
