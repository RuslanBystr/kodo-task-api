export const adminInvitationHtml = ({
  role,
  link,
}: {
  role: string;
  link: string;
}) => {
  return `
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; font-family: Arial, sans-serif;">
      <div style="max-width: 500px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);">
        <h1 style="text-align: center; color: #333;">Admin Invitation – The project-admin</h1>
        <p style="text-align: center; font-size: 14px; color: #777;">You have been invited to become an admin.</p>
        
        <div style="padding: 10px; background-color: #f4f4f4; border-radius: 5px; margin-top: 10px; text-align: center;">
          <p style="margin: 5px 0;"><strong>Your Role:</strong> ${role}</p>
        </div>

        <p style="text-align: center; margin-top: 20px;">
          <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
        </p>

        <p style="text-align: center; font-size: 12px; color: red; margin-top: 15px;">
          If you do not recognize this email or do not wish to become an admin, please ignore and delete this message.
        </p>
      </div>
    </div>
  `;
};
