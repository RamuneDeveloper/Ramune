FROM node:12.18
WORKDIR /app
COPY . /app
RUN apt-get update && apt-get install -y python3 git build-essential curl && yarn
EXPOSE 8000
ENV FILES_ROOT=/storage
VOLUME [ "/storage" ]
CMD ["yarn", "start"]