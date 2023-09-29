ifndef GO
GO := go
endif

compile:
	$(GO) build -o graph.o recursive/graph_recursive.go

run:
	./graph.o ../../data/graph/com-youtube.ungraph.txt
