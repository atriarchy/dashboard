require_relative "../config/environment"

# Your code goes here
`docker build -t ghcr.io/dylhack/trackboard .`
`docker push ghcr.io/dylhack/trackboard:latest`
