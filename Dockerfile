FROM node:12.18.3-alpine3.12

# Basic dev tools
RUN apk add --no-cache --update \
  git \
  openssh \
  zsh \
  curl \
  && sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Bangkok /etc/localtime \
    && echo 'Asia/Bangkok' > /etc/timezone \
    && apk del tzdata

# nestjs tools
RUN  yarn global add @nestjs/cli
