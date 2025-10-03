import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset - eMirimo',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">eMirimo</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Career & Mentorship Platform</p>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">Password Reset Request</h2>
          
          <p style="color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">
            Hello,
          </p>
          
          <p style="color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">
            We received a request to reset your password for your eMirimo account. Click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #0ea5e9, #0284c7); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              Reset Password
            </a>
          </div>
          
          <p style="color: #6b7280; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #0ea5e9; word-break: break-all; margin: 10px 0 0 0; font-size: 14px;">
            ${resetUrl}
          </p>
          
          <div style="border-top: 1px solid #e5e7eb; margin: 30px 0 20px 0; padding-top: 20px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
              © ${new Date().getFullYear()} eMirimo. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to eMirimo!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">eMirimo</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Career & Mentorship Platform</p>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">Welcome to eMirimo, ${name}!</h2>
          
          <p style="color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for joining eMirimo, the premier platform for Rwandan professionals seeking remote opportunities and career growth.
          </p>
          
          <p style="color: #6b7280; line-height: 1.6; margin: 0 0 20px 0;">
            Here's what you can do next:
          </p>
          
          <ul style="color: #6b7280; line-height: 1.8; margin: 0 0 20px 0; padding-left: 20px;">
            <li>Complete your profile to attract better opportunities</li>
            <li>Browse remote job opportunities from top companies</li>
            <li>Connect with industry mentors and experts</li>
            <li>Access career development resources and courses</li>
            <li>Join our community events and networking sessions</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: linear-gradient(135deg, #0ea5e9, #0284c7); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              Get Started
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; margin: 30px 0 20px 0; padding-top: 20px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              If you have any questions, feel free to contact our support team.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
              © ${new Date().getFullYear()} eMirimo. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email as it's not critical
  }
};
