-include ../../Makefile.defaults

# Require version 3.24 for --fresh
ifndef CMAKE
CMAKE := cmake
endif

compile:
	$(CMAKE) -B build --fresh -DCMAKE_BUILD_TYPE=Release -DGRAPH_RECURSIVE=ON -DGRAPH_ABSL_FLAT=ON
	$(CMAKE) --build build
	cp build/graph graph.o

run:
	./graph.o ../com-youtube.ungraph.txt

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo modprobe msr
	sudo ../../scripts/RAPL/build/rapl $(JSON) ./graph.o ../com-youtube.ungraph.txt
