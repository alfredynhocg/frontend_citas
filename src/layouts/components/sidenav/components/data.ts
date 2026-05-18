import type { MenuItemType } from '@/types/layout'

export const menuItems: MenuItemType[] = [
  {
    key: 'main-title',
    label: 'Principal',
    isTitle: true,
  },
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'lucide:layout-dashboard',
    url: '/dashboard/citas',
  },

  {
    key: 'app-title',
    label: 'Aplicación',
    isTitle: true,
  },
  {
    key: 'citas',
    label: 'Citas',
    icon: 'lucide:heart',
    url: '/citas',
  },
  {
    key: 'parejas',
    label: 'Parejas',
    icon: 'lucide:users-round',
    url: '/parejas',
  },
  {
    key: 'recuerdos',
    label: 'Recuerdos',
    icon: 'lucide:camera',
    url: '/recuerdos',
  },

  {
    key: 'admin-title',
    label: 'Administración',
    isTitle: true,
  },
  {
    key: 'usuarios',
    label: 'Usuarios',
    icon: 'lucide:shield-user',
    url: '/users/list',
  },
  {
    key: 'categorias',
    label: 'Categorías',
    icon: 'lucide:tag',
    url: '/admin/categorias',
  },
  {
    key: 'negocios',
    label: 'Negocios',
    icon: 'lucide:store',
    url: '/admin/negocios',
  },
  {
    key: 'admin-citas',
    label: 'Citas',
    icon: 'lucide:heart-handshake',
    url: '/admin/citas',
  },
  {
    key: 'perfil',
    label: 'Mi Perfil',
    icon: 'lucide:circle-user',
    url: '/perfil',
  },

  {
    key: 'whatsapp-title',
    label: 'WhatsApp',
    isTitle: true,
  },
  {
    key: 'whatsapp-estado',
    label: 'Bot',
    icon: 'lucide:bot',
    url: '/whatsapp/estado',
  },
  {
    key: 'whatsapp-conversaciones',
    label: 'Conversaciones',
    icon: 'lucide:message-circle',
    url: '/whatsapp/conversaciones',
  },
  {
    key: 'whatsapp-configuracion',
    label: 'Configuración IA',
    icon: 'lucide:settings-2',
    url: '/whatsapp/configuracion',
  },
]
