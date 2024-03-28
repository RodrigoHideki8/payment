FROM node:16.18.0 as development
RUN mkdir /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
COPY ./ ./
RUN npm install --legacy-peer-deps
RUN npm run build

FROM node:16.18.0  as production
COPY --from=development /home/node/app/package.json ./package.json
RUN npm install --legacy-peer-deps --omit=dev
COPY --from=development /home/node/app/dist ./dist
COPY --from=development /home/node/app/certificates ./certificates
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
