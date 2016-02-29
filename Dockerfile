FROM resin/raspberrypi2-node
ENV INITSYSTEM on

RUN apt-get update && apt-get install -y bluetooth bluez libbluetooth-dev libudev-dev

RUN mkdir /code
WORKDIR /code

COPY package.json /code/
RUN npm install

COPY . /code/

EXPOSE 80

CMD ["./start.sh"]
