ifndef JAVAC
JAVAC := javac
endif

ifndef JAVA
JAVA := java
endif

compile:
	$(JAVAC) *.java

run:
	$(JAVA) Sudoku ../../benchmark-data/sudoku/input-64.txt

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo ../../scripts/RAPL/build/rapl "$(JSON)" $(JAVA) Sudoku ../../benchmark-data/sudoku/input-64.txt
