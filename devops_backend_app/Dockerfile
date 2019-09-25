FROM node:8.10
# maintainer
MAINTAINER Muhammad Usman Ramzan
# working dir
#WORKDIR ./backend_workdir
# copy code into directory
COPY . .
# Environment variables ...
ENV POSTGRES_PASSWORD=""
ENV POSTGRES_USER=""
ENV POSTGRES_DB=""
ENV DB_PORT=""
ENV DB_HOST=""
EXPOSE 3030
# installing packages
RUN npm install

CMD npm run start-prod
