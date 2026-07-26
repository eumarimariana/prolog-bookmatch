import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import './index.css?url';

// Cria o QueryClient para compartilhar com o contexto do roteador
const queryClient = new QueryClient()

// Cria a instância do roteador baseada na árvore de arquivos
const router = createRouter({
  routeTree,
  context: { queryClient },
})

// Registra o roteador para garantir a tipagem (Type safety) no projeto inteiro
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)