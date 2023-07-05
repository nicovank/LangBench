ifndef NODE
NODE := node
endif

compile:
	node-gyp configure
	node-gyp build

run:
	$(NODE) --stack-size=65536 graph_recursive.js ../com-youtube.ungraph.txt

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo modprobe msr
	sudo ../../scripts/RAPL/build/rapl $(JSON) $(NODE) --stack-size=65536 graph_recursive.js ../com-youtube.ungraph.txt
