-include ../../Makefile.defaults

compile:
	cmake -B build --fresh -DCMAKE_BUILD_TYPE=Release -DGRAPH_RECURSIVE=ON -DGRAPH_ABSL_FLAT=ON
	cmake --build build
	cp build/graph graph.o

run:
	./graph.o ../com-youtube.ungraph.txt
