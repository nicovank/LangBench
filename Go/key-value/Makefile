ifndef GO
GO := go
endif

ifndef JOBS
JOBS := 8
endif

compile:
	$(GO) build -o key_value.o key_value.go hashmap.go

run-server:
	./key_value.o 127.0.0.1 51234 24576 1024

run:
	python3 ../../data/run-server-client.py \
		--server-command "./key_value.o 127.0.0.1 51234 24576 1024" \
		--client-command "redis-benchmark -c $(JOBS) -n 2000000 -d 64 -r 500000 -t set,get -h 127.0.0.1 -p 51234" \
		--ready-matcher ".* initialized"
