// Central registry so every model is registered once (no duplicate models).
module.exports = {
  User: require('./User'),
  Student: require('./Student'),
  Faculty: require('./Faculty'),
  FacultyCourseAssignment: require('./FacultyCourseAssignment'),
  Department: require('./Department'),
  Course: require('./Course'),
  Enrollment: require('./Enrollment'),
  Attendance: require('./Attendance'),
  Grade: require('./Grade'),
  Submission: require('./Submission'),
};
