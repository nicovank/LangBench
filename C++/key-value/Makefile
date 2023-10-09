-include ../Makefile.defaults

ifndef JOBS
JOBS := 8 # Client concurrency level.
endif

compile:
	$(CXX) -std=c++17 -pthread $(CXXFLAGS) -o key_value.o key_value.cpp hashmap.cpp

run-server:
	./key_value.o 127.0.0.1 51234 24576 1024

run:
	python3 ../../data/run-server-client.py \
		--server-command "./key_value.o 127.0.0.1 51234 24576 1024" \
		--client-command "redis-benchmark -c $(JOBS) -n 2000000 -d 64 -r 500000 -t set,get -h 127.0.0.1 -p 51234" \
		--ready-matcher ".* initialized"

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo ../../scripts/RAPL/build/rapl "$(JSON)" python3 ../../data/run-server-client.py \
		--server-command "./key_value.o 127.0.0.1 51234 24576 1024" \
		--client-command "redis-benchmark -c $(JOBS) -n 2000000 -d 64 -r 500000 -t set,get -h 127.0.0.1 -p 51234" \
		--ready-matcher ".* initialized"
