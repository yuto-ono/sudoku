// 数独の盤面を表すクラス
var Board = function (data) {
    // セルのリストを作成
    this.cells = [];  // 高速化のため一次元配列
    this.is_valid = true;
    this.empty_list = new EmptyList();

    for (var i = 0; i < 81; i++) {
        var row = Math.floor(i / 9);
        var col = i % 9;
        this.cells.push(new Cell(i, data[row][col]));
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
    var target_cell = this.empty_list.first();
    var min_count = 9;
    this.empty_list.each(function (cell) {
        if (cell.length === 1) {
            target_cell = cell;
            return false;
        }
        if (cell.length < min_count) {
            target_cell = cell;
            min_count = cell.length;
        }
    });

    // 空きマスリストから選ばれたセルを削除
    this.empty_list.remove(target_cell);

    // 候補に挙がっている数字を入れてみる
    var result = false, self = this;
    target_cell.each(function (candidate) {
        if (target_cell.set_value(candidate)) {
            if (self.solve()) {
                result = true;
                return false;
            }
            target_cell.reset_value();
        }
    });

    if (!result) {
        // 解けなかったので、元に戻してやり直し
        this.empty_list.restore(target_cell);
    }

    return result;
};

Board.prototype.getData = function () {
    var data = [];
    for (var i = 0; i < 9; i++) {
        var cells_row = this.cells.slice(i * 9, (i + 1) * 9);
        var row = cells_row.map(function (cell) {
            return cell.value;
        });
        data.push(row);
    }
    return data;
};
