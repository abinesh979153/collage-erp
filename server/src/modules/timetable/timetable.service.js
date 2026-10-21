const Timetable = require('../../models/Timetable');
const Course = require('../../models/Course');
const AppError = require('../../utils/AppError');

exports.create = async (data, userId) => {
  const course = await Course.findById(data.courseId);

  if (!course) {
    throw new AppError(404, 'Course not found');
  }

  return Timetable.create({
    day: data.day,
    period: data.period,
    course: data.courseId,
    room: data.room,
    createdBy: userId
  });
};

exports.list = async (query) => {
  const filter = {};

  if (query.day) filter.day = query.day;
  if (query.courseId) filter.course = query.courseId;

  return Timetable.find(filter)
    .populate('course', 'title code')
    .sort({ day: 1, period: 1 });
};

exports.get = async (id) => {
  const item = await Timetable.findById(id)
    .populate('course', 'title code');

  if (!item) {
    throw new AppError(404, 'Timetable entry not found');
  }

  return item;
};

exports.update = async (id, data) => {
  const changes = { ...data };

  if (changes.courseId) {
    const course = await Course.findById(changes.courseId);

    if (!course) {
      throw new AppError(404, 'Course not found');
    }

    changes.course = changes.courseId;
    delete changes.courseId;
  }

  const item = await Timetable.findByIdAndUpdate(
    id,
    { $set: changes },
    { new: true, runValidators: true }
  ).populate('course', 'title code');

  if (!item) {
    throw new AppError(404, 'Timetable entry not found');
  }

  return item;
};

exports.remove = async (id) => {
  const item = await Timetable.findByIdAndDelete(id);

  if (!item) {
    throw new AppError(404, 'Timetable entry not found');
  }
};
