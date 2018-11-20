(function () {
  var items = [];
  for (var i = 0; i < 81; i++) {
    items.push({ value: 0, inputed: false })
  }
  new Vue({
    el: '#sudoku',
    data: {
      items: items,
      panel_is_active: false,
      current_index: 0,
      solved: false
    },
    
    methods: {
      show_panel: function(i) {
        this.current_index = i;
        this.panel_is_active = true;
      },
      
      input: function(value) {
        var item = this.items[this.current_index];
        item.value = value;
        item.inputed = !!value;
        this.panel_is_active = false;
      },
      
      cancel: function() {
        this.panel_is_active = false;
      },
      
      solve: function() {
        if (this.solved) {
          for (i = 0; i < 81; i++) {
            var item = this.items[i];
            if (!item.inputed) {
              item.value = 0;
            }
          }
          this.solved = false;
        }
        else {
          var data = this.items.map(function(item) { return item.value; });
          var board = new Board(data);

          if (!board.is_valid) {
            alert('無効なデータです。');
          }
          else if (board.solve()) {
            data = board.getData();
            for (i = 0; i < 81; i++) {
              this.items[i].value = data[i];
            }
            this.solved = true;
          }
          else {
            alert('解けませんでした。');
          }
        }
      },
      
      reset: function() {
        for (i = 0; i < 81; i++) {
          var item = this.items[i];
          item.value = 0;
          item.inputed = false;
        }
        this.solved = false;
      }
    },
    
    computed: {
      row: function () {
        return Math.floor(this.current_index / 9) + 1;
      },
      col: function () {
        return this.current_index % 9 + 1;
      }
    },
    
    filters: {
      zero_empty: function(value) {
        return value || '';
      }
    }
  });
})();
