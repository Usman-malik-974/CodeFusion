# FROM alpine:latest
# RUN apk add --no-cache build-base bash

# WORKDIR /app
# RUN gcc_version=$(ls /usr/include/c++ | grep -E '^[0-9]+') || gcc_version=10 && \
#     echo "Detected GCC version: $gcc_version" && \
#     if[ -f /usr/include/c++/$gcc_version/bits/stdc++.h ]; then \
#     g++ -std=c++17 -x c++-header /usr/include/c++/$gcc_version/bits/stdc++.h \
#         -o /usr/include/c++/$gcc_version/bits/stdc++.h.gch
#     else \
#        echo "bits/std++.h not found"; \    
#     fi
# CMD ["tail", "-f", "/dev/null"]


#****************************second

# # Use official GCC base image
# FROM gcc:latest

# # Install necessary build tools
# RUN apt-get update && apt-get install -y \
#     make bash && \
#     rm -rf /var/lib/apt/lists/*

# # Set working directory
# WORKDIR /app

# # Precompile bits/stdc++.h for faster C++ compilation
# RUN gcc_version=$(ls /usr/include/c++ | grep -E '^[0-9]+') || gcc_version=10 && \
#     echo "Detected GCC version: $gcc_version" && \
#     g++ -std=c++17 -x c++-header /usr/include/c++/$gcc_version/bits/stdc++.h \
#         -o /usr/include/c++/$gcc_version/bits/stdc++.h.gch

# # Default command — keep container alive
# CMD ["tail", "-f", "/dev/null"]


#*********************third

FROM alpine:latest

# Install compiler, standard libraries, and bash
RUN apk add --no-cache build-base bash

WORKDIR /app

# Precompile bits/stdc++.h header for faster compilation (optional optimization)
RUN gcc_version=$(ls /usr/include/c++ | grep -E '^[0-9]+') || gcc_version=10 && \
    echo "Detected GCC version: $gcc_version" && \
    if [ -f /usr/include/c++/$gcc_version/bits/stdc++.h ]; then \
        echo "Precompiling stdc++.h for GCC $gcc_version..."; \
        g++ -std=c++17 -x c++-header /usr/include/c++/$gcc_version/bits/stdc++.h \
            -o /usr/include/c++/$gcc_version/bits/stdc++.h.gch; \
    else \
        echo "bits/stdc++.h not found, skipping precompile."; \
    fi

CMD ["tail", "-f", "/dev/null"]
