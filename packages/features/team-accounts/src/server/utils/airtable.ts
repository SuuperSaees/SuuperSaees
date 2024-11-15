import Airtable from 'airtable';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;
const IS_PROD = process.env.NEXT_PUBLIC_IS_PROD === 'true';

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
  if (!IS_PROD) {
    console.log('Skipping Airtable update - not in production environment');
    return;
  }

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
    console.error('Missing Airtable configuration');
    return;
  }

  const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

  try {
    await base(AIRTABLE_TABLE_NAME).create([
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
    if (error instanceof Error) {
        console.error('Error de Airtable:', {
          mensaje: error.message,
          tipo: error.name,
          detalles: error
        });
      }
      throw new Error('Error to add user to Airtable: ' + error);
  }
}