-include ../../Makefile.defaults

compile:
	$(CXX) $(CXXFLAGS) -o sudoku.o sudoku.cpp

run:
	./sudoku.o ../input-64.txt

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo modprobe msr
	sudo ../../scripts/RAPL/build/rapl $(JSON) ./sudoku.o ../input-64.txt
