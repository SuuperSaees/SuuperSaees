import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';
import { Button } from '@kit/ui/button';
import { ArrowRight, BellIcon } from 'lucide-react';
import { Badge } from '@kit/ui/badge';

import { Separator } from '@kit/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { ScrollArea } from "@kit/ui/scroll-area" 

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { Card} from '@kit/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationEllipsis, PaginationNext } from 'node_modules/@kit/ui/src/shadcn/pagination';


export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('account:homePage');
    const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
)
  return {
    title: i18n.t('auth:signIn'),
  };
};

function UserHomePage() {
    const tags = Array.from({ length: 50 }).map(
        (_, i, a) => `v1.2.0-beta.${a.length - i}`
      )
  return (
    <div className='p-[35px]'>

        <div className="flex justify-between items-center mb-5">
            <div className="flex-grow">
                {/* Elemento alineado a la izquierda */}
                <span>
                <div className="text-primary-900 text-[36px] font-inter font-semibold leading-[44px] tracking-[-0.72px]">
                  <Trans i18nKey={'teams:team'} />
                </div>
                </span>
            </div>
            <div className="flex space-x-4">
                {/*  Elementos alineados a la derecha */}
                <span>
                    <Button variant="outline">
                        Tu prueba gratuita termina en xx dias
                    </Button>
                </span>
                <span>
                    <Button variant="outline" size="icon">
                        <BellIcon className="h-4 w-4" />
                    </Button>
                </span>
            </div>
        </div>

        <Card x-chunk="dashboard-05-chunk-3" className='h-[80vh] max-h-full overflow-hidden'>

                    <div className="flex justify-between items-center p-5">
                        <div className="flex space-x-4">
                            {/* Elemento alineado a la izquierda */}
                            <span>
                                <div className="font-semibold text-[18px]">
                                    Miembros del equipo #to-do-i18n
                                </div>
                            </span>
                            <span>
                                <Badge variant='outline' className='rounded-xl bg-brand-50 border-brand-200 text-brand-700'>
                                    100 usuarios #to-do-non-static
                                </Badge>
                            </span>
                        </div>
                        <div className="flex space-x-4">
                            {/*  Elementos alineados a la derecha */}
                            <span>
                                <Button variant="outline" className='bg-brand-600 text-white'>
                                    Agregar miembro #to-do-i18n
                                </Button>
                            </span>
                        </div>
                    
                    </div>

                    <Separator />
                    <div className='h-10 bg-[#F9FAFB] px-5 py-2 flex flex-wrap justify-between text-sm text-[#475467] font-medium'>
                        <h1>Nombre</h1>
                        <h1>Rol</h1>
                        <h1>Organizaciones gestionadas</h1>
                        <h1>Creado en</h1>
                        <div className="invisible">Espacio vacío</div>
                        
                    </div>
                    <Separator />

                    <ScrollArea className="h-[80%] w-full">
                        
                        <div>
                            {tags.map((tag) => (
                            <>
                                
                                <div role="status" className="animate-pulse">
                                    <div className="flex items-center justify-center mt-4">
                                        <svg className="w-8 h-8 text-gray-200 dark:text-gray-700 me-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>
                                        </svg>
                                        <div className="w-24 h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 me-3"></div>
                                        <div className="w-24 h-2 bg-gray-200 rounded-full dark:bg-gray-700 me-3"></div>
                                        <div className="w-24 h-2 bg-gray-200 rounded-full dark:bg-gray-700 me-4"></div>
                                        <div className="w-24 h-2 bg-gray-200 rounded-full dark:bg-gray-700 me-5"></div>
                                    </div>
                                    <span className="sr-only">Loading...</span>
                                </div>

                                <Separator className="my-2" />
                            </>
                            ))}
                        </div>
                    </ScrollArea>
            
        </Card>
        

    </div>
  );
}

export default withI18n(UserHomePage);
