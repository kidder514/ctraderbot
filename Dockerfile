FROM node:18

# working dir
WORKDIR /usr/src/app

# cope package json file
COPY package*.json ./

RUN npm install

COPY . .

# build
RUN npm run build

#EXPOSE the API Port
EXPOSE 1233

CMD ["node", "dist/server.js"]