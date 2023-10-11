ifndef PYTHON
PYTHON := python3
endif

compile:

run:
	$(PYTHON) -OO sudoku.py ../../benchmark-data/sudoku/input-64.txt

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo ../../scripts/RAPL/build/rapl "$(JSON)" $(PYTHON) -OO sudoku.py ../../benchmark-data/sudoku/input-64.txt
