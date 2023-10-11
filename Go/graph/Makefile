ifndef GO
GO := go
endif

compile:
	$(GO) build -o graph.o recursive/graph_recursive.go

run:
	./graph.o ../../benchmark-data/graph/com-youtube.ungraph.txt

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo ../../scripts/RAPL/build/rapl "$(JSON)" ./graph.o ../../benchmark-data/graph/com-youtube.ungraph.txt
