import { PageBody } from '@kit/ui/page';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Trans } from '@kit/ui/trans';
import { UpdatePasswordFormContainer } from '../../../../packages/features/accounts/src/components/personal-account-settings/password/update-password-container';
import { getDomainByUserId } from '../../../../packages/multitenancy/utils/get/get-domain';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export default async function UserDataPage() {
  const supabase = getSupabaseServerComponentClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError.message;
  const { domain: baseUrl } = await getDomainByUserId(userData?.user.id, true);

  return (
      <div className="w-full h-full">
        {/* Left column - Image */}
          <img
            src="/images/oauth/dataBackground.jpg" // Replace with your image path
            alt="Description"
            className="max-w-1/2 h-auto rounded-lg shadow-lg"
          />

        {/* Right column - Form */}
        <div className="flex flex-col">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Please fill in your details</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="field1" className="text-sm font-medium">Field 1</label>
                  <input
                    id="field1"
                    type="text"
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="field2" className="text-sm font-medium">Field 2</label>
                  <input
                    id="field2"
                    type="text"
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="field3" className="text-sm font-medium">Field 3</label>
                  <input
                    id="field3"
                    type="text"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}



