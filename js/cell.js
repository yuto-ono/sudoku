// それぞれのマスを表すクラス
// そのマスの候補の数字のリストとしても機能する
// 連結リストのアイテムとしても機能する作りになっている
var Cell = function (pos, value) {
    this.pos = pos;
    this.value = value;
    this.prev = this;
    this.next = this;
    this.related_cells = [];
    this.changed_cells = [];

    if (value) {
        this.length = 0;
    }
    else {
        this.candidates = 0x3fe;
        this.length = 9;
    }
};

// 初期化
// セルのリストが完成した後に呼ぶべし
// 矛盾を発見したら false を返す
Cell.prototype.init = function (cells) {
    var row = Math.floor(this.pos / 9);
    var col = this.pos % 9;
    var area33top  = Math.floor(row / 3) * 3;
    var area33left = Math.floor(col / 3) * 3;
    var row33, col33;

    for (var i = 0; i < 9; i++) {
        this.add_related_cell( cells, row, i );
        this.add_related_cell( cells, i, col );
        row33 = area33top  + Math.floor(i / 3);
        col33 = area33left + (i % 3);
        this.add_related_cell( cells, row33, col33);
    }

    if (this.value) {
        // 重複チェック
        for (var i = 0; i < 20; i++) {
            if (this.value === this.related_cells[i].value) {
                return false;
            }
        }
    }
    else {
        // 候補リストの作成
        this.set_candidates();
    }

    return true;
};

// 数字をセット　関連セルの候補も更新
// 矛盾が生じたら false を返す
Cell.prototype.set_value = function (value) {
    var mask = 1 << value;
    this.value = value;
    for (var i = 0; i < 20; i++) {
        var cell = this.related_cells[i];
        if (!cell.value && (cell.candidates & mask)) {
            if (cell.length === 1) {
                this.reset_value();
                return false;
            }
            cell.candidates ^= mask;
            cell.length--;
            this.changed_cells.push(cell);
        }
    }
    return true;
};

// 数字を0にリセット
// changed_cells をもとに、関連セルの候補も元に戻す
Cell.prototype.reset_value = function () {
    var len = this.changed_cells.length;
    var mask = 1 << this.value;
    for (var i = 0; i < len; i++) {
        var cell = this.changed_cells.pop();
        cell.candidates ^= mask;
        cell.length++;
    }
    this.value = 0;
};

// 候補に挙がっている数字でループ処理
Cell.prototype.each = function (callback) {
    for (var i = 1, mask = 1; i <= 9; i++) {
        mask <<= 1;
        if (this.candidates & mask) {
            if (callback(i) === false) break;
        }
    }
};

// 指定位置のセルを関連セルのリストに追加
Cell.prototype.add_related_cell = function (cells, row, col) {
    var pos = row * 9 + col;
    if (pos != this.pos) {
        var cell = cells[pos];
        if (this.related_cells.indexOf(cell) === -1) {
            this.related_cells.push(cell);
        }
    }
};

// 候補リストをセット
Cell.prototype.set_candidates = function () {
    for (var i = 0; i < 20; i++) {
        var cell = this.related_cells[i];
        if (cell.value) {
            var mask = 1 << cell.value;
            if (this.candidates & mask) {
                this.candidates ^= mask;
                this.length--;
            }
        }
    }
};
