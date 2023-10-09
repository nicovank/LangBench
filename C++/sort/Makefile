-include ../Makefile.defaults

compile:
	$(CXX) -std=c++17 $(CXXFLAGS) -o sort.o sort.cpp

run:
	./sort.o

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo ../../scripts/RAPL/build/rapl "$(JSON)" ./sort.o
