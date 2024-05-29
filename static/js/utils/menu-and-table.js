/**
 * 需求：菜单+表格
 * 1. （默认触发）点击 menu-item 后，触发点击事件
 * 2. 点击事件触发后，拉取数据，显示在 table 上
 * 结构：
 * section1.menu > div.menu-item
 * section2>table>thead+tbody
 * section3>div>button.prev-btn+input.page-number+span+input[disabled].total-page+button.next-btn
 * 注释：
 * 1. 需要的外部数据：
 *   1.1 菜单名
 *   1.2 获取数据的方法
 * 流程：
 * 1. 用户触发菜单点击
 **/

import Res from "../types/res.js";

/**
 * @brief 用于统一创建操作回调函数的闭包函数。
 * @description 这个函数将允许使用者通过回调函数，统一创建并返回一个可以用于操作 td DOM 的操作函数
 *
 * @param {($td: JQuery<HTMLTableCellElement>,
 * other:{tableController: typeof tableController, dataIndex: number}) => void} modifyFunc
 */
const createOperationFunc = (modifyFunc) => {
  return ($td, other) => {
    modifyFunc($td, other);
  };
};

class MenuAndTable {
  // #region 成员
  /**
   * @type {string}
   */
  menu_title = "";

  /**
   * @type {()=>Promise<Res>}
   */
  getDataFunc = async () => new Res();
  /**
   * @type {()=>Promise<Res>}
   */
  addDataFunc = async () => new Res();

  /**
   * @type {object[]}
   */
  data_list = [];

  /**
   * @type {()=>Promise<Res>[]}
   * @description 需要添加操作函数时，将目标添加到下方数组
   */
  operationFuncList = [];
  // #endregion

  /**
   * @param {string} menu_title
   * @param {()=>Promise<Res>} getDataFunc
   * @param {()=>{}[]} operationFuncList
   * @param {()=>Promise<Res>} addDataFunc
   */
  constructor(
    menu_title,
    getDataFunc,
    operationFuncList = [],
    addDataFunc = null
  ) {
    this.menu_title = menu_title;
    this.getDataFunc = getDataFunc;
    this.operationFuncList = operationFuncList;
    this.addDataFunc = addDataFunc;
  }
  setDataList(data_list) {
    this.data_list = data_list;
  }
}

