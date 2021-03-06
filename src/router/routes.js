
const routes = [
  {
    path: '/',
    component: () => import('layouts/BaseLayout'),
    children: [
      { path: '', name: 'index', component: () => import('pages/index') },
      {
        path: '/submissions',
        component: () => import('pages/submissions'),
        name: 'submissions',
        meta: { authorize: {isLoggedIn: true} }
      },
      {
        path: '/imports',
        component: () => import('pages/imports'),
        name: 'imports',
        meta: { authorize: {isLoggedIn: true} }
      },
      {
        path: '/submissions/create',
        component: () => import('pages/submission'),
        name: 'create_submission',
        props: {create: true, id: null}
      },
      {
        path: '/submissions/:id',
        component: () => import('pages/submission'),
        name: 'submission',
        props: true
      },
      {
        path: '/submissions/:id/modify/',
        component: () => import('pages/submission'),
        name: 'modify_submission',
        props: (route) => ({ id: route.params.id, modify: true })
      },
      {
        path: '/submissions/:id/confirm/',
        component: () => import('pages/confirm_submission'),
        name: 'confirm_submission',
        props: (route) => ({ id: route.params.id })
      },
      {
        path: '/submissions/created/',
        component: () => import('pages/submission_created'),
        name: 'submission_created'
      },
      {
        path: '/submission_types',
        component: () => import('pages/submission_types'),
        name: 'submission_types',
        meta: { authorize: {isLoggedIn: true} }
      },
      {
        path: '/submission_type/:id',
        component: () => import('pages/submission_type'),
        name: 'submission_type',
        props: true,
        meta: { authorize: {isLoggedIn: true} }
      },
      {
        path: '/submission_type/create',
        component: () => import('pages/submission_type'),
        name: 'create_submission_type'
      },
      {
        path: '/settings',
        name: 'settings',
        component: () => import('pages/settings'),
        meta: { authorize: {isLoggedIn: true} }
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
    component: () => import('pages/404')
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
