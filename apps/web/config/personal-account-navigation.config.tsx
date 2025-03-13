import {
  Layers,
  CreditCard,
  MessagesSquare,
  Settings,
  SquareCheck,
  Users,
  Sparkles,
  Home,
  Bot,
  Package,
  Box,
  // Wallet,
} from 'lucide-react';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

const iconClasses = 'w-4';

const routes = [
  {
    type: 'route',
    label: 'common:dashboardName',
    path: pathsConfig.app.dashboard,
    Icon: <Home className={iconClasses} />,
    end: true,
  },
  {
    type: 'route',
    label: 'common:messagesName',
    path: pathsConfig.app.messages,
    Icon: <MessagesSquare className={iconClasses} />,
    end: true,
    children: [],
    divider: true,
  },
  {
    type: 'route',
    label: 'common:ordersName',
    path: pathsConfig.app.orders,
    Icon: <Layers className={iconClasses} />,
  },
  {
    type: 'group',
    label: 'common:usersName',
    Icon: <Users className={iconClasses} />,
    collapsed: true,
    children: [
      {
        label: 'common:clientsName',
        path: pathsConfig.app.clients,
      },
      {
        label: 'common:teamName',
        path: pathsConfig.app.team,
      },
    ],
  },
  {
    type: 'group',
    label: 'common:aiToolsName',
    Icon: <Bot className={iconClasses} />,
    collapsed: true,
    children: [
      {
        label: 'common:toolCopyListName',
        path: pathsConfig.app.toolCopyList,
      },
      
    ],
  },
  {
    type: 'group',
    label: 'common:catalogName',
    Icon: <Package className={iconClasses} />,
    collapsed: true,
    children: [
      {
        label: 'common:catalogProviderName',
        path: pathsConfig.app.catalogProvider,
      },
      {
        label: 'common:catalogProductName',
        path: pathsConfig.app.catalogProduct,
      }
    ],
  },

  {
    type: 'route',
    label: 'common:servicesName',
    path: pathsConfig.app.services,
    Icon: <SquareCheck className={iconClasses} />,
  },
  // {
  //   label: 'common:briefsName',
  //   path: pathsConfig.app.briefs,
  //   Icon: <Briefcase className={iconClasses} />,
  // },
  // {
  //   label: 'Facturas',
  //   path: pathsConfig.app.invoices,
  //   Icon: <Wallet className={iconClasses} />,
  // },
  {
    type: 'route',
    label: 'common:pluginsName',
    path: pathsConfig.app.apps,
    Icon: <Sparkles className={iconClasses} />,
  },
  {
    type: 'route',
    label: 'common:settingsName',
    path: pathsConfig.app.personalAccountSettings,
    Icon: <Settings className={iconClasses} />,
  },
  // {
  //   label: 'Facturación',
  //   path: pathsConfig.app.personalAccountBilling,
  //   // Icon: </>
  // }
  {
    type: 'route',
    label: 'common:embedsName',
    path: pathsConfig.app.embeds,
    Icon: <Box className={iconClasses} />,
  },
];

if (featureFlagsConfig.enablePersonalAccountBilling) {
  routes.push({
    type: 'route',
    label: 'common:billingTabLabel',
    path: pathsConfig.app.personalAccountBilling,
    Icon: <CreditCard className={iconClasses} />,
  });
}

export const personalAccountNavigationConfig = NavigationConfigSchema.parse({
  routes,
  style: process.env.NEXT_PUBLIC_USER_NAVIGATION_STYLE,
});
