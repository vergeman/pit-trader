FROM node:22.12.0

RUN apt-get update && apt-get install -y zsh
RUN wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | zsh || true

COPY --chown=node:node . /web
WORKDIR /web
RUN npm install
RUN npm install -g wrangler

USER node
CMD ["npm", "start"]
