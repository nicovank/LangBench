ifndef JAVAC
JAVAC := javac
endif

ifndef JAVA
JAVA := java
endif

compile:
	$(JAVAC) Sort.java

run:
	$(JAVA) -XX:+UseParallelGC -Xms8192m -Xmx8192m Sort

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo ../../scripts/RAPL/build/rapl "$(JSON)" $(JAVA) -XX:+UseParallelGC -Xms8192m -Xmx8192m Sort
