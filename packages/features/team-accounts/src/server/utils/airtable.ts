import Airtable from 'airtable';

const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.NEXT_PUBLIC_AIRTABLE_TABLE_NAME;

export async function addUserToAirtable({
  name,
  email,
  phoneNumber,
  organizationName,
}: {
  name?: string;
  email: string;
  phoneNumber?: string;
  organizationName: string;
}) {

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
    console.error('Missing Airtable configuration');
    return;
  }

  const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

  try {
    await base('Onboarding_Process').create([
      {
        fields: {
          'Customer Name': name ?? email.split('@')[0],
          'Customer Email': email,
          'WhatsApp Number': phoneNumber ?? '',
          'Company Name': organizationName,
        },
      },
    ]);
  } catch (error) {
    // Mejor manejo del error
    if (error instanceof Error) {
        console.error('Error de Airtable:', {
          mensaje: error.message,
          tipo: error.name,
          detalles: error
        });
      }
      throw new Error('Error al agregar usuario a Airtable: ' + error);
  }
}