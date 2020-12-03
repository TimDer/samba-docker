const readIniFile   = require("read-ini-file")
const fs            = require("fs")
const { exec }      = require("child_process")

const iniFile = process.env.sharesFile

if (fs.existsSync(iniFile)) {
    // add users
    const json = readIniFile.sync(iniFile)
    
    if (json !== undefined) {
        let addUsers = [];

        // create command to execute
        let command = ``

        for (const [key, value] of Object.entries(json)) {
            // create user
            if (!addUsers.includes(value.userName)) {
                command = `${command}useradd ${value.userName}`
                addUsers.push(value.userName);
            }

            // edit smb.conf
            command = `${command} && echo "\\n\\n[${value.shareName}]
    comment = ${value.shareName}
    path = ${value.dir}
    force group = ${value.userName}
    force user = ${value.userName}
    writeable = yes
    read only = No" >> /etc/samba/smb.conf && `

            // add smb password
            command = `${command}printf "${value.password}\\n${value.password}\\n" | smbpasswd -a -s "${value.userName}" && `

            // check if the dir exists
            if (!fs.existsSync(value.dir)) {
                command = `${command}mkdir ${value.dir} && `
            }

            // chown to name:group
            command = `${command}chown ${value.userName}:${value.userName} ${value.dir}`
        }
        
        // execute command
        exec(command)
    }
}