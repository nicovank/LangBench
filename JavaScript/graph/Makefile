ifndef NODE
NODE := node
endif

compile:
	npm install
	npx node-gyp configure
	npx node-gyp build

run:
	$(NODE) --stack-size=65536 graph_recursive.js ../../benchmark-data/graph/com-youtube.ungraph.txt

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo ../../scripts/RAPL/build/rapl "$(JSON)" $(NODE) --stack-size=65536 graph_recursive.js ../../benchmark-data/graph/com-youtube.ungraph.txt
