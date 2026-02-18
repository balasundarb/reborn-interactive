export const resetPasswordTemplate = (resetUrl: string, userName?: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
  
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
          
          <!-- Header with Brand -->
          <tr>
            <td style="background: linear-gradient(135deg, #d63031 0%, #b02828 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                REBORN <span style="font-style: italic;">INTERACTIVE</span>
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px;">
              
              <h2 style="margin: 0 0 20px 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                Reset Your Password
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                ${userName ? `Hi ${userName},` : 'Hi there,'}
              </p>
              
              <p style="margin: 0 0 30px 0; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <!-- Reset Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background-color: #d63031; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; border-radius: 12px; box-shadow: 0 10px 25px rgba(214, 48, 49, 0.3);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 20px 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              
              <div style="background-color: #0f172a; padding: 15px; border-radius: 8px; border: 1px solid #334155; margin-bottom: 30px;">
                <a href="${resetUrl}" style="color: #60a5fa; text-decoration: none; font-size: 13px; word-break: break-all;">
                  ${resetUrl}
                </a>
              </div>
              
              <!-- Security Notice -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                  <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour for your security.
                </p>
              </div>
              
              <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 30px 40px; border-top: 1px solid #334155;">
              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 13px; text-align: center; line-height: 1.5;">
                This email was sent by Reborn Interactive
              </p>
              <p style="margin: 0; color: #64748b; font-size: 13px; text-align: center; line-height: 1.5;">
                © ${new Date().getFullYear()} Reborn Interactive. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `;
};