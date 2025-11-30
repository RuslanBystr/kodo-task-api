export const forgotPasswordHtml = ({
  username,
  link,
}: {
  username: string;
  link: string;
}) => {
  return `
        <div>
        <h1>Hello, ${username}</h1>
        <p>Click <a href=${link}>here</a> to reset your password</p>
        </div>
    `;
};
