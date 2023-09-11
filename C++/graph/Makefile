-include ../Makefile.defaults

compile:
	rm -rf build
	cmake . -B build -DCMAKE_BUILD_TYPE=Release -DGRAPH_RECURSIVE=ON -DGRAPH_ABSL_FLAT=ON
	cmake --build build

run:
	./build/graph ../../data/graph/com-youtube.ungraph.txt
