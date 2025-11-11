import multer from 'multer';
import { Request } from 'express';

/**
 * Configure multer for memory storage
 * Files are stored in memory as buffers (no disk I/O)
 */
const storage = multer.memoryStorage();

/**
 * File filter for documents only
 * Allows: PDF, DOC, DOCX
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
  }
};

/**
 * Multer middleware for document uploads
 * - Max file size: 10MB
 * - Memory storage (no disk writes)
 * - File type validation
 */
export const uploadDocument = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

