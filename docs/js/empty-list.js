// 空きマスリスト（双方向連結リストによる実装）
var EmptyList = function () {
  this.head = new Cell();
  this.length = 0;
};

// 要素を最後尾に追加
EmptyList.prototype.push = function (cell) {
  cell.prev = this.head.prev;
  cell.next = this.head;
  cell.prev.next = cell;
  this.head.prev = cell;
  this.length++;
};

// リスト中の最小の要素を取得
EmptyList.prototype.pop_min = function () {
  var cell = this.head, selected_cell, min_length = 10;

  while (cell.next !== this.head) {
    cell = cell.next;
    if (cell.length === 1) {
      selected_cell = cell;
      break;
    }
    if (cell.length < min_length) {
      min_length = cell.length;
      selected_cell = cell;
    }
  }

  selected_cell.prev.next = selected_cell.next;
  selected_cell.next.prev = selected_cell.prev;
  this.length--;
  return selected_cell;
};

// 空きマスリストに要素を復活
EmptyList.prototype.restore = function (cell) {
  cell.prev.next = cell;
  cell.next.prev = cell;
  this.length++;
};
