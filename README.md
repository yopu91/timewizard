# Timewizard (working title)
Backend (node.js) and frontend (react) for the timewizard project.

## Developing
```shell
npm install
npm run watch
npm start
```

## Linting
```shell
npm run lint
```

## Runing in docker
```shell
docker build -t timewizard . && \
docker stop timewizard && \
docker rm timewizard && \
docker run \
  --restart=unless-stopped \
  --name timewizard \
  -e FRONTEND='https://domain.com/' \
  -d timewizard
```
Requires `mongo` container to be running.


## Phonegap Build
```shell
npm run pgb
```
Upload `dist/pgb.zip` to https://build.phonegap.com/


### Show logs
```shell
docker logs [--tail <rows>] [--follow] timewizard
```
