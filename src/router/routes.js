
const routes = [
  {
    path: '/submissions/',
    component: () => import('layouts/BaseLayout'),
    children: [
      {
        path: '',
        component: () => import('pages/submissions'),
        name: 'my_submissions',
        meta: { authorize: {isLoggedIn: true} },
        props: { lab: false }
      },
      {
        path: ':id',
        component: () => import('pages/submission'),
        name: 'submission',
        props: true
      },
      {
        path: ':id/modify/',
        component: () => import('pages/submission'),
        name: 'modify_submission',
        props: (route) => ({ id: route.params.id, modify: true })
      },
      {
        path: ':id/confirm/',
        component: () => import('pages/confirm_submission'),
        name: 'confirm_submission',
        props: (route) => ({ id: route.params.id })
      },
      {
        path: 'created/',
        component: () => import('pages/submission_created'),
        name: 'submission_created'
      }
      // {
      //   path: 'submissions/:id',
      //   component: () => import('pages/submission'),
      //   name: 'submission',
      //   props: true
      // }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/BaseLayout'),
    children: [
      { path: '', name: 'index', component: () => import('pages/index') },
      { path: 'profile', name: 'profile', component: () => import('pages/profile'), meta: { authorize: {isLoggedIn: true} } },
      { path: 'settings', name: 'institution_settings', component: () => import('pages/institution_settings.vue'), meta: { authorize: {isLoggedIn: true, isStaff: true} } }
    ]
  },
  {
    path: '/:lab_id',
    component: () => import('layouts/BaseLayout'),
    children: [
      { path: '', name: 'lab', component: () => import('pages/lab') },
      {
        path: 'submissions',
        component: () => import('pages/submissions'),
        name: 'submissions',
        meta: { authorize: {isLoggedIn: true, isStaff: true} },
        props: { lab: true }
      },
      {
        path: 'imports',
        component: () => import('pages/imports'),
        name: 'imports',
        meta: { authorize: {isLoggedIn: true, isStaff: true} }
      },
      {
        path: 'submissions/create',
        component: () => import('pages/submission'),
        name: 'create_submission',
        props: {create: true, id: null}
      },
      {
        path: 'submission_types',
        component: () => import('pages/submission_types'),
        name: 'submission_types',
        meta: { authorize: {isLoggedIn: true, isStaff: true} }
      },
      {
        path: 'submission_type/:id',
        component: () => import('pages/submission_type'),
        name: 'submission_type',
        props: true,
        meta: { authorize: {isLoggedIn: true, isStaff: true} }
      },
      {
        path: 'submission_type/create',
        component: () => import('pages/submission_type'),
        name: 'create_submission_type'
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('pages/settings'),
        meta: { authorize: {isLoggedIn: true, isStaff: true} }
      }
    ]
  },
  {
    path: '/print',
    component: () => import('layouts/blank'),
    children: [
      {
        path: '/print/submissions/:id',
        component: () => import('pages/print_submission'),
        name: 'print_submission',
        props: (route) => ({ id: route.params.id })
      }
    ]
  },
  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404'),
    name: 'not_found'
  },
  { // Always leave this as last one
    path: '/error',
    component: () => import('pages/404'),
    name: 'not_found'
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
