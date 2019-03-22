FROM node:10-alpine

ARG container_version=0.1

LABEL description="Игра на CodeFest 2019" \
      version=$container_version \
      maintainer="<Mstislav Zhivodkov> m.zhivodkov@2gis.ru" \
      source="https://gitlab.2gis.ru/gamedev/airplanes"

WORKDIR /airplanes

COPY . ./

EXPOSE 3002

CMD [ "npm", "start" ]
