-include ../../Makefile.defaults

compile:
	CXX=$(CXX) CXXFLAGS=$(CXXFLAGS) cmake -B build --fresh -DGRAPH_RECURSIVE=ON -DGRAPH_ABSL_FLAT=ON
	cmake --build build
	cp build/graph graph.o

run:
	graph.o ../com-youtube.ungraph.txt
