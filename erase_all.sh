docker-compose down
docker system prune -a --volumes
docker volume rm $(docker volume ls -q)