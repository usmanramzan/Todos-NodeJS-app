FROM node:8.10
# Maintainer of the image
MAINTAINER usman.ramzan@emumba.com   
# Copying code into working dir
COPY . .
ENV DB_NAME=""
ENV DB_USER=""
ENV DB_PASS=""
ENV DB_PORT=""
ENV DB_HOST=""
RUN echo "$DB_NAME $DB_USER $DB_PASS ARE environment variables"
# Installing required node packages
RUN npm install

CMD node migrate.js up
