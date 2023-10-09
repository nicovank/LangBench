ifndef GO
GO := go
endif

compile:
	$(GO) build -o sort.o sort.go

run:
	./sort.o

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo ../../scripts/RAPL/build/rapl "$(JSON)" ./sort.o
