ifndef PYTHON
PYTHON := python3
endif

compile:

run:
	$(PYTHON) -OO graph_recursive.py ../com-youtube.ungraph.txt

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo modprobe msr
	sudo ../../scripts/RAPL/build/rapl $(JSON) $(PYTHON) -OO graph_recursive.py ../com-youtube.ungraph.txt
