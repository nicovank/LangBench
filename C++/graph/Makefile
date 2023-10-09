-include ../Makefile.defaults

compile:
	rm -rf build
	cmake . -B build -DCMAKE_BUILD_TYPE=Release -DGRAPH_RECURSIVE=ON -DGRAPH_ABSL_FLAT=ON
	cmake --build build

run:
	./build/graph ../../data/graph/com-youtube.ungraph.txt

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo ../../scripts/RAPL/build/rapl "$(JSON)" ./build/graph ../../data/graph/com-youtube.ungraph.txt
