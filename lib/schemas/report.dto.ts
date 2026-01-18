import { z } from "zod";

/**
 * InBody Report DTO Schema for validation
 */
export const ReportDTOSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  date: z.date(),
  
  // Body Composition Metrics
  bodyWeight: z.number().positive().optional(), // kg
  bodyFatPercentage: z.number().min(0).max(100).optional(), // %
  muscleMass: z.number().positive().optional(), // kg
  bodyWater: z.number().positive().optional(), // kg
  boneMass: z.number().positive().optional(), // kg
  protein: z.number().positive().optional(), // kg
  minerals: z.number().positive().optional(), // kg
  
  // Body Mass Index
  bmi: z.number().positive().optional(),
  
  // Basal Metabolic Rate
  bmr: z.number().positive().optional(), // kcal
  
  // Segmental Analysis (optional)
  rightArmMuscleMass: z.number().positive().optional(), // kg
  leftArmMuscleMass: z.number().positive().optional(), // kg
  trunkMuscleMass: z.number().positive().optional(), // kg
  rightLegMuscleMass: z.number().positive().optional(), // kg
  leftLegMuscleMass: z.number().positive().optional(), // kg
  
  // Body Fat Mass
  bodyFatMass: z.number().positive().optional(), // kg
  
  // Visceral Fat Level
  visceralFatLevel: z.number().min(0).optional(),
  
  // Skeletal Muscle Mass
  skeletalMuscleMass: z.number().positive().optional(), // kg
  
  // Additional metadata
  imageUrl: z.string().url().optional(),
  notes: z.string().optional(),
  
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Report DTO TypeScript type
 */
export type ReportDTO = z.infer<typeof ReportDTOSchema>;

/**
 * Create Report DTO Schema (for creating new reports, without id and timestamps)
 */
export const CreateReportDTOSchema = ReportDTOSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateReportDTO = z.infer<typeof CreateReportDTOSchema>;

/**
 * Update Report DTO Schema (all fields optional except id)
 */
export const UpdateReportDTOSchema = ReportDTOSchema.partial().required({
  id: true,
});

export type UpdateReportDTO = z.infer<typeof UpdateReportDTOSchema>;

/**
 * Report Summary DTO (for listing/reduced data)
 */
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
