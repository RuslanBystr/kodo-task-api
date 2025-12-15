import { forgotPasswordHtml } from './reset-password';
import { verifyCodeHtml } from './verify-code';

const templatesList = {
  forgotPasswordHtml,
  verifyCodeHtml,
};

export type templateName = keyof typeof templatesList;

type getTemplate = <T>(receiverOptions: T) => string;

export type Templates = Map<templateName, getTemplate>;

const templates: Templates = new Map<templateName, getTemplate>();
for (const template in templatesList) {
  templates.set(template as templateName, templatesList[template]);
}

export { templates };
