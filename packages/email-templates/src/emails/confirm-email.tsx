import {
  Body,
  Head,
  Html,
  Preview,
  Tailwind,
  Text,
  render,
} from '@react-email/components';

import { BodyStyle } from '../components/body-style';
import { EmailContent } from '../components/content';
import { EmailFooter } from '../components/footer';
import { EmailHeader } from '../components/header';
import { EmailHeading } from '../components/heading';
import { EmailWrapper } from '../components/wrapper';
import { initializeEmailI18n } from '../lib/i18n';

interface Props {
  userDisplayName: string;
  confirmationLink: string;
  language?: string;
}

export async function renderEmailConfirmation(props: Props) {
  const namespace = 'email-confirmation';

  const { t } = await initializeEmailI18n({
    language: props.language,
    namespace,
  });

  const previewText = t(`${namespace}:previewText`);

  const subject = t(`${namespace}:subject`);

  const html = render(
    <Html>
      <Head>
        <BodyStyle />
      </Head>

      <Preview>{previewText}</Preview>

      <Tailwind>
        <Body>
          <EmailWrapper>
            <EmailHeader>
              <EmailHeading>{t(`${namespace}:heading`)}</EmailHeading>
            </EmailHeader>

            <EmailContent>
              <Text className="text-[14px] leading-[24px] text-black">
                {t(`${namespace}:hello`, {
                  displayName: props.userDisplayName,
                })}
              </Text>

              <Text className="text-[14px] leading-[24px] text-black">
                {t(`${namespace}:paragraph1`)}
              </Text>

              <Text className="text-[14px] leading-[24px] text-black">
                <a href={props.confirmationLink} className="text-blue-500 hover:underline">
                  {t(`${namespace}:confirmationLinkText`)}
                </a>
              </Text>

              <Text className="text-[14px] leading-[24px] text-black">
                {t(`${namespace}:paragraph2`)}
              </Text>
            </EmailContent>

            <EmailFooter>{t(`${namespace}:footer`)} © {new Date().getFullYear()}</EmailFooter>
          </EmailWrapper>
        </Body>
      </Tailwind>
    </Html>,
  );

  return {
    html,
    subject,
  };
}
