ifndef NODE
NODE := node
endif

compile:
	node-gyp configure
	node-gyp build

run:
	$(NODE) --stack-size=65536 graph_recursive.js ../com-youtube.ungraph.txt
