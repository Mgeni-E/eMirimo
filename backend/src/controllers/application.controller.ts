import type { Request, Response } from 'express';
import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { User } from '../models/User.js';
import { createNotification } from './notification.controller.js';

// Apply for a job
export const apply = async (req: any, res: Response) => {
  try {
    const { 
      job_id, 
      cover_letter, 
      availability, 
      salary_expectation
    } = req.body;
    const seeker_id = req.user.uid;

    // Check if job exists and get employer
    const job = await Job.findById(job_id).populate('employer_id');
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if job is active - prevent applications to inactive jobs
    // Only reject if is_active is explicitly false (allow true, undefined, or null)
    if ((job as any).is_active === false) {
      return res.status(403).json({ 
        error: 'This job is currently inactive',
        message: 'Applications are not being accepted for this job at this time. The job may have been paused or closed by the employer or administrator.'
      });
    }

    // Check if deadline has passed
    if (job.application_deadline) {
      const deadline = new Date(job.application_deadline as string | Date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      deadline.setHours(0, 0, 0, 0);
      if (deadline < today) {
        return res.status(403).json({ 
          error: 'Application deadline has passed',
          message: 'The application deadline for this job has passed. Applications are no longer being accepted.'
        });
      }
    }

    // Check if already applied
    const existingApplication = await Application.findOne({ 
      job_id, 
      seeker_id 
    });
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    // Get seeker details for company_name and resume URL
    const seeker = await User.findById(seeker_id);
    if (!seeker) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Automatically fetch resume URL from user's profile
    const userResumeUrl = (seeker as any).cv_url || (seeker as any).job_seeker_profile?.documents?.resume_url || '';

    // Prepare application data
    const applicationData: any = {
      job_id,
      seeker_id,
      employer_id: (job.employer_id as any)._id,
      company_name: job.company_name || (job.employer_id as any)?.employer_profile?.company_name || 'Company',
      cover_letter: cover_letter || '',
      resume_url: userResumeUrl, // Automatically fetch from user's profile
      applied_at: new Date(),
      status: 'applied'
    };

    // Add optional fields if provided
    if (availability) {
      applicationData.availability = availability;
    }
    if (salary_expectation) {
      applicationData.salary_expectation = salary_expectation;
    }

    // Create application
    const application = await Application.create(applicationData);

    // Populate the application with job and seeker details
    const populatedApplication = await Application.findById(application._id)
      .populate('job_id', 'title company_name location')
      .populate('seeker_id', 'name email skills work_experience education')
      .populate('employer_id', 'name email');

    // Get job title and company name for notifications
    const jobTitle = job.title;
    const companyName = job.company_name || (job.employer_id as any)?.employer_profile?.company_name || 'Company';
    const seekerName = seeker.name || 'Job Seeker';

    // Create notification for employer
    await createNotification(
      (job.employer_id as any)._id.toString(),
      `New application received for ${jobTitle}`,
      'job_application',
      {
        application_id: application._id.toString(),
        job_id: job_id,
        seeker_id: seeker_id,
        job_title: jobTitle,
        company_name: companyName,
        seeker_name: seekerName
      },
      'New Job Application',
      'high',
      `/applications/${application._id}`,
      'application'
    );

    // Create notification for seeker
    await createNotification(
      seeker_id,
      `Application submitted successfully for ${jobTitle} at ${companyName}`,
      'job_application',
      {
        application_id: application._id.toString(),
        job_id: job_id,
        job_title: jobTitle,
        company_name: companyName
      },
      'Application Submitted',
      'medium',
      `/applications/${application._id}`,
      'application'
    );

    // Create notification for all admins
    const admins = await User.find({ role: 'admin', is_active: { $ne: false } })
      .select('_id')
      .lean();
    
    for (const admin of admins) {
      await createNotification(
        admin._id.toString(),
        `New application submitted: ${seekerName} applied for ${jobTitle} at ${companyName}`,
        'job_application',
        {
          application_id: application._id.toString(),
          job_id: job_id,
          seeker_id: seeker_id,
          employer_id: (job.employer_id as any)._id.toString(),
          job_title: jobTitle,
          company_name: companyName,
          seeker_name: seekerName
        },
        'New Application Submitted',
        'medium',
        `/admin/applications/${application._id}`,
        'application'
      );
    }

    res.status(201).json({
      success: true,
      application: populatedApplication,
      message: 'Application submitted successfully'
    });
  } catch (error: any) {
    console.error('Apply error:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors: Record<string, string> = {};
      if (error.errors) {
        Object.keys(error.errors).forEach(key => {
          validationErrors[key] = error.errors[key].message;
        });
      }
      return res.status(400).json({ 
        error: 'Validation failed', 
        message: 'Please check your application details',
        validationErrors 
      });
    }
    
    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = error.response?.status || error.status || 500;
    
    res.status(statusCode).json({ 
      error: 'Failed to submit application', 
      message: errorMessage 
    });
  }
};

// Get my applications (for job seekers)
export const myApplications = async (req: any, res: Response) => {
  try {
    const applications = await Application.find({ seeker_id: req.user.uid })
      .populate('job_id', 'title company location salary posted_at')
      .populate('employer_id', 'name email')
      .sort({ applied_at: -1 })
      .lean();

    res.json({
      success: true,
      applications,
      count: applications.length
    });
  } catch (error) {
    console.error('My applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// Get applications for employer's jobs
export const getEmployerApplications = async (req: any, res: Response) => {
  try {
    const applications = await Application.find({ employer_id: req.user.uid })
      .populate('job_id', 'title company_name company location')
      .populate('seeker_id', 'name email profile_image skills work_experience education')
      .sort({ applied_at: -1 })
      .lean();

    res.json({
      success: true,
      applications,
      count: applications.length
    });
  } catch (error) {
    console.error('Employer applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// Update application status (for employers)
export const updateApplicationStatus = async (req: any, res: Response) => {
  try {
    const { application_id } = req.params;
    const { status, notes, interview_date, interview_location, salary_offered, rejection_reason } = req.body;

    const application = await Application.findOneAndUpdate(
      { _id: application_id, employer_id: req.user.uid },
      { 
        status,
        notes,
        interview_date,
        interview_location,
        salary_offered,
        rejection_reason,
        updated_at: new Date()
      },
      { new: true }
    ).populate('job_id', 'title').populate('seeker_id', 'name email');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Create notification for job seeker
    let notificationMessage = '';
    let notificationType = 'application_status_change';

    switch (status) {
      case 'shortlisted':
        notificationMessage = `Congratulations! You have been shortlisted for ${(application.job_id as any).title}`;
        break;
      case 'interview':
        notificationMessage = `Interview scheduled for ${(application.job_id as any).title}`;
        notificationType = 'interview_scheduled';
        break;
      case 'offer':
        notificationMessage = `Congratulations! You have received an offer for ${(application.job_id as any).title}`;
        notificationType = 'offer_received';
        break;
      case 'hired':
        notificationMessage = `Congratulations! You have been hired for ${(application.job_id as any).title}`;
        break;
      case 'rejected':
        notificationMessage = `Unfortunately, your application for ${(application.job_id as any).title} was not successful`;
        break;
      default:
        notificationMessage = `Your application status for ${(application.job_id as any).title} has been updated`;
    }

    await createNotification(
      (application.seeker_id as any)._id.toString(),
      notificationMessage,
      notificationType,
      {
        application_id: application._id,
        job_id: (application.job_id as any)._id.toString(),
        status: status,
        interview_date,
        interview_location,
        salary_offered
      }
    );

    res.json({
      success: true,
      application,
      message: 'Application status updated successfully'
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

// Get application details
export const getApplicationDetails = async (req: any, res: Response) => {
  try {
    const { application_id } = req.params;
    
    const application = await Application.findById(application_id)
      .populate('job_id', 'title description requirements company location salary company_name')
      .populate({
        path: 'seeker_id',
        select: 'name email profile_image phone bio address skills job_seeker_profile cv_url social_links'
      })
      .populate('employer_id', 'name email');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check if user has permission to view this application
    const seekerId = (application.seeker_id as any)?._id?.toString();
    const employerId = (application.employer_id as any)?._id?.toString();
    
    if (seekerId !== req.user.uid && employerId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get resume URL from application or user profile
    // Prefer Firebase URLs over Cloudinary URLs
    let resumeUrl = application.resume_url || (application.seeker_id as any)?.cv_url;
    
    // If resume URL is from Cloudinary, try to get Firebase URL from user profile
    if (resumeUrl && resumeUrl.includes('cloudinary.com')) {
      const seeker = application.seeker_id as any;
      // Check if user has a Firebase URL in their profile
      const firebaseUrl = seeker?.cv_url?.includes('storage.googleapis.com') 
        ? seeker.cv_url 
        : seeker?.job_seeker_profile?.documents?.resume_url?.includes('storage.googleapis.com')
          ? seeker.job_seeker_profile.documents.resume_url
          : null;
      
      // Prefer Firebase URL if available
      if (firebaseUrl) {
        resumeUrl = firebaseUrl;
      }
    }

    res.json({
      success: true,
      application: {
        ...application.toObject(),
        resume_url: resumeUrl
      }
    });
  } catch (error) {
    console.error('Get application details error:', error);
    res.status(500).json({ error: 'Failed to fetch application details' });
  }
};
