import { Request, Response } from 'express';
import { Company } from '../models/Company';
import { Job } from '../models/Job';
import { User } from '../models/User';

export const getCompanyBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const company = await Company.findOne({ slug, status: 'active' })
      .populate('employer_id', 'name email profile_image');
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    res.json({
      success: true,
      company
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company'
    });
  }
};

export const getCompanyJobs = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    
    const company = await Company.findOne({ slug, status: 'active' });
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    const jobs = await Job.find({ 
      employer_id: company.employer_id, 
      is_active: true 
    })
    .populate('employer_id', 'name')
    .sort({ posted_at: -1 });

    res.json({
      success: true,
      jobs
    });
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company jobs'
    });
  }
};

export const createCompany = async (req: Request, res: Response) => {
  try {
    const { employer_id, ...companyData } = req.body;
    
    // Check if company already exists for this employer
    const existingCompany = await Company.findOne({ employer_id });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        error: 'Company profile already exists for this employer'
      });
    }

    const company = new Company({
      ...companyData,
      employer_id
    });
    
    await company.save();
    
    res.status(201).json({
      success: true,
      company
    });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create company'
    });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const updates = req.body;
    
    const company = await Company.findOneAndUpdate(
      { slug },
      { ...updates, updated_at: new Date() },
      { new: true }
    ).populate('employer_id', 'name email profile_image');
    
    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    res.json({
      success: true,
      company
    });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update company'
    });
  }
};

export const getAllCompanies = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, industry, company_size, search } = req.query;
    
    const query: any = { status: 'active' };
    
    if (industry) query.industry = industry;
    if (company_size) query.company_size = company_size;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const companies = await Company.find(query)
      .populate('employer_id', 'name profile_image')
      .sort({ created_at: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Company.countDocuments(query);

    res.json({
      success: true,
      companies,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / Number(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch companies'
    });
  }
};
