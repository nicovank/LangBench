ifndef NODE
NODE := node
endif

compile:

run:
	$(NODE) sudoku.js ../../data/sudoku/input-64.txt

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo ../../scripts/RAPL/build/rapl "$(JSON)" $(NODE) sudoku.js ../../data/sudoku/input-64.txt
