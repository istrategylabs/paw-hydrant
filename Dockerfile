FROM resin/armv7hf-node

RUN apt-get update && apt-get install -y bluetooth bluez libbluetooth-dev libudev-dev

RUN mkdir /code
WORKDIR /code

ENV INITSYSTEM on

ADD package.json /code/
RUN npm install

ADD . /code/

EXPOSE 80

CMD ["node", "index.js"]
