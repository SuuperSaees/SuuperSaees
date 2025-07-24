"use server";

import { getMailer } from "@kit/mailers";
import { getEmailTranslations } from "@kit/mailers";
import { getLogger } from "@kit/shared/logger";

import { getLanguageFromCookie } from "~/lib/i18n/i18n.server";
import { getDomainByUserId } from "~/multitenancy/utils/get/get-domain";
import { getFormSendIdentity } from "~/team-accounts/src/server/actions/orders/utils/get-form-send-identity";
import { EMAIL, EmailType, EmailParams } from "./email.types";
import { generateHtmlTemplate } from "./email.template";

interface EmailConfig {
  to: string;
  userId: string;
  subject: string;
  body: string;
  greeting: string;
  farewell: string;
  buttonText?: string;
  buttonUrl?: string;
  footer: string;
  additionalMessage?: string;
  emailType?: "default" | "message" | "notification" | "invoice";
  agencyName?: string;
  agencyId?: string;
  domain?: string;
}

// Factory function to create email configs (internal use only)
function createEmailConfig<T extends EmailType>(
  type: T,
  params: EmailParams[T],
  lang: "en" | "es",
): EmailConfig {
  switch (type) {
    case EMAIL.INVOICES.REQUEST_PAYMENT: {
      const p = params as EmailParams[typeof EMAIL.INVOICES.REQUEST_PAYMENT];
      const { t } = getEmailTranslations("requestPayment", lang);

      return {
        to: p.to,
        userId: p.userId,
        subject: t("subject", { invoiceNumber: p.invoiceNumber }),
        body: t("body", {
          invoiceNumber: p.invoiceNumber,
          clientName: p.clientName,
          amount: p.amount,
        }),
        greeting: t("greeting", { clientName: p.clientName }),
        farewell: t("farewell"),
        agencyName: p.agencyName ?? "",
        buttonText: t("buttonText"),
        buttonUrl: p.buttonUrl,
        footer: t("footer", { toEmail: p.to }),
        emailType: "invoice",
      };
    }

    case EMAIL.INVOICES.PAYMENT_RECEIVED: {
      const p = params as EmailParams[typeof EMAIL.INVOICES.PAYMENT_RECEIVED];
      const { t } = getEmailTranslations("paymentReceived", lang);

      return {
        to: p.to,
        userId: p.userId,
        subject: t("subject", { invoiceNumber: p.invoiceNumber }),
        body: t("body", { amount: p.amount, invoiceNumber: p.invoiceNumber }),
        greeting: t("greeting", { clientName: p.clientName }),
        farewell: t("farewell"),
        buttonText: undefined, // No button for payment received
        buttonUrl: undefined,
        footer: t("footer", { toEmail: p.to }),
        emailType: "invoice",
      };
    }

    case EMAIL.ORDERS.STATUS_UPDATE: {
      const p = params as EmailParams[typeof EMAIL.ORDERS.STATUS_UPDATE];
      const { t } = getEmailTranslations("orderStatusPriority", lang);

      const fieldKey = "status";
      const fieldKeySubject = `${fieldKey}.subject` as keyof typeof t;
      const fieldKeyBody = `${fieldKey}.body` as keyof typeof t;

      return {
        to: p.to,
        userId: p.userId,
        subject: t(fieldKeySubject, {
          actualName: p.userName,
          orderTitle: p.orderTitle,
          message: p.message,
        }),
        body: t(fieldKeyBody, {
          actualName: p.userName,
          orderTitle: p.orderTitle,
          message: p.message,
        }),
        greeting: t("greeting", { actualName: p.to.split("@")[0] ?? "User" }),
        farewell: t("farewell"),
        buttonText: t("viewOrder"),
        buttonUrl: `/orders/${p.orderId}`,
        footer: t("footer", { toEmail: p.to }),
        additionalMessage: p.message,
        emailType: "notification",
      };
    }

    case EMAIL.ORDERS.NEW_MESSAGE: {
      const p = params as EmailParams[typeof EMAIL.ORDERS.NEW_MESSAGE];
      const { t } = getEmailTranslations("orderMessage", lang);

      return {
        to: p.to,
        userId: p.userId,
        subject: t("subject", {
          userName: p.userName,
          orderTitle: p.orderTitle,
          date: p.date,
        }),
        body: t("subject", {
          userName: p.userName,
          orderTitle: p.orderTitle,
          date: p.date,
        }),
        greeting: t("greeting", { toEmail: p.to }),
        farewell: t("farewell"),
        buttonText: t("reply"),
        buttonUrl: `/orders/${p.orderId}`,
        footer: t("footer", { toEmail: p.to }),
        additionalMessage: p.message,
        emailType: "message",
      };
    }

    case EMAIL.CHAT.NEW_MESSAGE: {
      const p = params as EmailParams[typeof EMAIL.CHAT.NEW_MESSAGE];
      const { t } = getEmailTranslations("chatMessage", lang);

      return {
        to: p.to,
        userId: p.userId,
        subject: t("subject", {
          senderName: p.senderName,
          chatTitle: p.chatTitle,
        }),
        body: t("body", {
          senderName: p.senderName,
          chatTitle: p.chatTitle,
          message: p.message,
        }),
        greeting: t("greeting", { toName: p.to.split("@")[0] ?? "User" }),
        farewell: t("farewell"),
        buttonText: t("viewMessage"),
        buttonUrl: "/messages",
        footer: t("footer", { toEmail: p.to }),
        additionalMessage: p.message,
        emailType: "message",
      };
    }

    case EMAIL.CLIENTS.NEW_REGISTRATION: {
      const p = params as EmailParams[typeof EMAIL.CLIENTS.NEW_REGISTRATION];
      const { t } = getEmailTranslations("newClientRegistration", lang);

      return {
        to: p.to,
        userId: p.userId,
        subject: t("subject", { clientName: p.clientName }),
        body: t("body"),
        greeting: t("greeting"),
        farewell: t("farewell"),
        buttonText: t("buttonText"),
        buttonUrl: p.buttonUrl,
        footer: t("footer", { toEmail: p.to }),
        additionalMessage: `${t("clientDetails")}\n${t("clientName", { clientName: p.clientName })}\n${t("clientEmail", { clientEmail: p.clientEmail })}\n${t("organizationName", { organizationName: p.organizationName })}\n${t("registrationDate", { registrationDate: p.registrationDate })}`,
        emailType: "notification",
        agencyId: p.agencyId,
        domain: p.domain
      };
    }

    case EMAIL.AGENCY_MEMBERS.NEW_REGISTRATION: {
      const p = params as EmailParams[typeof EMAIL.AGENCY_MEMBERS.NEW_REGISTRATION];
      const { t } = getEmailTranslations("newAgencyMemberRegistration", lang);

      return {
        to: p.to,
        userId: p.userId,
        subject: t("subject", { agencyName: p.agencyName }),
        body: t("body"),
        greeting: t("greeting"),
        farewell: t("farewell"),
        buttonText: t("buttonText"),
        buttonUrl: p.buttonUrl,
        footer: t("footer", { toEmail: p.to }),
        additionalMessage: `${t("memberDetails")}\n${t("memberEmail", { memberEmail: p.memberEmail })}\n${t("registrationDate", { registrationDate: p.registrationDate })}\n${t("status")}\n\n${t("instructions")}`,
        emailType: "notification",
        agencyId: p.agencyId,
        domain: p.domain,
      };
    }

    case EMAIL.NOTIFICATIONS.GENERAL: {
      const p = params as EmailParams[typeof EMAIL.NOTIFICATIONS.GENERAL];
      // For general notifications, use direct content since it's custom
      return {
        to: p.to,
        userId: p.userId,
        subject: p.subject,
        body: p.body,
        greeting: p.greeting ?? "Hello!",
        farewell: p.farewell ?? "Best regards.",
        buttonText: p.buttonText,
        buttonUrl: p.buttonUrl,
        footer: `This email was sent to ${p.to}. If you have any questions, please contact us.`,
        emailType: "notification",
      };
    }

    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}

// Main send function with factory pattern
export async function sendEmail<T extends EmailType>(
  type: T,
  params: EmailParams[T],
): Promise<void> {
  const logger = await getLogger();
  const mailer = await getMailer();

  try {
    console.log("DEBUG - Email params:", { type, params });

    const lang = getLanguageFromCookie() as "en" | "es";
    const config = createEmailConfig(type, params, lang);
    console.log("DEBUG - Email config created:", {
      to: config.to,
      userId: config.userId,
      subject: config.subject,
    });

    const { domain: siteURL, organizationId } = !config.agencyId
      ? await getDomainByUserId(config.userId, true)
      : { domain: config.domain ?? '', organizationId: config.agencyId };

    // Get sender identity and branding
    const { fromSenderIdentity, logoUrl, themeColor, buttonTextColor } =
      await getFormSendIdentity(organizationId ?? "", "at");

      console.log("DEBUG - Sender identity:", {
      fromSenderIdentity,
      logoUrl, 
      themeColor
      })

    // Generate HTML content
    const htmlContent = generateHtmlTemplate({
      subject: config.subject,
      body: config.body,
      greeting: config.greeting,
      farewell: config.farewell,
      buttonText: config.buttonText,
      buttonUrl: config.buttonUrl,
      footer: config.footer,
      additionalMessage: config.additionalMessage,
      logoUrl,
      themeColor,
      buttonTextColor,
      siteURL,
      lang,
      agencyName: config.agencyName ?? "",
    });

    console.log("DEBUG - HTML content generated:", {
      subject: config.subject,
      to: config.to,
    });

    // Send email
    await mailer.sendEmail({
      to: config.to,
      from: fromSenderIdentity,
      subject: config.subject,
      html: htmlContent,
    });

    logger.info(`Email sent successfully to ${config.to} (type: ${type})`);
  } catch (error) {
    logger.error({ error, type, to: "params.to" }, "Error sending email");
    console.error("Email sending error:", error);
    throw error;
  }
}

// Alternative direct config approach (for custom emails)
export async function sendCustomEmail(config: EmailConfig): Promise<void> {
  const logger = await getLogger();
  const mailer = await getMailer();

  try {
    const { domain: siteURL, organizationId } = !config.agencyId
      ? await getDomainByUserId(config.userId, true)
      : { domain: config.domain ?? '', organizationId: config.agencyId };

    const lang = getLanguageFromCookie() as "en" | "es";

    const { fromSenderIdentity, logoUrl, themeColor, buttonTextColor } =
      await getFormSendIdentity(organizationId ?? "", "at");

    const htmlContent = generateHtmlTemplate({
      subject: config.subject,
      body: config.body,
      greeting: config.greeting,
      farewell: config.farewell,
      buttonText: config.buttonText,
      buttonUrl: config.buttonUrl,
      footer: config.footer,
      additionalMessage: config.additionalMessage,
      logoUrl,
      themeColor,
      buttonTextColor,
      siteURL,
      lang,
      agencyName: config.agencyName ?? "",
    });

    await mailer.sendEmail({
      to: config.to,
      from: fromSenderIdentity,
      subject: config.subject,
      html: htmlContent,
    });

    logger.info(`Custom email sent successfully to ${config.to}`);
  } catch (error) {
    logger.error(
      { error, config: { ...config, userId: "[REDACTED]" } },
      "Error sending custom email",
    );
    console.error("Email sending error:", error);
    throw error;
  }
}


