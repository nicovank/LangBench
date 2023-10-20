# LangBench

The main repository for this project lives at [`nicovank/Energy-Languages`](https://github.com/nicovank/Energy-Languages).
Any issues should be reported on [that repository's issue section](https://github.com/nicovank/Energy-Languages/issues).

## Documentation

Both repositories should be cloned in the same parent directory.
```
.
├── Energy-Languages
└── LangBench
```

```bash
% cp -r Energy-Languages/docker LangBench
% cp -r Energy-Languages/scripts LangBench
% cp Energy-Languages/requirements.txt LangBench
```

### Docker

```bash
% sudo modprobe msr # Enable msr kernel module.
% sudo docker build -f docker/LangBench.Dockerfile -t langbench .
% sudo docker run --privileged -v [OUTPUT_DIRECTORY]:/root/data langbench [OPTIONS]
```

```bash
% sudo docker run -it --privileged -v `pwd`/data/`hostname -s`/docker-default:/root/data langbench \
    --languages C++ Go Java JavaScript Python \
    --warmup 3 \
    --iterations 21
```
