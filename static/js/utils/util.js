const picsum = (width, height) => {
  return `https://picsum.photos/${width}/${height}`;
};

function validateForm() {
  // get form item value
  let username = $('input[title="username"]').val();
  let email = $('input[title="email"]').val();
  let password = $('input[title="password"]').val();
  let confirmPassword = $('input[title="password_confirm"]').val();
  let permission = $('input[name="permission"]:checked').val();

  let errorMessage = "";

  // validate empty
  if (username.trim() === "") {
    errorMessage += "Please enter your username.\n";
  }

  if (email.trim() === "") {
    errorMessage += "Please enter your email address.\n";
  } else {
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      errorMessage += "Please enter a valid email address.\n";
    }
  }

  // 验证密码是否为空
  if (password.trim() === "") {
    errorMessage += "Please enter your password.\n";
  }
  if (confirmPassword.trim() === "") {
    errorMessage += "Please confirm your password.\n";
  }
  if (password !== confirmPassword) {
    errorMessage += "Passwords do not match.\n";
  }

  // 如果存在错误消息，则显示错误提示并阻止表单提交
  if (errorMessage !== "") {
    alert(errorMessage);
    return false; // 阻止表单提交
  }

  // 如果通过所有校验，则返回 true 允许表单提交
  return true;
}

export default { picsum, validateForm };
