import Vue from 'vue'
import VueRouter from 'vue-router'
import MeetingList from '../views/MeetingList.vue'
import MeetingCreate from '../views/MeetingCreate.vue'
import MeetingDetail from '../views/MeetingDetail.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/meetings'
  },
  {
    path: '/meetings',
    component: MeetingList
  },
  {
    path: '/create',
    component: MeetingCreate
  },
  {
    path: '/meeting/:id',
    component: MeetingDetail,
    name: 'MeetingDetail'
  },
  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
