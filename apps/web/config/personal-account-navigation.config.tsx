import { CreditCard, Home, Layers, Users, Wallet, Settings, SquareCheck } from 'lucide-react';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

const iconClasses = 'w-4';

const routes = [
  {
    label: 'Inicio',
    path: pathsConfig.app.home,
    Icon: <Home className={iconClasses} />,
    end: true,
  },
  {
    label: 'Pedidos',
    path: pathsConfig.app.orders,
    Icon: <Layers className={iconClasses} />,
  },
  {
    label: 'Usuarios',
    path: pathsConfig.app.users,
    Icon: <Users className={iconClasses} />,
  },
  {
    label: 'Servicios',
    path: pathsConfig.app.services,
    Icon: <SquareCheck className={iconClasses} />,
  },
  {
    label: 'Facturas',
    path: pathsConfig.app.invoices,
    Icon: <Wallet className={iconClasses} />,
  },
  {
    label: 'Configuraciones',
    path: pathsConfig.app.personalAccountSettings,
    Icon: <Settings className={iconClasses} />,
  },
];

if (featureFlagsConfig.enablePersonalAccountBilling) {
  routes.push({
    label: 'common:billingTabLabel',
    path: pathsConfig.app.personalAccountBilling,
    Icon: <CreditCard className={iconClasses} />,
  });
}

export const personalAccountNavigationConfig = NavigationConfigSchema.parse({
  routes,
  style: process.env.NEXT_PUBLIC_USER_NAVIGATION_STYLE,
});
