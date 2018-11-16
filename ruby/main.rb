require 'benchmark'

original_data = []
data = []

# ファイル読み込み、配列に格納
File.open(ARGV[0], 'r') do |f|
    f.each_line do |line|
        row = line.split(',', -1).map { |x| x.to_i }
        data.push(row)
    end
end

# 数独の盤面を表すクラス
class Board
    # それぞれのマスを表すクラス
    # そのマスの候補の数字のリストとしても機能する
    # 連結リストのアイテムとしても機能する作りになっている
    class Cell
        include Enumerable
        attr_accessor :prev, :next, :count
        attr_reader :pos, :value, :candidates

        def initialize (pos = nil, value = 0)
            @pos, @value = pos, value
            @prev = @next = self
            @related_cells = {}
            @changed_cells = []
            if value == 0 then
                @candidates = [ true, true, true, true, true, true, true, true, true ]
                @count = 9
            else
                @count = 0
            end
        end

        # 初期化
        # セルのリストが完成した後に呼ぶべし
        # 矛盾を発見したら false を返す
        def init (cells)
            # related_cell （関連セル）のセット
            row = @pos / 9
            col = @pos % 9
            area33top  = row / 3 * 3
            area33left = col / 3 * 3

            9.times do |i|
                add_related_cells( cells, row * 9 + i )
                add_related_cells( cells, i * 9 + col )
                row33 = area33top  + (i / 3)
                col33 = area33left + (i % 3)
                add_related_cells( cells, row33 * 9 + col33 )
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
        def is_empty () @value == 0 end

        # is_empty の逆
        def is_filled () @value != 0 end

        # 数字をセット　関連セルの候補も更新
        # 矛盾が生じたら false を返す
        def set_value (value)
            i = value - 1
            @value = value
            @related_cells.each do |pos, cell|
                if cell.is_empty then
                    if cell.candidates[i] then
                        if cell.count == 1 then
                            reset_value
                            return false
                        end
                        cell.candidates[i] = false
                        cell.count -= 1
                        @changed_cells.push(cell)
                    end
                end
            end
            return true
        end

        # 数字を0にリセット
        # changed_cells をもとに、関連セルの候補も元に戻す
        def reset_value
            i = @value - 1
            @changed_cells.each do |cell|
                cell.candidates[i] = true
                cell.count += 1
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

        # set_related_cell から内部的に呼ばれる
        def add_related_cells (cells, pos)
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
        end
    end
    # Cellクラスの定義終了

    # 空きマスリスト（双方向連結リストによる実装）
    class EmptyList
        include Enumerable
        attr_reader :count

        def initialize
            @head = Cell.new  # ダミーのセル
            @count = 0
        end

        # 要素を最後に追加
        def push(cell)
            cell.prev = @head.prev
            cell.next = @head
            cell.prev.next = cell
            @head.prev = cell
            @count += 1
            self
        end

        # ループ実装
        def each
            cell = @head
            while cell.next != @head
                cell = cell.next
                yield cell
            end
            self
        end

        # 最初の要素
        def first() @head.next end

        # 空きマスリストから要素を削除
        def remove(cell)
            cell.prev.next = cell.next
            cell.next.prev = cell.prev
            @count -= 1
            self
        end
    
        # 空きマスリストに要素を復活
        def restore(cell)
            cell.prev.next = cell
            cell.next.prev = cell
            @count += 1
            self
        end
    end
    # EmptyListの定義終了

    # ここからBoardクラスの定義
    attr_reader :is_valid

    # 初期化
    def initialize(data)
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
                @empty_list.push(cell)
            end
        end
    end

    # 改良バックトラック
    def solve
        if @empty_list.count == 0 then
            # 解けた！
            return true
        end

        # 空きマスのうち、最も候補が少ないものを選ぶ
        target_cell = @empty_list.first
        min_count = 9
        @empty_list.each do |cell|
            if cell.count == 1 then
                # 候補が1個だけのが見つかったらループを抜ける
                target_cell = cell
                break
            elsif cell.count < min_count then
                target_cell = cell
                min_count = cell.count
            end
        end

        # 空きマスリストから選ばれたセルを削除
        @empty_list.remove(target_cell)

        # 候補に挙がっている数字を入れてみる
        target_cell.each do |candidate|
            if target_cell.set_value(candidate) then
                return true if solve
                target_cell.reset_value
            end
        end

        # 間違っているのでやり直し
        @empty_list.restore(target_cell)
        return false
    end

    # 二次元配列に変換したデータを取得
    def get_data
        data = []
        9.times do |i|
            row = @cells[i * 9, 9]
            data.push( row.map { |cell| cell.value } )
        end
        return data
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
