/**
 * @param {boolean} isSuccess is Method successful?
 * @param {any} data data return
 * @param {string} msg message return
 */
class Res {
  /**
   * @param {string} msg message return
   * @param {boolean} isSuccess is Method success?
   * @param {any} data data return
   */
  constructor(msg = "", isSuccess = false, data = null) {
    this.msg = msg;
    this.isSuccess = isSuccess;
    this.data = data;
  }
}

export default Res;
