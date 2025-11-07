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

/**
 * Send job recommendation email to job seekers
 */
export const sendJobRecommendationEmail = async (
  email: string,
  name: string,
  job: any,
  matchScore: number,
  reasons: string[],
  skillsMatch: string[],
  skillsGap: string[]
) => {
  const jobUrl = `${process.env.FRONTEND_URL}/jobs/${job._id}`;
  const applyUrl = `${process.env.FRONTEND_URL}/jobs/${job._id}/apply`;
  
  const matchColor = matchScore >= 80 ? '#10b981' : matchScore >= 60 ? '#3b82f6' : '#f59e0b';
  const matchLabel = matchScore >= 80 ? 'Excellent Match' : matchScore >= 60 ? 'Good Match' : 'Fair Match';
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `🎯 New Job Recommendation: ${job.title} at ${job.employer_id.name} (${matchScore}% match)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">eMirimo</h1>
          <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">AI-Powered Job Recommendations</p>
        </div>
        
        <!-- Main Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Greeting -->
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">Hi ${name}! 👋</h2>
          <p style="color: #6b7280; line-height: 1.6; margin: 0 0 25px 0;">
            We found a job opportunity that matches your profile perfectly! Our AI analyzed your skills, experience, and preferences to recommend this position.
          </p>
          
          <!-- Job Card -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
              <div>
                <h3 style="color: #1f2937; margin: 0 0 5px 0; font-size: 20px;">${job.title}</h3>
                <p style="color: #6b7280; margin: 0; font-size: 16px; font-weight: 500;">${job.employer_id.name}</p>
              </div>
              <div style="background: ${matchColor}; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold;">
                ${matchScore}% Match
              </div>
            </div>
            
            <p style="color: #4b5563; line-height: 1.5; margin: 0 0 15px 0; font-size: 14px;">
              ${job.description.substring(0, 200)}${job.description.length > 200 ? '...' : ''}
            </p>
            
            <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; color: #6b7280; font-size: 14px;">
                📍 ${job.location}
              </div>
              <div style="display: flex; align-items: center; color: #6b7280; font-size: 14px;">
                💼 ${job.type}
              </div>
              <div style="display: flex; align-items: center; color: #6b7280; font-size: 14px;">
                ⏰ ${job.experience_level}
              </div>
            </div>
            
            <!-- Skills Match -->
            ${skillsMatch.length > 0 ? `
              <div style="margin-bottom: 15px;">
                <p style="color: #059669; font-weight: 600; margin: 0 0 8px 0; font-size: 14px;">✅ Your Matching Skills:</p>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  ${skillsMatch.map(skill => `
                    <span style="background: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;">
                      ${skill}
                    </span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            <!-- Skills Gap -->
            ${skillsGap.length > 0 ? `
              <div style="margin-bottom: 15px;">
                <p style="color: #dc2626; font-weight: 600; margin: 0 0 8px 0; font-size: 14px;">📚 Skills to Develop:</p>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  ${skillsGap.map(skill => `
                    <span style="background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;">
                      ${skill}
                    </span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            <!-- Match Reasons -->
            ${reasons.length > 0 ? `
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; border-radius: 0 6px 6px 0;">
                <p style="color: #1e40af; font-weight: 600; margin: 0 0 8px 0; font-size: 14px;">🤖 Why this job matches you:</p>
                <ul style="color: #1e40af; margin: 0; padding-left: 16px; font-size: 14px;">
                  ${reasons.map(reason => `<li style="margin-bottom: 4px;">${reason}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
          
          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${applyUrl}" 
               style="background: linear-gradient(135deg, #10b981, #059669); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;
                      margin-right: 10px;
                      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              🚀 Apply Now
            </a>
            <a href="${jobUrl}" 
               style="background: white; 
                      color: #3b82f6; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;
                      border: 2px solid #3b82f6;">
              👀 View Details
            </a>
          </div>
          
          <!-- Learning Resources -->
          ${skillsGap.length > 0 ? `
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">💡 Want to improve your match score?</h4>
              <p style="color: #92400e; margin: 0 0 15px 0; font-size: 14px;">
                Check out our learning resources to develop the skills you need for this role.
              </p>
              <a href="${process.env.FRONTEND_URL}/learning" 
                 style="background: #f59e0b; 
                        color: white; 
                        text-decoration: none; 
                        padding: 10px 20px; 
                        border-radius: 6px; 
                        font-weight: 500; 
                        display: inline-block;
                        font-size: 14px;">
                📚 Explore Learning Resources
              </a>
            </div>
          ` : ''}
          
          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; margin: 30px 0 20px 0; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">
              This recommendation was generated by our AI based on your profile and job requirements.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              <a href="${process.env.FRONTEND_URL}/profile" style="color: #3b82f6; text-decoration: none;">Update your preferences</a> | 
              <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #3b82f6; text-decoration: none;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Job recommendation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending job recommendation email:', error);
    throw new Error('Failed to send job recommendation email');
  }
};

/**
 * Send course/learning resource recommendation email to job seekers
 */
export const sendCourseRecommendationEmail = async (
  email: string,
  name: string,
  course: any,
  matchScore: number,
  reasons: string[],
  skillsGap: string[]
) => {
  const courseUrl = `${process.env.FRONTEND_URL}/learning/${course._id}`;
  
  const matchColor = matchScore >= 0.8 ? '#10b981' : matchScore >= 0.6 ? '#3b82f6' : '#f59e0b';
  const matchLabel = matchScore >= 0.8 ? 'Excellent Match' : matchScore >= 0.6 ? 'Good Match' : 'Fair Match';
  const matchPercentage = Math.round(matchScore * 100);
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `📚 Learning Recommendation: ${course.title} (${matchPercentage}% match)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">eMirimo</h1>
          <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">Learning Recommendations</p>
        </div>
        
        <!-- Main Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Greeting -->
          <h2 style="color: #1f2937; margin: 0 0 20px 0;">Hi ${name}! 👋</h2>
          <p style="color: #6b7280; line-height: 1.6; margin: 0 0 25px 0;">
            We found a learning resource that matches your skill development needs! This course can help you bridge skill gaps and advance your career.
          </p>
          
          <!-- Course Card -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
              <div>
                <h3 style="color: #1f2937; margin: 0 0 5px 0; font-size: 20px;">${course.title}</h3>
                ${course.author ? `<p style="color: #6b7280; margin: 0; font-size: 16px; font-weight: 500;">${course.author}</p>` : ''}
              </div>
              <div style="background: ${matchColor}; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold;">
                ${matchPercentage}% Match
              </div>
            </div>
            
            <p style="color: #4b5563; line-height: 1.5; margin: 0 0 15px 0; font-size: 14px;">
              ${(course.short_description || course.description || '').substring(0, 200)}${(course.short_description || course.description || '').length > 200 ? '...' : ''}
            </p>
            
            <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
              ${course.type ? `
                <div style="display: flex; align-items: center; color: #6b7280; font-size: 14px;">
                  📖 ${course.type.charAt(0).toUpperCase() + course.type.slice(1)}
                </div>
              ` : ''}
              ${course.duration ? `
                <div style="display: flex; align-items: center; color: #6b7280; font-size: 14px;">
                  ⏱️ ${course.duration} minutes
                </div>
              ` : ''}
              ${course.difficulty_level ? `
                <div style="display: flex; align-items: center; color: #6b7280; font-size: 14px;">
                  📊 ${course.difficulty_level.charAt(0).toUpperCase() + course.difficulty_level.slice(1)}
                </div>
              ` : ''}
              ${course.category ? `
                <div style="display: flex; align-items: center; color: #6b7280; font-size: 14px;">
                  🏷️ ${course.category.replace('_', ' ').charAt(0).toUpperCase() + course.category.replace('_', ' ').slice(1)}
                </div>
              ` : ''}
            </div>
            
            <!-- Skills Gap -->
            ${skillsGap.length > 0 ? `
              <div style="margin-bottom: 15px;">
                <p style="color: #059669; font-weight: 600; margin: 0 0 8px 0; font-size: 14px;">🎯 Skills You'll Learn:</p>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  ${skillsGap.map(skill => `
                    <span style="background: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;">
                      ${skill}
                    </span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            ${course.skills && course.skills.length > 0 ? `
              <div style="margin-bottom: 15px;">
                <p style="color: #059669; font-weight: 600; margin: 0 0 8px 0; font-size: 14px;">📚 Course Skills:</p>
                <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                  ${course.skills.slice(0, 8).map((skill: string) => `
                    <span style="background: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;">
                      ${skill}
                    </span>
                  `).join('')}
                  ${course.skills.length > 8 ? `<span style="color: #6b7280; font-size: 12px;">+${course.skills.length - 8} more</span>` : ''}
                </div>
              </div>
            ` : ''}
            
            <!-- Match Reasons -->
            ${reasons.length > 0 ? `
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; border-radius: 0 6px 6px 0;">
                <p style="color: #1e40af; font-weight: 600; margin: 0 0 8px 0; font-size: 14px;">🤖 Why this course matches you:</p>
                <ul style="color: #1e40af; margin: 0; padding-left: 16px; font-size: 14px;">
                  ${reasons.map(reason => `<li style="margin-bottom: 4px;">${reason}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
          
          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${courseUrl}" 
               style="background: linear-gradient(135deg, #10b981, #059669); 
                      color: white; 
                      text-decoration: none; 
                      padding: 15px 30px; 
                      border-radius: 8px; 
                      font-weight: bold; 
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              📖 Start Learning
            </a>
          </div>
          
          <!-- Related Jobs -->
          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">💼 Apply Your New Skills</h4>
            <p style="color: #92400e; margin: 0 0 15px 0; font-size: 14px;">
              After completing this course, check out job opportunities that match your new skills.
            </p>
            <a href="${process.env.FRONTEND_URL}/jobs" 
               style="background: #f59e0b; 
                      color: white; 
                      text-decoration: none; 
                      padding: 10px 20px; 
                      border-radius: 6px; 
                      font-weight: 500; 
                      display: inline-block;
                      font-size: 14px;">
              🔍 Browse Jobs
            </a>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #e5e7eb; margin: 30px 0 20px 0; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">
              This recommendation was generated based on your profile and skill development needs.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              <a href="${process.env.FRONTEND_URL}/profile" style="color: #3b82f6; text-decoration: none;">Update your preferences</a> | 
              <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #3b82f6; text-decoration: none;">Unsubscribe</a>
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Course recommendation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending course recommendation email:', error);
    throw new Error('Failed to send course recommendation email');
  }
};
