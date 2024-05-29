const addCourseDto = {
  course_name: "",
  description: "",
};

const deleteCourseDto = {
  id: "",
};

const editCourseDto = {
  id: "",
  course_name: "",
  description: "",
};

const decideEnterEnrollmentDto = {
  id: "",
  condition: "",
};

const addLectureDto = {
  instructor_id: "",
  course_id: "",
  time: null, // Optional
  lecture_name: "",
};

const deleteLectureDto = {
  id: "",
};

const editLectureDto = {
  id: "",
  time: null,
  lecture_name: "",
  status: "",
  is_delete: false,
};

const addUserDto = {
  username: "",
  password: "",
  phone: "",
  email: "",
  major: "",
  department: "",
  type: 0,
};

const deleteUserDto = {
  id: "",
  type: 0,
};

const editUserDto = {
  id: "",
  username: "",
  password: "",
  phone: "",
  email: "",
  major: "",
  type: 0,
};

export {
  addCourseDto,
  deleteCourseDto,
  editCourseDto,
  decideEnterEnrollmentDto,
  addLectureDto,
  deleteLectureDto,
  editLectureDto,
  addUserDto,
  deleteUserDto,
  editUserDto,
};
