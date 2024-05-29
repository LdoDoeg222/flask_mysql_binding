import identity from "../utils/identity.js";

const studentDto = {
  student_id: Number(identity.user_id),
};

const getAssignmentByStudentIdDto = {
  ...studentDto,
};

const getCourseByStudentIdDto = {
  ...studentDto,
};

const enterEnrollmentDto = {
  ...studentDto,
  lecture_id: 1,
  academic_year: 1,
};

const getAllLectureByCourseIdDto = {
  course_id: 1,
};

const getSubmitWorkByStudentIdDto = {
  ...studentDto,
};

const submitWorkDto = {
  lecture_id: 1,
  title: 1,
  ...studentDto,
  // submit_time: "",
};

export {
  getAssignmentByStudentIdDto,
  getCourseByStudentIdDto,
  enterEnrollmentDto,
  getAllLectureByCourseIdDto,
  getSubmitWorkByStudentIdDto,
  submitWorkDto,
};
