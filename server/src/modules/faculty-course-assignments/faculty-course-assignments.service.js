const FacultyCourseAssignment = require('../../models/FacultyCourseAssignment');
const Faculty = require('../../models/Faculty');
const Course = require('../../models/Course');
const AppError = require('../../utils/AppError');

exports.create = async (data, userId) => {
  const [faculty, course] = await Promise.all([
    Faculty.findById(data.faculty),
    Course.findById(data.course)
  ]);

  if (!faculty) throw new AppError(404, 'Faculty not found');
  if (!course) throw new AppError(404, 'Course not found');

  return FacultyCourseAssignment.create({
    faculty: faculty._id,
    course: course._id,
    assignedBy: userId
  });
};

exports.list = async () => {
  return FacultyCourseAssignment.find()
    .populate('faculty', 'name email department designation')
    .populate('course', 'title code department')
    .populate('assignedBy', 'name email')
    .sort({ createdAt: -1 });
};

exports.remove = async (id) => {
  const assignment = await FacultyCourseAssignment.findByIdAndDelete(id);

  if (!assignment) {
    throw new AppError(404, 'Faculty-course assignment not found');
  }
};
