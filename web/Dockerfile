FROM node:22.16.0

RUN apt-get update && apt-get install -y zsh
RUN wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | zsh || true
RUN npm install -g wrangler

COPY --chown=node:node . /web
USER node
WORKDIR /web
RUN npm install

USER node
CMD ["npm", "start"]