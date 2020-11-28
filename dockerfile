# ============================== Basics ==============================

# Select base image to use
FROM ubuntu:20.04

# Expose samba ports
EXPOSE 138/udp
EXPOSE 139
EXPOSE 445
EXPOSE 445/udp

# set users ini file var
ENV userFile=/users.ini

# ============================== Install the required software ==============================

# get some updates
RUN apt-get update && \
    apt-get upgrade -y

# set time sone
ENV timezone=UTC
RUN echo $timezone > input.txt
RUN apt-get install -y tzdata < input.txt
RUN rm input.txt

# Get some updates and install some packages
RUN apt-get install samba nodejs npm -y

# clear cache
RUN rm -fr /var/cache/*

# ============================== Copy over files ==============================

# Copy over smb.conf file
COPY ./smb.conf /etc/samba/smb.conf

# Copy over node files
COPY ./node /node/get_ready

# Copy over get_ready.sh
COPY ./get_ready.sh /get_ready.sh

# ============================== Run the server ==============================

#CMD /bin/bash
CMD /get_ready.sh