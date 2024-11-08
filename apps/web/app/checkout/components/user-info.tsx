import { UseFormReturn } from "react-hook-form";
import { FormData } from "../types/billing-form-types";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@kit/ui/form";
import { Input } from "@kit/ui/input";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Switch } from "@kit/ui/switch";
import { Label } from "@kit/ui/label";

interface UserDataFieldsProps {
    form: UseFormReturn<FormData>;
}

export const UserInfo: React.FC<UserDataFieldsProps> = ({ form }) => {
    const [isBuyingForOrganization, setIsBuyingForOrganization] = useState(false);
    const { t } = useTranslation('services');
    return(
      <div>
        <div className="text-gray-900 font-inter text-base font-semibold leading-[2.375]">{t('checkout.personalDetails')}</div>
         <div className="mt-1 mb-10 flex items-center gap-4">
                <FormField
                  name="fullName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-sm font-medium leading-[20px] text-gray-700">
                        {t('checkout.full_name')}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-sm font-medium leading-[20px] text-gray-700">
                        {t('checkout.email')}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="text-gray-900 font-inter text-base font-semibold leading-[2.375]">{t('checkout.billingAddress')}</div>
              <div className="mt-1 flex items-center gap-4">
                <FormField
                  name="address"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-sm font-medium leading-[20px] text-gray-700">
                        {t('checkout.address')}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="city"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-sm font-medium leading-[20px] text-gray-700">
                        {t('checkout.city')}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-4 flex items-center gap-4">
                <FormField
                  name="country"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-sm font-medium leading-[20px] text-gray-700">
                        {t('checkout.country')}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="state_province_region"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-sm font-medium leading-[20px] text-gray-700">
                        {t('checkout.state_province')}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="postal_code"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-sm font-medium leading-[20px] text-gray-700">
                        {t('checkout.postal_code')}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mb-4">
                <FormField
                  name="buying_for_organization"
                  render={({ field }) => (
                    <div className="mb-4 mt-4 flex items-center space-x-2">
                      <FormControl>
                        <Switch
                          id="buying_for_organization"
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            setIsBuyingForOrganization(checked);
                          }}
                        />
                      </FormControl>
                      <Label htmlFor="buying_for_organization">
                        {t('checkout.buying_for_organization')}
                      </Label>
                    </div>
                  )}
                />
              </div>
              {isBuyingForOrganization && (
                <>
                  <div className="mt-4 flex items-center gap-4">
                    <FormField
                      name="enterprise_name"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel className="text-sm font-medium leading-[20px] text-gray-700">
                            {t('checkout.enterprise_name')}
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="tax_code"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel className="text-sm font-medium leading-[20px] text-gray-700">
                            {t('checkout.tax_code')}
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}
      </div>
    )
}