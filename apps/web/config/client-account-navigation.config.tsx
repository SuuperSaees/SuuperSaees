import {
  // Briefcase,
  CreditCard, // Home,
  Layers,
  Settings, // SquareCheck,
  // Users,
  // Wallet,
} from 'lucide-react';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

const iconClasses = 'w-4';

const routes = [
  // {
  //   label: 'Inicio',
  //   path: pathsConfig.app.home,
  //   Icon: <Home className={iconClasses} />,
  //   end: true,
  // },
  {
    label: 'common:orders',
    path: pathsConfig.app.orders,
    Icon: <Layers className={iconClasses} />,
  },
  // {
  //   label: 'Usuarios',
  //   Icon: <Users className={iconClasses} />,
  //   children: [
  //     {
  //       label: 'Clientes',
  //       path: pathsConfig.app.clients,
  //     },
  //   ],
  // },

  // {
  //   label: 'Facturas',
  //   path: pathsConfig.app.invoices,
  //   Icon: <Wallet className={iconClasses} />,
  // },
  {
    label: 'common:settings',
    path: pathsConfig.app.personalAccountSettings,
    Icon: <Settings className={iconClasses} />,
  },
  // {
  //   label: 'Briefs',
  //   path: pathsConfig.app.briefs,
  //   Icon: <Briefcase className={iconClasses} />,
  // },
];

if (featureFlagsConfig.enablePersonalAccountBilling) {
  routes.push({
    label: 'common:billingTabLabel',
    path: pathsConfig.app.personalAccountBilling,
    Icon: <CreditCard className={iconClasses} />,
  });
}

export const clientAccountNavigationConfig = NavigationConfigSchema.parse({
  routes,
  style: process.env.NEXT_PUBLIC_USER_NAVIGATION_STYLE,
});