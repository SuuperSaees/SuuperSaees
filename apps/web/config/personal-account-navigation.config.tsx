import {
  // Briefcase,
  CreditCard,
  Layers,
  Settings,
  SquareCheck,
  Users,
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
    label: 'common:ordersName',
    path: pathsConfig.app.orders,
    Icon: <Layers className={iconClasses} />,
  },
  {
    label: 'common:usersName',
    Icon: <Users className={iconClasses} />,
    children: [
      {
        label: 'common:clients',
        path: pathsConfig.app.clients,
      },
      {
        label: 'common:team',
        path: pathsConfig.app.team,
      },
    ],
  },

  {
    label: 'common:servicesName',
    path: pathsConfig.app.services,
    Icon: <SquareCheck className={iconClasses} />,
  },
  // {
  //   label: 'Facturas',
  //   path: pathsConfig.app.invoices,
  //   Icon: <Wallet className={iconClasses} />,
  // },
  {
    label: 'common:settingsName',
    path: pathsConfig.app.personalAccountSettings,
    Icon: <Settings className={iconClasses} />,
  },
  // {
  //   label: 'Facturación',
  //   path: pathsConfig.app.personalAccountBilling,
  //   // Icon: </>
  // }
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

export const personalAccountNavigationConfig = NavigationConfigSchema.parse({
  routes,
  style: process.env.NEXT_PUBLIC_USER_NAVIGATION_STYLE,
});
