const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID');

const gradeFields = {
  student: objectId,
  course: objectId,
  assessment: z.string().trim().min(1).max(100),
  marksObtained: z.coerce.number().min(0),
  maxMarks: z.coerce.number().positive()
};

module.exports = {
  create: {
    body: z.object(gradeFields).strict()
      .refine(
        data => data.marksObtained <= data.maxMarks,
        {
          message: 'Marks obtained cannot exceed maximum marks',
          path: ['marksObtained']
        }
      )
  },
  list: {
    query: z.object({
      student: objectId.optional(),
      course: objectId.optional(),
      assessment: z.string().optional()
    })
  },
  get: {
    params: z.object({ id: objectId })
  },
  update: {
    params: z.object({ id: objectId }),
    body: z.object({
      assessment: gradeFields.assessment.optional(),
      marksObtained: gradeFields.marksObtained.optional(),
      maxMarks: gradeFields.maxMarks.optional()
    }).strict().refine(
      data => Object.keys(data).length > 0,
      'At least one field is required'
    )
  }
};
