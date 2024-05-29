const createAssignmentDto = {
  lecture_id: "",
  title: "",
  deadline: "",
  description: "",
};

const updateAssignmentDto = {
  lecture_id: "",
  title: "",
  deadline: "",
  description: "",
  is_delete: false,
};

const getCourseAndLectureDto = {
  instructor_id: "",
};

const createLectureDto = {
  instructor_id: "",
  course_id: "",
  time: null,
  lecture_name: "",
};

const getStudentByInstructorIdDto = { instructor_id: "" };

const getSubmitWorkByInstructorIdDto = { instructor_id: "" };

const updateSubmissionDto = { id: "", description: "" };

export {
  createAssignmentDto,
  updateAssignmentDto,
  getCourseAndLectureDto,
  createLectureDto,
  getStudentByInstructorIdDto,
  getSubmitWorkByInstructorIdDto,
  updateSubmissionDto,
};
