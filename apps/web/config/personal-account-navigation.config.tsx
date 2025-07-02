import {
  Layers,
  CreditCard,
  Settings,
  Users,
  Home,
  Bot,
  Package,
  ShoppingBag,
  Wallet,
  ShoppingCart,
  Inbox,
  CopyCheck,
  GraduationCap,
  Handshake,
  Calendar,
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
    Icon: <Inbox className={iconClasses} />,
    end: true,
  },
  {
    type: 'route',
    label: 'common:trainingName',
    path: pathsConfig.app.training,
    Icon: <GraduationCap className={iconClasses} />,
    end: true,
  },
  {
    type: 'route',
    label: 'common:ordersName',
    path: pathsConfig.app.orders,
    Icon: <Layers className={iconClasses} />,
  },
  {
    type: 'group',
    label: 'common:catalogName',
    Icon: <Package className={iconClasses} />,
    collapsible: true,
    collapsed: true,
    children: [
      {
        type: 'route',
        label: 'common:catalogProductName',
        collapsible: true,
        collapsed: true,
        // Icon: <Package className={'text-transparent'} />,
        path: pathsConfig.app.catalogProduct,
        // children: [
        //   // {
        //   //   label: 'common:catalogWholesaleName',
        //   //   path: pathsConfig.app.catalogWholesale,
        //   // },
        //   // {
        //   //   label: 'common:catalogPrivateLabelName',
        //   //   path: pathsConfig.app.catalogPrivateLabel,
        //   // },
        // ],
      },
      {
        type: 'route',
        label: 'common:catalogProviderName',
        path: pathsConfig.app.catalogProvider,
        collapsible: true,
        collapsed: true,
      },
      {
        type: 'route',
        label: 'common:catalogSourcingChinaName',
        path: pathsConfig.app.catalogSourcingChina,
        collapsible: true,
        collapsed: true,
      }
    ],
  },
  {
    type: 'route',
    label: 'common:calendarName',
    path: pathsConfig.app.calendar,
    Icon: <Calendar className={iconClasses} />,
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
    type: 'route',
    label: 'common:partnersName',
    path: pathsConfig.app.partners,
    Icon: <Handshake className={iconClasses} />,
  },
  {
    type: 'route',
    label: 'common:clientsName',
    path: pathsConfig.app.clients,
    Icon: <ShoppingCart className={iconClasses} />,
  },
  {
    type: 'route',
    label: 'common:teamName',
    path: pathsConfig.app.team,
    Icon: <Users className={iconClasses} />,
  },
  // {
  //   type: 'group',
  //   label: 'common:usersName',
  //   Icon: <Users className={iconClasses} />,
  //   collapsed: true,
  //   children: [
  //     {
  //       label: 'common:clientsName',
  //       path: pathsConfig.app.clients,
  //     },
  //     {
  //       label: 'common:teamName',
  //       path: pathsConfig.app.team,
  //     },
  //   ],
  // },
  {
    type: 'route',
    label: 'common:servicesName',
    path: pathsConfig.app.services,
    Icon: <Wallet className={iconClasses} />,
  },
  {
    type: 'route',
    label: 'common:briefsName',
    path: pathsConfig.app.briefs,
    Icon: <CopyCheck className={iconClasses} />,
  },
  
 

  {
    type: 'route',
    label: 'common:invoicesName',
    path: pathsConfig.app.invoices,
    Icon: <Wallet className={iconClasses} />,
  },
  {
    type: 'route',
    label: 'common:pluginsName',
    path: pathsConfig.app.apps,
    Icon: <ShoppingBag className={iconClasses} />,
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
