# FROM node:20

# WORKDIR /app

# COPY package.json package-lock.json* ./

# RUN npm install

# COPY . .

# EXPOSE 5173

# CMD ["npm", "run", "dev", "--", "--host"]



FROM node:18

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "run", "preview"]