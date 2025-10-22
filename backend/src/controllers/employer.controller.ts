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
    const employerJobs = await Job.find({ employer_id: employerId }).select('_id');
    const jobIds = employerJobs.map(job => job._id);
    
    const interviews = await Application.find({
      job_id: { $in: jobIds },
      status: { $in: ['interview', 'shortlisted'] }
    })
      .populate('seeker_id', 'name email')
      .populate('job_id', 'title')
      .sort({ createdAt: -1 })
      .lean();
    
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
    const employerJobs = await Job.find({ employer_id: employerId }).select('_id');
    const jobIds = employerJobs.map(job => job._id);
    
    const pipelineData = await Application.aggregate([
      { $match: { job_id: { $in: jobIds } } },
      {
        $lookup: {
          from: 'users',
          localField: 'seeker_id',
          foreignField: '_id',
          as: 'candidate'
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: 'job_id',
          foreignField: '_id',
          as: 'job'
        }
      },
      {
        $project: {
          _id: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          candidate: { $arrayElemAt: ['$candidate', 0] },
          job: { $arrayElemAt: ['$job', 0] }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);
    
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
    
    application.status = stage;
    await application.save();
    
    res.json(application);
  } catch (error) {
    console.error('Error updating candidate stage:', error);
    res.status(500).json({ error: 'Failed to update candidate stage' });
  }
};

// Update interview status
export const updateInterviewStatus = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // For now, we'll treat interviews as applications with interview status
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ error: 'Interview not found' });
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
    console.error('Error updating interview status:', error);
    res.status(500).json({ error: 'Failed to update interview status' });
  }
};
