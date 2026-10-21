const { User, Student, Faculty, FacultyCourseAssignment } = require('../../models');
const Submission = require('../../models/Submission');
const Assignment = require('../../models/Assignment');
const Enrollment = require('../../models/Enrollment');
const AppError = require('../../utils/AppError');

async function requireStudent(user) {
  const student = await Student.findOne({ email: user.email });
  if (!student) throw new AppError(403, 'Student profile not found for this account');
  return student;
}

async function requireFaculty(user) {
  const faculty = await Faculty.findOne({ user: user.id });
  if (!faculty) throw new AppError(403, 'Faculty profile not linked to this account');
  return faculty;
}

async function canAccess(user, submission) {
  if (user.role === 'admin') return true;

  if (user.role === 'student') {
    const student = await requireStudent(user);
    return String(submission.student) === String(student._id);
  }

  if (user.role === 'faculty') {
    const faculty = await requireFaculty(user);
    const assignment = await Assignment.findById(submission.assignment).select('course');
    if (!assignment) return false;

    return Boolean(await FacultyCourseAssignment.exists({
      faculty: faculty._id,
      course: assignment.course
    }));
  }

  return false;
}

function populateSubmission(query) {
  return query
    .populate('assignment', 'title dueDate course')
    .populate({ path: 'assignment', populate: { path: 'course', select: 'title code' } })
    .populate('student', 'name rollNo email');
}

exports.create = async (data, user) => {
  if (user.role !== 'student') {
    throw new AppError(403, 'Only students can submit assignments');
  }

  const student = await requireStudent(user);
  const assignment = await Assignment.findById(data.assignmentId);
  if (!assignment) throw new AppError(404, 'Assignment not found');

  const enrollment = await Enrollment.findOne({
    student: student._id,
    course: assignment.course,
    status: 'active'
  });
  if (!enrollment) {
    throw new AppError(403, 'Active enrollment in this assignment course is required');
  }

  const existing = await Submission.findOne({
    assignment: assignment._id,
    student: student._id
  });
  if (existing) throw new AppError(409, 'Submission already exists for this assignment');

  const submission = await Submission.create({
    assignment: assignment._id,
    student: student._id,
    content: data.content
  });

  return populateSubmission(Submission.findById(submission._id));
};

exports.list = async (query, user) => {
  const filter = {};

  if (user.role === 'student') {
    const student = await requireStudent(user);
    filter.student = student._id;
  } else if (user.role === 'faculty') {
    const faculty = await requireFaculty(user);
    const links = await FacultyCourseAssignment.find({ faculty: faculty._id }).select('course');
    const courseIds = links.map(link => link.course);

    const assignments = await Assignment.find({ course: { $in: courseIds } }).select('_id');
    filter.assignment = { $in: assignments.map(item => item._id) };
  } else if (user.role !== 'admin') {
    throw new AppError(403, 'Insufficient permissions');
  }

  if (query.assignmentId) {
    const assignment = await Assignment.findById(query.assignmentId).select('course');
    if (!assignment) throw new AppError(404, 'Assignment not found');

    if (user.role === 'faculty') {
      const faculty = await requireFaculty(user);
      const linked = await FacultyCourseAssignment.exists({
        faculty: faculty._id,
        course: assignment.course
      });
      if (!linked) throw new AppError(403, 'Course is not assigned to this faculty');
    }

    filter.assignment = query.assignmentId;
  }

  if (query.studentId && user.role === 'admin') {
    filter.student = query.studentId;
  }

  return populateSubmission(Submission.find(filter).sort({ submittedAt: -1 }));
};

exports.get = async (id, user) => {
  const submission = await Submission.findById(id);
  if (!submission) throw new AppError(404, 'Submission not found');

  if (!(await canAccess(user, submission))) {
    throw new AppError(403, 'You cannot access this submission');
  }

  return populateSubmission(Submission.findById(id));
};

exports.update = async (id, data, user) => {
  const submission = await Submission.findById(id);
  if (!submission) throw new AppError(404, 'Submission not found');

  if (user.role !== 'student') {
    throw new AppError(403, 'Only the owning student can update a submission');
  }

  if (!(await canAccess(user, submission))) {
    throw new AppError(403, 'You cannot update this submission');
  }

  submission.content = data.content;
  submission.submittedAt = new Date();
  await submission.save();

  return populateSubmission(Submission.findById(id));
};
