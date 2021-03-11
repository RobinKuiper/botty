FROM node:15

# Create app directory
WORKDIR /botty

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm ci --only=production

# Bundle app source
COPY . .
COPY example_config.json config.json

EXPOSE 8080

CMD [ "node", "main.js" ]