ifndef JAVAC
JAVAC := javac
endif

ifndef JAVA
JAVA := java
endif

compile:
	$(JAVAC) GraphRecursive.java

run:
	$(JAVA) -Xss128m GraphRecursive ../com-youtube.ungraph.txt

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo modprobe msr
	sudo ../../scripts/RAPL/build/rapl $(JSON) $(JAVA) -Xss128m GraphRecursive ../com-youtube.ungraph.txt
