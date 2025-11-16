export enum ErrorClientOperations {
  CLIENT_NOT_FOUND = 'clientNotFound',
  CLIENT_ALREADY_EXISTS = 'clientAlreadyExists',
  INSUFFICIENT_PERMISSIONS = 'insufficientPermissions',
  AGENCY_NOT_FOUND = 'agencyNotFound',
  CLIENT_DELETED = 'clientDeleted',
}

export enum ErrorUserOperations {
  USER_NOT_FOUND = 'userNotFound',
  USER_ALREADY_EXISTS = 'userAlreadyExists',
  FAILED_TO_CREATE_USER = 'failedToCreateUser',
  FAILED_TO_DELETE_USER = 'failedToDeleteUser',
  FAILED_TO_UPDATE_USER = 'failedToUpdateUser',
  FAILED_TO_DELETE_USERS = 'failedToDeleteUsers',
  USER_DELETED = 'userDeleted',
}

export enum ErrorOrganizationOperations {
  ORGANIZATION_NOT_FOUND = 'organizationNotFound',
  ORGANIZATION_ALREADY_EXISTS = 'organizationAlreadyExists',
  FAILED_TO_UPDATE_ORGANIZATION = 'failedToUpdateOrganization',
  ORGANIZATION_UPDATED = 'organizationUpdated',
  ORGANIZATION_NAME_UPDATED = 'organizationNameUpdated',
  FAILED_TO_ASSOCIATE_ROLE = 'failedToAssociateRole',
  FAILED_TO_UPDATE_ORGANIZATION_SETTINGS_COLOR = 'failedToUpdateOrganizationSettingsColor',
  FAILED_TO_GET_ORGANIZATION_SETTINGS = 'failedToGetOrganizationSettings',
  FAILED_TO_UPDATE_ORGANIZATION_SETTING = 'failedToUpdateOrganizationSetting',
  FAILED_TO_CREATE_ORGANIZATION_SETTING = 'failedToCreateOrganizationSetting',
  ORGANIZATION_NOT_FOUND_OR_NOT_ACCESSIBLE = 'organizationNotFoundOrNotAccessible',
}

export enum ErrorOrderOperations {
  ORDER_NOT_FOUND = 'orderNotFound',
  ORDER_ALREADY_EXISTS = 'orderAlreadyExists',
  FAILED_TO_REMOVE_FOLLOWER = 'failedToRemoveFollower',
  FAILED_TO_REMOVE_FOLLOWERS = 'failedToRemoveFollowers',
  FAILED_TO_CREATE_ORDER = 'failedToCreateOrder',
  INSUFFICIENT_PERMISSIONS = 'insufficientPermissions',
  FAILED_TO_INSERT_FILES = 'failedToInsertFiles',
  FAILED_TO_ADD_ASSIGNEES = 'failedToAddAssignees',
  FAILED_TO_ADD_FOLLOWERS = 'failedToAddFollowers',
  FAILED_TO_DELETE_ORDER = 'failedToDeleteOrder',
  FAILED_TO_UPDATE_ORDER_STATUS = 'failedToUpdateOrderStatus',
  FAILED_TO_GET_ORDER = 'failedToGetOrder',
  FAILED_TO_LIST_ORDERS = 'failedToListOrders',
}

export enum ErrorServiceOperations {
  INSUFFICIENT_PERMISSIONS = 'insufficientPermissions',
  SERVICE_NOT_FOUND = 'serviceNotFound',
  SERVICE_ALREADY_EXISTS = 'serviceAlreadyExists',
  FAILED_TO_CANCEL_SERVICE = 'failedToCancelService',
  SERVICE_CANCELLED = 'serviceCancelled',
  FAILED_TO_ADD_SERVICE = 'failedToAddService',
  FAILED_TO_CREATE_SERVICE = 'failedToCreateService',
  FAILED_TO_DELETE_SERVICE = 'failedToDeleteService',
  FAILED_TO_DELETE_SERVICE_FROM_STRIPE = 'failedToDeleteServiceFromStripe',
  FAILED_TO_FIND_STRIPE_ACCOUNT = 'failedToFindStripeAccount',
}

export enum ErrorBriefOperations {
  BRIEF_NOT_FOUND = 'briefNotFound',
  BRIEF_ALREADY_EXISTS = 'briefAlreadyExists',
  FAILED_TO_CREATE_BRIEF = 'failedToCreateBrief',
  FAILED_TO_UPDATE_BRIEF = 'failedToUpdateBrief',
  FAILED_TO_DELETE_BRIEF = 'failedToDeleteBrief',
  BRIEF_UPDATED = 'briefUpdated',
  BRIEF_DELETED = 'briefDeleted',
  FAILED_TO_CONNECT_SERVICE = 'failedToConnectService',
  FAILED_TO_UPDATE_FIELDS = 'failedToUpdateFields',
  FAILED_TO_DELETE_FORM_FIELDS = 'failedToDeleteFormFields',
  FAILED_TO_CREATE_BRIEF_RESPONSES = 'failedToCreateBriefResponses',
  FAILED_TO_GET_FORM_FIELDS = 'failedToGetFormFields',
  FAILED_TO_CREATE_FORM_FIELDS = 'failedToCreateFormFields',
}

