import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { PasswordReset } from './components/password-reset';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('auth:passwordResetLabel'),
  };
};

function PasswordResetPage() {
  return (
    <PasswordReset />
  );
}

export default withI18n(PasswordResetPage);
