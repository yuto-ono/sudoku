new Vue({
  el: '#sudoku',
  
  data: {
    items: [],
    panel_is_active: false,
    current_index: 0,
    solved: false,
    time: null
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

    solve_with_measure: function(board) {
      var start = performance.now();
      var result = board.solve();
      var end = performance.now();
      this.time = end - start;
      return result;
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

        if (window.history && window.history.pushState) {
          window.history.pushState(null, null, '?data=' + data.join(''));
        }

        if (!board.is_valid) {
          alert('重複があります。');
        }
        else if (this.solve_with_measure(board)) {
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
    },

    init: function() {
      this.items.length = 0;
      var match = window.location.search.match(/[?&]data=(\d{81})(?=&|#|$)/);
      if (match) {
        var data_string = match[1];
        for (var i = 0; i < 81; i++) {
          var value = Number(data_string[i]);
          this.items.push({ value: value, inputed: !!value });
        }
      }
      else {
        for (var i = 0; i < 81; i++) {
          this.items.push({ value: 0, inputed: false });
        }
      }
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
    },

    fixed: function(value, digits) {
      return value && value.toFixed(digits);
    }
  },

  created: function () {
    var vm = this;
    this.init();
    window.addEventListener('popstate', function () { vm.init(); }, false);
  }
});
