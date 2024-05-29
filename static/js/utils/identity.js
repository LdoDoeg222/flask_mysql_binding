const identity = {
  type: -1, // DONE
  // type: 0, // Home Done
  // type: 1,
  // type: 2, // DONE
  user_id: Number.parseInt(1),
  username: "",

  // for student
  Courses: [],
  Lectures: [],
  Assignments: [],
  Submissions: [],
  nowSubmission: {},
  Feedback: {
    feedback: {
      submission_id: 0,
    },
  },
  StudentList: [],

  isAccess: false,
  type_id: ["student", "instructor", "admin"],

  setLoggedIn() {
    localStorage.setItem(
      "userdata",
      JSON.stringify({
        type: this.type,
        user_id: this.user_id,
        username: this.username,
      })
    );
  },

  checkLocalLoggedIn() {
    if (localStorage.getItem("userdata")) {
      const userdata = JSON.parse(localStorage.getItem("userdata"));
      this.type = userdata.type;
      this.user_id = Number.parseInt(userdata.user_id);
      this.username = userdata.username;
    }
  },

  logout() {
    localStorage.removeItem("userdata");
    this.type = -1;
    this.user_id = Number.parseInt(1);
    this.username = "";
  },
};

export default identity;
