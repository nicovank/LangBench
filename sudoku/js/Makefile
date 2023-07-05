ifndef NODE
NODE := node
endif

compile:

run:
	$(NODE) sudoku.js ../input-64.txt

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo modprobe msr
	sudo ../../scripts/RAPL/build/rapl $(JSON) $(NODE) sudoku.js ../input-64.txt
