FROM alpine:latest

RUN apk add --no-cache build-base bash

WORKDIR /app

RUN gcc_version=$(ls /usr/include/c++ | grep -E '^[0-9]+' || echo "10") && \
    echo "Detected GCC version: $gcc_version" && \
    if [ -f /usr/include/c++/$gcc_version/bits/stdc++.h ]; then \
        echo "Precompiling stdc++.h..." && \
        g++ -std=c++17 -x c++-header /usr/include/c++/$gcc_version/bits/stdc++.h \
            -o /usr/include/c++/$gcc_version/bits/stdc++.h.gch; \
    else \
        echo "bits/stdc++.h not found, skipping precompilation."; \
    fi

CMD ["tail", "-f", "/dev/null"]