export enum ErrorReviewOperations {
  REVIEW_NOT_FOUND = 'reviewNotFound',
  REVIEW_ALREADY_EXISTS = 'reviewAlreadyExists',
  FAILED_TO_CREATE_REVIEW = 'failedToCreateReview',
  FAILED_TO_UPDATE_REVIEW = 'failedToUpdateReview',
  FAILED_TO_DELETE_REVIEW = 'failedToDeleteReview',
  FAILED_TO_GET_REVIEWS = 'failedToGetReviews',
  FAILED_TO_GET_REVIEW = 'failedToGetReview',
}

export enum ErrorTimerOperations {
  TIMER_NOT_FOUND = 'timerNotFound',
  TIMER_ALREADY_EXISTS = 'timerAlreadyExists',
  FAILED_TO_CREATE_TIMER = 'failedToCreateTimer',
  FAILED_TO_UPDATE_TIMER = 'failedToUpdateTimer',
  FAILED_TO_DELETE_TIMER = 'failedToDeleteTimer',
  FAILED_TO_START_TIMER = 'failedToStartTimer',
  FAILED_TO_STOP_TIMER = 'failedToStopTimer',
  FAILED_TO_PAUSE_TIMER = 'failedToPauseTimer',
  FAILED_TO_RESUME_TIMER = 'failedToResumeTimer',
  TIMER_ALREADY_RUNNING = 'timerAlreadyRunning',
  INSUFFICIENT_PERMISSIONS = 'insufficientPermissions',
  TIMER_CREATED = 'timerCreated',
  FAILED_TO_GET_TIMERS = 'failedToGetTimers',
}

export enum ErrorBillingOperations {
  FAILED_TO_FIND_STRIPE_ACCOUNT = 'failedToFindStripeAccount',
  FAILED_TO_CREATE_STRIPE_ACCOUNT = 'failedToCreateStripeAccount',
  FAILED_TO_CREATE_TRELI_ACCOUNT = 'failedToCreateTreliAccount',
  FAILED_TO_DELETE_STRIPE_ACCOUNT = 'failedToDeleteStripeAccount',
  FAILED_TO_DELETE_TRELI_ACCOUNT = 'failedToDeleteTreliAccount',
  FAILED_TO_CREATE_STRIPE_SERVICE = 'failedToCreateStripeService',
  FAILED_TO_CREATE_SERVICE = 'failedToCreateService',
  FAILED_TO_DELETE_SERVICE = 'failedToDeleteService',
}

export enum ErrorAnnotationOperations {
  ANNOTATION_NOT_FOUND = 'annotationNotFound',
  FAILED_TO_FIND_ANNOTATION = 'failedToFindAnnotation',
  FAILED_TO_CREATE_ANNOTATION = 'failedToCreateAnnotation',
  FAILED_TO_UPDATE_ANNOTATION = 'failedToUpdateAnnotation',
  FAILED_TO_DELETE_ANNOTATION = 'failedToDeleteAnnotation',
  FAILED_TO_LIST_ANNOTATIONS = 'failedToListAnnotations',

  MESSAGE_NOT_FOUND = 'messageNotFound',
  FAILED_TO_FIND_MESSAGES = 'failedToFindMessages',
  FAILED_TO_LIST_MESSAGES = 'failedToListMessages',
  FAILED_TO_ADD_MESSAGE = 'failedToAddMessage',
}

export enum ErrorPluginOperations {
  PLUGIN_NOT_FOUND = 'pluginNotFound',
  PLUGIN_ALREADY_EXISTS = 'pluginAlreadyExists',
  FAILED_TO_CREATE_PLUGIN = 'failedToCreatePlugin',
  FAILED_TO_UPDATE_PLUGIN = 'failedToUpdatePlugin',
  FAILED_TO_DELETE_PLUGIN = 'failedToDeletePlugin',
  PLUGIN_DELETED = 'pluginDeleted',
  PLUGIN_UPDATED = 'pluginUpdated',
  FAILED_TO_FETCH_PLUGIN = 'failedToFetchPlugin',
}

export enum ErrorChatOperations {
  CHAT_NOT_FOUND = 'chatNotFound',
  CHAT_ALREADY_EXISTS = 'chatAlreadyExists',
  FAILED_TO_CREATE_CHAT = 'failedToCreateChat',
  FAILED_TO_UPDATE_CHAT = 'failedToUpdateChat',
  FAILED_TO_DELETE_CHAT = 'failedToDeleteChat',
  CHAT_DELETED = 'chatDeleted',
  FAILED_TO_ADD_MEMBERS = 'failedToAddMembers',
  FAILED_TO_REMOVE_MEMBERS = 'failedToRemoveMembers',
  INSUFFICIENT_PERMISSIONS = 'insufficientPermissions',
  FAILED_TO_GET_MESSAGES = 'failedToGetMessages',
  FAILED_TO_GET_MEMBER_SETTINGS = 'failedToGetMemberSettings',
}

export enum ErrorBriefOperations {
  FAILED_TO_LIST_BRIEFS = 'failedToListBriefs',
  BRIEF_NOT_FOUND_API = 'briefNotFound',
} 