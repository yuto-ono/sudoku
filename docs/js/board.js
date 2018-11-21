// 数独の盤面を表すクラス
var Board = function (data) {
  // セルのリストを作成
  this.cells = [];  // 高速化のため一次元配列
  this.is_valid = true;
  this.empty_list = new EmptyList();

  for (var i = 0; i < 81; i++) {
    this.cells.push(new Cell(i, data[i]));
  }

  // セルの初期化と空きマスリストの作成
  for (var i = 0; i < 81; i++) {
    var cell = this.cells[i];
    if (!cell.init(this.cells)) {
      this.is_valid = false;
    }
    if (!cell.value) {
      this.empty_list.push(cell);
    }
  }
};

// 改良バックトラック（再帰呼び出し）
Board.prototype.solve = function () {
  if (!this.empty_list.length) {
    // 解けた！
    return true;
  }

  // 空きマスのうち、最も候補が少ないものを選ぶ
  var cell = this.empty_list.pop_min();

  // 候補に挙がっている数字を入れてみる
  for (var i = 1, mask = 1; i <= 9; i++) {
    mask <<= 1;
    if (cell.candidates & mask) {
      if (cell.set_value(i)) {
        if (this.solve()) {
          return true;
        }
        cell.reset_value();
      }
    }
  }

  // 解けなかったので、元に戻してやり直し
  this.empty_list.restore(cell);
  return false;
};

// 配列でデータを取得
Board.prototype.getData = function () {
  return this.cells.map(function (cell) {
    return cell.value;
  });
};
