const Assignment = require('../../models/Assignment');
const Course = require('../../models/Course');
const AppError = require('../../utils/AppError');

exports.create = async (data, userId) => {
  const course = await Course.findById(data.course);

  if (!course) {
    throw new AppError(404, 'Course not found');
  }

  return Assignment.create({
    ...data,
    createdBy: userId
  });
};

exports.list = async (query) => {
  const filter = {};

  if (query.course) {
    filter.course = query.course;
  }

  return Assignment.find(filter)
    .populate('course', 'title code')
    .sort({ dueDate: 1, createdAt: -1 });
};

exports.get = async (id) => {
  const assignment = await Assignment.findById(id)
    .populate('course', 'title code');

  if (!assignment) {
    throw new AppError(404, 'Assignment not found');
  }

  return assignment;
};

exports.update = async (id, data) => {
  if (data.course) {
    const course = await Course.findById(data.course);

    if (!course) {
      throw new AppError(404, 'Course not found');
    }
  }

  const assignment = await Assignment.findByIdAndUpdate(
    id,
    data,
    { new: true, runValidators: true }
  ).populate('course', 'title code');

  if (!assignment) {
    throw new AppError(404, 'Assignment not found');
  }

  return assignment;
};

exports.remove = async (id) => {
  const assignment = await Assignment.findByIdAndDelete(id);

  if (!assignment) {
    throw new AppError(404, 'Assignment not found');
  }
};
