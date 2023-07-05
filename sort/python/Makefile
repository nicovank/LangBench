ifndef PYTHON
PYTHON := python3
endif

compile:

run:
	$(PYTHON) -OO sort.py

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo modprobe msr
	sudo ../../scripts/RAPL/build/rapl $(JSON) $(PYTHON) -OO sort.py
