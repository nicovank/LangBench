-include ../Makefile.defaults

compile:
	$(CXX) $(CXXFLAGS) -o sudoku.o sudoku.cpp

run:
	./sudoku.o ../../benchmark-data/sudoku/input-64.txt

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo ../../scripts/RAPL/build/rapl "$(JSON)" ./sudoku.o ../../benchmark-data/sudoku/input-64.txt
