import Airtable from 'airtable';
import { CustomError, CustomResponse } from '@kit/shared/response';
import { HttpStatus } from '../../../../../shared/src/response/http-status';

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
  try {
    // Check Airtable config
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        'Missing Airtable configuration',
        'missingAirtableConfig'
      );
    }

    const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

    const fields = {
      'Customer Name': name ?? email.split('@')[0],
      'Customer Email': email,
      'WhatsApp Number': phoneNumber ?? '',
      'Company Name': organizationName,
    };

    await base(AIRTABLE_TABLE_NAME).create([
      {
        fields,
      },
    ]);

    return CustomResponse.success(
      {
        email,
        organizationName,
      },
      'userAddedToAirtable'
    ).toJSON();

  } catch (error) {
    if (error instanceof Error) {
      console.error('Airtable Error:', {
        message: error.message,
        type: error.name,
        stack: error.stack,
        details: error
      });
    } else {
      console.error('Non-Error object thrown:', error);
    }
    return CustomResponse.error(error, 'failedToAddUserToAirtable').toJSON();
  }
}