import { Controller } from '@nestjs/common';
import { MailService } from '../services/mail.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(private readonly mail: MailService) {}

  // @ApiOperation({ summary: 'Send a test email' })
  // @ApiResponse({ status: 200, description: 'Success' })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       email: {
  //         type: 'string',
  //         example: 'example@example.com',
  //       },
  //       role: {
  //         type: 'string',
  //         example: 'example',
  //       },
  //       token: {
  //         type: 'string',
  //         example: 'token',
  //       },
  //     },
  //   },
  // })
  // @HttpCode(HttpStatus.OK)
  // @Post('test-email')
  // async mailTest(@Body() { email, role, invitationToken }) {
  //   await this.mail.sendAdminInvitation({ email, role, invitationToken });
  //   return {
  //     success: true,
  //   };
  // }
}
