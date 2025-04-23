import { // Briefcase,
CreditCard, Layers, Settings, Users, Home, Package, Bot,
Inbox,
Store, // Wallet,
} from 'lucide-react';



import { NavigationConfigSchema } from '@kit/ui/navigation-schema';



import featureFlagsConfig from './feature-flags.config';
import pathsConfig from './paths.config';


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
    type: 'route',
    label: 'common:clientsName',
    path: pathsConfig.app.clients,
    Icon: <Store className={iconClasses} />,
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
    label: 'common:teamName',
    path: pathsConfig.app.team,
    Icon: <Users className={iconClasses} />,
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

  // {
  //   label: 'Servicios',
  //   path: pathsConfig.app.services,
  //   Icon: <SquareCheck className={iconClasses} />,
  // },
  // {
  //   label: 'Facturas',
  //   path: pathsConfig.app.invoices,
  //   Icon: <Wallet className={iconClasses} />,
  // },
  {
    type: 'route',
    label: 'common:settingsName',
    path: pathsConfig.app.personalAccountSettings,
    Icon: <Settings className={iconClasses} />,
  }
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
    type: 'route',
    label: 'common:billingTabLabel',
    path: pathsConfig.app.personalAccountBilling,
    Icon: <CreditCard className={iconClasses} />,
  });
}

export const teamMemberAccountNavigationConfig = NavigationConfigSchema.parse({
  routes,
  style: process.env.NEXT_PUBLIC_USER_NAVIGATION_STYLE,
});