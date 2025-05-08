import { withI18n } from '~/lib/i18n/with-i18n';

function UserSettingsLayout(props: React.PropsWithChildren) {
  return (
    <>
      {props.children}
    </>
  );
}

export default withI18n(UserSettingsLayout);
