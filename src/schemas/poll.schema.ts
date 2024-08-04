import { z } from 'zod';

export const PollSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(255, 'Title must be 255 characters or less'),
  question: z
    .string()
    .min(1, 'Question is required')
    .max(1000, 'Question must be 1000 characters or less'),
  options: z.array(z.string()).min(2, 'At least two options are required'),
  createdAt: z.date(),
  updatedAt: z.date(),
  startTime: z.date().nullable(),
  endTime: z.date().nullable(),
  duration: z.number().int().positive('Duration must be a positive integer'),
  isActive: z.boolean(),
  createdBy: z.string().uuid(),
});

export const CreatePollSchema = PollSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  startTime: true,
  endTime: true,
  isActive: true,
  createdBy: true,
});

export const UpdatePollSchema = CreatePollSchema.partial();

export const AnswerSchema = z.object({
  id: z.string().uuid(),
  pollId: z.string().uuid(),
  // userId: z.string().uuid(),
  // option: z.string(),
  createdAt: z.date(),
});

export const CreateAnswerSchema = AnswerSchema.omit({
  id: true,
  createdAt: true,
});

export const StartPollSchema = z.object({
  pollId: z.string().uuid(),
});

export type Poll = z.infer<typeof PollSchema>;
export type CreatePollDto = z.infer<typeof CreatePollSchema>;
export type UpdatePollDto = z.infer<typeof UpdatePollSchema>;
export type Answer = z.infer<typeof AnswerSchema>;
export type CreateAnswerDto = z.infer<typeof CreateAnswerSchema>;
export type StartPollDto = z.infer<typeof StartPollSchema>;

export const CreatePollValidationSchema = CreatePollSchema;
export const UpdatePollValidationSchema = UpdatePollSchema;
export const CreateAnswerValidationSchema = CreateAnswerSchema.extend({
  pollId: z.string().uuid('Invalid poll ID'),
  option: z.string().min(1, 'Answer is required'),
});
