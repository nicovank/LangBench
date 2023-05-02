.PHONY: all clean

all: sort-o2.o sort-o3.o

sort-o2.o: sort.c
	$(CXX) -std=c++17 -O2 -o $@ $<

sort-o3.o: sort.c
	$(CXX) -std=c++17 -O3 -o $@ $<

clean:
	rm sort-o2.o
	rm sort-o3.o
