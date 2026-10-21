const Student = require('../../models/Student');
const Faculty = require('../../models/Faculty');
const Attendance = require('../../models/Attendance');
const Grade = require('../../models/Grade');
const FeeLedger = require('../../models/FeeLedger');
const LibraryBook = require('../../models/LibraryBook');

const reports = {
  students: {
    model: Student,
    fields: ['name', 'rollNo', 'email', 'department', 'year', 'createdAt']
  },
  faculty: {
    model: Faculty,
    fields: ['name', 'email', 'department', 'designation', 'createdAt']
  },
  attendance: {
    model: Attendance,
    fields: ['student', 'course', 'date', 'status', 'createdAt'],
    populate: [
      { path: 'student', select: 'name rollNo' },
      { path: 'course', select: 'code title' }
    ]
  },
  grades: {
    model: Grade,
    fields: ['student', 'course', 'assessment', 'marksObtained', 'maxMarks', 'createdAt'],
    populate: [
      { path: 'student', select: 'name rollNo' },
      { path: 'course', select: 'code title' }
    ]
  },
  fees: {
    model: FeeLedger,
    fields: ['studentId', 'description', 'amount', 'type', 'createdAt'],
    populate: [
      { path: 'studentId', select: 'name rollNo' }
    ]
  },
  library: {
    model: LibraryBook,
    fields: ['title', 'author', 'isbn', 'copies', 'createdAt']
  }
};

function cell(value) {
  if (value == null) return '';
  if (value instanceof Date) value = value.toISOString();
  else if (typeof value === 'object') {
    value = value.name
      ? `${value.name}${value.rollNo ? ` (${value.rollNo})` : ''}`
      : value.title
        ? `${value.code ? `${value.code} ` : ''}${value.title}`
        : JSON.stringify(value);
  }

  const text = String(value);
  return /[",\r\n]/.test(text)
    ? `"${text.replace(/"/g, '""')}"`
    : text;
}

async function exportCsv(type) {
  const config = reports[type];
  if (!config) {
    const error = new Error('Unsupported report type');
    error.statusCode = 400;
    throw error;
  }

  let query = config.model.find({}).select(config.fields.join(' '));

  for (const item of config.populate || []) {
    query = query.populate(item);
  }

  const records = await query.sort({ createdAt: -1 }).lean();
  const lines = [
    config.fields.join(','),
    ...records.map(record =>
      config.fields.map(field => cell(record[field])).join(',')
    )
  ];

  return lines.join('\r\n') + '\r\n';
}

module.exports = { exportCsv };
