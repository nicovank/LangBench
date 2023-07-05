ifndef JAVAC
JAVAC := javac
endif

ifndef JAVA
JAVA := java
endif

compile:
	$(JAVAC) *.java

run:
	$(JAVA) Sudoku ../input-64.txt

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo modprobe msr
	sudo ../../scripts/RAPL/build/rapl $(JSON) $(JAVA) Sudoku ../input-64.txt
