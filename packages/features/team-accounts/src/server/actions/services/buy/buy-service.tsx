'use server';

// import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
// import { getPrimaryOwnerId } from '../../members/get/get-member-account';

export const buyService = async (
    formValues: { 
        fullName: string; 
        email: string; 
        address: string; 
        city: string; 
        country:string;
        state_province_region: string;
        postal_code: string;
        buying_for_organization: boolean;
        enterprise_name: string;
        tax_code: string;
        discount_coupon: string;
    }) => {
    try {
      // Imprimir los valores en la consola
      // console.log('Valores del formulario:', formValues);
    } catch (error) {
      console.error('Error al crear el servicio:', error);
      throw error;
    }
};