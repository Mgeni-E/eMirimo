import type { Request, Response } from 'express';
import { Job } from '../models/Job.js';
import { Application } from '../models/Application.js';
import { User } from '../models/User.js';

// Get employer job statistics
export const getJobStats = async (req: any, res: Response) => {
  try {
    const employerId = req.user.uid;
    
    const totalJobs = await Job.countDocuments({ employer_id: employerId });
    const activeJobs = await Job.countDocuments({ 
      employer_id: employerId, 
      is_active: true 
    });
    const expiredJobs = await Job.countDocuments({ 
      employer_id: employerId, 
      is_active: false 
    });
    
    res.json({
      total: totalJobs,
      active: activeJobs,
      expired: expiredJobs
    });
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({ error: 'Failed to fetch job statistics' });
  }
};

// Get employer application statistics
export const getApplicationStats = async (req: any, res: Response) => {
  try {
    const employerId = req.user.uid;
    
    // Get all jobs by this employer
    const employerJobs = await Job.find({ employer_id: employerId }).select('_id');
    const jobIds = employerJobs.map(job => job._id);
    
    const totalApplications = await Application.countDocuments({ 
      job_id: { $in: jobIds } 
    });
    
    const applicationsByStatus = await Application.aggregate([
      { $match: { job_id: { $in: jobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const statusCounts = applicationsByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
    
    res.json({
      total: totalApplications,
      applied: statusCounts['applied'] || 0,
      shortlisted: statusCounts['shortlisted'] || 0,
      interview: statusCounts['interview'] || 0,
      offer: statusCounts['offer'] || 0,
      hired: statusCounts['hired'] || 0,
      rejected: statusCounts['rejected'] || 0
    });
  } catch (error) {
    console.error('Error fetching application stats:', error);
    res.status(500).json({ error: 'Failed to fetch application statistics' });
  }
};

// Get employer applications
export const getApplications = async (req: any, res: Response) => {
  try {
    const employerId = req.user.uid;
    const { status, page = 1, limit = 10 } = req.query;
    
    // Get all jobs by this employer
    const employerJobs = await Job.find({ employer_id: employerId }).select('_id');
    const jobIds = employerJobs.map(job => job._id);
    
    const filter: any = { job_id: { $in: jobIds } };
    if (status) {
      filter.status = status;
    }
    
    const applications = await Application.find(filter)
      .populate('seeker_id', 'name email')
      .populate('job_id', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit as string))
      .lean();
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
};

// Update application status
export const updateApplicationStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Verify the application belongs to this employer's job
    const job = await Job.findById(application.job_id);
    if (!job || job.employer_id.toString() !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    application.status = status;
    await application.save();
    
    res.json(application);
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
};

// Get employer interviews
export const getInterviews = async (req: any, res: Response) => {
  try {
    const employerId = req.user.uid;
    
    // Get all jobs by this employer
    const employerJobs = await Job.find({ employer_id: employerId }).select('_id title');
    const jobIds = employerJobs.map(job => job._id);
    
    // Get applications with interviews - also check by status to catch interview_scheduled
    const applications = await Application.find({
      job_id: { $in: jobIds },
      $or: [
        { interviews: { $exists: true, $ne: [] } },
        { status: 'interview_scheduled' }
      ]
    })
      .populate({
        path: 'seeker_id',
        select: 'name email profile_image skills job_seeker_profile'
      })
      .populate('job_id', 'title')
      .sort({ createdAt: -1 });
    
    // Transform to interview list
    const interviews: any[] = [];
    
    console.log(`Found ${applications.length} applications with interviews or interview_scheduled status`);
    
    applications.forEach((app: any) => {
      // Convert to plain object if needed
      const appObj = app.toObject ? app.toObject() : app;
      
      console.log(`Processing application ${appObj._id}, status: ${appObj.status}, interviews count: ${appObj.interviews?.length || 0}`);
      
      if (appObj.interviews && appObj.interviews.length > 0) {
        appObj.interviews.forEach((interview: any, index: number) => {
          const scheduledDate = new Date(interview.scheduled_at);
          
          // Extract experience from job_seeker_profile
          let experience = 'Not specified';
          const seeker = appObj.seeker_id;
          if (seeker?.job_seeker_profile?.work_experience && seeker.job_seeker_profile.work_experience.length > 0) {
            const totalYears = seeker.job_seeker_profile.work_experience.reduce((sum: number, exp: any) => {
              const startDate = new Date(exp.start_date);
              const endDate = exp.end_date ? new Date(exp.end_date) : new Date();
              const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
              return sum + years;
            }, 0);
            experience = `${Math.round(totalYears)} years`;
          } else if (seeker?.job_seeker_profile?.total_years_experience) {
            experience = `${seeker.job_seeker_profile.total_years_experience} years`;
          }
          
          // Extract skills
          const skills = seeker?.skills?.map((s: any) => typeof s === 'string' ? s : s.name) || [];
          
          // Get interview ID - handle both _id and id formats, or generate one
          const interviewId = interview._id 
            ? (interview._id.toString ? interview._id.toString() : String(interview._id))
            : (interview.id || `${appObj._id}_${index}`);
          
          interviews.push({
            id: interviewId,
            applicationId: appObj._id.toString(),
            candidate: {
              id: seeker?._id?.toString() || '',
              name: seeker?.name || 'Unknown',
              email: seeker?.email || '',
              avatar: seeker?.profile_image,
              experience: experience,
              skills: skills
            },
            job: {
              id: appObj.job_id?._id?.toString() || '',
              title: appObj.job_id?.title || 'Unknown Job',
              department: ''
            },
            interviewer: {
              id: interview.interviewer_ids?.[0]?.toString() || employerId,
              name: interview.interviewer_names?.[0] || 'Employer',
              email: ''
            },
            scheduledDate: scheduledDate.toISOString().split('T')[0],
            scheduledTime: scheduledDate.toTimeString().split(' ')[0].substring(0, 5),
            duration: interview.duration || 60,
            type: interview.type === 'in_person' ? 'in-person' : interview.type,
            location: interview.location,
            meetingLink: interview.meeting_url,
            status: interview.status || 'scheduled',
            notes: interview.notes,
            feedback: interview.feedback,
            rating: interview.rating
          });
        });
      }
    });
    
    // Sort by scheduled date
    interviews.sort((a, b) => {
      const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime}`);
      const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime}`);
      return dateB.getTime() - dateA.getTime();
    });
    
    res.json(interviews);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
};

// Get hiring pipeline data
export const getHiringPipeline = async (req: any, res: Response) => {
  try {
    const employerId = req.user.uid;
    
    // Get all jobs by this employer
    const employerJobs = await Job.find({ employer_id: employerId }).select('_id title');
    const jobIds = employerJobs.map(job => job._id);
    
    // Get applications with populated data
    const applications = await Application.find({ job_id: { $in: jobIds } })
      .populate('seeker_id', 'name email profile_image skills job_seeker_profile')
      .populate('job_id', 'title department')
      .sort({ createdAt: -1 })
      .lean();
    
    // Map application status to pipeline stage
    const statusToStage: Record<string, string> = {
      'applied': 'applied',
      'under_review': 'screening',
      'shortlisted': 'screening',
      'interview_scheduled': 'interview',
      'interview_completed': 'final',
      'offer_made': 'offer',
      'hired': 'hired',
      'rejected': 'rejected'
    };
    
    // Transform to frontend format
    const pipelineData = applications.map((app: any) => {
      const candidate = app.seeker_id;
      const job = app.job_id;
      
      // Extract experience from job_seeker_profile
      let experience = 'Not specified';
      if (candidate?.job_seeker_profile?.work_experience && candidate.job_seeker_profile.work_experience.length > 0) {
        const totalYears = candidate.job_seeker_profile.work_experience.reduce((sum: number, exp: any) => {
          const startDate = new Date(exp.start_date);
          const endDate = exp.end_date ? new Date(exp.end_date) : new Date();
          const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
          return sum + years;
        }, 0);
        experience = `${Math.round(totalYears)} years`;
      } else if (candidate?.job_seeker_profile?.total_years_experience) {
        experience = `${candidate.job_seeker_profile.total_years_experience} years`;
      }
      
      // Extract skills
      const skills = candidate?.skills?.map((s: any) => typeof s === 'string' ? s : s.name) || [];
      
      // Get interview scheduled date if exists
      let interviewScheduled: string | undefined;
      if (app.interviews && app.interviews.length > 0) {
        const nextInterview = app.interviews.find((i: any) => i.status === 'scheduled');
        if (nextInterview) {
          interviewScheduled = new Date(nextInterview.scheduled_at).toISOString();
        }
      }
      
      return {
        id: app._id.toString(),
        name: candidate?.name || 'Unknown',
        email: candidate?.email || '',
        avatar: candidate?.profile_image,
        experience: experience,
        skills: skills,
        currentStage: statusToStage[app.status] || 'applied',
        appliedAt: app.applied_at || app.createdAt || new Date().toISOString(),
        lastActivity: app.last_activity_at || app.updatedAt || app.createdAt || new Date().toISOString(),
        job: {
          id: job?._id?.toString() || '',
          title: job?.title || 'Unknown Job',
          department: job?.department || ''
        },
        notes: app.employer_notes || app.internal_notes,
        rating: app.evaluation?.overall_score ? Math.round(app.evaluation.overall_score / 20) : undefined, // Convert 0-100 to 1-5
        interviewScheduled: interviewScheduled,
        offerDate: app.offer?.date ? new Date(app.offer.date).toISOString() : undefined
      };
    });
    
    res.json(pipelineData);
  } catch (error) {
    console.error('Error fetching hiring pipeline:', error);
    res.status(500).json({ error: 'Failed to fetch hiring pipeline data' });
  }
};

// Update candidate stage in pipeline
export const updateCandidateStage = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Verify the application belongs to this employer's job
    const job = await Job.findById(application.job_id);
    if (!job || job.employer_id.toString() !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Map pipeline stage back to application status
    const stageToStatus: Record<string, string> = {
      'applied': 'applied',
      'screening': 'under_review',
      'interview': 'interview_scheduled',
      'final': 'interview_completed',
      'offer': 'offer_made',
      'hired': 'hired',
      'rejected': 'rejected'
    };
    
    const newStatus = stageToStatus[stage] || stage;
    application.status = newStatus as any;
    application.last_activity_at = new Date();
    
    // Add to timeline
    if (!application.timeline) {
      application.timeline = [];
    }
    application.timeline.push({
      status: newStatus,
      timestamp: new Date(),
      changed_by: req.user.uid,
      notes: `Moved to ${stage} stage`
    });
    
    await application.save();
    
    res.json(application);
  } catch (error) {
    console.error('Error updating candidate stage:', error);
    res.status(500).json({ error: 'Failed to update candidate stage' });
  }
};

// Get shortlisted candidates for interview scheduling
export const getShortlistedCandidates = async (req: any, res: Response) => {
  try {
    const employerId = req.user.uid;
    
    // Get all jobs by this employer
    const employerJobs = await Job.find({ employer_id: employerId }).select('_id title');
    const jobIds = employerJobs.map(job => job._id);
    
    // Get shortlisted applications
    const applications = await Application.find({
      job_id: { $in: jobIds },
      status: 'shortlisted'
    })
      .populate('seeker_id', 'name email profile_image')
      .populate('job_id', 'title')
      .sort({ createdAt: -1 })
      .lean();
    
    // Transform to candidate list
    const candidates = applications.map((app: any) => ({
      applicationId: app._id,
      candidate: {
        id: app.seeker_id._id,
        name: app.seeker_id.name,
        email: app.seeker_id.email,
        avatar: app.seeker_id.profile_image
      },
      job: {
        id: app.job_id._id,
        title: app.job_id.title
      }
    }));
    
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching shortlisted candidates:', error);
    res.status(500).json({ error: 'Failed to fetch shortlisted candidates' });
  }
};

// Schedule interview
export const scheduleInterview = async (req: any, res: Response) => {
  try {
    const { applicationId, scheduledAt, duration, type, location, meetingUrl, notes } = req.body;
    const employerId = req.user.uid;
    
    if (!applicationId || !scheduledAt || !duration || !type) {
      return res.status(400).json({ error: 'Missing required fields: applicationId, scheduledAt, duration, type' });
    }
    
    // Find the application
    const application = await Application.findById(applicationId)
      .populate('job_id', 'employer_id title');
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Verify the application belongs to this employer's job
    const job = application.job_id as any;
    if (!job || job.employer_id.toString() !== employerId) {
      return res.status(403).json({ error: 'Unauthorized: You can only schedule interviews for your own job postings' });
    }
    
    // Verify application is shortlisted
    if (application.status !== 'shortlisted') {
      return res.status(400).json({ error: 'Can only schedule interviews for shortlisted candidates' });
    }
    
    // Get employer name
    const employer = await User.findById(employerId);
    const employerName = employer?.name || 'Employer';
    
    // Create interview object
    const interview = {
      type: type === 'in-person' ? 'in_person' : type,
      scheduled_at: new Date(scheduledAt),
      duration: parseInt(duration),
      location: location || undefined,
      meeting_url: meetingUrl || undefined,
      interviewer_ids: [employerId],
      interviewer_names: [employerName],
      status: 'scheduled',
      notes: notes || undefined,
      created_at: new Date()
    };
    
    // Add interview to application
    if (!application.interviews) {
      application.interviews = [];
    }
    application.interviews.push(interview);
    
    // Update application status to interview_scheduled
    application.status = 'interview_scheduled';
    
    await application.save();
    
    // Create notification for job seeker
    const { createNotification } = await import('./notification.controller.js');
    const jobTitle = (job as any).title || 'the position';
    const interviewDate = new Date(scheduledAt);
    await createNotification(
      (application.seeker_id as any).toString(),
      'Interview Scheduled',
      `An interview has been scheduled for ${jobTitle} on ${interviewDate.toLocaleDateString()} at ${interviewDate.toLocaleTimeString()}`,
      'interview_scheduled',
      'application',
      { application_id: application._id, interview_id: application.interviews[application.interviews.length - 1]._id }
    );
    
    res.json({
      success: true,
      interview: application.interviews[application.interviews.length - 1],
      application
    });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({ error: 'Failed to schedule interview', message: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Update interview status
export const updateInterviewStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { interviewId, status } = req.body;
    
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Verify the application belongs to this employer's job
    const job = await Job.findById(application.job_id);
    if (!job || job.employer_id.toString() !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // If interviewId is provided, update specific interview
    if (interviewId && application.interviews) {
      const interview = application.interviews.find((int: any) => int._id.toString() === interviewId);
      if (interview) {
        interview.status = status;
        await application.save();
        return res.json({ success: true, interview, application });
      }
    }
    
    // Otherwise, update application status (for backward compatibility)
    application.status = status;
    await application.save();
    
    res.json({ success: true, application });
  } catch (error) {
    console.error('Error updating interview status:', error);
    res.status(500).json({ error: 'Failed to update interview status' });
  }
};
