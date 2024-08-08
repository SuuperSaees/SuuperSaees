// 'use client';

// import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel} from '@kit/ui/alert-dialog'; 
// import { createService } from './create-service-server';
// import { Button } from '@kit/ui/button';
// import { z } from "zod"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
//   } from "@kit/ui/form"
// import { Input } from "@kit/ui/input"
// import { Separator } from '@kit/ui/separator';
// import { useTranslation } from 'react-i18next';

// const formSchema = z.object({
//     name: z.string().min(2).max(50),
//     price: z.string().min(2).max(15)
// })

// type CreateServicesProps = {
//     propietary_organization_id: string;
// }


// const CreateServiceDialog = ( { propietary_organization_id }: CreateServicesProps ) => {
//     const { t } = useTranslation('services');
//     const form = useForm<z.infer<typeof formSchema>>({
//         resolver: zodResolver(formSchema),
//         defaultValues: {
//             name: "",
//             price: "",
//         },
//       })
     
//       async function onSubmit(values: z.infer<typeof formSchema>) {
//         const priceAsNumber = parseFloat(values.price.toString());
//         await createService({
//             ...values,
//             price: priceAsNumber,
//             propietary_organization_id
//         })
//         window.location.reload();
//       }
      

//   return (
//     <>
//       <AlertDialog>
//         <AlertDialogTrigger asChild>
//         <Button>
//           {t("createService")}
//         </Button>
//         </AlertDialogTrigger>
//         <AlertDialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
//           <div className='flex justify-between w-full items-center'>
//           <AlertDialogHeader>
//               <AlertDialogTitle>
//                 {t("createService")} 
//               </AlertDialogTitle>
//           </AlertDialogHeader>
//           <AlertDialogCancel className="text-red-500 hover:text-red-700 font-bold">X</AlertDialogCancel>
//           </div>
//           <AlertDialogDescription>
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                     <FormField
//                     control={form.control}
//                     name="name"
//                     render={({ field }) => (
//                         <FormItem>
//                         <FormLabel>{t("serviceName")}</FormLabel>
//                         <FormControl>
//                             <Input placeholder={t("serviceNameLabel")} {...field} />
//                         </FormControl>
//                         <FormMessage />
//                         </FormItem>
//                     )}
//                     />
//                     <FormField
//                     control={form.control}
//                     name="price"
//                     render={({ field }) => (
//                         <FormItem>
//                         <FormLabel>{t("servicePrice")}</FormLabel>
//                         <FormControl>
//                             <Input placeholder={t("servicepriceLabel")} {...field} />
//                         </FormControl>
//                         <FormMessage />
//                         </FormItem>
//                     )}
//                     />
//                     <Separator/>
//                     <Button type="submit" className='w-full '>{t("createService")}</Button>
//                 </form>
//             </Form>
//           </AlertDialogDescription>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// };

// export default CreateServiceDialog;
