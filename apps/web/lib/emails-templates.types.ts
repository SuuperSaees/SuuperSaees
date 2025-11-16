import enEmails from '../public/locales/en/emails.json';

export namespace EmailsTemplates {
  export type EmailTypes = keyof typeof enEmails;
  export type TranslationKeys<T extends EmailTypes> =
    keyof (typeof enEmails)[T];
  export type contactFormSubmision = TranslationKeys<'contactFormSubmission'>;
  export type orderCompleted = TranslationKeys<'orderCompleted'>;
  export type orderCreation = TranslationKeys<'orderCreation'>;
  export type orderMessage = TranslationKeys<'orderMessage'>;
  export type orderStatusPriority = TranslationKeys<'orderStatusPriority'>;
  export type inviteEmail = TranslationKeys<'inviteEmail'>;
}
