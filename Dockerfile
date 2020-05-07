# Run build application
FROM node:13-alpine AS builder

RUN apk add g++ make python

WORKDIR /app/
COPY . .
RUN yarn install
RUN cd app && yarn install
RUN yarn build

# Run image
FROM node:13-alpine
WORKDIR /app/

# Server
COPY --from=builder /app .
# Vue Applicaiton
COPY --from=builder /app/app/dist ./public

# re add ignored dependencies in server
# RUN cd server && yarn install && cd ..

# add data directory for sqlite
RUN mkdir data

EXPOSE 3030

CMD [ "yarn", "start" ]
