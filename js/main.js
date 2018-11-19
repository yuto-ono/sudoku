var data = [
    [8,0,0,0,0,0,0,0,0],
    [0,0,3,6,0,0,0,0,0],
    [0,7,0,0,9,0,2,0,0],
    [0,5,0,0,0,7,0,0,0],
    [0,0,0,0,4,5,7,0,0],
    [0,0,0,1,0,0,0,3,0],
    [0,0,1,0,0,0,0,6,8],
    [0,0,8,5,0,0,0,1,0],
    [0,9,0,0,0,0,4,0,0],
];
console.time('sudoku');
var board = new Board(data);

if (!board.is_valid) {
    console.log('無効なデータです。');
}
else if (board.solve()) {
    var data = board.getData();
    for (i = 0; i < 9; i++) {
        console.log(data[i]);
    }
}
else {
    console.log('解けませんでした。');
}
console.timeEnd('sudoku');