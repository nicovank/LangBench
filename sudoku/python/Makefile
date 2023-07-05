ifndef PYTHON
PYTHON := python3
endif

compile:

run:
	$(PYTHON) sudoku.py -OO ../input-64.txt

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo modprobe msr
	sudo ../../scripts/RAPL/build/rapl $(JSON) $(PYTHON) sudoku.py -OO ../input-64.txt