const tableController = {
  //#region table Config
  tableConfig: {
    row_limit: 20,
    need_prettier: true,
    init_menu_index: 0,
  },
  setTableConfig(config) {
    this.tableConfig.row_limit = config.row_limit || 20;
    this.tableConfig.need_prettier = config.need_prettier || true;
    this.tableConfig.menu_class = undefined;
    this.tableConfig.init_menu_index = config.init_menu_index || 0;
  },
  //#endregion

  //#region table arguments
  menu_index: -1,

  /**@type {MenuAndTable} */
  menu_and_table: null,
  table_item_keys: [],

  page_amount: -1,
  key_amount: -1,
  //#endregion

  pagination: {
    set page_index(pg_idx) {
      if (pg_idx < 1) {
        this.pg_idx = 1;
      } else if (1 <= pg_idx && pg_idx <= tableController.page_amount) {
        this.pg_idx = pg_idx;
      } else if (tableController.page_amount < pg_idx) {
        this.pg_idx = tableController.page_amount;
      }
      this.pageIndicator.val(this.pg_idx);
      tableController.renderTable(this.pg_idx);
    },
    get page_index() {
      return this.pg_idx;
    },

    prevBtn: $("section:nth-child(3)>div>button.prev-btn"),
    nextBtn: $("section:nth-child(3)>div>button.next-btn"),
    pageIndicator: $("section:nth-child(3)>div>input.page-number"),
    totalPage: $("section:nth-child(3)>div>input.total-page"),

    initPagination() {
      // #region static initial
      this.page_index = 1;
      this.prevBtn.off("click");
      this.prevBtn.on("click", () => {
        this.page_index = this.page_index - 1;
      });
      this.nextBtn.off("click");
      this.nextBtn.on("click", () => {
        this.page_index = this.page_index + 1;
      });
      this.totalPage.val(tableController.page_amount);
      // #endregion

      this.pageIndicator.removeAttr("disabled");
      this.pageIndicator.on("change", (ev) => {
        const target_page_index = ev.target.val();
        this.page_index = target_page_index;
        this.pageIndicator.val(actual_page_index);
      });
    },
  },

  setTableData(menu_index, menu_and_table) {
    this.menu_index = menu_index;

    this.menu_and_table = menu_and_table;
    this.page_amount = Math.ceil(
      this.menu_and_table.data_list.length / this.tableConfig.row_limit
    );
    if (this.menu_and_table.data_list.length != 0)
      this.table_item_keys = Object.keys(this.menu_and_table.data_list[0]);
    else this.table_item_keys = ["No data"];
    this.key_amount = this.table_item_keys.length;

    this.page_index = 1;
  },

  addData(dataObj, dataIndex = null) {
    if (!dataIndex) this.menu_and_table.data_list.push(dataObj);
    else this.menu_and_table.data_list.splice(dataIndex, 0, dataObj);
    this.renderTable(this.pagination.page_index);
  },
  updateData(dataIndex, dataObj) {
    this.menu_and_table.data_list[dataIndex] = dataObj;
    this.renderTable(this.pagination.page_index);
  },
  deleteData(dataIndex) {
    this.menu_and_table.data_list.splice(dataIndex, 1);
    this.renderTable(this.pagination.page_index);
  },
  refreshData() {
    this.menu_and_table.getDataFunc().then((res) => {
      if (res.isSuccess) {
        this.menu_and_table.data_list = res.data;
        this.renderTable(this.pagination.page_index);
      }
    });
  },

  constructTable() {
    const $thead = $("section:nth-child(2)>table>thead");

    const $headTr = $(`<tr></tr>`);
    $thead.empty();
    $thead.append($headTr);

    for (let i = 0; i < this.key_amount; i++) {
      const key = this.table_item_keys[i];
      const $th = $(`<th>${key}</th>`);
      $headTr.append($th);
    }

    // 存在操作函数列表时
    if (this.menu_and_table.operationFuncList.length > 0) {
      const $th = $(
        `<th colspan="${this.menu_and_table.operationFuncList.length}">Operation</th>`
      );
      $headTr.append($th);
    }

    const $tbody = $("section:nth-child(2)>table>tbody");
    $tbody.empty();
    for (let i = 0; i < this.tableConfig.row_limit; i++) {
      const $newTr = $(`<tr></tr>`);
      $tbody.append($newTr);

      for (let j = 0; j < this.key_amount; j++) {
        const $td = $(`<td></td>`);
        $newTr.append($td);
      }
      for (let j = 0; j < this.menu_and_table.operationFuncList.length; j++) {
        const $td = $(`<td></td>`);
        $newTr.append($td);
      }
    }

    if (this.menu_and_table.addDataFunc !== null) {
      const $table = $(`section:nth-child(2)>table`);
      const $div = $(`<div class="addBtn-container"></div>`);
      const $addButton = $(`<button class="add-btn">Add</button>`);
      $(".addBtn-container").remove();
      $div.html($addButton);
      $table.before($div);

      $addButton.off("click").on("click", () => {
        const dialog = document.querySelector("dialog");
        const form = dialog.querySelector("form");
        const $form = $(form);
        $form.empty();
        $form.off("submit").on("submit", (ev) => ev.preventDefault());

        const keys = this.table_item_keys;
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const $form_item = $(
            `<div>
            ${
              key === "ID"
                ? ""
                : `<label>${key}</label><input type="${
                    key === "Time" ? "datetime-local" : key
                  }" name="${key}">`
            }
            </div>`
          );
          $form.append($form_item);
        }

        const $msgDiv = $(`<div></div>`);
        const $msgSpan = $(`<span style="color:red"></span>`);
        $msgDiv.append($msgSpan);
        $form.append($msgDiv);

        const $btnDiv = $(`<div></div>`);
        const $confirmBtn = $(`<button class="confirm-btn">Confirm</button>`);
        const $cancelBtn = $(`<button class="cancel-btn">Cancel</button>`);
        $form.append($btnDiv);
        $btnDiv.append($confirmBtn, $cancelBtn);

        $confirmBtn.off("click").on("click", async () => {
          const dto = {};
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const $input = $form.find(`input[name="${key}"]`);
            dto[key] = $input.val();
          }

          const { isSuccess, msg } = await this.menu_and_table.addDataFunc(dto);
          if (isSuccess) {
            dialog.close();
            this.refreshData();
          } else {
            $msgSpan.text(msg);
          }
        });

        $cancelBtn.off("click").on("click", () => dialog.close());
        dialog.showModal();
      });
    }
  },

  renderTable(page_index = 1) {
    // 渲染表格，需要考虑的有：
    // 1. 所需渲染的数据列表，2. 操作函数列表，3. 当前页索引
    const indent = (page_index - 1) * this.tableConfig.row_limit;
    const dataToRender = this.menu_and_table.data_list.slice(
      indent,
      indent + this.tableConfig.row_limit > this.menu_and_table.data_list.length
        ? this.menu_and_table.data_list.length
        : indent + this.tableConfig.row_limit
    );

    const $tbody = $("section:nth-child(2)>table>tbody");
    $tbody.find("td").empty();
    for (let i = 0; i < dataToRender.length; i++) {
      const $tr = $tbody.children().eq(i);
      for (let j = 0; j < this.key_amount; j++) {
        const $td = $tr.children().eq(j);
        const key = this.table_item_keys[j];
        const data = dataToRender[i][key];
        $td.text(data);
      }

      // NOTICE: 遍历操作函数列表，调用操作函数
      for (let j = 0; j < this.menu_and_table.operationFuncList.length; j++) {
        const $td = $tr.children().eq(j + this.key_amount);
        this.menu_and_table.operationFuncList[j]($td, {
          tableController,
          dataIndex: indent + i,
        });
      }
    }
    if (this.tableConfig.need_prettier) this.prettierTable();
  },

  prettierTable() {
    const $section2 = $(".list-and-table section:nth-child(2)");
    const $table = $section2.find(`table`);
    const $addBtnContainer = $section2.find(`.addBtn-container`);

    $table.height($section2.height() - $addBtnContainer.height());

    $table.find(`tr`).height(`${100 / this.row_limit + 1}%`);
    $table
      .find(`th`)
      .width(
        `${
          100 / (this.key_amount + this.menu_and_table.operationFuncList.length)
        }%`
      );
  },
};

/**
 * @description 初始化菜单并为菜单项绑定表格的函数
 * @param {MenuAndTable[]} menu_and_table_list
 * @param {{row_limit: number, need_prettier: boolean, menu_class: string, init_menu_index: number}} config
 */
const initialize = (
  menu_and_table_list,
  config = {
    row_limit: 20,
    need_prettier: true,
    menu_class: null,
    init_menu_index: 0,
  }
) => {
  tableController.setTableConfig(config);

  const $menu = $(
    `section:nth-child(1).menu${
      config.menu_class ? "." + config.menu_class : ""
    }`
  );
  $menu.html("");
  menu_and_table_list.forEach((mat_item) => {
    const $menu_item = $(`<div class="menu-item">${mat_item.menu_title}</div>`);
    $menu.append($menu_item);
    $menu_item.off("click").on("click", async (ev) => {
      // 菜单点击事件
      $menu.children().removeClass("active");
      $(ev.target).addClass("active");

      // 没有数据时，拉取并配置数据
      if (!mat_item.data_list || mat_item.data_list.length == 0) {
        const { data } = await mat_item.getDataFunc();
        mat_item.setDataList(data);
      }
      tableController.setTableData(
        menu_and_table_list.indexOf(mat_item),
        mat_item
      );
      tableController.constructTable();
      tableController.pagination.initPagination();
    });
  });
  $menu
    .children(`:nth-child(${tableController.tableConfig.init_menu_index + 1})`)
    .trigger("click");
};

export { MenuAndTable, initialize, createOperationFunc, tableController };
