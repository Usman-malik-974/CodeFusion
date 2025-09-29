FROM alpine:latest

# Install build dependencies
RUN apk add --no-cache g++ gcc libc-dev make bash

WORKDIR /app

# Precompile bits/stdc++.h
RUN gcc_version=$(ls /usr/include/c++ | grep -E '^[0-9]+') || gcc_version=10 && \
    echo "Detected GCC version: $gcc_version" && \
    g++ -std=c++17 -x c++-header /usr/include/c++/$gcc_version/bits/stdc++.h \
        -o /usr/include/c++/$gcc_version/bits/stdc++.h.gch

CMD ["tail", "-f", "/dev/null"]