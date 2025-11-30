import { adminInvitationHtml } from './admin-invitation';
import { adminIvitedCredentialsHtml } from './admin-invited-credentials';
import { forgotPasswordHtml } from './reset-password';
import { verifyCodeHtml } from './verify-code';

const templatesList = {
  forgotPasswordHtml,
  verifyCodeHtml,
  adminInvitationHtml,
  adminIvitedCredentialsHtml,
};

export type templateName = keyof typeof templatesList;

type getTemplate = <T>(receiverOptions: T) => string;

export type Templates = Map<templateName, getTemplate>;

const templates = new Map<templateName, getTemplate>();
for (const template in templatesList) {
  templates.set(template as templateName, templatesList[template]);
}

export { templates };
