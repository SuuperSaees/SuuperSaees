import { Database } from '~/lib/database.types';

import { CreateServiceDTO, UpdateServiceDTO } from '../dtos/service.dto';

export class ServiceBuilder {
  private serviceInsert: Database['public']['Tables']['services']['Insert'] & {
    provider: string;
  } = {
    name: '',
    standard: false,
    provider: '',
  };

  setName(name: string) {
    this.serviceInsert.name = name;
    return this;
  }

  setStandard(standard: boolean) {
    this.serviceInsert.standard = standard;
    return this;
  }

  setProvider(provider: string) {
    this.serviceInsert.provider = provider;
    return this;
  }

  setOrganizationId(organizationId: string) {
    this.serviceInsert.propietary_organization_id = organizationId;
    return this;
  }

  setDescription(description: string) {
    this.serviceInsert.service_description = description;
    return this;
  }

  setPrice(price: number) {
    this.serviceInsert.price = price;
    return this;
  }

  build(): Database['public']['Tables']['services']['Insert'] {
    return {
      ...this.serviceInsert,
      created_at: new Date().toISOString(),
    };
  }

  static fromDTO(
    dto: CreateServiceDTO | UpdateServiceDTO,
  ): Database['public']['Tables']['services']['Insert'] & {
    provider: string;
  } {
    const builder = new ServiceBuilder();
    return {
      ...builder
        .setName(dto.name ?? '')
        .setStandard(dto.standard ?? false)
        .setOrganizationId(dto.organizationId ?? '')
        .build(),
      provider: dto.provider ?? 'suuper', // this function will be modified to return the provider
    };
  }
}
