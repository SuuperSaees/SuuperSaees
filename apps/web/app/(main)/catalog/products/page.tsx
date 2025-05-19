'use client'

import { redirect } from 'next/navigation';
import pathsConfig from '~/config/paths.config';
import { useOrganizationSettings } from 'node_modules/@kit/accounts/src/context/organization-settings-context';

export default function CatalogProductsPage() {
  const { catalog_product_url} = useOrganizationSettings()

  if (!catalog_product_url) {
    return redirect(pathsConfig.app.orders);
  }

  return (
      <div className="flex h-full border-t">
        <iframe src={catalog_product_url} className="w-full h-full" />
      </div>
  );
}
