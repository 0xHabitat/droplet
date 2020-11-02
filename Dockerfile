FROM flyio/flyctl:latest as flyio
FROM node:14-alpine
COPY --from=flyio /flyctl /
RUN apk add git bind-tools
RUN yarn global add https://github.com/pinkiebell/ipfs-tools
WORKDIR /app
COPY . /app
ARG DOMAIN
ARG FLY_TOKEN
ENV DOMAIN=${DOMAIN}
ENV FLY_TOKEN=${FLY_TOKEN}
RUN \
  NEW_CID=`pin=1 ipfs-publish web/ | grep 'root cid' | sed 's/root cid: //g'`; \
  echo new=$NEW_CID; \
  APEX=`echo ${DOMAIN} | awk -F'.' '{print $(NF-1)"."$(NF)}'`; \
  /flyctl -t ${FLY_TOKEN} dns-records export $APEX > .tmp_zone; \
  OLD_CID=`dig +short TXT _dnslink.${DOMAIN} | sed -e 's/dnslink=\/ipfs\///g' -e 's/"//g'`; \
  echo old=$OLD_CID; \
  cat .tmp_zone; \
  sed -i'' -e "s/$OLD_CID/$NEW_CID/g" .tmp_zone; \
  cat .tmp_zone; \
  /flyctl -t ${FLY_TOKEN} dns-records import $APEX .tmp_zone;
