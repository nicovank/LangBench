ifndef PYTHON
PYTHON := python3
endif

compile:

run-server:
	$(PYTHON) key_value.py 127.0.0.1 51234 24576 1024

run:
	python3 ../../benchmark-data/run-server-client.py \
		--server-command "$(PYTHON) -u key_value.py 127.0.0.1 51234 24576 1024" \
		--client-command "redis-benchmark -c 1 -n 2000000 -d 64 -r 500000 -t set,get -h 127.0.0.1 -p 51234" \
		--ready-matcher ".* initialized"

measure:
ifndef JSON
	$(error JSON is not defined)
endif
	sudo ../../scripts/RAPL/build/rapl "$(JSON)" python3 ../../benchmark-data/run-server-client.py '\
		--server-command "$(PYTHON) -u key_value.py 127.0.0.1 51234 24576 1024" \
		--client-command "redis-benchmark -c 1 -n 2000000 -d 64 -r 500000 -t set,get -h 127.0.0.1 -p 51234" \
		--ready-matcher ".* initialized"'
