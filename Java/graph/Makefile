ifndef JAVAC
JAVAC := javac
endif

ifndef JAVA
JAVA := java
endif

compile:
	$(JAVAC) GraphRecursive.java

run:
	$(JAVA) -Xss128m GraphRecursive ../../data/graph/com-youtube.ungraph.txt

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo ../../scripts/RAPL/build/rapl "$(JSON)" $(JAVA) -Xss128m GraphRecursive ../../data/graph/com-youtube.ungraph.txt
