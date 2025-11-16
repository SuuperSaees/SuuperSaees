import { // Briefcase,
  CreditCard, // Home,
  Layers, Settings, // SquareCheck,
  Users, // Wallet,
  FolderClosed,
  MessagesSquare,
  Home,
  Package,
  Bot,
  Handshake,
  GraduationCap,
  Calendar,
  Wallet,
  LayoutGrid,
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
  // {
  //   label: 'common:messagesName',
  //   path: pathsConfig.app.messages,
  //   Icon: <MessagesSquare className={iconClasses} />,
  //   end: true,
  //   children: [],
  //   divider: true,
  // },
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
  {
    type: 'route',
    label: 'common:servicesName',
    path: pathsConfig.app.servicesCatalog,
    end: true,
    Icon: <LayoutGrid className={iconClasses} />,
  },
  

  {
    type: 'route',
    label: 'common:invoicesName',
    path: pathsConfig.app.invoices,
    Icon: <Wallet className={iconClasses} />,
  },
  {
    type: 'route',
    label: 'common:organizationName',
    path: pathsConfig.app.organization,
    Icon: <Users className={iconClasses} />,
  },
  
  {
    type: 'route',
    label: 'common:storage',
    path: pathsConfig.app.storage,
    Icon: (
      // <img
      //   src="https://ygxrahspvgyntzimoelc.supabase.co/storage/v1/object/public/account_image/cloud-01.svg?t=2024-09-28T19%3A16%3A08.869Z"
      //   className={iconClasses}
      //   alt="Cloud Icon"
      // />
      <FolderClosed className={iconClasses} />
    ),
  },

  {
    type: 'route',
    label: 'common:settingsName',
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
    type: 'route',
    label: 'common:billingTabLabel',
    path: pathsConfig.app.personalAccountBilling,
    Icon: <CreditCard className={iconClasses} />,
  });
}

export const clientAccountNavigationConfig = NavigationConfigSchema.parse({
  routes,
  style: process.env.NEXT_PUBLIC_USER_NAVIGATION_STYLE,
});

export const clientAccountGuestNavigationConfig = NavigationConfigSchema.parse({
  routes: [],
  style: process.env.NEXT_PUBLIC_USER_NAVIGATION_STYLE,
});