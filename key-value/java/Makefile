ifndef JAVAC
JAVAC := javac
endif

ifndef JAVA
JAVA := java
endif

ifndef JOBS
JOBS := 8
endif

compile:
	$(JAVAC) KeyValue.java HashMap.java

run:
	screen -dmS key_value $(JAVA) KeyValue 127.0.0.1 51234 24576 1024
	redis-benchmark -c $(JOBS) -n 2000000 -d 64 -r 500000 -t set,get -h 127.0.0.1 -p 51234
	screen -S key_value -X stuff '^C'
