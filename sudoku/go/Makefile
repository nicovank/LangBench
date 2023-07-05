ifndef GO
GO := go
endif

compile:
	$(GO) build -o sudoku.o sudoku.go

run:
	./sudoku.o ../input-64.txt

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo modprobe msr
	sudo ../../scripts/RAPL/build/rapl $(JSON) ./sudoku.o ../input-64.txt
