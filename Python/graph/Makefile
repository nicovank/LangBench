ifndef PYTHON
PYTHON := python3
endif

compile:

run:
	$(PYTHON) -OO graph_recursive.py ../../data/graph/com-youtube.ungraph.txt

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo ../../scripts/RAPL/build/rapl "$(JSON)" $(PYTHON) -OO graph_recursive.py ../../data/graph/com-youtube.ungraph.txt
