import type { Request, Response } from 'express';
import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { User } from '../models/User.js';
import { createNotification } from './notification.controller.js';

// Apply for a job
export const apply = async (req: any, res: Response) => {
  try {
    const { job_id, cover_letter, resume_url } = req.body;
    const seeker_id = req.user.uid;

    // Check if job exists and get employer
    const job = await Job.findById(job_id).populate('employer_id');
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({ 
      job_id, 
      seeker_id 
    });
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    // Create application
    const application = await Application.create({
      job_id,
      seeker_id,
      employer_id: (job.employer_id as any)._id,
      cover_letter,
      resume_url
    });

    // Populate the application with job and seeker details
    const populatedApplication = await Application.findById(application._id)
      .populate('job_id', 'title company location')
      .populate('seeker_id', 'name email')
      .populate('employer_id', 'name email');

    // Create notification for employer
    await createNotification(
      (job.employer_id as any)._id.toString(),
      `New application received for ${job.title}`,
      'job_application',
      {
        application_id: application._id,
        job_id: job_id,
        seeker_id: seeker_id,
        job_title: job.title
      }
    );

    // Create notification for seeker
    await createNotification(
      seeker_id,
      `Application submitted successfully for ${job.title}`,
      'job_application',
      {
        application_id: application._id,
        job_id: job_id,
        job_title: job.title
      }
    );

    res.status(201).json({
      success: true,
      application: populatedApplication,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
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
      .populate('job_id', 'title company location')
      .populate('seeker_id', 'name email skills work_experience education')
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
      .populate('job_id', 'title description requirements company location salary')
      .populate('seeker_id', 'name email skills work_experience education cv_url')
      .populate('employer_id', 'name email');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check if user has permission to view this application
    if ((application.seeker_id as any)._id.toString() !== req.user.uid && 
        (application.employer_id as any)._id.toString() !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Get application details error:', error);
    res.status(500).json({ error: 'Failed to fetch application details' });
  }
};
