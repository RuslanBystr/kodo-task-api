export const adminIvitedCredentialsHtml = ({
  userName,
  email,
  password,
}: {
  userName: string;
  email: string;
  password: string;
}) => {
  return `
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; font-family: Arial, sans-serif;">
      <div style="max-width: 500px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);">
        <h1 style="text-align: center; color: #333;">Welcome to the Project-admin</h1>
        <p style="text-align: center; font-size: 14px; color: #777;">Your admin account has been successfully created.</p>
        
        <div style="padding: 10px; background-color: #f4f4f4; border-radius: 5px; margin-top: 10px;">
          <p style="margin: 5px 0;"><strong>Username:</strong> ${userName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
        </div>

        <p style="text-align: center; margin-top: 20px;">
          <a href="/auth" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px;">Login to Admin Panel</a>
        </p>

        <p style="text-align: center; font-size: 12px; color: red; margin-top: 15px;">
          If you do not recognize this email or did not request access, please ignore this message.
        </p>
      </div>
    </div>
  `;
};
