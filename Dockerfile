FROM node:20-alpine

RUN apk update && \
  apk add git

WORKDIR /app

RUN git clone https://github.com/LiveChurchSolutions/ContentApi.git .

RUN git submodule init && git submodule update

RUN npm install

CMD npm run initdb && npm run $ENVIRONMENT

EXPOSE 8300
