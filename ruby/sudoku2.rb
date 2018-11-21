require 'benchmark'

# 数独の盤面を表すクラス
class Board

    # それぞれのマスを表すクラス
    # そのマスの候補の数字のリストとしても機能する
    # 連結リストのアイテムとしても機能する作りになっている
    class Cell
        include Enumerable
        attr_accessor :prev, :next, :count
        attr_reader :pos, :value, :candidates, :is_dummy

        def initialize (pos = nil, value = 0)
            @pos, @value = pos, value
            @is_dummy = pos.nil?
            @prev = @next = self
            @related_cells = {}
            @changed_cells = []
            if value == 0 then
                @candidates = [ true ] * 9
                @count = 9
            else
                @count = 0
            end
        end

        # 初期化
        # セルのリストが完成した後に呼ぶべし
        # 矛盾を発見したら false を返す
        def init (cells)
            # related_cells （関連セルのリスト）のセット
            row = @pos / 9
            col = @pos % 9
            area33top  = row / 3 * 3
            area33left = col / 3 * 3

            9.times do |i|
                add_related_cell( cells, row * 9 + i )
                add_related_cell( cells, i * 9 + col )
                row33 = area33top  + (i / 3)
                col33 = area33left + (i % 3)
                add_related_cell( cells, row33 * 9 + col33 )
            end
            
            if is_filled then
                # 重複チェック
                @related_cells.each do |pos, cell|
                    # 重複していたらアウト
                    return false if @value == cell.value
                end
            elsif
                # 候補リストの作成
                set_candidates
            end

            return true
        end

        # 空きマスかどうか
        def is_empty() @value == 0 end

        # is_empty の逆
        def is_filled() @value != 0 end

        # 数字をセット　関連セルの候補も更新
        # 矛盾が生じたら false を返す
        def set_value (value, empty_list)
            i = value - 1
            @value = value
            @related_cells.each do |pos, cell|
                if cell.is_empty then
                    if cell.candidates[i] then
                        if cell.count == 1 then
                            reset_value(empty_list)
                            return false
                        end
                        cell.candidates[i] = false
                        cell.count -= 1
                        empty_list.update(cell)
                        @changed_cells.push(cell)
                    end
                end
            end
            return true
        end

        # 数字を0にリセット
        # changed_cells をもとに、関連セルの候補も元に戻す
        def reset_value (empty_list)
            i = @value - 1
            @changed_cells.each do |cell|
                cell.candidates[i] = true
                cell.count += 1
                empty_list.update(cell)
            end
            @changed_cells.clear
            @value = 0
            self
        end

        # 候補に挙がっている数字を返す
        def each
            @candidates.each_with_index do |is_candidate, i|
                yield i + 1 if is_candidate
            end
            self
        end

        private

        # 指定位置のセルを関連セルのリストに追加
        def add_related_cell (cells, pos)
            @related_cells[pos] = cells[pos]  if pos != @pos
            self
        end

        # 候補リストをセット
        def set_candidates
            @related_cells.each do |pos, cell|
                if cell.is_filled then
                    i = cell.value - 1
                    if @candidates[i] then
                        @candidates[i] = false
                        @count -= 1
                    end
                end
            end
            self
        end
    end
    # Cellクラスの定義終了


    # 空きマスリスト（双方向連結リストによる実装）
    # 常に候補の少ない順に並ぶよう工夫している
    class EmptyList
        include Enumerable
        attr_reader :count

        def initialize
            @index = []
            9.times { @index.push(Cell.new) }
            8.times do |i|
                @index[i].next = @index[i+1]
                @index[i+1].prev = @index[i]
            end
            @index[8].next = @index[0]
            @index[0].prev = @index[8]
            @count = 0
        end

        # 要素を追加
        def add (cell)
            node = @index[cell.count - 1]
            cell.prev = node
            cell.next = node.next
            cell.next.prev = cell
            node.next = cell
            @count += 1
            self
        end

        # セルの候補数の更新のさいに順番を保つ
        def update (cell)
            cell.prev.next = cell.next
            cell.next.prev = cell.prev
            node = @index[cell.count - 1]
            cell.prev = node
            cell.next = node.next
            cell.next.prev = cell
            node.next = cell
            self
        end

        # 最初の要素を取り出す
        def shift
            head = @index.first
            cell = @index.first.next
            while cell.is_dummy
                cell = cell.next
            end
            cell.prev.next = cell.next
            cell.next.prev = cell.prev
            @count -= 1
            cell
        end
    end
    # EmptyListの定義終了


    # ここからBoardクラスの定義
    attr_reader :is_valid

    # 初期化
    def initialize (data)
        # セルのリストを作成
        @cells = []  # 高速化のため一次元配列
        @is_valid = true
        @empty_list = EmptyList.new

        81.times do |pos|
            row = pos / 9
            col = pos % 9
            @cells.push( Cell.new(pos, data[row][col]) )
        end
        
        # セルの初期化と空きマスリストの作成
        @cells.each do |cell|
            if !cell.init(@cells) then
                @is_valid = false
            end
            if cell.is_empty then
                @empty_list.add(cell)
            end
        end
    end

    # 改良バックトラック（再帰呼び出し）
    def solve
        if @empty_list.count == 0 then
            # 解けた！
            return true
        end

        # 空きマスリストの最初のアイテムを取得
        target_cell = @empty_list.shift

        # 候補に挙がっている数字を入れてみる
        target_cell.each do |candidate|
            if target_cell.set_value(candidate, @empty_list) then
                return true if solve
                target_cell.reset_value(@empty_list)
            end
        end

        # 間違っているのでやり直し
        @empty_list.add(target_cell)
        return false
    end

    # 二次元配列に変換したデータを取得
    def get_data
        data = []
        9.times do |i|
            data.push( @cells[i * 9, 9].map { |cell| cell.value } )
        end
        return data
    end
end
# Boardクラスの定義終了


# すべてのクラスの定義が終了
# ここから実際の処理


# ファイル読み込み、配列に格納
data = []

File.open(ARGV[0], 'r') do |f|
    f.each_line do |line|
        row = line.split(',', -1).map { |x| x.to_i }
        data.push(row)
    end
end

# インスタンス作成
board = Board.new(data)
result = nil
if !board.is_valid then
    puts '無効な数独データです'
    exit
end

# 時間計測
time = Benchmark.realtime do
    # バックトラック実行
    result = board.solve
end


# データ表示
board.get_data.each do |line|
    puts line.join(', ')
end
if !result then
    puts '解けませんでした'
end

puts "実行時間: #{time}秒"
