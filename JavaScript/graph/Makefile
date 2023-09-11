ifndef NODE
NODE := node
endif

compile:
	npm install
	npx node-gyp configure
	npx node-gyp build

run:
	$(NODE) --stack-size=65536 graph_recursive.js ../../data/graph/com-youtube.ungraph.txt
