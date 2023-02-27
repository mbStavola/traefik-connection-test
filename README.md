# Traefik Connection Test

There is a set of connection "producer" services which will periodically hit the tracker service. This tracker service will log any connection reuse, especially noting same vs different client reuse.

## Usage

Just run `docker-compose --compatibility up` and you should be able to see how Traefik handles proxying connections.

You can adjust the frequency of requests by playing with the Traefik healthcheck frequency of `connection-service-producer`.