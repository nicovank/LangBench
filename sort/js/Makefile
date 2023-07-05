ifndef NODE
NODE := node
endif

compile:

run:
	$(NODE) --max-heap-size=8192 sort.js

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo modprobe msr
	sudo ../../scripts/RAPL/build/rapl $(JSON) $(NODE) --max-heap-size=8192 sort.js
