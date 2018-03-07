FROM node:8.9.4
MAINTAINER Herlon Aguiar <herlon@doare.org>

RUN apt-get -qq update

COPY . /opt/app
WORKDIR /opt/app

CMD ["yarn"]
CMD ["yarn", "start"]