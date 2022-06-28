FROM node:10 as build

WORKDIR /frontend
COPY . /frontend

RUN npm install

RUN --mount=type=secret,id=REACT_APP_API_ENDPOINT \
    --mount=type=secret,id=REACT_APP_BICONOMY_KEY \
    --mount=type=secret,id=REACT_APP_BICONOMY_DEBUG_ENABLED \
    export REACT_APP_API_ENDPOINT=$(cat /run/secrets/REACT_APP_API_ENDPOINT) && \ 
    export REACT_APP_BICONOMY_KEY=$(cat /run/secrets/REACT_APP_BICONOMY_KEY) && \
    export REACT_APP_BICONOMY_DEBUG_ENABLED=$(cat /run/secrets/REACT_APP_BICONOMY_DEBUG_ENABLED) && \
    npm run build

CMD ["npm", "start"]

FROM nginx:alpine

COPY --from=build /frontend/build /usr/share/nginx/html

# RUN rm /etc/nginx/conf.d/default.conf
# COPY nginx/default.conf /etc/nginx/conf.d

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
