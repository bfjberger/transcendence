PATH_DOCKER_COMPOSE = docker-compose.yml

NAME = transcendence

all : down build run

run:
	docker-compose -f ${PATH_DOCKER_COMPOSE} -p ${NAME} up

build:
	docker-compose -f ${PATH_DOCKER_COMPOSE} -p ${NAME} build

migrations:
	docker-compose -f ${PATH_DOCKER_COMPOSE} -p ${NAME} exec bck_django python3 manage.py makemigrations
	docker-compose -f ${PATH_DOCKER_COMPOSE} -p ${NAME} exec bck_django python3 manage.py migrate

migrate:
	docker-compose -f ${PATH_DOCKER_COMPOSE} -p ${NAME} exec bck_django python3 manage.py migrate

collectstatic:
	docker-compose -f ${PATH_DOCKER_COMPOSE} -p ${NAME} exec bck_django python3 manage.py collectstatic --noinput

clear:
	-if [ "$$(docker ps -q)" ]; then docker stop $$(docker ps -qa); fi
	-if [ "$$(docker ps -qa)" ]; then docker rm $$(docker ps -qa); fi
	-if [ "$$(docker images -q)" ]; then docker rmi -f $$(docker images -qa); fi
	-if [ "$$(docker volume ls -q)" ]; then docker volume rm $$(docker volume ls -q); fi
	-if [ "$$(docker network ls -q)" ]; then docker network rm $$(docker network ls -q) 2>/dev/null; fi

down:
	docker-compose -f ${PATH_DOCKER_COMPOSE} -p ${NAME} down

clean: down
	docker system prune -af

fclean: down
	docker system prune -af --volumes

.PHONY: clean fclean clear