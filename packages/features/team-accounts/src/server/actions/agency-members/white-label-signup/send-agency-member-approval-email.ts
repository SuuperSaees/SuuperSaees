'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { getMailer } from '@kit/mailers';
import { getLanguageFromCookie } from '../../../../../../../../apps/web/lib/i18n/i18n.server';
import { getFormSendIdentity } from '../../orders/utils/get-form-send-identity';

export async function sendAgencyMemberApprovalEmail(
  memberEmail: string,
  agencyId: string,
  baseUrl: string
) {
  try {
    const supabase = getSupabaseServerComponentClient({ admin: true });
    
    // Get agency information and owner email
    const { data: organization } = await supabase
      .from('organizations')
      .select('name, owner_id')
      .eq('id', agencyId)
      .single();

    if (!organization) {
      throw new Error('Agency not found');
    }

    const { data: ownerAccount } = await supabase
      .from('accounts')
      .select('email, name')
      .eq('id', organization?.owner_id ?? '')
      .single();

    if (!ownerAccount) {
      throw new Error('Agency owner not found');
    }

    // Create team management URL (where owner can approve members)
    const teamManagementUrl = `${baseUrl}/team`;

    // Get email template and sender identity
    const lang = getLanguageFromCookie() as 'en' | 'es';
    const { fromSenderIdentity } = await getFormSendIdentity(agencyId, 'at');

    const subject = lang === 'es' 
      ? `Solicitud de registro de nuevo miembro para ${organization.name}`
      : `New member registration request for ${organization.name}`;

    const body = lang === 'es'
      ? `
        <p>Hola ${ownerAccount.name || 'Administrador'},</p>
        <p>Un nuevo miembro ha solicitado unirse a tu agencia <strong>${organization.name}</strong>:</p>
        <p><strong>Correo electrónico:</strong> ${memberEmail}</p>
        <p>Para revisar y aprobar esta solicitud, ve a la sección de gestión de equipo:</p>
      `
      : `
        <p>Hello ${ownerAccount.name || 'Administrator'},</p>
        <p>A new member has requested to join your agency <strong>${organization.name}</strong>:</p>
        <p><strong>Email:</strong> ${memberEmail}</p>
        <p>To review and approve this request, go to your team management section:</p>
      `;

    const buttonText = lang === 'es' ? 'Gestionar Equipo' : 'Manage Team';

    const htmlContent = generateNotificationEmailTemplate({
      subject,
      body,
      buttonText,
      buttonUrl: teamManagementUrl,
      agencyName: organization.name ?? '',
      memberEmail,
      lang,
    });

    // Send email
    const mailer = await getMailer();
    await mailer.sendEmail({
      to: ownerAccount.email ?? '',
      from: fromSenderIdentity,
      subject,
      html: htmlContent,
    });

    console.log(`Notification email sent to ${ownerAccount.email} for member ${memberEmail}`);

  } catch (error) {
    console.error('Error sending agency member notification email:', error);
    throw error;
  }
}

function generateNotificationEmailTemplate({
  subject,
  body,
  buttonText,
  buttonUrl,
  agencyName,
  memberEmail,
  lang,
}: {
  subject: string;
  body: string;
  buttonText: string;
  buttonUrl: string;
  agencyName: string;
  memberEmail: string;
  lang: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h1 style="color: #2c3e50; margin-bottom: 20px;">${subject}</h1>
            
            ${body}
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498db;">
                <p style="margin: 0; font-weight: bold;">${lang === 'es' ? 'Detalles de la solicitud:' : 'Request details:'}</p>
                <p style="margin: 5px 0;"><strong>${lang === 'es' ? 'Agencia:' : 'Agency:'}</strong> ${agencyName}</p>
                <p style="margin: 5px 0;"><strong>${lang === 'es' ? 'Correo del solicitante:' : 'Applicant email:'}</strong> ${memberEmail}</p>
                <p style="margin: 5px 0; color: #e74c3c;"><strong>${lang === 'es' ? 'Estado:' : 'Status:'}</strong> ${lang === 'es' ? 'Pendiente de aprobación' : 'Pending approval'}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${buttonUrl}" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    ${buttonText}
                </a>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                    <strong>${lang === 'es' ? 'Instrucciones:' : 'Instructions:'}</strong>
                </p>
                <p style="margin: 5px 0; color: #856404; font-size: 14px;">
                    ${lang === 'es' 
                      ? 'Haz clic en "Gestionar Equipo" para acceder a tu panel de administración donde podrás revisar y aprobar esta solicitud de membresía.'
                      : 'Click "Manage Team" to access your admin panel where you can review and approve this membership request.'
                    }
                </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                ${lang === 'es' 
                  ? 'Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:'
                  : 'If you cannot click the button, copy and paste the following link into your browser:'
                }
            </p>
            <p style="color: #666; font-size: 12px; word-break: break-all;">
                ${buttonUrl}
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #666; font-size: 12px; text-align: center;">
                © 2024 Suuper, soporte@suuper.co
            </p>
        </div>
    </body>
    </html>
  `;
}
