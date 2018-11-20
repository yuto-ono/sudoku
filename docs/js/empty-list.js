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

// ループ処理
EmptyList.prototype.each = function (callback) {
    var cell = this.head;
    while (cell.next !== this.head) {
        cell = cell.next;
        if (callback(cell) === false) break;
    }
};

// 最初の要素
EmptyList.prototype.first = function () {
    return this.head.next;
};

// 空きマスリストから要素を削除
EmptyList.prototype.remove = function (cell) {
    cell.prev.next = cell.next;
    cell.next.prev = cell.prev;
    this.length--;
};

// 空きマスリストに要素を復活
EmptyList.prototype.restore = function (cell) {
    cell.prev.next = cell;
    cell.next.prev = cell;
    this.length++;
};
