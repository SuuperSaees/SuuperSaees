export enum ErrorClientOperations {
    CLIENT_NOT_FOUND = 'clientNotFound',
    CLIENT_ALREADY_EXISTS = 'clientAlreadyExists',
    INSUFFICIENT_PERMISSIONS = 'insufficientPermissions',
    AGENCY_NOT_FOUND = 'agencyNotFound',
  }
  
  export enum ErrorUserOperations {
    USER_NOT_FOUND = 'userNotFound',
    USER_ALREADY_EXISTS = 'userAlreadyExists',
    FAILED_TO_CREATE_USER = 'failedToCreateUser',
  }
  
  export enum ErrorOrganizationOperations {
    ORGANIZATION_NOT_FOUND = 'organizationNotFound',
    ORGANIZATION_ALREADY_EXISTS = 'organizationAlreadyExists',
  }