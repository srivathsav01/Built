import { z } from "zod";


export const ReportDTOSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  date: z.date(),
  
  bodyWeight: z.number().positive().optional(), 
  bodyFatPercentage: z.number().min(0).max(100).optional(), 
  muscleMass: z.number().positive().optional(), 
  bodyWater: z.number().positive().optional(), 
  boneMass: z.number().positive().optional(), 
  protein: z.number().positive().optional(), 
  minerals: z.number().positive().optional(), 
  
  
  bmi: z.number().positive().optional(),
  
  
  bmr: z.number().positive().optional(), 
  
  
  rightArmMuscleMass: z.number().positive().optional(), 
  leftArmMuscleMass: z.number().positive().optional(), 
  trunkMuscleMass: z.number().positive().optional(), 
  rightLegMuscleMass: z.number().positive().optional(), 
  leftLegMuscleMass: z.number().positive().optional(), 
  
  
  bodyFatMass: z.number().positive().optional(), 
  
  
  visceralFatLevel: z.number().min(0).optional(),
  
  
  skeletalMuscleMass: z.number().positive().optional(), 
  
  
  imageUrl: z.string().url().optional(),
  notes: z.string().optional(),
  
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type ReportDTO = z.infer<typeof ReportDTOSchema>;

export const CreateReportDTOSchema = ReportDTOSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateReportDTO = z.infer<typeof CreateReportDTOSchema>;

export const UpdateReportDTOSchema = ReportDTOSchema.partial().required({
  id: true,
});

export type UpdateReportDTO = z.infer<typeof UpdateReportDTOSchema>;


export const ReportSummaryDTOSchema = ReportDTOSchema.pick({
  id: true,
  userId: true,
  date: true,
  bodyWeight: true,
  bodyFatPercentage: true,
  bmi: true,
  createdAt: true,
  updatedAt: true,
});

export type ReportSummaryDTO = z.infer<typeof ReportSummaryDTOSchema>;
