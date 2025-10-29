import { Request, Response } from 'express';
import { SkillAssessment } from '../models/SkillAssessment';
import { SkillTestResult } from '../models/SkillTestResult';
import { User } from '../models/User';

export const getAssessments = async (req: Request, res: Response) => {
  try {
    const { category, difficulty, skill_name } = req.query;
    
    const query: any = { is_active: true };
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (skill_name) query.skill_name = { $regex: skill_name, $options: 'i' };

    const assessments = await SkillAssessment.find(query)
      .populate('created_by', 'name')
      .sort({ created_at: -1 });

    res.json({
      success: true,
      assessments
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assessments'
    });
  }
};

export const getAssessment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const assessment = await SkillAssessment.findById(id)
      .populate('created_by', 'name');
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found'
      });
    }

    res.json({
      success: true,
      assessment
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assessment'
    });
  }
};

export const submitAssessment = async (req: Request, res: Response) => {
  try {
    const { assessment_id, answers, time_taken } = req.body;
    const userId = (req as any).user.uid;
    
    const assessment = await SkillAssessment.findById(assessment_id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    
    const answerDetails = assessment.questions.map((question: any) => {
      const userAnswer = answers[question._id];
      const isCorrect = userAnswer === question.correct_answer;
      const points = question.points || 1;
      
      totalPoints += points;
      if (isCorrect) {
        correctAnswers++;
        earnedPoints += points;
      }
      
      return {
        question_id: question._id,
        answer: userAnswer,
        is_correct: isCorrect,
        time_taken: 0, // Could be calculated per question
        points_earned: isCorrect ? points : 0
      };
    });

    const score = Math.round((earnedPoints / totalPoints) * 100);
    const passed = score >= assessment.passing_score;

    // Check if user already took this assessment
    const existingResult = await SkillTestResult.findOne({
      user_id: userId,
      assessment_id
    });

    if (existingResult) {
      return res.status(400).json({
        success: false,
        error: 'Assessment already completed'
      });
    }

    // Create test result
    const testResult = new SkillTestResult({
      user_id: userId,
      assessment_id,
      skill_name: assessment.skill_name,
      answers: answerDetails,
      total_questions: assessment.total_questions,
      correct_answers: correctAnswers,
      score,
      time_taken,
      passed,
      started_at: new Date(Date.now() - time_taken * 60 * 1000),
      completed_at: new Date()
    });

    await testResult.save();

    // Generate certificate URL if passed
    let certificateUrl = null;
    if (passed) {
      // In a real implementation, you would generate a certificate PDF
      certificateUrl = `/certificates/${testResult._id}.pdf`;
    }

    res.json({
      success: true,
      result: {
        ...testResult.toObject(),
        certificate_url: certificateUrl
      }
    });
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit assessment'
    });
  }
};

export const getUserResults = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.uid;
    
    const results = await SkillTestResult.find({ user_id: userId })
      .populate('assessment_id', 'skill_name category difficulty')
      .sort({ completed_at: -1 });

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error fetching user results:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user results'
    });
  }
};

export const createAssessment = async (req: Request, res: Response) => {
  try {
    const { skill_name, category, description, questions, time_limit, passing_score, difficulty } = req.body;
    const createdBy = (req as any).user.id;
    
    const assessment = new SkillAssessment({
      skill_name,
      category,
      description,
      questions,
      total_questions: questions.length,
      time_limit,
      passing_score,
      difficulty,
      created_by: createdBy
    });

    await assessment.save();
    await assessment.populate('created_by', 'name');

    res.status(201).json({
      success: true,
      assessment
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create assessment'
    });
  }
};

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { skill_name, limit = 10 } = req.query;
    
    const query: any = { passed: true };
    if (skill_name) query.skill_name = skill_name;

    const leaderboard = await SkillTestResult.find(query)
      .populate('user_id', 'name profile_image')
      .sort({ score: -1, time_taken: 1 })
      .limit(Number(limit));

    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard'
    });
  }
};
