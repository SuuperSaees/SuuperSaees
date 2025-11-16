import { // Briefcase,
CreditCard, Layers, Settings, Users, Home, Package, Bot,
Inbox,
Store, 
// Wallet,
GraduationCap,
Handshake,
Calendar,
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
    path: pathsConfig.app.catalog,
    collapsible: true,
    collapsed: true,
    children: [
      {
        type: 'route',
        label: 'common:catalogProductName',
        path: pathsConfig.app.catalogProduct,
        collapsible: true,
        collapsed: true,
        // Icon: <Package className={'text-transparent'} />,
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
  
  // {
  //   label: 'Servicios',
  //   path: pathsConfig.app.services,
  //   Icon: <SquareCheck className={iconClasses} />,
  // },
  // {
  //   type: 'route',
  //   label: 'common:invoicesName',
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