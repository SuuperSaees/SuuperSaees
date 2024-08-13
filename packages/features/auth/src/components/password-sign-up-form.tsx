// 'use client';

// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';
// import { useTranslation } from 'react-i18next';
// import { Button } from '@kit/ui/button';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@kit/ui/form';
// import { If } from '@kit/ui/if';
// import { Input } from '@kit/ui/input';
// import { Trans } from '@kit/ui/trans';
// import { PasswordSignUpSchema } from '../schemas/password-sign-up.schema';
// import { TermsAndConditionsFormField } from './terms-and-conditions-form-field';
// import { registerUser } from '../server/actions/auth/sign-up/register-user';


// export function PasswordSignUpForm({
//   defaultValues,
//   displayTermsCheckbox,
//   onSubmit,
//   // loading,
// }: {
//   defaultValues?: {
//     email: string;
//   };

//   displayTermsCheckbox?: boolean;

//   onSubmit: (params: {
//     name: string;
//     email: string;
//     password: string;
//     portalName: string;
//   }) => unknown;
//   loading: boolean;
// }) {
//   const { t } = useTranslation();

//   const form = useForm({
//     resolver: zodResolver(PasswordSignUpSchema),
//     defaultValues: {
//       name: '',
//       email: defaultValues?.email ?? '',
//       password: 'defaultPassword123',
//       portalName: '',
//     },
//   });

//   async function onRegister(data: {
//     name: string;
//     email: string;
//     password: string;
//     portalName: string;
//   }) { 
//     await registerUser(data);
//   }

//   return (
//     <Form {...form}>
//       <form
//         className={'w-full space-y-2.5'}
//         onSubmit={form.handleSubmit(onSubmit)}
//       >
//         <FormField
//           control={form.control}
//           name={'name'}
//           render={({ field }) => (
//             <FormItem  className='text-start'>
//               <FormLabel>
//                 <Trans i18nKey={'common:nameInput'} />
//               </FormLabel>

//               <FormControl>
//                 <Input
//                   required
//                   type="string"
//                   placeholder={t('namePlaceholder')}
//                   {...field}
//                 />
//               </FormControl>

//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name={'email'}
//           render={({ field }) => (
//             <FormItem  className='text-start'>
//               <FormLabel>
//                 <Trans i18nKey={'common:emailAddress'} />
//               </FormLabel>

//               <FormControl>
//                 <Input
//                   data-test={'email-input'}
//                   required
//                   type="email"
//                   placeholder={t('emailPlaceholder')}
//                   {...field}
//                 />
//               </FormControl>

//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name={'portalName'}
//           render={({ field }) => (
//             <FormItem  className='text-start'>
//               <FormLabel>
//                 <Trans i18nKey={'common:namePortalInput'} />
//               </FormLabel>

//               <FormControl>
//                 <Input
//                   required
//                   type="string"
//                   placeholder={t('namePortalPlaceholder')}
//                   {...field}
//                 />
//               </FormControl>

//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         <FormField
//           control={form.control}
//           name={'password'}
//           render={({ field }) => (
//             <FormItem className='text-start'>
//               {/* <FormLabel>
//                 <Trans i18nKey={'common:password'} />
//               </FormLabel> */}
//               <FormControl>
//                 <Input
//                   className={'hidden'}
//                   required
//                   data-test={'password-input'}
//                   type="password"
//                   placeholder={''}
//                   {...field}
//                 />
//               </FormControl>

//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <If condition={displayTermsCheckbox}>
//           <TermsAndConditionsFormField />
//         </If>
//         {/* <Button
//           data-test={'auth-submit-button'}
//           className={'w-full bg-brand-600 hover:bg-brand-700'}
//           type="submit"
//           disabled={loading}
//         >
//           <If
//             condition={loading}
//             fallback={
//               <>
//                 <Trans i18nKey={'auth:signUpWithEmail'} />
//               </>
//             }
//           >
//             <Trans i18nKey={'auth:signingUp'} />
//           </If>
//         </Button> */}
//         <Button 
//         onClick= {() => onRegister(form.getValues())}
//         type='button'>
//           <Trans i18nKey={'auth:signingUp'} />
//         </Button>
//       </form>
//     </Form>
//   );
// }
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { If } from '@kit/ui/if';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import { PasswordSignUpSchema } from '../schemas/password-sign-up.schema';
import { TermsAndConditionsFormField } from './terms-and-conditions-form-field';

export function PasswordSignUpForm({
  defaultValues,
  displayTermsCheckbox,
  onSubmit,
  loading,
}: {
  defaultValues?: {
    email: string;
  };

  displayTermsCheckbox?: boolean;

  onSubmit: (params: {
    email: string;
    password: string;
    repeatPassword: string;
  }) => unknown;
  loading: boolean;
}) {
  const { t } = useTranslation();

  const form = useForm({
    resolver: zodResolver(PasswordSignUpSchema),
    defaultValues: {
      email: defaultValues?.email ?? '',
      password: '',
      repeatPassword: '',
    },
  });

  return (
    <Form {...form}>
      <form
        className={'w-full space-y-2.5'}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name={'email'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey={'common:emailAddress'} />
              </FormLabel>

              <FormControl>
                <Input
                  data-test={'email-input'}
                  required
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'password'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey={'common:password'} />
              </FormLabel>

              <FormControl>
                <Input
                  required
                  data-test={'password-input'}
                  type="password"
                  placeholder={''}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'repeatPassword'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey={'auth:repeatPassword'} />
              </FormLabel>

              <FormControl>
                <Input
                  required
                  data-test={'repeat-password-input'}
                  type="password"
                  placeholder={''}
                  {...field}
                />
              </FormControl>

              <FormMessage />

              <FormDescription className={'pb-2 text-xs'}>
                <Trans i18nKey={'auth:repeatPasswordHint'} />
              </FormDescription>
            </FormItem>
          )}
        />

        <If condition={displayTermsCheckbox}>
          <TermsAndConditionsFormField />
        </If>

        <Button
          data-test={'auth-submit-button'}
          className={'w-full'}
          type="submit"
          disabled={loading}
        >
          <If
            condition={loading}
            fallback={
              <>
                <Trans i18nKey={'auth:signUpWithEmail'} />

                <ArrowRight
                  className={
                    'zoom-in animate-in slide-in-from-left-2 fill-mode-both h-4 delay-500 duration-500'
                  }
                />
              </>
            }
          >
            <Trans i18nKey={'auth:signingUp'} />
          </If>
        </Button>
      </form>
    </Form>
  );
}
